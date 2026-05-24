import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Text, useScroll, useTexture } from '@react-three/drei';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { galleryState } from '../portfolioState';
import { getPortfolioPage, getPortfolioPageIndex, PORTFOLIO_PAGES } from '../portfolioPageData';
import { clamp, getPageOffset, getRelativeOffset } from '../utils/portfolioTimeline';
import { GlitchMaterial, GlitchFrameMaterial } from '../materials/GlitchMaterials';
import { HologramProjector } from './HologramProjector';

extend({ GlitchMaterial, GlitchFrameMaterial });

const OPTIONS = [
  "WHO I AM",
  "WHAT I BUILD",
  "HOW I THINK",
  "WHAT'S NEXT"
];

function OptionButton({ text, index, total, radiusRef, xOffset, opacityRef, isSelected, onSelect, glitchIntensityRef }) {
  const groupRef = useRef();
  const textRef = useRef();
  const hudMeshRef = useRef();
  const bgRef = useRef();

  const hudTexture = useTexture('/hud_frame.png');
  if (hudTexture) hudTexture.colorSpace = THREE.SRGBColorSpace;

  // Calculate position along a tight arc instead of a full circle
  const spread = Math.PI * 0.25;
  const BASE_ANGLE = -Math.PI / 6; // Aligns with the -2.1 offset visually
  const angle = ((index - (total - 1) / 2) / (total > 1 ? total - 1 : 1)) * spread + BASE_ANGLE;
  const x = xOffset;

  const geometry = useMemo(() => {
    const width = 2.5;
    const height = 0.6;
    const segments = 32;
    const geo = new THREE.PlaneGeometry(width, height, 1, segments);
    const pos = geo.attributes.position;
    const curveAmount = 0.1; // Slightly less curve than images since they are wider
    for (let i = 0; i < pos.count; i++) {
      const vy = pos.getY(i);
      pos.setZ(i, -Math.pow(vy / 1.1, 2) * curveAmount);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const hudGeometry = useMemo(() => {
    const width = 2.7 * 1.1;
    const height = 0.6 * 2.4;
    const segments = 32;
    const geo = new THREE.PlaneGeometry(width, height, 1, segments);
    const pos = geo.attributes.position;
    const curveAmount = 0.1;
    for (let i = 0; i < pos.count; i++) {
      const vy = pos.getY(i);
      pos.setZ(i, -Math.pow(vy / 1.1, 2) * curveAmount);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const curOpacity = opacityRef ? opacityRef.current : 1;
    const curRadius = radiusRef ? radiusRef.current : 3.6;
    const curGlitch = glitchIntensityRef ? glitchIntensityRef.current : 0;

    const y = Math.sin(angle) * curRadius;
    const z = Math.cos(angle) * curRadius;

    // Scale pulse: normal pulse + active expansion (made faster and smaller)
    const basePulse = 1.0 + (isSelected ? Math.sin(state.clock.elapsedTime * 5) * 0.05 : 0);
    const activeScale = THREE.MathUtils.lerp(groupRef.current.scale.x, isSelected ? 1.08 : basePulse, delta * 10);
    groupRef.current.scale.setScalar(activeScale);

    // Shift slightly forward when selected
    const targetZ = isSelected ? 0.1 : 0;
    groupRef.current.position.y = y;
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, z + targetZ, delta * 18);

    if (bgRef.current && bgRef.current.material) {
      bgRef.current.material.opacity = (isSelected ? 0.6 : 0.2) * curOpacity;
      bgRef.current.material.color.lerp(new THREE.Color(isSelected ? "#ff00ff" : "#4b0082"), delta * 18);
    }

    if (hudMeshRef.current && hudMeshRef.current.material) {
      hudMeshRef.current.material.uTime = state.clock.elapsedTime;
      // Local glitch intensity increases when selected
      const localGlitch = isSelected ? 0.4 + Math.random() * 0.2 : curGlitch;
      hudMeshRef.current.material.uGlitchIntensity = localGlitch;

      const hudPulse = (isSelected ? 1.0 : 0.8) + Math.sin(state.clock.elapsedTime * (isSelected ? 10 : 2) + index) * 0.2;
      hudMeshRef.current.material.uOpacity = hudPulse * curOpacity;
    }

    if (textRef.current) {
      textRef.current.fillOpacity = curOpacity;
      // Flickering text when selected
      if (isSelected && Math.random() > 0.95) {
        textRef.current.fillOpacity = 0.3 * curOpacity;
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={[x, 0, 0]}
      rotation={[-angle, 0, -Math.PI]}
    >
      {/* Invisible Hit Area (Optimized size to avoid overlapping gaps) */}
      <mesh
        position={[0, 0, 0.02]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'auto';
        }}
      >
        <planeGeometry args={[2.8, 0.7]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Semi-transparent Background */}
      <mesh ref={bgRef} geometry={geometry} position={[0, 0, -0.01]}>
        <meshBasicMaterial
          color={isSelected ? "#d900ff" : "#4b0082"}
          transparent
          opacity={0.2}
          toneMapped={false}
        />
      </mesh>

      {/* HUD Tech Frame */}
      <mesh ref={hudMeshRef} geometry={hudGeometry} position={[0, 0, 0.01]}>
        <glitchFrameMaterial
          uTexture={hudTexture}
          transparent
          uColor={new THREE.Color(isSelected ? "#ff00ff" : "#ef4bfb").multiplyScalar(1.5)}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      <Text
        ref={textRef}
        fontSize={0.16}
        maxWidth={2.8}
        lineHeight={1}
        textAlign="center"
        anchorY="middle"
        color="white"
        font="/Orbitron-VariableFont_wght.ttf"
        letterSpacing={0.1}
      >
        {text.toUpperCase()}
      </Text>
    </group>
  );
}

export function WhoAmIGallery() {
  const galleryRef = useRef();
  const scroll = useScroll();
  const page = getPortfolioPage('who-am-i');
  const pageIndex = getPortfolioPageIndex('who-am-i');
  const pageCount = PORTFOLIO_PAGES.length;
  const nextPageOffset = getPageOffset(pageIndex + 1, pageCount);

  const radius = 3.6;
  const xOffset = 0.2;
  const opacityRef = useRef(1);
  const currentRadiusRef = useRef(radius);
  const glitchIntensityRef = useRef(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const transitionGlitchRef = useRef(0);
  const clickAudioCtxRef = useRef(null);
  const clickAudioBufferRef = useRef(null);

  // Pre-decode click sound for zero-latency playback
  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    clickAudioCtxRef.current = ctx;
    fetch('/audio/click.mp3')
      .then((r) => r.arrayBuffer())
      .then((ab) => ctx.decodeAudioData(ab))
      .then((buf) => { clickAudioBufferRef.current = buf; })
      .catch(() => { });
    return () => ctx.close();
  }, []);

  const playClickSound = () => {
    if (clickAudioCtxRef.current && clickAudioBufferRef.current) {
      if (clickAudioCtxRef.current.state === 'suspended') {
        clickAudioCtxRef.current.resume();
      }
      const src = clickAudioCtxRef.current.createBufferSource();
      src.buffer = clickAudioBufferRef.current;
      const gain = clickAudioCtxRef.current.createGain();
      gain.gain.value = 0.4; // Set a clear volume
      src.connect(gain);
      gain.connect(clickAudioCtxRef.current.destination);
      src.start(clickAudioCtxRef.current.currentTime);
    }
  };

  useFrame((state, delta) => {
    if (!galleryRef.current) return;
    const offset = scroll.offset;
    const pageOffset = getRelativeOffset(offset, pageIndex, pageCount);

    // Glitchy Entrance Logic
    const entranceStart = page?.timing.galleryScaleStart ?? 0.0;
    const entranceEnd = page?.timing.galleryScaleEnd ?? 0.48;

    // progress goes from 0 to 1 during entrance
    const entranceProgress = clamp((pageOffset - entranceStart) / (entranceEnd - entranceStart), 0, 1);

    // Exit logic: fade out as we approach the end of the page range (relative offset 1.0)
    const exitFadeDistance = page?.timing.galleryExitFadeDistance ?? 0.2;
    const isLastPage = pageIndex === pageCount - 1;
    const exitVisibility = isLastPage
      ? 1
      : clamp((1.0 - pageOffset) / exitFadeDistance, 0, 1);

    // Stutter/Flicker effect during entrance (finishes at 90% progress)
    let stutter = 1;
    if (entranceProgress > 0 && entranceProgress < 0.9) {
      // Randomly hide or show based on progress to create flickering
      if (Math.random() > entranceProgress * 1.5) {
        stutter = 0;
      }
      // Add occasional "half-visible" frames
      else if (Math.random() > 0.8) {
        stutter = 0.5;
      }
    }

    const nextOpacity = exitVisibility * (entranceProgress > 0.01 ? 1 : 0) * stutter;

    // Scale is either 0 or 1 (with a tiny bit of jitter when glitching, finishes at 90%)
    const jitter = (entranceProgress > 0 && entranceProgress < 0.9 && Math.random() > 0.8) ? (1 + (Math.random() - 0.5) * 0.1) : 1;
    const visibleScale = (entranceProgress > 0.05 ? 1 : 0.001) * exitVisibility * jitter;

    const exitProgress = 1 - exitVisibility;
    const easedExit = Math.pow(exitProgress, 2.5);
    const nextRadius = radius - easedExit * radius;

    opacityRef.current = nextOpacity;
    currentRadiusRef.current = nextRadius;

    if (galleryRef.current.scale) {
      galleryRef.current.scale.setScalar(visibleScale);
    }
    galleryRef.current.visible = visibleScale > 0.001 && nextOpacity > 0.01;

    // Glitch intensity - fades out as we approach the final state (entranceProgress = 1)
    const intensity = (entranceProgress > 0 && entranceProgress < 1)
      ? (0.8 + Math.random() * 0.2) * (1.0 - entranceProgress)
      : Math.pow(1.0 - entranceProgress, 2.0);
    glitchIntensityRef.current = intensity;

    // Transition glitch decay
    if (transitionGlitchRef.current > 0.01) {
      transitionGlitchRef.current = THREE.MathUtils.lerp(transitionGlitchRef.current, 0, delta * 10);
    } else if (transitionGlitchRef.current !== 0) {
      transitionGlitchRef.current = 0;
    }
  });

  return (
    <group ref={galleryRef}>
      {OPTIONS.map((option, i) => (
        <OptionButton
          key={option}
          text={option}
          index={i}
          total={OPTIONS.length}
          radiusRef={currentRadiusRef}
          xOffset={xOffset}
          opacityRef={opacityRef}
          isSelected={selectedIndex === i}
          onSelect={() => {
            if (selectedIndex !== i) {
              setSelectedIndex(i);
              transitionGlitchRef.current = 1.0;
              playClickSound();
            }
          }}
          glitchIntensityRef={glitchIntensityRef}
        />
      ))}
      <HologramProjector selectedIndex={selectedIndex} transitionGlitchRef={transitionGlitchRef} />
    </group>
  );
}
