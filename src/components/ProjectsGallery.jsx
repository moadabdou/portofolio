import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useTexture, Text, shaderMaterial, useScroll } from '@react-three/drei';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { galleryState } from '../portfolioState';
import { getPortfolioPage, getPortfolioPageIndex, PORTFOLIO_PAGES } from '../portfolioPageData';
import { clamp, getPageOffset, getRelativeOffset } from '../utils/portfolioTimeline';

import { GlitchMaterial, GlitchFrameMaterial } from '../materials/GlitchMaterials';

extend({ GlitchMaterial, GlitchFrameMaterial });

export const PROJECTS = [
  {
    id: 1,
    img: '/projects/p1.png',
    title: 'MTensor',
    description: 'A high-performance CPU-based deep learning and autograd engine built in C++. Features an architecture integrated with oneDNN primitives, OpenMP parallelism, and custom AVX-512 fused vector operations for optimizers and reductions. Implements dynamic computational graphs, strided memory layouts, and a comprehensive neural network layer topology from scratch.',
    github: 'https://github.com/moadabdou/Mtensor'
  },
  {
    id: 2,
    img: '/projects/p2.png',
    title: 'Fern-OS',
    description: 'A high-concurrency distributed job orchestration engine built to schedule and execute DAG workflows over custom network primitives. Features a central orchestrator leveraging Java 21 Virtual Threads and Spring Boot, communicating with decentralized plain-Java worker nodes via a custom-built, big-endian binary TCP wire protocol. Implements robust crash recovery, isolated state persistence with PostgreSQL, distributed state management (XCom) using MinIO, and a comprehensive Python SDK for programmatic workflow definitions.',
    github: 'https://github.com/moadabdou/fernos'
  },
  {
    id: 3,
    img: '/projects/p3.png',
    title: 'ArimaSSH',
    description: 'A modular, pure Java implementation of the SSH-2 protocol (RFC 4253) and SFTP subsystem engineered from the bare metal. Built without high-level SSH dependencies, it maps raw TCP sockets directly to Java 21 Virtual Threads for non-blocking, asynchronous connection handling. Features custom binary packet serialization, stateful Diffie-Hellman key exchanges via Bouncy Castle, CTR-mode AES symmetric encryption, and full TCP/IP port forwarding multiplexing.',
    github: 'https://github.com/moadabdou/arimassh'
  },
  {
    id: 4,
    img: '/projects/p4.png',
    title: 'e-Service',
    description: 'An Academic Resource Planning application designed to automate and optimize teaching load allocations within department faculties. Engineered with a strict Role-Based Access Control (RBAC) matrix separating Administrators, Department Heads, Program Coordinators, and Faculty Staff. Features a stateful workflow engine for expressing module preferences, tracking cascading validation matrices, calculating dynamic hourly quotas, and generating granular administrative reports',
    github: 'https://github.com/moadabdou/e-service'
  },
  {
    id: 5,
    img: '/projects/p5.png',
    title: 'AeroSpeech',
    description: 'A high-fidelity, non-autoregressive Text-to-Speech (TTS) synthesis engine utilizing a novel hybrid deep learning architecture. The system replaces standard Transformer self-attention layers with a low-latency pipeline combining Gated Linear Attention (GLA) and Mamba 2 state-space models (SSMs) to achieve $O(N)$ linear complexity during text-to-mel spectrogram generation. Features integrated multi-variance adaptors for pitch, energy, and duration alignment, coupled with a pretrained HiFi-GAN vocoder execution layer for real-time acoustic neural decoding.',
    github: 'https://github.com/moadabdou/aerospeech'
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
      const offset = scroll.offset;
      const pageOffset = getRelativeOffset(offset, projectsPageIndex, pageCount);

      if (offset > nextPageOffset - 0.02) return;
      // Use pageOffset (0-1) instead of global offset to compare against the timing threshold
      if (pageOffset < (projectsPage?.timing.keyboardNavigationStart ?? 0.6)) return;

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
  }, [scroll, projectsPage, nextPageOffset, projectsPageIndex, pageCount]);

  useFrame((state, delta) => {
    if (!galleryRef.current) return;
    const offset = scroll.offset;
    const pageOffset = getRelativeOffset(offset, projectsPageIndex, pageCount);

    const scaleProgress = THREE.MathUtils.smoothstep(pageOffset, projectsPage?.timing.galleryScaleStart ?? 0.3, projectsPage?.timing.galleryScaleEnd ?? 0.5);
    const glitchProgress = THREE.MathUtils.smoothstep(pageOffset, projectsPage?.timing.galleryGlitchStart ?? 0.3, projectsPage?.timing.galleryGlitchEnd ?? 0.5);

    // Exit logic: fade out as we approach the end of the page range (relative offset 1.0)
    const exitFadeDistance = projectsPage?.timing.galleryExitFadeDistance ?? 0.3;
    const exitStart = 1.0 - exitFadeDistance;
    const isLastPage = projectsPageIndex === pageCount - 1;
    const exitVisibility = isLastPage
      ? 1
      : clamp((1.0 - pageOffset) / exitFadeDistance, 0, 1);

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

    // We don't rotate galleryRef here because the parent group in App.jsx (sharedRotationRef)
    // already handles the combined rotation for the SpaceStation and the Gallery.

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
