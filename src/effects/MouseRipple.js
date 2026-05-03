import { Effect } from 'postprocessing';
import { Uniform, Vector2 } from 'three';

const fragmentShader = /* glsl */`
  uniform vec2  uMouse;    // cursor position in 0..1 UV space
  uniform vec2  uDir;      // normalized velocity direction (points forward)
  uniform float uSpeed;    // scalar speed, clamped 0..1

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Vector from cursor to this pixel
    vec2 d = uv - uMouse;

    // Component along velocity (positive = in front of cursor)
    float along = dot(d, uDir);

    // Component perpendicular to velocity
    vec2  perpDir = vec2(-uDir.y, uDir.x);
    float perp    = dot(d, perpDir);

    // Distance from cursor
    float dist = length(d);

    // --- Wake cone ---
    // Only pixels *behind* the cursor (along < 0) and within ±halfAngle
    float behind   = -along;                         // positive when behind
    float halfAngle = 0.5;                            // ~26° each side
    float inCone   = step(0.001, behind)              // must be behind
                   * step(abs(perp), behind * halfAngle); // within V-cone

    // --- Wave function ---
    // Waves run perpendicular to velocity, get smaller with distance
    float wave = sin(behind * 55.0)                   // frequency along wake trail
               * exp(-dist * 5.5)                     // fall-off from cursor
               * inCone
               * uSpeed
               * 0.012;                               // overall strength

    // Displace UV perpendicular to motion direction
    vec2 distUV = uv + perpDir * wave;

    // Chromatic aberration at wave crests
    float ab = abs(wave) * 3.5;
    float cr = texture2D(inputBuffer, distUV + vec2(ab * 0.004, 0.0)).r;
    float cg = texture2D(inputBuffer, distUV                        ).g;
    float cb = texture2D(inputBuffer, distUV - vec2(ab * 0.004, 0.0)).b;

    outputColor = vec4(cr, cg, cb, inputColor.a);
  }
`;

export class WakeEffect extends Effect {
  constructor() {
    super('WakeEffect', fragmentShader, {
      uniforms: new Map([
        ['uMouse', new Uniform(new Vector2(0.5, 0.5))],
        ['uDir',   new Uniform(new Vector2(1.0, 0.0))],
        ['uSpeed', new Uniform(0.0)],
      ]),
    });

    this._prev      = new Vector2(0.5, 0.5);
    this._smoothDir = new Vector2(1.0, 0.0);
    this._smoothSpd = 0;
  }

  /** Call every mousemove from React */
  setMouse(x, y) {
    this.uniforms.get('uMouse').value.set(x, y);
  }

  /** Called automatically every frame by EffectComposer */
  update(_renderer, _inputBuffer, deltaTime) {
    const mouse = this.uniforms.get('uMouse').value;

    // Raw frame displacement
    const dx = mouse.x - this._prev.x;
    const dy = mouse.y - this._prev.y;
    const rawLen = Math.sqrt(dx * dx + dy * dy);

    if (rawLen > 0.0001) {
      // Smooth the direction so it doesn't snap
      this._smoothDir.x += (dx / rawLen - this._smoothDir.x) * 0.35;
      this._smoothDir.y += (dy / rawLen - this._smoothDir.y) * 0.35;
      const l = Math.sqrt(this._smoothDir.x ** 2 + this._smoothDir.y ** 2);
      this._smoothDir.x /= l;
      this._smoothDir.y /= l;
    }

    // Speed: pixels-per-second equivalent in UV space
    const rawSpeed = Math.min(rawLen / (deltaTime + 0.001) * 2.5, 1.0);
    this._smoothSpd += (rawSpeed - this._smoothSpd) * 0.25;

    this.uniforms.get('uDir').value.copy(this._smoothDir);
    this.uniforms.get('uSpeed').value = this._smoothSpd;

    this._prev.copy(mouse);
  }
}
