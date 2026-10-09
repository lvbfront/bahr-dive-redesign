// A tiny raw-WebGL "liquid gradient": domain-warped noise in Bahr's blues that drifts on its own and is stirred by the
// pointer (soft swirl + ripple with inertia). ~2 KB, no three.js. One instance per <BahrMark live />.

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`

const FRAG = `precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uP; uniform float uStir; uniform vec2 uVel;
vec2 h2(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  float a = dot(h2(i) - 0.5, f), b = dot(h2(i + vec2(1, 0)) - 0.5, f - vec2(1, 0));
  float c = dot(h2(i + vec2(0, 1)) - 0.5, f - vec2(0, 1)), d = dot(h2(i + vec2(1, 1)) - 0.5, f - vec2(1, 1));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) + 0.5;
}
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p = p * 2.02 + vec2(1.7, 9.2); a *= 0.5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * asp, uv.y) * 1.35;
  float t = uTime * 0.06;
  // pointer stir: a swirl + ripple around the pointer, strength eased on the JS side (inertia)
  vec2 d = (uv - uP) * vec2(asp, 1.0);
  float r = length(d);
  float fall = exp(-r * r * 14.0);
  float ang = uStir * fall * 2.6;
  mat2 R = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  p = R * (p - uP * vec2(asp, 1.0) * 1.35) + uP * vec2(asp, 1.0) * 1.35;
  p += uVel * fall * 0.6;
  p += normalize(d + 1e-4) * sin(r * 34.0 - uTime * 5.0) * 0.025 * uStir * exp(-r * 5.0);
  // flowing domain warp
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  vec2 w = vec2(fbm(p + 1.8 * q + vec2(1.7, 9.2) + t * 0.7), fbm(p + 1.8 * q + vec2(8.3, 2.8) - t * 0.6));
  float f = fbm(p + 2.2 * w);
  vec3 navy = vec3(0.035, 0.09, 0.26), deep = vec3(0.039, 0.184, 0.502), royal = vec3(0.043, 0.275, 0.651);
  vec3 mid = vec3(0.063, 0.39, 0.71), light = vec3(0.2, 0.56, 0.87);
  // base gradient like the screenshots: lighter toward the lower-left tail, deeper toward the upper-right
  float base = clamp(0.62 - uv.x * 0.4 + (0.5 - uv.y) * 0.3, 0.0, 1.0);
  float v = smoothstep(0.36, 0.66, f) * 0.85 + base * 0.3 - 0.08;
  vec3 col = mix(navy, deep, smoothstep(0.0, 0.3, v));
  col = mix(col, royal, smoothstep(0.25, 0.55, v));
  col = mix(col, mid, smoothstep(0.55, 0.78, v));
  col = mix(col, light, smoothstep(0.78, 1.0, v));
  gl_FragColor = vec4(col, 1.0);
}`

export class Liquid {
  private gl: WebGLRenderingContext
  private prog: WebGLProgram
  private u: Record<string, WebGLUniformLocation | null> = {}
  private raf = 0
  private t0 = performance.now()
  private running = false
  private target = { x: 0.5, y: 0.5 }
  private ptr = { x: 0.5, y: 0.5 }
  private vel = { x: 0, y: 0 }
  private stir = 0
  private stirTarget = 0
  speed = 1

  constructor(private canvas: HTMLCanvasElement, private maxDpr: number) {
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'low-power' })
    if (!gl) throw new Error('no webgl')
    this.gl = gl
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader')
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)
    this.prog = prog
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    for (const k of ['uRes', 'uTime', 'uP', 'uStir', 'uVel']) this.u[k] = gl.getUniformLocation(prog, k)
    this.resize()
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr)
    const w = Math.max(1, Math.round(this.canvas.clientWidth * dpr))
    const h = Math.max(1, Math.round(this.canvas.clientHeight * dpr))
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w
      this.canvas.height = h
      this.gl.viewport(0, 0, w, h)
    }
  }

  /** pointer in 0..1 element space (y up); `inside` = over the letters */
  point(x: number, y: number, inside: boolean) {
    const dx = x - this.target.x
    const dy = y - this.target.y
    this.target = { x, y }
    if (inside) {
      this.stirTarget = Math.min(1.4, this.stirTarget + Math.hypot(dx, dy) * 9)
      this.vel = { x: this.vel.x + dx * 4, y: this.vel.y + dy * 4 }
    }
  }

  private frame = () => {
    this.raf = requestAnimationFrame(this.frame)
    const gl = this.gl
    const time = ((performance.now() - this.t0) / 1000) * this.speed
    // inertia: the stir eases in and decays; the pointer position lags behind
    this.ptr.x += (this.target.x - this.ptr.x) * 0.12
    this.ptr.y += (this.target.y - this.ptr.y) * 0.12
    this.stir += (this.stirTarget - this.stir) * 0.08
    this.stirTarget *= 0.955
    this.vel.x *= 0.94
    this.vel.y *= 0.94
    gl.uniform2f(this.u.uRes, this.canvas.width, this.canvas.height)
    gl.uniform1f(this.u.uTime, time)
    gl.uniform2f(this.u.uP, this.ptr.x, this.ptr.y)
    gl.uniform1f(this.u.uStir, this.stir)
    gl.uniform2f(this.u.uVel, this.vel.x, this.vel.y)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  start() {
    if (this.running) return
    this.running = true
    this.raf = requestAnimationFrame(this.frame)
  }
  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }
  destroy() {
    this.stop()
    this.gl.deleteProgram(this.prog)
    this.gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
}
