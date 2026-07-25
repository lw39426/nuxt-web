# 后端埋点系统设计文档（Flask / Python）

本文档用于指导后端实现埋点系统的服务端部分，适配当前前端 SDK 的批量上报格式（batch + events），并满足“高频写、低频读”的吞吐与可靠性要求。

> 系统定位：
> - 只做 **用户行为与业务报表分析** 数据（PV/click/expose/custom）。
> - **错误与性能监控** 交给 Sentry（本系统不承担 APM/错误归因/告警等能力）。

---

## 0. 总览：核心原则

### 0.1 设计目标

- 高吞吐写入：接收 API 极快返回（典型 204）
- 削峰填谷：写入先入队列，异步消费落库
- 高可靠：至少一次（at-least-once）处理；允许重复但可去重
- 可观测：能看到队列堆积、消费延迟、丢弃率、入库失败率
- 可扩展：可水平扩容 ingestion / worker

### 0.2 关键约束与取舍

- 接收接口不做耗时操作：
  - 不做 UA/GeoIP 富化
  - 不做复杂 SQL
  - 只做“最基础结构校验 + 限流/防滥用 + 入队”
- 系统默认允许少量“重复事件”，通过 `event_id` 幂等去重解决。

---

## 1. 数据契约（与前端对齐）

前端 SDK 当前上报结构为：

```json
{
  "batch_id": "uuid",
  "sent_at": 1710000000000,
  "events": [
    {
      "app_id": "nuxtweb",
      "device_id": "uuid",
      "session_id": "uuid",
      "event_id": "uuid",
      "event_type": "page_view",
      "timestamp": 1710000000000,
      "event_name": "buy_button_click",
      "url": "https://...",
      "referrer": "https://...",
      "prev_url": "https://...",
      "env": "dev",
      "platform": "web",
      "sdk_version": "0.1.0",
      "params": { "sku_id": "sku_123", "price": 199 }
    }
  ]
}
```

后端应保持以下兼容性：

- 支持 `events` 是数组（批量）
- 字段缺失或类型不正确：按策略拒绝或丢弃（见校验策略）
- `timestamp` 不完全可信：应补充 `server_received_at`（服务端接收时间）用于排序与对账

---

## 2. 数据接收层（Data Ingestion）

### 2.1 API 设计

建议接口：

- `POST /api/tracker/collect`

建议返回：

- 成功入队：`204 No Content`
- JSON 无法解析/格式错误：`400 Bad Request`
- 超过大小限制：`413 Payload Too Large`
- 触发限流：`429 Too Many Requests`
- 服务不可用（例如 Redis 挂了）：`503 Service Unavailable`

#### 为什么是 204

- 前端 `sendBeacon()` 更倾向“只要服务器收到了就行”，不需要响应体
- 减少网络负载与序列化开销

### 2.2 接收层只做“最基础校验”

推荐使用 Pydantic（或 Marshmallow），但注意“校验不要过重”。

建议校验策略：

- 必填：`batch_id`、`events`（list）、每个 event 必须有：
  - `app_id`、`device_id`、`session_id`、`event_id`、`event_type`、`timestamp`
- `events` 数量上限：例如 `<= 50`（防止超大包）
- `params` 允许任意 JSON（但建议限制体积，例如单事件 params <= 8KB）
- `timestamp` 合理性：允许一定漂移
  - 例如：接受 `timestamp` 与 `server_received_at` 相差在 `-24h ~ +5min`，超出则：
    - 方案 A：直接拒绝该事件
    - 方案 B：保留事件但打上 `ts_skewed=true` 并将 `event_time` 以 server time 为准

### 2.3 获取 IP / UA 的正确方式（考虑反向代理）

Flask 在 Nginx / LB 后：

- **不要直接信任** `request.remote_addr`
- 建议：
  - Nginx 设置 `X-Forwarded-For` / `X-Real-IP`
  - Flask 端启用 `werkzeug.middleware.proxy_fix.ProxyFix`

并存储：

- `client_ip`（可选：加盐 hash 或只存前 24 位网段，降低隐私风险）
- `user_agent` 原始字符串
- `origin`、`referer`、`accept-language`（可选）

### 2.4 防滥用（强烈建议）

因为埋点接口通常是“半公开”的（前端无法安全保存 secret），因此必须在接收层做防护：

- App 白名单：允许的 `app_id` 列表
- Origin 白名单：不同 app_id 对应允许的 `Origin`（浏览器请求）
- 速率限制：
  - 维度：`app_id + client_ip` 或 `client_ip`
  - 实现：Redis token bucket / sliding window
- 负载保护：
  - 当队列堆积严重时：直接返回 503 或 429（背压）

### 2.5 入队（削峰填谷）

你提供的 Redis List 方案可行，但需要补齐“可靠性 ACK”。

#### 方案 A（最低改动，基于 Redis List，推荐加 ACK）

使用两个 list：

- `event_queue`：待处理
- `event_queue_processing`：处理中（ack 前暂存）

工作流：

- ingestion：`LPUSH event_queue <payload>`
- worker：使用 `BRPOPLPUSH event_queue event_queue_processing` 拿到消息
- worker 成功入库后：`LREM event_queue_processing 1 <payload>` 完成 ack

优点：改动小。
缺点：处理列表可能膨胀，需要定期清理“僵尸消息”（worker 崩溃后未 ack 的消息）。

#### 方案 B（推荐，Redis Streams + Consumer Group）

- ingestion：`XADD tracker_stream * payload=<json>`
- worker：`XREADGROUP GROUP g1 c1 BLOCK 2000 COUNT 200 ...`
- ack：`XACK tracker_stream g1 <id>`
- 可结合 pending entries list（PEL）做“重新投递/死信”

优点：天然 consumer group、ack、pending 重试更成熟。
缺点：实现略复杂，但长期维护成本更低。

### 2.6 Redis Streams 具体落地（推荐默认实现）

> 前置依赖建议：Redis >= 6.2（支持 `XAUTOCLAIM`，用于自动回收长时间 pending 的消息）。

#### 2.6.1 Key / Group 命名建议

- 事件流（按 app 分流，避免单 key 过热）：
  - `trk:{app_id}:events`（Redis Stream）
- 消费组：
  - `g_events_v1`
- 死信流（DLQ）：
  - `trk:{app_id}:events:dlq`

#### 2.6.2 写入命令（ingestion）

建议写入字段：

- `payload`：完整 JSON（建议 orjson 序列化）
- `received_at_ms`：服务端接收毫秒时间戳
- `attempt`：初始写 0（给 worker 重试计数用）

命令示例：

```bash
# 使用近似裁剪，避免 stream 无限增长（按业务吞吐调整 MAXLEN）
XADD trk:nuxtweb:events MAXLEN ~ 200000 * \
  payload "{...json...}" received_at_ms "1710000000000" attempt "0"
```

说明：

- `MAXLEN ~` 是近似裁剪，性能更好。
- `payload` 中请务必包含每个 event 的 `app_id/event_id/device_id/session_id/timestamp`（用于幂等与对账）。

#### 2.6.3 初始化消费组（一次性）

```bash
# 0-0 表示从最早开始；$ 表示从创建时刻之后的新消息开始
XGROUP CREATE trk:nuxtweb:events g_events_v1 0-0 MKSTREAM
```

#### 2.6.4 Worker 消费/ACK（批量）

```bash
# 作为 consumer=c1 从消费组读取
XREADGROUP GROUP g_events_v1 c1 COUNT 200 BLOCK 2000 STREAMS trk:nuxtweb:events >

# 入库成功后确认
XACK trk:nuxtweb:events g_events_v1 1710000000000-0 1710000000001-0
```

#### 2.6.5 Pending 回收（避免“僵尸消息”）

当 worker 崩溃，消息会留在 PEL（pending entries list）里，不会再次被 `>` 读取。

建议两种回收方式（二选一即可）：

1) 周期性 `XAUTOCLAIM`（推荐，自动把超时 pending 转给当前 consumer）：

```bash
# min-idle-time: 60000ms 表示 idle 超过 60s 的 pending 视为可回收
XAUTOCLAIM trk:nuxtweb:events g_events_v1 c1 60000 0-0 COUNT 200
```

2) `XPENDING` + `XCLAIM`（兼容旧版本 Redis，但实现略繁琐）。

实践建议：

- 回收后先做“小批量重试入库”；连续失败的消息尽快进入 DLQ。

---

## 3. 异步消费与存储层（Worker / Processing）

### 3.1 Worker 形式

两类可选：

- 自研 worker（一个 Python 进程/服务）：
  - 优点：吞吐可控、依赖少
  - 缺点：需要自己处理重试、DLQ、并发
- Celery（Redis broker）：
  - 优点：任务模型成熟
  - 缺点：高吞吐“海量小任务”时开销偏大，且需要更谨慎的参数调优

建议：先用“自研批处理 worker”快速上线，后续如需要复杂工作流再引入 Celery。

### 3.2 批量入库（Batch Insert）

关键参数：

- `BATCH_SIZE`：建议 200~2000（视库与 SQL driver 调整）
- `FLUSH_INTERVAL`：例如 200~500ms（避免低流量时不落库）

批量策略：

- 攒够 N 条或者超时就插入
- 每批插入用单个事务
- 插入失败：
  - 可重试错误（连接失败/死锁）：指数退避重试
  - 不可重试错误（字段不合法/超长）：进入 DLQ

### 3.3 幂等去重（强烈建议）

由于：

- 前端可能重试
- worker 可能因 crash 造成重复消费（at-least-once）

因此必须依赖 `event_id` 去重。

落库建议：

- 原始表对 `(app_id, event_id)` 建唯一索引
- 插入使用：
  - MySQL：`INSERT ... ON DUPLICATE KEY UPDATE ...`（通常只做 no-op）
  - ClickHouse：可用 ReplacingMergeTree 或在 ETL 时去重

### 3.4 数据富化（UA / GeoIP）

富化应在 worker 中做，而不是 ingestion。

建议优化点：

- UA 解析：
  - 使用 `user-agents` 库
  - 加 LRU cache（相同 UA 在短时间内重复率很高）
- GeoIP：
  - 使用 `geoip2` + 本地 GeoLite2 库
  - 同样加 cache（IP 在短时间内重复率也高）
- 可选：富化失败不应阻断入库：
  - `geo_country/geo_city` 允许为 null

### 3.5 DLQ（死信队列）

必须有：

- Schema 校验失败
- JSON 无法解析
- 超过字段长度、无法入库
- 重试超过次数

DLQ 内容建议：

- 原始 payload
- reason
- server_received_at
- worker_id

DLQ 可以用：

- Redis Stream `tracker_dlq`
- 或独立表 `tracking_events_dlq`

### 3.6 Worker 重试 / DLQ 策略（建议默认）

目标：既保证“可重试错误”不丢，又避免无限重试拖垮系统。

建议分类：

- 可重试（retryable）：
  - DB 连接失败、超时
  - 死锁 / lock wait timeout
  - Redis 临时抖动
- 不可重试（non-retryable）：
  - JSON 结构错误、字段类型错误
  - 单字段超长（例如 url 超 2048）
  - 违反约束（缺失 app_id/event_id 等）

建议默认策略：

- 单条消息最大重试次数：`MAX_ATTEMPTS=5`
- 指数退避：`delay = min(2^attempt * 0.5s, 30s)`
- 超过次数或判定不可重试：写入 DLQ（同时 ACK 原消息，避免 PEL 堆积）

DLQ 推荐字段（Streams）：

- `payload`（原始 JSON）
- `reason`（短码：`schema_invalid`/`db_error`/`too_large` 等）
- `detail`（可选，截断后的异常字符串）
- `failed_at_ms`
- `attempt`

操作要点：

- DLQ 的写入不能失败（至少要落日志）；否则会出现“黑洞丢失”。
- 对于“整批入库失败”的场景：建议降级到“二分法拆批”定位坏数据，然后坏数据进 DLQ，其余继续入库。

---

## 4. 存储设计

### 4.1 原始事件表（tracking_events_raw）

推荐字段（MySQL 版本示例）：

- `id` big int auto increment
- `app_id` varchar
- `event_id` char(36)
- `event_type` varchar
- `event_name` varchar nullable
- `device_id` char(36)
- `session_id` char(36)
- `user_id` varchar nullable
- `event_ts` bigint（来自客户端 timestamp）
- `server_received_at` datetime(3)
- `url` text / varchar(2048)
- `referrer` text nullable
- `prev_url` text nullable
- `env` varchar nullable
- `platform` varchar nullable
- `sdk_version` varchar nullable
- `client_ip` varbinary / varchar（建议脱敏或 hash）
- `user_agent` text
- `ua_os/ua_browser` varchar nullable（富化结果）
- `geo_country/geo_city` varchar nullable（富化结果）
- `params_json` json（业务参数）

索引建议：

- UNIQUE `(app_id, event_id)`（幂等去重）
- INDEX `(app_id, event_type, server_received_at)`
- INDEX `(app_id, device_id, server_received_at)`

分区/归档：

- 若 MySQL：按 `server_received_at` 月分区或按月归档表
- 设置 retention：例如 raw 保留 30~90 天（根据成本与合规）

### 4.2 ClickHouse（可选但更匹配高频写）

如果写入量显著增长（千万/天级别），建议 raw 入 ClickHouse：

- 列式存储适合分析聚合
- 写入吞吐远高于 MySQL
- 可用 materialized view 做实时/准实时聚合

在“初版本”可先 MySQL 聚合表 + raw 归档，再视规模迁移。

### 4.3 MySQL DDL 示例（可直接执行，MySQL 8.0）

> 说明：下面给出“raw + dlq + daily 聚合”最小三张表。字段可根据实际业务删减。

#### 4.3.1 原始表（raw）

```sql
CREATE TABLE IF NOT EXISTS tracking_events_raw (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  app_id VARCHAR(64) NOT NULL,
  event_id CHAR(36) NOT NULL,
  batch_id CHAR(36) NULL,

  event_type VARCHAR(64) NOT NULL,
  event_name VARCHAR(128) NULL,

  device_id CHAR(36) NOT NULL,
  session_id CHAR(36) NOT NULL,
  user_id VARCHAR(128) NULL,

  event_ts_ms BIGINT NOT NULL,
  server_received_at DATETIME(3) NOT NULL,

  url VARCHAR(2048) NULL,
  referrer VARCHAR(2048) NULL,
  prev_url VARCHAR(2048) NULL,

  env VARCHAR(32) NULL,
  platform VARCHAR(32) NULL,
  sdk_version VARCHAR(32) NULL,

  origin VARCHAR(256) NULL,
  client_ip VARBINARY(16) NULL,
  user_agent TEXT NULL,

  ua_os VARCHAR(64) NULL,
  ua_browser VARCHAR(64) NULL,
  geo_country VARCHAR(64) NULL,
  geo_city VARCHAR(64) NULL,

  params_json JSON NULL,
  context_json JSON NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uk_app_event (app_id, event_id),
  KEY idx_app_type_time (app_id, event_type, server_received_at),
  KEY idx_app_name_time (app_id, event_name, server_received_at),
  KEY idx_app_device_time (app_id, device_id, server_received_at),
  KEY idx_app_user_time (app_id, user_id, server_received_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

关于 IP 存储：

- `VARBINARY(16)` 可同时存 IPv4/IPv6（worker 写入前做 `inet_pton`）。
- 若合规/隐私要求更严：可改存 `ip_hash`（例如 `BINARY(16)` 存 MD5/SHA 截断），或只存网段。

#### 4.3.2 死信表（DLQ，便于人工回放/排查）

```sql
CREATE TABLE IF NOT EXISTS tracking_events_dlq (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  app_id VARCHAR(64) NOT NULL,
  event_id CHAR(36) NULL,
  reason VARCHAR(64) NOT NULL,
  detail VARCHAR(1024) NULL,
  payload_json JSON NOT NULL,
  failed_at DATETIME(3) NOT NULL,
  attempt INT NOT NULL DEFAULT 0,
  worker_id VARCHAR(64) NULL,
  PRIMARY KEY (id),
  KEY idx_app_failedat (app_id, failed_at),
  KEY idx_reason_failedat (reason, failed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 4.3.3 每日聚合表（示例：PV/UV/新设备）

```sql
CREATE TABLE IF NOT EXISTS tracking_metrics_daily (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  app_id VARCHAR(64) NOT NULL,
  dt DATE NOT NULL,
  metric VARCHAR(64) NOT NULL,
  dim_key VARCHAR(128) NOT NULL DEFAULT 'all',
  dim_value VARCHAR(256) NOT NULL DEFAULT 'all',
  value BIGINT NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_app_dt_metric_dim (app_id, dt, metric, dim_key, dim_value),
  KEY idx_app_dt (app_id, dt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

落地建议：

- 聚合任务只写聚合表，管理端只读聚合表（权限隔离）。
- `dim_key/dim_value` 用于扩展（比如 `page_path`、`utm_source`），避免后续频繁加列。

---

## 5. ETL 与看板 API

### 5.1 聚合任务（APScheduler / Crontab）

你提出的“每日凌晨聚合”是正确方向。

建议升级点：

- 任务幂等：每次跑同一天都能安全覆盖（`INSERT ... ON DUPLICATE KEY UPDATE`）
- 支持补算：
  - 当发现某天数据延迟到达，可重跑那一天
- 时间维度：
  - 先做 daily（简单、稳定）
  - 视业务需要再加 hourly（趋势更平滑）

聚合指标建议（最小集合）：

- PV：`event_type='page_view'`
- UV：按 `device_id` 去重（或按 user_id+device_id 口径二选一）
- 新设备：当天首次出现的 `device_id`
- Top pages：按 `params.path` 或 `url` 归一
- 渠道占比：需要前端提供 `utm_source/utm_medium` 或 referrer 分类

### 5.2 APScheduler 任务模板（建议实现）

> 目标：把“聚合、补算、维护”都变成可观测、可重入、可回滚的定时任务。

建议最小任务集：

- `aggregate_daily(dt)`：聚合某天 PV/UV/新设备（支持补算）
- `reclaim_pending()`：回收 Redis Streams pending（XAUTOCLAIM）
- `purge_raw(retention_days)`：原始表按保留策略清理/归档（谨慎上线，先只报警不删除）

伪代码示例：

```python
from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler(timezone="Asia/Shanghai")

def aggregate_daily(dt):
  # 1) 计算 PV/UV
  # 2) upsert 到 tracking_metrics_daily（幂等）
  pass

def reclaim_pending():
  # 使用 XAUTOCLAIM 回收 idle 超时的 pending
  # 对回收消息执行重试/入库或 DLQ
  pass

def purge_raw(retention_days: int = 90):
  # 仅示意：生产上建议先归档到冷库，再删除
  pass

# 每天 02:10 聚合前一天
scheduler.add_job(aggregate_daily, "cron", hour=2, minute=10, args=["yesterday"])

# 每分钟回收 pending（或更长间隔）
scheduler.add_job(reclaim_pending, "interval", minutes=1)

# 每天 03:30 触发保留策略检查
scheduler.add_job(purge_raw, "cron", hour=3, minute=30, args=[90])

scheduler.start()
```

落地要点：

- 所有任务必须打点日志：开始/结束/耗时/处理条数/失败条数。
- 任务幂等（可重复执行）：聚合用 upsert；pending 回收用“已处理标记或幂等入库”。

### 5.3 看板 API（只查聚合表）

接口示例：

- `GET /api/admin/metrics/overview?date=2026-05-25`
- `GET /api/admin/metrics/trend?from=...&to=...&metric=pv`
- `GET /api/admin/metrics/pages/top?date=...&limit=50`

安全建议：

- JWT 鉴权 + RBAC
- 管理端接口与采集接口分域名/子路径隔离
- 只给管理端开放查询聚合表权限（读写隔离）

---

## 6. 观测与运维（必须）

### 6.1 关键指标（Metrics）

- ingestion：
  - QPS、P95/P99 latency
  - 4xx/5xx 比例、429 比例
- queue：
  - 队列长度/stream lag
  - pending 数量（Streams）
- worker：
  - 消费速率 events/s
  - 入库耗时、批大小
  - 重试次数、DLQ 数量
- DB：
  - 写入 TPS、锁等待、慢查询

### 6.2 负载保护（背压）

当满足任一条件：

- 队列长度超过阈值
- worker lag 超过阈值
- DB 写入失败率持续上升

建议措施：

- ingestion 返回 503/429
- 或降低采样率（可通过前端配置下发；不在本后端初版本强依赖）

---

## 7. Flask 具体落地建议

### 7.1 部署

- Flask 本体不建议直接跑开发 server
- 生产建议：`gunicorn` + 多 worker
  - CPU 密集少：`gthread` 或 `gevent`
- 前置 Nginx：
  - 限制 body size（避免超大包）
  - 配置真实 IP 透传（X-Forwarded-For）

### 7.2 JSON 性能

- 解析/序列化建议用 `orjson`（可显著降低 CPU）
- ingestion 只做最小化 parse + 入队

### 7.3 参考伪代码（仅表达结构）

```python
# Flask ingestion pseudo-code

@bp.post('/api/tracker/collect')
def collect():
    payload = request.get_json(force=False, silent=False)
    # 1) validate (minimal)
    # 2) rate-limit / origin allowlist
    # 3) attach meta
    msg = {
        "server_received_at": time.time_ns(),
        "client_ip": get_client_ip(request),
        "user_agent": request.headers.get("User-Agent", ""),
        "body": payload,
    }
    # 4) enqueue (redis list/stream)
    redis.xadd("tracker_stream", {"payload": orjson.dumps(msg)})
    return ("", 204)
```

---

## 8. 与 Sentry 的配合点

本系统不承担 error/APM，但建议通过以下方式实现“串联排查”：

- 前端已将 `device_id/session_id/app_id` 写入 Sentry tag
- 管理端报表页面可以提供“按 device_id/session_id 查询行为轨迹”的能力

---

## 9. 版本路线（建议）

### v0（可上线最小版）

- ingestion：校验 + 入队（Redis List + ack 或 Redis Streams）
- worker：批量入库 raw 表 + 简单 UA/GeoIP（可先不做）
- ETL：每日聚合 PV/UV/新设备 + overview/trend API

### v1（质量与可靠性增强）

- DLQ + 重试策略完善
- 多 worker 横向扩容、消费 lag 监控告警
- raw 表分区与 retention

### v2（规模化）

- ClickHouse 引入（raw + materialized views）
- 更细的实时/准实时指标

---

## 10. 你当前初版本设计的评价（针对关键点）

你给的版本方向正确：

- “接收极简 + Redis 队列 + worker 批量入库 + 离线聚合 + 看板只读聚合表” 是标准高吞吐埋点后端路线。

需要补齐的关键工程点（建议优先级从高到低）：

1. **队列可靠性 ACK**（避免 worker crash 导致消息丢失）
2. **幂等去重**（event_id 唯一索引，允许至少一次消费）
3. **限流与防滥用**（app_id/origin 白名单 + 429）
4. **DLQ + 可观测性**（否则线上问题无法定位）
5. **raw 表分区与 retention**（避免表无限增长拖垮 MySQL）
