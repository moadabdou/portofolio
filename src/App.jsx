import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ScrollControls, Scroll, useScroll } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, wrapEffect } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';
import * as THREE from 'three';

import { SpaceStation } from './components/SpaceStation';
import { WakeEffect } from './effects/MouseRipple';
import MoadName from './components/MoadName';
import HeaderFrame from './components/HeaderFrame';
import { ProjectsGallery } from './components/ProjectsGallery';

export const scrollState = { offset: 0 };


// Wrap the custom Effect class into a React component
const Wake = wrapEffect(WakeEffect);

// Normalized mouse position for parallax
const mouse = { x: 0, y: 0 };

function Scene() {
  const groupRef = useRef();
  const stationGroupRef = useRef();
  const scroll = useScroll();

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Parallax
    const targetX = mouse.y * 0.06;
    const targetY = mouse.x * 0.06;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, delta * 1.5);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, delta * 1.5);

    // Scroll Animation
    const offset = scroll.offset; // 0 to 1
    scrollState.offset = offset;

    if (stationGroupRef.current) {
      // Move far left and near camera
      // Initial: [-8, -1, -12]
      stationGroupRef.current.position.x = THREE.MathUtils.lerp(-8, -10, offset);
      stationGroupRef.current.position.y = THREE.MathUtils.lerp(-1, 0, offset);
      stationGroupRef.current.position.z = THREE.MathUtils.lerp(-12, -10, offset);

      stationGroupRef.current.scale.setScalar(THREE.MathUtils.lerp(2.5, 3.2, offset));
      stationGroupRef.current.rotation.y = THREE.MathUtils.lerp(-0.5, 0.2, offset);
      stationGroupRef.current.rotation.x = THREE.MathUtils.lerp(-0.5, 2, offset);
      stationGroupRef.current.rotation.z = THREE.MathUtils.lerp(-0.5, 0.2, offset);
    }
  });

  return (
    <group ref={groupRef}>
      <Environment preset="city" />

      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-10, -10, -5]} intensity={1} color="#aaaaff" />
      <pointLight position={[-9, 2, -10]} intensity={8} color="#d900ff" distance={25} decay={2} />
      <pointLight position={[-6, -4, -8]} intensity={5} color="#fb00c9" distance={20} decay={2} />

      <group ref={stationGroupRef}>
        <SpaceStation
          scale={1}
          position={[0, 0, 0]}
          rotation={[0.2, 0, 0.5]}
        />
        <ProjectsGallery />
      </group>
    </group>
  );
}

export default function App() {
  const rippleRef = useRef();

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!rippleRef.current) return;
      const nx = e.clientX / window.innerWidth;
      const ny = 1 - e.clientY / window.innerHeight;
      rippleRef.current.setMouse(nx, ny);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#0a0b10', position: 'relative' }}>
      <HeaderFrame />

      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ powerPreference: "high-performance", antialias: false }}
      >
        <color attach="background" args={['#0a0b10']} />

        <Suspense fallback={null}>
          <ScrollControls pages={2} damping={0.2}>
            <Scene />

            <Scroll html>
              <div style={{ width: '100vw' }}>
                <section style={{ height: '100vh', position: 'relative' }}>
                  <MoadName />
                </section>

                <section style={{ height: '100vh', position: 'relative' }}>
                  {/* Second page - user will add projects here */}
                </section>
              </div>
            </Scroll>
          </ScrollControls>

          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} height={300} intensity={2} mipmapBlur />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={new Vector2(0.002, 0.002)}
              radialModulation
              modulationOffset={0.4}
            />
            {/* Directional water-wake effect — V-shaped waves trailing behind the cursor */}
            <Wake ref={rippleRef} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
