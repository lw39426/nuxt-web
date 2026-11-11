type Vector3 = [number, number, number]
type Surface = (u: number, v: number) => Vector3

export interface HeroKittenScene {
  resize: (width: number, height: number, pixelRatio: number) => void
  setPose: (horizontal: number, vertical: number, yaw: number, pitch: number) => void
  setTheme: (dark: boolean) => void
  render: () => void
  dispose: () => void
}

const VERTEX_SHADER = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aColor;
attribute float aGloss;
uniform mat4 uModel;
uniform mat4 uViewProjection;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vColor;
varying float vGloss;
// 将模型位置与法线转换到世界坐标，供柔光材质使用。
void main() {
  vec4 world = uModel * vec4(aPosition, 1.0);
  vPosition = world.xyz;
  vNormal = mat3(uModel) * aNormal;
  vColor = aColor;
  vGloss = aGloss;
  gl_Position = uViewProjection * world;
}`

const FRAGMENT_SHADER = `
precision mediump float;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vColor;
varying float vGloss;
uniform float uDark;
// 合成柔和主光、补光和轮廓光，输出带高光的奶油色材质。
void main() {
  vec3 normal = normalize(vNormal);
  vec3 key = normalize(vec3(-3.0, 5.0, 6.0));
  vec3 fill = normalize(vec3(4.0, 2.0, 3.0));
  vec3 rim = normalize(vec3(1.0, 4.0, -4.0));
  vec3 view = normalize(vec3(0.0, 3.0, 8.0) - vPosition);
  vec3 ambient = mix(vec3(0.34, 0.27, 0.41), vec3(0.77, 0.82, 0.94), normal.y * 0.5 + 0.5);
  vec3 light = ambient * 0.62;
  light += vec3(1.0, 0.91, 0.80) * max(dot(normal, key), 0.0) * 1.08;
  light += vec3(0.81, 0.83, 1.0) * max(dot(normal, fill), 0.0) * 0.44;
  light += vec3(0.88, 0.78, 1.0) * max(dot(normal, rim), 0.0) * mix(0.26, 0.46, uDark);
  float specular = pow(max(dot(normal, normalize(key + view)), 0.0), mix(26.0, 110.0, vGloss));
  float contact = mix(0.85, 1.0, smoothstep(0.0, 0.42, vPosition.y));
  vec3 color = vColor * light * contact + vec3(specular * (0.025 + vGloss * 0.42));
  color = (color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14);
  gl_FragColor = vec4(pow(clamp(color, 0.0, 1.0), vec3(1.0 / 2.2)), 1.0);
}`

/** 将三维向量归一化，用于曲面法线和摄像机基向量。 */
function normalize(vector: Vector3): Vector3 {
  const length = Math.hypot(...vector) || 1
  return [vector[0] / length, vector[1] / length, vector[2] / length]
}

/** 计算叉积，保持曲面法线朝外。 */
function cross(a: Vector3, b: Vector3): Vector3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

/** 生成列主序刚体矩阵，避免引入整个三维引擎来处理少量关节。 */
function transform(yaw = 0, pitch = 0, roll = 0, x = 0, y = 0, z = 0) {
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const cx = Math.cos(pitch)
  const sx = Math.sin(pitch)
  const cz = Math.cos(roll)
  const sz = Math.sin(roll)
  return new Float32Array([
    cy * cz + sy * sx * sz,
    cx * sz,
    -sy * cz + cy * sx * sz,
    0,
    -cy * sz + sy * sx * cz,
    cx * cz,
    sy * sz + cy * sx * cz,
    0,
    sy * cx,
    -sx,
    cy * cx,
    0,
    x,
    y,
    z,
    1
  ])
}

/** 相乘两个列主序矩阵，分别组合身体和颈部转向。 */
function multiply(a: Float32Array, b: Float32Array) {
  const result = new Float32Array(16)
  for (let column = 0; column < 4; column++) {
    for (let row = 0; row < 4; row++) {
      for (let index = 0; index < 4; index++) {
        result[column * 4 + row]! += a[index * 4 + row]! * b[column * 4 + index]!
      }
    }
  }
  return result
}

/** 将局部曲面转换到模型坐标；所有静态缩放只在创建时执行。 */
function place(point: Vector3, center: Vector3, scale: Vector3, rotation: Float32Array): Vector3 {
  const [x, y, z] = point.map((value, index) => value * scale[index]!) as Vector3
  return [
    rotation[0]! * x + rotation[4]! * y + rotation[8]! * z + center[0],
    rotation[1]! * x + rotation[5]! * y + rotation[9]! * z + center[1],
    rotation[2]! * x + rotation[6]! * y + rotation[10]! * z + center[2]
  ]
}

/** 把参数曲面烘焙为交错顶点数据，供头部和身体各一次绘制。 */
function addSurface(
  vertices: number[],
  surface: Surface,
  color: string,
  gloss = 0.18,
  rings = 18,
  segments = 28
) {
  const rgb = [1, 3, 5].map(
    (offset) => (parseInt(color.slice(offset, offset + 2), 16) / 255) ** 2.2
  )
  const grid: number[][] = []
  const epsilon = 0.0001
  for (let ring = 0; ring <= rings; ring++) {
    const u = Math.max(epsilon, Math.min(1 - epsilon, ring / rings))
    for (let segment = 0; segment <= segments; segment++) {
      const v = segment / segments
      const point = surface(u, v)
      const nextU = surface(Math.min(1 - epsilon / 2, u + epsilon), v)
      const prevU = surface(Math.max(epsilon / 2, u - epsilon), v)
      const nextV = surface(u, v + epsilon)
      const prevV = surface(u, v - epsilon)
      const du = nextU.map((value, index) => value - prevU[index]!) as Vector3
      const dv = nextV.map((value, index) => value - prevV[index]!) as Vector3
      grid.push([...point, ...normalize(cross(dv, du)), ...rgb, gloss])
    }
  }
  for (let ring = 0; ring < rings; ring++) {
    for (let segment = 0; segment < segments; segment++) {
      const first = ring * (segments + 1) + segment
      const next = first + segments + 1
      for (const index of [first, first + 1, next, first + 1, next + 1, next]) {
        vertices.push(...grid[index]!)
      }
    }
  }
}

/** 添加圆润的黏土部件，共用曲面生成流程而不增加逐帧对象。 */
function addEllipsoid(
  vertices: number[],
  center: Vector3,
  scale: Vector3,
  color: string,
  gloss = 0.18,
  yaw = 0,
  roll = 0,
  detail = 18
) {
  const rotation = transform(yaw, 0, roll)
  /** 采样球面并应用形状缩放与摆放角度。 */
  function surface(u: number, v: number): Vector3 {
    const theta = u * Math.PI
    const phi = v * Math.PI * 2
    return place(
      [Math.sin(theta) * Math.cos(phi), Math.cos(theta), Math.sin(theta) * Math.sin(phi)],
      center,
      scale,
      rotation
    )
  }
  addSurface(vertices, surface, color, gloss, detail, detail + 10)
}

/** 添加有厚度的短曲线，用于嘴角、胡须和尾巴。 */
function addTube(vertices: number[], points: Vector3[], radius: number, color: string, rings = 22) {
  /** 计算三次贝塞尔曲线的位置。 */
  function center(t: number): Vector3 {
    const weights = [(1 - t) ** 3, 3 * t * (1 - t) ** 2, 3 * t ** 2 * (1 - t), t ** 3]
    return [0, 1, 2].map((axis) =>
      points.reduce((sum, point, index) => sum + point[axis]! * weights[index]!, 0)
    ) as Vector3
  }
  /** 沿曲线建立截面，保证弯曲部位仍有真实体积。 */
  function surface(u: number, v: number): Vector3 {
    const point = center(u)
    const next = center(Math.min(1, u + 0.001))
    const previous = center(Math.max(0, u - 0.001))
    const tangent = normalize(next.map((value, index) => value - previous[index]!) as Vector3)
    const side = normalize(cross(tangent, [0, 0, 1]))
    const up = cross(side, tangent)
    const phi = -v * Math.PI * 2
    return point.map(
      (value, index) => value + radius * (side[index]! * Math.cos(phi) + up[index]! * Math.sin(phi))
    ) as Vector3
  }
  addSurface(vertices, surface, color, 0.12, rings, 10)
  for (const point of [points[0]!, points[3]!]) {
    addEllipsoid(vertices, point, [radius, radius, radius], color, 0.12, 0, 0, 8)
  }
}

/** 构建同一只小猫的身体与头部，顶点只生成一次。 */
function buildKitten() {
  const body: number[] = []
  const head: number[] = []
  const cream = '#f6e6cc'
  const muzzle = '#fff5e5'
  const pink = '#e5a3aa'
  const lavender = '#b7a0d0'

  addTube(
    body,
    [
      [0.37, 0.28, -0.17],
      [1.35, 0.02, -0.23],
      [1.4, 1.25, -0.15],
      [0.94, 1.13, 0]
    ],
    0.105,
    cream,
    32
  )
  addEllipsoid(body, [0, 0.79, -0.03], [0.56, 0.69, 0.45], cream)
  addEllipsoid(body, [0, 0.77, 0.39], [0.37, 0.43, 0.09], muzzle)
  for (const side of [-1, 1]) {
    addEllipsoid(body, [side * 0.45, 0.28, 0.04], [0.28, 0.24, 0.32], cream)
    addEllipsoid(body, [side * 0.26, 0.44, 0.38], [0.175, 0.34, 0.2], cream, 0.18, 0, side * -0.08)
    addEllipsoid(body, [side * 0.27, 0.17, 0.46], [0.23, 0.16, 0.28], muzzle)
  }

  /** 围巾领口使用椭圆环面，让领口真实包住颈部。 */
  function scarf(u: number, v: number): Vector3 {
    const around = u * Math.PI * 2
    const section = v * Math.PI * 2
    return [
      (0.43 + Math.cos(section) * 0.105) * Math.cos(around),
      1.37 + Math.sin(section) * 0.105,
      (0.33 + Math.cos(section) * 0.105) * Math.sin(around)
    ]
  }
  addSurface(body, scarf, lavender, 0.13, 32, 12)
  addEllipsoid(body, [0.28, 1.25, 0.36], [0.145, 0.13, 0.12], '#c4afd9')
  addEllipsoid(body, [0.26, 1.03, 0.44], [0.105, 0.26, 0.055], lavender, 0.1, 0, -0.12)
  addEllipsoid(body, [0.43, 1.08, 0.37], [0.1, 0.22, 0.06], '#c4afd9', 0.1, 0, 0.34)

  addEllipsoid(head, [0, 1.95, 0], [0.87, 0.77, 0.69], cream, 0.2, 0, 0, 26)
  for (const side of [-1, 1]) {
    /** 渐缩的饱满耳廓保留圆润耳尖，不使用尖锥冒充猫耳。 */
    function ear(u: number, v: number): Vector3 {
      const t = (Math.cos(u * Math.PI) + 1) / 2
      const width = Math.sin(u * Math.PI) * (1 - t * 0.66)
      return [
        side * (0.5 + t * 0.2) + Math.cos(v * Math.PI * 2) * width * 0.39,
        2.34 + t * 0.83,
        -0.005 + Math.sin(v * Math.PI * 2) * width * 0.21
      ]
    }
    addSurface(head, ear, cream, 0.18, 22, 28)
    /** 缩小并前移耳内曲面，使粉色部分嵌入耳廓而不是浮在旁边。 */
    function innerEar(u: number, v: number): Vector3 {
      const point = ear(u, v)
      return [
        side * 0.62 + (point[0] - side * 0.62) * 0.6,
        2.66 + (point[1] - 2.66) * 0.62,
        point[2] * 0.25 + 0.13
      ]
    }
    addSurface(head, innerEar, pink, 0.1, 18, 24)
    addEllipsoid(
      head,
      [side * 0.335, 2.035, 0.626],
      [0.127, 0.158, 0.07],
      '#322737',
      0.9,
      side * 0.27
    )
    addEllipsoid(
      head,
      [side * 0.335 - 0.029, 2.092, 0.686],
      [0.03, 0.04, 0.018],
      '#fffaf4',
      0.25,
      side * 0.27,
      0,
      10
    )
    addEllipsoid(
      head,
      [side * 0.335 + 0.036, 2.005, 0.694],
      [0.011, 0.014, 0.008],
      '#fffaf4',
      0.2,
      side * 0.27,
      0,
      8
    )
    addEllipsoid(
      head,
      [side * 0.505, 1.827, 0.558],
      [0.125, 0.065, 0.028],
      '#eab7b5',
      0.08,
      side * 0.52
    )
    addEllipsoid(head, [side * 0.105, 1.765, 0.678], [0.154, 0.112, 0.088], muzzle)
    addTube(
      head,
      [
        [0, 1.756, 0.765],
        [side * 0.014, 1.701, 0.767],
        [side * 0.059, 1.697, 0.756],
        [side * 0.077, 1.732, 0.748]
      ],
      0.009,
      '#87695e',
      10
    )
    for (const line of [-1, 1]) {
      addTube(
        head,
        [
          [side * 0.28, 1.78, 0.656],
          [side * 0.38, 1.79 + line * 0.015, 0.637],
          [side * 0.48, 1.79 + line * 0.029, 0.59],
          [side * 0.58, 1.79 + line * 0.042, 0.528]
        ],
        0.007,
        '#c0a28b',
        10
      )
    }
  }
  addEllipsoid(head, [0, 1.826, 0.768], [0.066, 0.046, 0.038], '#d5919d', 0.35)
  return { vertices: new Float32Array([...body, ...head]), bodyCount: body.length / 10 }
}

/** 创建透明的原生 WebGL 小猫；只在外层请求时渲染，不自建动画循环。 */
export function createHeroKittenScene(canvas: HTMLCanvasElement, dark: boolean): HeroKittenScene {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: true,
    premultipliedAlpha: false,
    powerPreference: 'low-power'
  })
  if (!gl) throw new Error('当前浏览器不支持 WebGL')
  const shaders: WebGLShader[] = []
  let program: WebGLProgram | null = null
  let buffer: WebGLBuffer | null = null

  /** 释放创建中和已创建的 GPU 资源，也用于初始化失败的清理。 */
  function dispose() {
    if (buffer) gl!.deleteBuffer(buffer)
    if (program) gl!.deleteProgram(program)
    for (const shader of shaders) gl!.deleteShader(shader)
    buffer = null
    program = null
    shaders.length = 0
  }

  /** 编译固定的着色器源码，失败时向外层展示可理解的降级状态。 */
  function compile(type: number, source: string) {
    const shader = gl!.createShader(type)
    if (!shader) throw new Error('无法创建小猫着色器')
    shaders.push(shader)
    gl!.shaderSource(shader, source)
    gl!.compileShader(shader)
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
      throw new Error(gl!.getShaderInfoLog(shader) || '小猫着色器编译失败')
    }
    return shader
  }

  try {
    program = gl.createProgram()
    if (!program) throw new Error('无法创建小猫渲染程序')
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX_SHADER))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || '小猫渲染程序链接失败')
    }
    gl.useProgram(program)
    const modelUniform = gl.getUniformLocation(program, 'uModel')
    const projectionUniform = gl.getUniformLocation(program, 'uViewProjection')
    const themeUniform = gl.getUniformLocation(program, 'uDark')
    const { vertices, bodyCount } = buildKitten()
    const vertexCount = vertices.length / 10
    buffer = gl.createBuffer()
    if (!buffer) throw new Error('无法创建小猫顶点缓冲区')
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
    for (const [name, size, offset] of [
      ['aPosition', 3, 0],
      ['aNormal', 3, 3],
      ['aColor', 3, 6],
      ['aGloss', 1, 9]
    ] as const) {
      const location = gl.getAttribLocation(program, name)
      gl.enableVertexAttribArray(location)
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 40, offset * 4)
    }
    gl.enable(gl.DEPTH_TEST)
    gl.clearColor(0, 0, 0, 0)
    let bodyMatrix = transform()
    let headMatrix = transform()
    let darkMode = dark

    /** 调整正交投影与有限像素密度，完整保留耳尖、尾巴和脚爪。 */
    function resize(width: number, height: number, pixelRatio: number) {
      canvas.width = Math.max(1, Math.round(width * pixelRatio))
      canvas.height = Math.max(1, Math.round(height * pixelRatio))
      gl!.viewport(0, 0, canvas.width, canvas.height)
      const aspect = width / Math.max(height, 1)
      const halfHeight = 1.88 / Math.min(1, aspect)
      const halfWidth = halfHeight * aspect
      const projection = new Float32Array([
        1 / halfWidth,
        0,
        0,
        0,
        0,
        1 / halfHeight,
        0,
        0,
        0,
        0,
        -2 / 20,
        0,
        0,
        0,
        0,
        1
      ])
      // 先围绕取景中心转动，再后移摄像机，避免视角变化挤出主体。
      const centeredView = multiply(
        transform(0, 0, 0, 0, 0, -8),
        multiply(transform(0, 0.177), transform(0, 0, 0, 0, -1.56, 0))
      )
      gl!.uniformMatrix4fv(projectionUniform, false, multiply(projection, centeredView))
    }

    /** 整体绕中心旋转一整圈，轻微位移与转头叠加在独立关节层。 */
    function setPose(horizontal: number, vertical: number, yaw: number, pitch: number) {
      const orbit = multiply(
        transform(0, 0, 0, horizontal * 0.08, 1.56 - vertical * 0.05, 0),
        multiply(transform(yaw, pitch), transform(0, 0, 0, 0, -1.56, 0))
      )
      bodyMatrix = multiply(orbit, transform(horizontal * 0.12, 0, -horizontal * 0.018))
      const neck = multiply(
        transform(0, 0, 0, 0, 1.42, 0),
        multiply(
          transform(horizontal * 0.42, vertical * 0.2, -horizontal * 0.026),
          transform(0, 0, 0, 0, -1.42, 0)
        )
      )
      headMatrix = multiply(bodyMatrix, neck)
    }

    /** 深色主题略增强轮廓光，保持同一套奶油色材质。 */
    function setTheme(value: boolean) {
      darkMode = value
    }

    /** 身体与头部分别一次绘制，静止时没有 GPU 更新。 */
    function render() {
      if (!program || gl!.isContextLost()) return
      gl!.clear(gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT)
      gl!.uniform1f(themeUniform, darkMode ? 1 : 0)
      gl!.uniformMatrix4fv(modelUniform, false, bodyMatrix)
      gl!.drawArrays(gl!.TRIANGLES, 0, bodyCount)
      gl!.uniformMatrix4fv(modelUniform, false, headMatrix)
      gl!.drawArrays(gl!.TRIANGLES, bodyCount, vertexCount - bodyCount)
    }

    return { resize, setPose, setTheme, render, dispose }
  } catch (error) {
    dispose()
    throw error
  }
}
