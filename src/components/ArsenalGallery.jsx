import React, { useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { getPortfolioPage, getPortfolioPageIndex, PORTFOLIO_PAGES } from '../portfolioPageData';
import { clamp, getRelativeOffset } from '../utils/portfolioTimeline';

const ROWS = 7;
const COLS = 5;
const HEX_RADIUS = 0.45;
const HEX_GAP = 0.05;

// Math for hexagon grid layout
const dx = Math.sqrt(3) * (HEX_RADIUS + HEX_GAP);
const dy = 1.5 * (HEX_RADIUS + HEX_GAP);

function Hexagon({ position, opacity, mouse, ...props }) {
  const meshRef = useRef();
  const basePos = useMemo(() => new THREE.Vector3(...position), [position]);
  const currentPos = useRef(new THREE.Vector3(...position));
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // 1. Calculate distance from mouse projected to the menu plane (local space)
    // The parent group is at x=4, so we subtract 4 from the projected mouse x
    const targetX = (state.mouse.x * 6) - 4; 
    const targetY = (state.mouse.y * 4);
    const target = new THREE.Vector3(targetX, targetY, 0);
    const dist = basePos.distanceTo(target);

    // 2. Fisheye Distortion Logic
    const maxDist = 3.5;
    const strength = clamp(1 - dist / maxDist, 0, 1);
    const bulge = Math.pow(strength, 2.5);
    
    // Scale expansion
    const targetScale = 1.0 + bulge * 1.2;
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, delta * 12));

    // Position shift (lens effect)
    const dir = new THREE.Vector3().subVectors(basePos, target).normalize();
    const shift = dir.multiplyScalar(bulge * 0.8);
    const targetPos = basePos.clone().add(shift);
    
    meshRef.current.position.lerp(targetPos, delta * 10);
    currentPos.current.copy(meshRef.current.position);

    // 3. Material Updates
    if (meshRef.current.material) {
      meshRef.current.material.opacity = (0.15 + bulge * 0.5) * opacity;
      meshRef.current.material.color.lerp(new THREE.Color(bulge > 0.4 ? "#00ffff" : "#4b0082"), delta * 5);
    }
  });

  return (
    <mesh ref={meshRef} position={position} {...props}>
      <circleGeometry args={[HEX_RADIUS, 6]} />
      <meshBasicMaterial 
        transparent 
        opacity={0.4} 
        color="#4b0082" 
        side={THREE.DoubleSide}
        toneMapped={false}
      />
      {/* Subtle Border */}
      <lineSegments>
        <edgesGeometry args={[new THREE.CircleGeometry(HEX_RADIUS, 6)]} />
        <lineBasicMaterial transparent opacity={0.6 * opacity} color="#00ffff" toneMapped={false} />
      </lineSegments>
    </mesh>
  );
}

export function ArsenalGallery() {
  const groupRef = useRef();
  const scroll = useScroll();
  const { mouse } = useThree();
  const page = getPortfolioPage('arsenal');
  const pageIndex = getPortfolioPageIndex('arsenal');
  const pageCount = PORTFOLIO_PAGES.length;

  const [opacity, setOpacity] = useState(0);

  // Generate grid positions
  const hexPositions = useMemo(() => {
    const positions = [];
    const width = (COLS - 1) * dx;
    const height = (ROWS - 1) * dy;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * dx + (r % 2 === 0 ? 0 : dx / 2) - width / 2;
        const y = r * dy - height / 2;
        positions.push([x, y, 0]);
      }
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const offset = scroll.offset;
    const pageOffset = getRelativeOffset(offset, pageIndex, pageCount);

    // Entrance Logic: Be fully visible when centered (pageOffset = 0.5)
    const entranceStart = 0.2;
    const entranceEnd = 0.45;
    const entranceProgress = clamp((pageOffset - entranceStart) / (entranceEnd - entranceStart), 0, 1);

    // Exit Logic
    const isLastPage = pageIndex === pageCount - 1;
    const exitVisibility = isLastPage ? 1 : clamp((1.0 - pageOffset) / 0.2, 0, 1);

    const nextOpacity = entranceProgress * exitVisibility;
    setOpacity(nextOpacity);

    groupRef.current.visible = nextOpacity > 0.001;
    groupRef.current.scale.setScalar(clamp(entranceProgress * 1.0, 0, 1));
  });

  return (
    <group ref={groupRef} position={[4, 0, 0]} rotation={[0, -0.4, 0]}>
      {hexPositions.map((pos, i) => (
        <Hexagon 
          key={i} 
          position={pos} 
          opacity={opacity} 
          mouse={mouse}
          rotation={[0, 0, Math.PI / 2]} 
        />
      ))}
    </group>
  );
}
