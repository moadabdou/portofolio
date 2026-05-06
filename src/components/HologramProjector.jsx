import React, { useRef, useMemo } from 'react';
import { useGLTF, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getPortfolioPage, getPortfolioPageIndex, PORTFOLIO_PAGES } from '../portfolioPageData';
import { clamp, getPageOffset } from '../utils/portfolioTimeline';

export function HologramProjector() {
  const groupRef = useRef();
  // Load the model
  const { scene } = useGLTF('/star_wars_delta_squad_advisor_hologram_projector.glb');
  const scroll = useScroll();

  const page = getPortfolioPage('who-am-i');
  const pageIndex = getPortfolioPageIndex('who-am-i');
  const pageCount = PORTFOLIO_PAGES.length;
  const nextPageOffset = getPageOffset(pageIndex + 1, pageCount);

  // Apply granular "general vibes" materials: 
  // Aligned with the Space Station's color palette (Dark blue-purple + Vibrant purple)
  useMemo(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
        
        const name = (child.name + child.material.name).toLowerCase();
        
        // 1. Holographic / Glowing Parts - Vibrant Purple (Space Station Emissive)
        if (name.includes('glow') || name.includes('hologram') || name.includes('light') || name.includes('vfx') || name.includes('glass')) {
          child.material.color = new THREE.Color("#d400ff"); // Slightly brighter purple
          child.material.emissive = new THREE.Color("#a629ff");
          child.material.emissiveIntensity = 12.0; // Cranked up for intense shine
          child.material.transparent = true;
          child.material.opacity = 0.9;
        } 
        // 2. Main Mechanical Structure - Dark Metallic Blue-Purple (Space Station Base)
        else if (name.includes('base') || name.includes('body') || name.includes('case')) {
          child.material.color = new THREE.Color("#2a1b54");
          child.material.metalness = 1.0;
          child.material.roughness = 0.1; // Much smoother for better reflections
          child.material.emissive = new THREE.Color("#a629ff");
          child.material.emissiveIntensity = 2.5; // Stronger rim light
        }
        // 3. Detail / Accent Mechanical Parts
        else {
          child.material.color = new THREE.Color("#2a1b54");
          child.material.metalness = 1.0;
          child.material.roughness = 0.05; // Extremely shiny details
          child.material.emissive = new THREE.Color("#a629ff");
          child.material.emissiveIntensity = 1.5;
        }

        if (child.material.map) child.material.map.colorSpace = THREE.SRGBColorSpace;
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const offset = scroll.offset;

    // Entrance logic (aligned with WhoAmIGallery timing)
    const entranceStart = page?.timing.galleryScaleStart ?? 0.6;
    const entranceEnd = page?.timing.galleryScaleEnd ?? 0.9;
    const entranceProgress = clamp((offset - entranceStart) / (entranceEnd - entranceStart), 0, 1);

    // Exit logic
    const exitFadeDistance = page?.timing.galleryExitFadeDistance ?? 0.15;
    const exitStart = nextPageOffset - exitFadeDistance;
    const isLastPage = pageIndex === pageCount - 1;
    const exitVisibility = isLastPage
      ? 1
      : clamp((nextPageOffset - offset) / Math.max(0.0001, nextPageOffset - exitStart), 0, 1);

    // 1. Entrance: Move into frame from the right (x: 10 -> x: 4.5)
    const targetX = -20;
    const startX = -32;
    const x = THREE.MathUtils.lerp(startX, targetX, entranceProgress);

    // 2. Move Away Effect: Scale down as it enters (scale: 1.0 -> scale: 0.45)
    // This gives the impression of "moving away" into the scene
    const startScale = 0.5;
    const targetScale = 0.15;
    const scale = THREE.MathUtils.lerp(startScale, targetScale, entranceProgress) * exitVisibility;

    // Apply transformations
    groupRef.current.position.set(x, 13, 0.9);
    groupRef.current.scale.setScalar(scale);

    // 3. Subtle "Alive" Animation: Slow spin and gentle hover
    groupRef.current.rotation.y += delta * 0.4;
    groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 1.5) * 0.001; // Tiny hover

    // Rotation adjust to face the camera/center slightly
    groupRef.current.rotation.x = 3.5;
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;

    // Visibility management
    groupRef.current.visible = entranceProgress > 0.001 && exitVisibility > 0.001;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
      {/* Local glow light to make the robot shine and pop from the dark background */}
      <pointLight 
        position={[0, 1, 0.5]} 
        intensity={25} 
        color="#a629ff" 
        distance={15} 
        decay={2} 
      />
    </group>
  );
}

useGLTF.preload('/star_wars_delta_squad_advisor_hologram_projector.glb');
