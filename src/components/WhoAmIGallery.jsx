import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Text, useScroll, useTexture } from '@react-three/drei';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { galleryState } from '../portfolioState';
import { getPortfolioPage, getPortfolioPageIndex, PORTFOLIO_PAGES } from '../portfolioPageData';
import { clamp, getPageOffset } from '../utils/portfolioTimeline';
import { GlitchMaterial, GlitchFrameMaterial } from '../materials/GlitchMaterials';
import { HologramProjector } from './HologramProjector';

extend({ GlitchMaterial, GlitchFrameMaterial });

const OPTIONS = [
  "01_WHO I AM",
  "02_WHAT I BUILD",
  "03_HOW I THINK",
  "04_WHAT'S NEXT"
];

function OptionButton({ text, index, total, radius, xOffset, opacity, isSelected, onSelect, glitchIntensity }) {
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

  const y = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;
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

    // Scale pulse: normal pulse + active expansion (made faster and smaller)
    const basePulse = 1.0 + (isSelected ? Math.sin(state.clock.elapsedTime * 5) * 0.05 : 0);
    const activeScale = THREE.MathUtils.lerp(groupRef.current.scale.x, isSelected ? 1.08 : basePulse, delta * 10);
    groupRef.current.scale.setScalar(activeScale);

    // Shift slightly forward when selected
    const targetZ = isSelected ? 0.1 : 0;
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, z + targetZ, delta * 18);

    if (bgRef.current && bgRef.current.material) {
      bgRef.current.material.opacity = (isSelected ? 0.6 : 0.2) * opacity;
      bgRef.current.material.color.lerp(new THREE.Color(isSelected ? "#ff00ff" : "#4b0082"), delta * 18);
    }

    if (hudMeshRef.current && hudMeshRef.current.material) {
      hudMeshRef.current.material.uTime = state.clock.elapsedTime;
      // Local glitch intensity increases when selected
      const localGlitch = isSelected ? 0.4 + Math.random() * 0.2 : glitchIntensity;
      hudMeshRef.current.material.uGlitchIntensity = localGlitch;

      const hudPulse = (isSelected ? 1.0 : 0.8) + Math.sin(state.clock.elapsedTime * (isSelected ? 10 : 2) + index) * 0.2;
      hudMeshRef.current.material.uOpacity = hudPulse * opacity;
    }

    if (textRef.current) {
      textRef.current.fillOpacity = opacity;
      // Flickering text when selected
      if (isSelected && Math.random() > 0.95) {
        textRef.current.fillOpacity = 0.3 * opacity;
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={[x, y, z]}
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
  const [opacity, setOpacity] = useState(1);
  const [currentRadius, setCurrentRadius] = useState(radius);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useFrame((state, delta) => {
    if (!galleryRef.current) return;
    const offset = scroll.offset;

    // Glitchy Entrance Logic
    const entranceStart = page?.timing.galleryScaleStart ?? 0.6;
    const entranceEnd = page?.timing.galleryScaleEnd ?? 0.9;

    // progress goes from 0 to 1 during entrance
    const entranceProgress = clamp((offset - entranceStart) / (entranceEnd - entranceStart), 0, 1);

    // Exit logic
    const exitFadeDistance = page?.timing.galleryExitFadeDistance ?? 0.15;
    const exitStart = nextPageOffset - exitFadeDistance;
    const isLastPage = pageIndex === pageCount - 1;
    const exitVisibility = isLastPage
      ? 1
      : clamp((nextPageOffset - offset) / Math.max(0.0001, nextPageOffset - exitStart), 0, 1);

    // Stutter/Flicker effect during entrance
    let stutter = 1;
    if (entranceProgress > 0 && entranceProgress < 1) {
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

    // Scale is either 0 or 1 (with a tiny bit of jitter when glitching)
    const jitter = (entranceProgress > 0 && entranceProgress < 1 && Math.random() > 0.8) ? (1 + (Math.random() - 0.5) * 0.1) : 1;
    const visibleScale = (entranceProgress > 0.05 ? 1 : 0.001) * exitVisibility * jitter;

    const exitProgress = 1 - exitVisibility;
    const easedExit = Math.pow(exitProgress, 2.5);
    const nextRadius = radius - easedExit * radius;

    setOpacity(nextOpacity);
    setCurrentRadius(nextRadius);

    if (galleryRef.current.scale) {
      galleryRef.current.scale.setScalar(visibleScale);
    }
    galleryRef.current.visible = visibleScale > 0.001 && nextOpacity > 0.01;

    // Glitch intensity - very high during entrance stutter
    const intensity = (entranceProgress > 0 && entranceProgress < 1)
      ? 0.8 + Math.random() * 0.2
      : Math.pow(1.0 - entranceProgress, 2.0);
    setGlitchIntensity(intensity);
  });

  return (
    <group ref={galleryRef}>
      {OPTIONS.map((option, i) => (
        <OptionButton
          key={option}
          text={option}
          index={i}
          total={OPTIONS.length}
          radius={currentRadius}
          xOffset={xOffset}
          opacity={opacity}
          isSelected={selectedIndex === i}
          onSelect={() => setSelectedIndex(i === selectedIndex ? -1 : i)}
          glitchIntensity={glitchIntensity}
        />
      ))}
      <HologramProjector selectedIndex={selectedIndex} />
    </group>
  );
}
