import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

export const GlitchMaterial = shaderMaterial(
  {
    uTexture: null,
    uTime: 0,
    uGlitchIntensity: 0,
    uColor: new THREE.Color('#d0d0d0'),
    uOpacity: 1.0,
  },
  // Vertex Shader
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // Fragment Shader
  `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uGlitchIntensity;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;

  float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  void main() {
      vec2 uv = vUv;

      // 1. Wave Displacement (Removed as requested)
      // float wave = sin(uv.y * 20.0 + uTime * 10.0) * 0.015 * uGlitchIntensity;
      // float wave2 = cos(uv.x * 15.0 + uTime * 7.0) * 0.01 * uGlitchIntensity;
      // uv.x += wave;
      // uv.y += wave2;

      // 2. Image Tearing
      float tearY = floor(uv.y * 15.0 + uTime * 2.0);
      if (rand(vec2(tearY, 1.0)) > (1.0 - 0.15 * uGlitchIntensity)) {
          uv.x += (rand(vec2(tearY, uTime)) - 0.5) * 0.1 * uGlitchIntensity;
      }

      // 3. Chromatic Aberration (RGB Split)
      float offset = 0.03 * uGlitchIntensity;
      vec4 sampleR = texture2D(uTexture, uv + vec2(offset, 0.0));
      vec4 sampleG = texture2D(uTexture, uv);
      vec4 sampleB = texture2D(uTexture, uv - vec2(offset, 0.0));
      
      vec3 texColor = vec3(sampleR.r, sampleG.g, sampleB.b);

      // 4. Scanlines
      float scanline = sin(uv.y * 800.0) * 0.1 * uGlitchIntensity;
      texColor -= scanline;

      // Final color with alpha from texture
      gl_FragColor = vec4(texColor * uColor, sampleG.a * uOpacity);
  }
  `
);

export const GlitchFrameMaterial = shaderMaterial(
  {
    uTexture: null,
    uTime: 0,
    uGlitchIntensity: 0,
    uColor: new THREE.Color('#a629ff'),
    uOpacity: 0.6,
  },
  // Vertex Shader
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // Fragment Shader
  `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uGlitchIntensity;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;

  float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  void main() {
      vec2 uv = vUv;

      // Glitch logic (sync with main image)
      // float wave = sin(uv.y * 20.0 + uTime * 10.0) * 0.015 * uGlitchIntensity;
      // uv.x += wave;

      float tearY = floor(uv.y * 15.0 + uTime * 2.0);
      if (rand(vec2(tearY, 1.0)) > (1.0 - 0.15 * uGlitchIntensity)) {
          uv.x += (rand(vec2(tearY, uTime)) - 0.5) * 0.1 * uGlitchIntensity;
      }

      float offset = 0.02 * uGlitchIntensity;
      float maskR = texture2D(uTexture, uv + vec2(offset, 0.0)).r;
      float maskG = texture2D(uTexture, uv).r;
      float maskB = texture2D(uTexture, uv - vec2(offset, 0.0)).r;

      vec3 finalColor = uColor * maskG;
      // Add RGB split glow
      finalColor.r += maskR * 0.5 * uGlitchIntensity;
      finalColor.b += maskB * 0.5 * uGlitchIntensity;

      float alpha = max(maskG, max(maskR, maskB)) * uOpacity;
      
      gl_FragColor = vec4(finalColor, alpha);
  }
  `
);
