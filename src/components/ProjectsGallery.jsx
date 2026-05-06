import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useTexture, Text, shaderMaterial, useScroll } from '@react-three/drei';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { galleryState } from '../portfolioState';
import { getPortfolioPage, getPortfolioPageIndex, PORTFOLIO_PAGES } from '../portfolioPageData';
import { clamp, getPageOffset } from '../utils/portfolioTimeline';

import { GlitchMaterial, GlitchFrameMaterial } from '../materials/GlitchMaterials';

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


function ProjectCard({ url, index, total, radius, startAngle, endAngle, xOffset, glitchIntensity, opacity }) {
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
      meshRef.current.material.uOpacity = opacity;
    }

    if (hudMeshRef.current && hudMeshRef.current.material) {
      hudMeshRef.current.material.uTime = state.clock.elapsedTime;
      hudMeshRef.current.material.uGlitchIntensity = glitchIntensity;
      // Pulse opacity slightly, then multiply by global opacity
      const pulse = 0.4 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
      hudMeshRef.current.material.uOpacity = pulse * opacity;
    }

    // Glitch-like pulse on the wireframe instead of the image
    if (frameRef.current && frameRef.current.material) {
      frameRef.current.material.opacity = (0.4 + Math.sin(state.clock.elapsedTime * 8 + index) * 0.2) * opacity;
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


    </group>
  );
}

export function ProjectsGallery() {
  const galleryRef = useRef();
  const audioCtxRef = useRef(null);
  const audioBufferRef = useRef(null);
  const glitchBufferRef = useRef(null);
  const hasPlayedEntrySoundRef = useRef(false);
  const scroll = useScroll();
  const projectsPage = getPortfolioPage('projects');
  const projectsPageIndex = getPortfolioPageIndex('projects');
  const pageCount = PORTFOLIO_PAGES.length;
  const nextPageOffset = getPageOffset(projectsPageIndex + 1, pageCount);

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
  const [opacity, setOpacity] = useState(1);
  const [currentRadius, setCurrentRadius] = useState(radius);
  const currentRotation = useRef(0);

  // Pre-decode audio for zero-latency playback
  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;

    const loadSound = (url, bufferRef) => {
      fetch(url)
        .then((r) => r.arrayBuffer())
        .then((ab) => ctx.decodeAudioData(ab))
        .then((buf) => { bufferRef.current = buf; })
        .catch(() => { });
    };

    loadSound('/audio/alexzavesa-woosh-game-glitch-4-463026.mp3', audioBufferRef);
    loadSound('/audio/virtual_vibes-glitch-sound-effect-hd-379466.mp3', glitchBufferRef);

    // Audio Unlocker: Browsers block audio until a user gesture.
    const unlock = () => {
      if (ctx.state === 'suspended') ctx.resume();
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('wheel', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('wheel', unlock);
    window.addEventListener('touchstart', unlock);

    return () => {
      ctx.close();
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('wheel', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);

  const playSound = (buffer, volume = 0.5) => {
    if (audioCtxRef.current && buffer) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const src = audioCtxRef.current.createBufferSource();
      src.buffer = buffer;
      const gain = audioCtxRef.current.createGain();
      gain.gain.value = volume;
      src.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      src.start(0);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (scroll.offset > nextPageOffset - 0.02) return;
      if (scroll.offset < (projectsPage?.timing.keyboardNavigationStart ?? 0.6)) return;

      if (e.key === 'ArrowRight') {
        galleryState.index = (galleryState.index + 1) % PROJECTS.length;
        galleryState.targetRotation -= (Math.PI * 2) / PROJECTS.length;
      } else if (e.key === 'ArrowLeft') {
        galleryState.index = (galleryState.index - 1 + PROJECTS.length) % PROJECTS.length;
        galleryState.targetRotation += (Math.PI * 2) / PROJECTS.length;
      } else {
        return; // not a navigation key — skip sound
      }

      // Play pre-decoded whoosh (no decode delay)
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        playSound(audioBufferRef.current, 0.3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scroll, projectsPage, nextPageOffset]);

  useFrame((state, delta) => {
    if (!galleryRef.current) return;
    const offset = scroll.offset;
    const scaleProgress = THREE.MathUtils.smoothstep(offset, projectsPage?.timing.galleryScaleStart ?? 0.45, projectsPage?.timing.galleryScaleEnd ?? 0.8);
    const glitchProgress = THREE.MathUtils.smoothstep(offset, projectsPage?.timing.galleryGlitchStart ?? 0.4, projectsPage?.timing.galleryGlitchEnd ?? 0.98);
    const exitFadeDistance = projectsPage?.timing.galleryExitFadeDistance ?? 0.08;
    const exitStart = nextPageOffset - exitFadeDistance;
    const isLastPage = projectsPageIndex === pageCount - 1;
    const exitVisibility = isLastPage
      ? 1
      : clamp((nextPageOffset - offset) / Math.max(0.0001, nextPageOffset - exitStart), 0, 1);

    // Scale in during entrance, and scale out during exit
    const visibleScale = THREE.MathUtils.lerp(0.001, 1, scaleProgress) * exitVisibility;
    const nextOpacity = exitVisibility;

    // Move towards the center during exit with ease-in curve
    const exitProgress = 1 - nextOpacity;
    const easedExit = Math.pow(exitProgress, 2.5); // Start slow, accelerate
    const nextRadius = radius - easedExit * radius; // Decrease radius to move "in"

    setOpacity(nextOpacity);
    setCurrentRadius(nextRadius);

    galleryRef.current.scale.setScalar(visibleScale);
    galleryRef.current.visible = visibleScale > 0.01 && nextOpacity > 0.01;

    // Smoothly update the current rotation (used for the axis pulse or other local effects)
    currentRotation.current = THREE.MathUtils.lerp(currentRotation.current, galleryState.targetRotation, delta * 4);

    const intensity = Math.pow(1.0 - glitchProgress, 1.0);
    setGlitchIntensity(intensity);

  });

  return (
    // Wrapper group to shift the mathematical center to match the visual center
    <group position={[centerX, centerY, centerZ]}>
      <group ref={galleryRef}>
        {PROJECTS.map((project, i) => (
          <ProjectCard
            key={project.id}
            url={project.img}
            index={i}
            total={PROJECTS.length}
            radius={currentRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            xOffset={xOffset}
            glitchIntensity={glitchIntensity}
            opacity={opacity}
          />
        ))}
      </group>
    </group>
  );
}
