import React, { useRef, useMemo } from 'react';
import { useGLTF, useScroll, Text, Float, Billboard, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getPortfolioPage, getPortfolioPageIndex, PORTFOLIO_PAGES, WHO_AM_I_INFO } from '../portfolioPageData';
import { clamp, getPageOffset, getRelativeOffset } from '../utils/portfolioTimeline';
import { GlitchFrameMaterial } from '../materials/GlitchMaterials';
import { extend } from '@react-three/fiber';

extend({ GlitchFrameMaterial });

const OPTIONS = [
  "WHO I AM",
  "WHAT I BUILD",
  "HOW I THINK",
  "WHAT'S NEXT"
];

function ProjectedInfo({ selectedIndex, opacity, position, rotation, transitionGlitchRef }) {
  const beamRef = useRef();
  const coreRef = useRef();
  const lightningRef = useRef();
  const contentRef = useRef();
  const panelMatRef = useRef();

  const data = (selectedIndex !== -1 && OPTIONS[selectedIndex]) ? WHO_AM_I_INFO[OPTIONS[selectedIndex]] : null;
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const formattedDate = useMemo(() => currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.'), [currentTime]);
  const formattedTime = useMemo(() => currentTime.toLocaleTimeString('en-GB', { hour12: false }), [currentTime]);

  // Load textures
  const frameTex = useTexture('/frame.png');
  const profileTextures = useTexture({
    "WHO I AM": "/who_am_i/1.png",
    "WHAT I BUILD": "/who_am_i/2.png",
    "HOW I THINK": "/who_am_i/3.png",
    "WHAT'S NEXT": "/who_am_i/4.png",
  });

  const currentProfileTex = data ? profileTextures[OPTIONS[selectedIndex]] : null;

  React.useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Core flicker
    if (coreRef.current) {
      coreRef.current.opacity = (0.4 + Math.random() * 0.4) * opacity;
    }

    // Outer glow pulse
    if (beamRef.current) {
      beamRef.current.opacity = (0.1 + Math.sin(t * 10) * 0.05 + Math.random() * 0.1) * opacity;
    }

    // Lightning "jitter" effect
    if (lightningRef.current) {
      lightningRef.current.scale.x = 1 + (Math.random() - 0.5) * 0.2;
      lightningRef.current.scale.z = 1 + (Math.random() - 0.5) * 0.2;
      lightningRef.current.opacity = (Math.random() > 0.8 ? 0.3 : 0.05) * opacity;
    }

    if (contentRef.current) {
      contentRef.current.position.y = Math.sin(t * 2) * 0.05;

      const curGlitch = transitionGlitchRef ? transitionGlitchRef.current : 0;
      // Enhanced jitter during transition
      const jitterThreshold = 0.98 - curGlitch * 0.2;
      if (Math.random() > jitterThreshold) {
        contentRef.current.position.x = (Math.random() - 0.5) * (0.05 + curGlitch * 0.5);
        contentRef.current.position.z = (Math.random() - 0.5) * (curGlitch * 0.2);
      } else {
        contentRef.current.position.x = 0;
        contentRef.current.position.z = 0;
      }
    }

    if (panelMatRef.current) {
      const curGlitch = transitionGlitchRef ? transitionGlitchRef.current : 0;
      panelMatRef.current.uTime = t;
      panelMatRef.current.uGlitchIntensity = 0.05 + curGlitch * 0.8 + (Math.random() > 0.95 ? 0.2 : 0);
      panelMatRef.current.uOpacity = 0.8 * opacity;
    }
  });

  if (!data) return null;

  return (
    <group position={position} rotation={rotation}>
      {/* 1. ADVANCED BEAM SYSTEM */}
      <group position={[0, 2.7, 0]}>
        {/* Core - Central energy */}
        <mesh>
          <cylinderGeometry args={[0.2, 0.02, 5, 16, 1, true]} />
          <meshBasicMaterial
            ref={coreRef}
            color="#ff29f1"
            transparent
            opacity={0.8 * opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Outer Glow - Soft volume */}
        <mesh>
          <cylinderGeometry args={[3, 0.05, 5, 32, 1, true]} />
          <meshBasicMaterial
            ref={beamRef}
            color="#d400ff"
            transparent
            opacity={0.2 * opacity}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Lightning Shell - Electric Jitter */}
        <mesh ref={lightningRef}>
          <cylinderGeometry args={[3.2, 0.06, 5.1, 8, 1, true]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.1 * opacity}
            wireframe
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* 3. INFO PANEL CONTROL */}
      <Billboard
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
        position={[0, 12, 0]}
      >
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <group ref={contentRef} rotation={[0.2, -0.4, 0]}>
            {/* Custom Outer Frame with Glitch Effect */}
            <mesh position={[0, -1.5, -0.1]}>
              <planeGeometry args={[32, 16]} />
              <glitchFrameMaterial
                ref={panelMatRef}
                uTexture={frameTex}
                uColor={new THREE.Color("#ff29f1")}
                transparent
                uOpacity={0.8 * opacity}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>

            {/* --- LEFT SIDE: Profile Image --- */}
            <group position={[-6.4, -0.4, 0.1]}>
              <mesh>
                <planeGeometry args={[6, 6]} />
                <meshBasicMaterial
                  map={currentProfileTex}
                  transparent
                  opacity={0.9 * opacity}
                />
              </mesh>
              {/* Image Frame/Border */}
              <mesh position={[0, 0, -0.01]}>
                <planeGeometry args={[6.2, 6.2]} />
                <meshBasicMaterial color="#ff29f1" transparent opacity={0.3 * opacity} />
              </mesh>

              {/* Stylish Date & Time */}
              <group position={[0, -4.3, 0]}>
                {/* Decorative brackets */}
                <Text
                  position={[-2.4, 0, 0]}
                  fontSize={0.6}
                  color="#ff29f1"
                  font="/static/Orbitron-Bold.ttf"
                  fillOpacity={0.6 * opacity}
                >
                  [
                </Text>
                <Text
                  position={[2.4, 0, 0]}
                  fontSize={0.6}
                  color="#ff29f1"
                  font="/static/Orbitron-Bold.ttf"
                  fillOpacity={0.6 * opacity}
                >
                  ]
                </Text>

                {/* Date */}
                <Text
                  fontSize={0.4}
                  anchorX="center"
                  anchorY="bottom"
                  color="#ffffff"
                  font="/static/Orbitron-Bold.ttf"
                  fillOpacity={0.8 * opacity}
                >
                  {formattedDate}
                </Text>

                {/* Time */}
                <Text
                  position={[0, -0.6, 0]}
                  fontSize={0.3}
                  anchorX="center"
                  anchorY="bottom"
                  color="#d400ff"
                  font="/static/Orbitron-Bold.ttf"
                  fillOpacity={0.9 * opacity}
                >
                  {formattedTime}
                </Text>

                {/* Scanning line indicator */}
                <mesh position={[0, -1, 0]}>
                  <planeGeometry args={[3, 0.02]} />
                  <meshBasicMaterial color="#ff29f1" transparent opacity={0.4 * opacity} />
                </mesh>
              </group>
            </group>

            {/* --- RIGHT SIDE: Profile Insight --- */}
            <group position={[-2, 2.3, 0.1]}>
              <Text
                fontSize={0.6}
                anchorX="left"
                anchorY="top"
                color="#ffffff"
                font="/static/Orbitron-Bold.ttf"
                fillOpacity={opacity}
              >
                {data.profileTitle}
              </Text>

              <Text
                position={[0, -1.5, 0]}
                fontSize={0.45}
                maxWidth={12} // Reduced from 16 to prevent overflow
                lineHeight={1.4}
                anchorX="left"
                anchorY="top"
                color="white"
                font="/static/ShareTechMono-Regular.ttf"
                fillOpacity={0.9 * opacity}
              >
                {data.details}
              </Text>
            </group>
          </group>
        </Float>
      </Billboard>
    </group >
  );
}

export function HologramProjector({ selectedIndex, transitionGlitchRef }) {
  const groupRef = useRef();
  const robotRef = useRef();
  const [currentPosition, setCurrentPosition] = React.useState([0, 0, 0]);
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

  const [projectionOpacity, setProjectionOpacity] = React.useState(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const offset = scroll.offset;
    const pageOffset = getRelativeOffset(offset, pageIndex, pageCount);

    // Entrance logic (aligned with WhoAmIGallery timing)
    const entranceStart = page?.timing.galleryScaleStart ?? 0.25;
    const entranceEnd = page?.timing.galleryScaleEnd ?? 0.5;
    const entranceProgress = clamp((pageOffset - entranceStart) / (entranceEnd - entranceStart), 0, 1);

    // Exit logic: fade out as we approach the end of the page range (relative offset 1.0)
    const exitFadeDistance = page?.timing.galleryExitFadeDistance ?? 0.2;
    const isLastPage = pageIndex === pageCount - 1;
    const exitVisibility = isLastPage
      ? 1
      : clamp((1.0 - pageOffset) / exitFadeDistance, 0, 1);

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

    // 3. Subtle "Alive" Animation: Slow spin and gentle hover for the robot only
    if (robotRef.current) {
      robotRef.current.rotation.y += delta * 0.4;
    }

    groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 1.5) * 0.001; // Tiny hover for the whole unit

    // Rotation adjust to face the camera/center slightly
    groupRef.current.rotation.x = 3.5;
    const rotationZ = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    groupRef.current.rotation.z = rotationZ;

    // Sync position state for the stable projection
    setCurrentPosition([x, 13 + Math.sin(state.clock.elapsedTime * 1.5) * 0.001, 0.9]);

    // Visibility management
    groupRef.current.visible = entranceProgress > 0.001 && exitVisibility > 0.001;

    // Projection fade logic
    const targetOpacity = (selectedIndex !== -1 && groupRef.current.visible) ? 1 : 0;
    setProjectionOpacity(THREE.MathUtils.lerp(projectionOpacity, targetOpacity, delta * 5));
  });

  return (
    <>
      <group ref={groupRef}>
        <group ref={robotRef}>
          <primitive object={scene} />
          <pointLight
            position={[0, 1, 0.5]}
            intensity={25}
            color="#a629ff"
            distance={15}
            decay={2}
          />
        </group>
      </group>

      {/* Stable Projection - Passed world position and rotation to keep it aligned with the robot */}
      <ProjectedInfo
        selectedIndex={selectedIndex}
        opacity={projectionOpacity}
        position={currentPosition}
        rotation={[3.5, 0, 0]} // Matching the robot's tilt
        transitionGlitchRef={transitionGlitchRef}
      />
    </>
  );
}

useGLTF.preload('/star_wars_delta_squad_advisor_hologram_projector.glb');
