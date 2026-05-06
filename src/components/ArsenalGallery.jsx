import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useScroll, Float } from '@react-three/drei';
import * as THREE from 'three';
import { renderToStaticMarkup } from 'react-dom/server';
import { 
  Code, Database, Cpu, Layers, Box, Globe, 
  Zap, Shield, Terminal, Monitor, Disc, 
  PenTool, Layout, Wind, Activity, Command,
  Cloud, Cpu as CpuIcon, Database as DbIcon
} from 'lucide-react';
import { getPortfolioPageIndex, PORTFOLIO_PAGES } from '../portfolioPageData';
import { clamp, getRelativeOffset } from '../utils/portfolioTimeline';

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

function TechIcon({ icon: Icon, position, opacity, isFocused, size = 0.4, glitch = 0 }) {
  const texture = useMemo(() => {
    const color = isFocused ? "#ffffff" : "#ffffff";
    const svgString = renderToStaticMarkup(
      <Icon color={color} size={64} strokeWidth={1.5} />
    );
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svg64 = btoa(svgString);
    img.src = `data:image/svg+xml;base64,${svg64}`;
    
    const tex = new THREE.CanvasTexture(canvas);
    img.onload = () => {
      ctx.clearRect(0, 0, 128, 128);
      ctx.drawImage(img, 16, 16, 96, 96);
      tex.needsUpdate = true;
    };
    return tex;
  }, [Icon, isFocused]);

  const finalSize = isFocused ? size * 1.25 : size;
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current || glitch <= 0) return;
    meshRef.current.position.x = position[0] + (Math.random() - 0.5) * glitch * 0.1;
    meshRef.current.position.y = position[1] + (Math.random() - 0.5) * glitch * 0.1;
    meshRef.current.visible = Math.random() > glitch * 0.3;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[finalSize, finalSize]} />
      <meshBasicMaterial 
        map={texture} 
        transparent 
        opacity={opacity} 
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function CurvedText({ text, radius, opacity }) {
  const chars = text.split("");
  const charSpacing = 0.14; 
  
  return (
    <group>
      {chars.map((char, i) => {
        const totalChars = chars.length;
        // Reverse order: i goes from 0 (M) to 8 (S). 
        // We want M to be on the left (positive angle offset) and S on the right (negative angle offset).
        const angleOffset = ((totalChars - 1) / 2 - i) * charSpacing;
        const angle = Math.PI / 2 + angleOffset;
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const rotationZ = angle - Math.PI / 2;

        return (
          <Text
            key={i}
            position={[x, y, 0]}
            rotation={[0, 0, rotationZ]}
            fontSize={0.24}
            font="/Orbitron-VariableFont_wght.ttf"
            color="#ef4bfb"
            fillOpacity={opacity * 0.8}
            outlineWidth={0.015} // Adds "thickness" to the font
            outlineColor="#ef4bfb"
            outlineOpacity={opacity * 0.4}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
          >
            {char.toUpperCase()}
          </Text>
        );
      })}
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
                position={[iconX, iconY, 0.15]} 
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
  const [transitionGlitch, setTransitionGlitch] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const offset = scroll.offset;
      const pageOffset = getRelativeOffset(offset, pageIndex, pageCount);
      if (pageOffset < 0.3 || pageOffset > 0.7) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      const triggerGlitch = () => setTransitionGlitch(1.0);

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const dir = e.key === 'ArrowUp' ? 1 : -1;
        const nextLevel = clamp(activeLevel + dir, 0, ARSENAL_DATA.length - 1);
        
        if (nextLevel !== activeLevel) {
          triggerGlitch();
          setFocusIndices((prev) => {
            const next = [...prev];
            const oldLength = ARSENAL_DATA[activeLevel].items.length;
            const newLength = ARSENAL_DATA[nextLevel].items.length;
            const oldIndex = prev[activeLevel];
            const nearestIndex = Math.round((oldIndex / oldLength) * newLength) % newLength;
            next[nextLevel] = nearestIndex;
            return next;
          });
          setActiveLevel(nextLevel);
        }
      } else if (e.key === 'ArrowLeft') {
        triggerGlitch();
        setFocusIndices((prev) => {
          const next = [...prev];
          const items = ARSENAL_DATA[activeLevel].items;
          next[activeLevel] = (next[activeLevel] + 1) % items.length;
          return next;
        });
      } else if (e.key === 'ArrowRight') {
        triggerGlitch();
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

    if (transitionGlitch > 0.01) {
      setTransitionGlitch(THREE.MathUtils.lerp(transitionGlitch, 0, delta * 12));
    } else if (transitionGlitch !== 0) {
      setTransitionGlitch(0);
    }

    groupRef.current.visible = nextOpacity > 0.01;
    groupRef.current.scale.setScalar(entranceProgress);
    groupRef.current.rotation.y = -0.4;
  });

  const focusedIcon = ARSENAL_DATA[activeLevel].icons[focusIndices[activeLevel] % ARSENAL_DATA[activeLevel].icons.length];
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

      {/* Curved "MY SKILLS" Text */}
      <CurvedText text="MY SKILLS" radius={3.3} opacity={opacity} />

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
          <group position={[0, 0, 0.2]}>
            <TechIcon 
              icon={focusedIcon} 
              position={[0, 0.1, 0]} 
              opacity={opacity} 
              isFocused={true} 
              size={0.8}
              glitch={transitionGlitch}
            />
            
            <Text
              fontSize={0.15}
              position={[0, -0.6, 0]} 
              font="/Orbitron-VariableFont_wght.ttf"
              color="#ef4bfb"
              fillOpacity={opacity * (transitionGlitch > 0 && Math.random() > 0.5 ? 0.3 : 1)}
              textAlign="center"
              anchorY="middle"
              maxWidth={2.0}
              depthTest={false}
            >
              {focusedItem}
            </Text>
          </group>
        </Float>
      </group>
    </group>
  );
}
