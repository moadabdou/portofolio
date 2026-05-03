import React, { useMemo, useRef } from 'react';
import { useTexture, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

const PROJECTS = [
  { id: 1, img: '/projects/p1.png', title: 'PROJECT ALPHA' },
  { id: 2, img: '/projects/p2.png', title: 'PROJECT BETA' },
  { id: 3, img: '/projects/p3.png', title: 'PROJECT GAMMA' },
  { id: 4, img: '/projects/p4.png', title: 'PROJECT DELTA' },
  { id: 5, img: '/projects/p5.png', title: 'PROJECT EPSILON' },
];


function ProjectCard({ url, title, index, total, radius, startAngle, endAngle, xOffset, rotX, rotY, rotZ }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const frameRef = useRef();
  const texture = useTexture(url);

  // Calculate position along the arc in the YZ plane
  const progress = total > 1 ? index / (total - 1) : 0;
  const angle = THREE.MathUtils.lerp(startAngle, endAngle, progress);


  const y = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;
  const x = xOffset;
  const geometry = useMemo(() => {
    const width = 1.6;
    const height = 2.2;
    // We bend along the Y axis (height) to wrap the rim, so we need segments along Y
    const segments = 32;
    const geo = new THREE.PlaneGeometry(width, height, 1, segments);

    // Bend the plane along its Y axis (height) to wrap around the outer rim
    const pos = geo.attributes.position;
    const curveAmount = 0.2; // Adjust for perfect hug
    for (let i = 0; i < pos.count; i++) {
      const vy = pos.getY(i);
      // Bend backwards (-Z) so it hugs the ring
      pos.setZ(i, -Math.pow(vy / (height / 2), 2) * curveAmount);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Glitch-like pulse on the wireframe instead of the image
    if (frameRef.current && frameRef.current.material) {
      frameRef.current.material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 8 + index) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[x, y, z]} rotation={[-angle, 0, -Math.PI]}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
          color="#999999" // Dim the brightest whites so they don't trigger the global Bloom effect
        />
        {/* Neon Frame */}
        <mesh ref={frameRef} geometry={geometry} scale={1.01} position={[0, 0, -0.01]}>
          <meshBasicMaterial color="#a629ff" wireframe transparent opacity={0.5} toneMapped={false} />
        </mesh>
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

  useFrame((_, delta) => {
    if (!galleryRef.current) return;
    const offset = scroll.offset;
    const page2Progress = THREE.MathUtils.smoothstep(offset, 0.45, 0.8);

    galleryRef.current.scale.setScalar(THREE.MathUtils.lerp(0.001, 1, page2Progress));
    galleryRef.current.visible = page2Progress > 0.01;
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
            />
          ))}
        </group>
      </group>
    </group>
  );
}
