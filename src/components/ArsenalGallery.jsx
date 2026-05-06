import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useScroll, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Code, Database, Cpu, Layers, Box, Globe,
  Zap, Shield, Terminal, Monitor, Disc,
  PenTool, Layout, Wind, Activity, Command,
  Cloud, Cpu as CpuIcon, Database as DbIcon
} from 'lucide-react';
import { getPortfolioPageIndex, PORTFOLIO_PAGES } from '../portfolioPageData';
import { clamp, getRelativeOffset } from '../utils/portfolioTimeline';

// Arbitrary icons from Lucide for placeholder use
const FOUNDATION_ICONS = [Zap, Box, CpuIcon, Layers, Shield];
const TOOLS_ICONS = [Terminal, Monitor, Disc, PenTool, Layout, Wind];
const PROTOCOL_ICONS = [Globe, DbIcon, Activity, Command, Cloud];

const ARSENAL_DATA = [
  {
    name: 'FOUNDATION',
    icons: FOUNDATION_ICONS,
    items: ['REACT', 'THREE.JS', 'NODE.JS', 'TYPESCRIPT', 'GLSL']
  },
  {
    name: 'STATION TOOLS',
    icons: TOOLS_ICONS,
    items: ['GIT', 'DOCKER', 'VITE', 'GSAP', 'FIGMA', 'POSTGRES']
  },
  {
    name: 'PROTOCOLS',
    icons: PROTOCOL_ICONS,
    items: ['GRAPHQL', 'CI/CD', 'REST', 'UI/UX', '3D MATH']
  }
];

const RING_RADII = [1.65, 2.25, 2.85];

function TechIcon({ icon: Icon, position, opacity, scale = 1, isFocused }) {
  return (
    <group position={position}>
      <Html
        center
        transform
        distanceFactor={6}
        pointerEvents="none"
        style={{
          transition: 'all 0.3s ease',
          opacity: opacity,
          filter: isFocused ? 'drop-shadow(0 0 8px #ff00ff)' : 'none'
        }}
      >
        <Icon
          color={isFocused ? "#ff00ff" : "white"}
          size={isFocused ? 32 : 24}
          strokeWidth={1.5}
        />
      </Html>
    </group>
  );
}

function OrbitalRing({ items, icons, radius, isActive, focusIndex, opacity }) {
  const segmentWidth = 0.5;
  const gap = 0.04;

  return (
    <group>
      <mesh>
        <ringGeometry args={[radius - segmentWidth * 0.5, radius + segmentWidth * 0.5, 64]} />
        <meshBasicMaterial
          transparent
          opacity={opacity * 0.15}
          color="#4b0082"
          side={THREE.DoubleSide}
        />
      </mesh>

      <group>
        {items.map((item, i) => {
          const segmentAngle = (Math.PI * 2 / items.length);
          const startAngle = (i * segmentAngle) + Math.PI / 2 - (segmentAngle / 2) + gap / 2;
          const lengthAngle = segmentAngle - gap;
          const isFocused = isActive && i === focusIndex;

          const iconAngle = i * segmentAngle + Math.PI / 2;
          const iconX = Math.cos(iconAngle) * radius;
          const iconY = Math.sin(iconAngle) * radius;

          return (
            <group key={item}>
              {/* Offset segment slightly forward to avoid Z-fighting with background ring */}
              <mesh position={[0, 0, 0.01]}>
                <ringGeometry args={[
                  radius - segmentWidth * (isFocused ? 0.55 : 0.5),
                  radius + segmentWidth * (isFocused ? 0.55 : 0.5),
                  64, 1,
                  startAngle,
                  lengthAngle
                ]} />
                <meshBasicMaterial
                  transparent
                  opacity={opacity * (isFocused ? 0.9 : 0.2)}
                  color={isFocused ? "#ff00ff" : (isActive ? "#ef4bfb" : "#4b0082")}
                  depthWrite={false}
                  side={THREE.DoubleSide}
                  toneMapped={false}
                />
              </mesh>

              <TechIcon
                icon={icons[i % icons.length]}
                position={[iconX, iconY, 0.05]}
                opacity={opacity * (isFocused ? 1 : 0.4)}
                isFocused={isFocused}
              />
            </group>
          );
        })}
      </group>
    </group>
  );
}

export function ArsenalGallery() {
  const groupRef = useRef();
  const scroll = useScroll();
  const pageIndex = getPortfolioPageIndex('arsenal');
  const pageCount = PORTFOLIO_PAGES.length;

  const [activeLevel, setActiveLevel] = useState(0);
  const [focusIndices, setFocusIndices] = useState(ARSENAL_DATA.map(() => 0));
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const offset = scroll.offset;
      const pageOffset = getRelativeOffset(offset, pageIndex, pageCount);
      if (pageOffset < 0.3 || pageOffset > 0.7) return;

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const dir = e.key === 'ArrowUp' ? 1 : -1;
        const nextLevel = clamp(activeLevel + dir, 0, ARSENAL_DATA.length - 1);

        if (nextLevel !== activeLevel) {
          setFocusIndices((prev) => {
            const next = [...prev];
            const oldLength = ARSENAL_DATA[activeLevel].items.length;
            const newLength = ARSENAL_DATA[nextLevel].items.length;
            const oldIndex = prev[activeLevel];

            // Calculate nearest index based on angular position
            // (oldIndex / oldLength) is the normalized position around the ring
            const nearestIndex = Math.round((oldIndex / oldLength) * newLength) % newLength;

            next[nextLevel] = nearestIndex;
            return next;
          });
          setActiveLevel(nextLevel);
        }
      } else if (e.key === 'ArrowLeft') {
        setFocusIndices((prev) => {
          const next = [...prev];
          const items = ARSENAL_DATA[activeLevel].items;
          next[activeLevel] = (next[activeLevel] + 1) % items.length;
          return next;
        });
      } else if (e.key === 'ArrowRight') {
        setFocusIndices((prev) => {
          const next = [...prev];
          const items = ARSENAL_DATA[activeLevel].items;
          next[activeLevel] = (next[activeLevel] - 1 + items.length) % items.length;
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLevel, scroll, pageIndex, pageCount]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const offset = scroll.offset;
    const pageOffset = getRelativeOffset(offset, pageIndex, pageCount);

    const entranceStart = 0.3;
    const entranceEnd = 0.5;
    const entranceProgress = clamp((pageOffset - entranceStart) / (entranceEnd - entranceStart), 0, 1);

    const exitFadeDistance = 0.2;
    const isLastPage = pageIndex === pageCount - 1;
    const exitVisibility = isLastPage ? 1 : clamp((1.0 - pageOffset) / exitFadeDistance, 0, 1);

    const nextOpacity = entranceProgress * exitVisibility;
    setOpacity(nextOpacity);

    groupRef.current.visible = nextOpacity > 0.01;
    groupRef.current.scale.setScalar(entranceProgress);
    groupRef.current.rotation.y = -0.4;
  });

  const focusedItem = ARSENAL_DATA[activeLevel].items[focusIndices[activeLevel]];

  return (
    <group ref={groupRef} position={[4, 0, 0]}>
      {ARSENAL_DATA.map((levelData, i) => (
        <OrbitalRing
          key={levelData.name}
          items={levelData.items}
          icons={levelData.icons}
          radius={RING_RADII[i]}
          isActive={activeLevel === i}
          focusIndex={focusIndices[i]}
          opacity={opacity}
        />
      ))}

      <group>
        <mesh>
          <circleGeometry args={[1.3, 64]} />
          <meshBasicMaterial
            transparent
            opacity={opacity * 0.15}
            color="#d900ff"
            depthWrite={false}
          />
        </mesh>
        <mesh>
          <ringGeometry args={[1.25, 1.3, 64]} />
          <meshBasicMaterial
            transparent
            opacity={opacity * 0.8}
            color="#ff00ff"
            depthWrite={false}
          />
        </mesh>

        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Text
            fontSize={0.35}
            position={[0, 0, 0.2]} // Offset forward to avoid clipping
            font="/Orbitron-VariableFont_wght.ttf"
            color="#ef4bfb"
            fillOpacity={opacity}
            textAlign="center"
            anchorY="middle"
            maxWidth={2.8}
            depthTest={false} // Ensure it's always on top of the center circle
          >
            {focusedItem}
          </Text>
        </Float>
      </group>
    </group>
  );
}
