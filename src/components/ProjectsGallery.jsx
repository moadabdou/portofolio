import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useTexture, Text, shaderMaterial, useScroll } from '@react-three/drei';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { galleryState } from '../App';

const GlitchMaterial = shaderMaterial(
  {
    uTexture: null,
    uTime: 0,
    uGlitchIntensity: 0,
    uColor: new THREE.Color('#d0d0d0'),
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
  varying vec2 vUv;

  float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  void main() {
      vec2 uv = vUv;

      // 1. Wave Displacement (Fluctuation)
      float wave = sin(uv.y * 20.0 + uTime * 10.0) * 0.015 * uGlitchIntensity;
      float wave2 = cos(uv.x * 15.0 + uTime * 7.0) * 0.01 * uGlitchIntensity;
      uv.x += wave;
      uv.y += wave2;

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
      gl_FragColor = vec4(texColor * uColor, sampleG.a);
  }
  `
);

const GlitchFrameMaterial = shaderMaterial(
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
      float wave = sin(uv.y * 20.0 + uTime * 10.0) * 0.015 * uGlitchIntensity;
      uv.x += wave;

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

extend({ GlitchMaterial, GlitchFrameMaterial });

export const PROJECTS = [
  {
    id: 1,
    img: '/projects/p1.png',
    title: 'AERO SPEECH',
    description: 'A cutting-edge hybrid Text-to-Speech engine engineered for ultra-low latency and natural prosody. Built with a distributed backend architecture to handle high-concurrency real-time audio synthesis at scale.',
    github: 'https://github.com/moadabdou/aerospeech'
  },
  {
    id: 2,
    img: '/projects/p2.png',
    title: 'NEURAL NEXUS',
    description: 'Advanced deep learning orchestration platform that simplifies the deployment of complex neural networks. Features automated hyperparameter tuning and seamless scaling across multi-GPU environments.',
    github: 'https://github.com/moadabdou/neural-nexus'
  },
  {
    id: 3,
    img: '/projects/p3.png',
    title: 'CYBER CORE',
    description: 'Enterprise-grade cybersecurity monitoring system utilizing transformer-based anomaly detection. It provides real-time threat intelligence and automated incident response for critical infrastructure.',
    github: 'https://github.com/moadabdou/cyber-core'
  },
  {
    id: 4,
    img: '/projects/p4.png',
    title: 'VIRTUAL VORTEX',
    description: 'A high-performance WebGL visualization engine designed for rendering complex fluid dynamics and particle systems in real-time. Leverages custom GLSL shaders for cinematic-quality visual effects.',
    github: 'https://github.com/moadabdou/virtual-vortex'
  },
  {
    id: 5,
    img: '/projects/p5.png',
    title: 'QUANTUM QUARTZ',
    description: 'High-dimensional data analytics suite specialized in quantum computing simulations. Offers immersive 3D visualizations and predictive modeling for multi-variable experimental datasets.',
    github: 'https://github.com/moadabdou/quantum-quartz'
  },
];


function ProjectCard({ url, title, index, total, radius, startAngle, endAngle, xOffset, glitchIntensity }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const frameRef = useRef();
  const hudMeshRef = useRef();
  const texture = useTexture(url);
  const hudTexture = useTexture('/hud_frame.png');

  // Ensure textures are in the correct color space for vibrant colors
  if (texture) texture.colorSpace = THREE.SRGBColorSpace;
  if (hudTexture) hudTexture.colorSpace = THREE.SRGBColorSpace;

  // Calculate position along a full circle
  const angle = (index / total) * Math.PI * 2 + 90;

  const y = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;
  const x = xOffset;
  const geometry = useMemo(() => {
    const width = 1.6;
    const height = 2.2;
    const segments = 32;
    const geo = new THREE.PlaneGeometry(width, height, 1, segments);
    const pos = geo.attributes.position;
    const curveAmount = 0.2;
    for (let i = 0; i < pos.count; i++) {
      const vy = pos.getY(i);
      pos.setZ(i, -Math.pow(vy / 1.1, 2) * curveAmount);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const hudGeometry = useMemo(() => {
    const width = 1.6 * 1.25;
    const height = 2.2 * 2.05;
    const segments = 32;
    const geo = new THREE.PlaneGeometry(width, height, 1, segments);
    const pos = geo.attributes.position;
    const curveAmount = 0.2; // Keep the same curvature coefficient as the image
    for (let i = 0; i < pos.count; i++) {
      const vy = pos.getY(i);
      // vy here goes from -height/2 to height/2
      // We want to match the image's curve: z = - (y / 1.1)^2 * 0.2
      pos.setZ(i, -Math.pow(vy / 1.1, 2) * curveAmount);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    if (meshRef.current && meshRef.current.material) {
      meshRef.current.material.uTime = state.clock.elapsedTime;
      meshRef.current.material.uGlitchIntensity = glitchIntensity;
    }

    if (hudMeshRef.current && hudMeshRef.current.material) {
      hudMeshRef.current.material.uTime = state.clock.elapsedTime;
      hudMeshRef.current.material.uGlitchIntensity = glitchIntensity;
      // Pulse opacity slightly
      hudMeshRef.current.material.uOpacity = 0.4 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
    }

    // Glitch-like pulse on the wireframe instead of the image
    if (frameRef.current && frameRef.current.material) {
      frameRef.current.material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 8 + index) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[x, y, z]} rotation={[-angle, 0, -Math.PI]}>
      <mesh ref={meshRef} geometry={geometry}>
        <glitchMaterial
          uTexture={texture}
          transparent
          side={THREE.DoubleSide}
          toneMapped={true}
        />
      </mesh>

      {/* HUD Tech Frame */}
      <mesh ref={hudMeshRef} geometry={hudGeometry} position={[0, 0, 0.01]}>
        <glitchFrameMaterial
          uTexture={hudTexture}
          transparent
          uColor="#ef4bfbff"
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Neon Wireframe (Original) - Keep but fade out if needed */}
      <mesh ref={frameRef} geometry={geometry} scale={[1.01, 1.01, 1.01 * 1.01]} position={[0, 0, -0.01]}>
        <meshBasicMaterial color="#a629ff" wireframe transparent opacity={0.2} toneMapped={false} />
      </mesh>

      <Text
        position={[0, -0.65, 0.1]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015}
        outlineColor="#a629ff"
      // If the text needs to be rotated to be readable, you can add a rotation prop here
      >
        {title}
      </Text>
    </group>
  );
}

export function ProjectsGallery() {
  const galleryRef = useRef();
  const scroll = useScroll();

  // Tweakable parameters for the arc in the YZ plane
  const radius = 3.6; // Matches the station's ring radius
  // Shifted angles up to move the center images higher along the ring
  const startAngle = Math.PI * 0.75;
  const endAngle = -Math.PI * 0.45;
  const xOffset = .2; // Offset to sit on the front face (+X or -X face depending on model)

  // 3D Model Offset (The model's visual center is not at 0,0,0)
  // Tweak these to move the axesHelper (and the arc) to the exact center of the ring!
  const centerX = 0.0;  // Try moving it along +X
  const centerY = 0.0;
  const centerZ = 0.0; // Try moving it along -Z

  // Orientation tweaks for the cards to lay flat on the ring
  const rotX = 0;
  // Flipping the normal by using -Math.PI / 2 to fix the mirrored text!
  const rotY = 0;
  const rotZ = Math.PI; // Tweak this if the images are sideways or upside down

  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const currentRotation = useRef(0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only navigate if we are mostly scrolled to the projects section
      if (scroll.offset < 0.6) return;

      if (e.key === 'ArrowRight') {
        galleryState.index = (galleryState.index + 1) % PROJECTS.length;
        galleryState.targetRotation -= (Math.PI * 2) / PROJECTS.length;
      } else if (e.key === 'ArrowLeft') {
        galleryState.index = (galleryState.index - 1 + PROJECTS.length) % PROJECTS.length;
        galleryState.targetRotation += (Math.PI * 2) / PROJECTS.length;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scroll]);

  useFrame((state, delta) => {
    if (!galleryRef.current) return;
    const offset = scroll.offset;
    const scaleProgress = THREE.MathUtils.smoothstep(offset, 0.45, 0.8);
    const glitchProgress = THREE.MathUtils.smoothstep(offset, 0.4, 0.98);

    galleryRef.current.scale.setScalar(THREE.MathUtils.lerp(0.001, 1, scaleProgress));
    galleryRef.current.visible = scaleProgress > 0.01;

    // Smoothly rotate the gallery
    currentRotation.current = THREE.MathUtils.lerp(currentRotation.current, galleryState.targetRotation, delta * 4);
    galleryRef.current.rotation.x = currentRotation.current;

    const intensity = Math.pow(1.0 - glitchProgress, 1.0);
    setGlitchIntensity(intensity);
  });

  return (
    // Apply the same rotation as SpaceStation
    <group rotation={[1.9, 2.35, -.55]}>
      {/* Wrapper group to shift the mathematical center to match the visual center */}
      <group position={[centerX, centerY, centerZ]}>
        <group ref={galleryRef}>
          {PROJECTS.map((project, i) => (
            <ProjectCard
              key={project.id}
              url={project.img}
              title={project.title}
              index={i}
              total={PROJECTS.length}
              radius={radius}
              startAngle={startAngle}
              endAngle={endAngle}
              xOffset={xOffset}
              glitchIntensity={glitchIntensity}
            />
          ))}
        </group>
      </group>
    </group>
  );
}
