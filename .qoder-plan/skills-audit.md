# Skills 质量审查与整合计划

## Context

项目存在两个 Skills 目录（`.github/skills/` 13个 + `.trae/skills/` 4个），共 17 个 Skill 文件。问题包括：完全重复的文件、功能重叠、不适用的内容（如 React 相关）、以及部分 Skill 质量过低。需要整合为高质量、无重复的统一 Skill 集合。

**用户确认**：统一到 `.github/skills/`，按建议清理 GSAP Skills。

---

## Task 1：移动 .trae/skills 中的新 Skill 到 .github/skills

将 `.trae/skills/` 中独有的 2 个高质量 Skill 复制到 `.github/skills/`：
- `product-ui-design/SKILL.md` → `.github/skills/product-ui-design/SKILL.md`
- `nuxt-senior-engineer/SKILL.md` → `.github/skills/nuxt-senior-engineer/SKILL.md`

## Task 2：删除被替代的旧 Skill

| 文件 | 理由 |
|------|------|
| `.github/skills/nuxt4/SKILL.md` | 27行太薄，被 `nuxt-senior-engineer` (248行) 完全覆盖 |
| `.github/skills/nuxtui/SKILL.md` | 31行太薄，组件模式已整合到 `nuxt-senior-engineer` + `product-ui-design` |
| `.github/skills/ui-ux-nuxt-vue/SKILL.md` | 被 `product-ui-design` 完全覆盖且后者更贴合项目 |

## Task 3：删除不适用的 GSAP Skills

| 文件 | 理由 |
|------|------|
| `.github/skills/gsap-react/SKILL.md` | 项目不用 React |
| `.github/skills/gsap-performance/SKILL.md` | 性能要点已被 `nuxt-senior-engineer` 覆盖 |
| `.github/skills/gsap-utils/SKILL.md` | 项目未使用 gsap.utils 高级工具函数 |

## Task 4：精简保留的 GSAP Skills

| 文件 | 操作 |
|------|------|
| `gsap-frameworks/SKILL.md` | 精简：仅保留 Vue/Nuxt 部分，删除 Svelte 内容 |
| `gsap-plugins/SKILL.md` | 精简：仅保留项目实际使用的插件（ScrollTrigger 相关） |
| `gsap-core/SKILL.md` | 保留不动 |
| `gsap-timeline/SKILL.md` | 保留不动 |
| `gsap-scrolltrigger/SKILL.md` | 保留不动 |

## Task 5：删除整个 .trae/skills 目录

所有内容已统一到 `.github/skills/`，删除 `.trae/skills/` 下的 4 个 Skill 目录。

## Task 6：更新 llms.txt 索引

更新 `.github/skills/llms.txt`，反映新的 Skill 清单，删除已移除的条目。

### 最终结构

```
.github/skills/
├── product-ui-design/SKILL.md       # UI 设计规范（项目定制）
├── nuxt-senior-engineer/SKILL.md    # Nuxt 4 高级工程（项目定制）
├── ui-beautiful-page/SKILL.md       # 长页面/GSAP 叙事流程
├── gsap-core/SKILL.md               # GSAP 核心 API
├── gsap-timeline/SKILL.md           # GSAP 时间线
├── gsap-scrolltrigger/SKILL.md      # ScrollTrigger
├── gsap-frameworks/SKILL.md         # Vue/Nuxt GSAP 集成（精简版）
├── gsap-plugins/SKILL.md            # 插件（精简版）
└── llms.txt                         # Agent 索引（更新）
```

**从 17 个 → 8 个**，减少 53%，消除所有重复和无效内容。

---

## 验证方式

1. 确认 `.trae/skills/` 目录已完全删除
2. 确认每个保留的 Skill 有唯一职责，无功能重叠
3. 确认 `llms.txt` 索引已更新
4. 运行 `pnpm dev` 确认项目正常
