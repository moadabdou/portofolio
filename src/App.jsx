import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ScrollControls, Scroll, useScroll } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, wrapEffect } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';
import * as THREE from 'three';
import gsap from 'gsap';

import { SpaceStation } from './components/SpaceStation';
import { WakeEffect } from './effects/MouseRipple';
import HeaderFrame from './components/HeaderFrame';
import { WhoAmIGallery } from './components/WhoAmIGallery';
import { ArsenalGallery } from './components/ArsenalGallery';
import { ProjectsGallery } from './components/ProjectsGallery';
import { ContactOrbit } from './components/ContactOrbit';
import { PORTFOLIO_PAGES } from './portfolioPageData';
import { PORTFOLIO_PAGE_VIEWS } from './portfolioPageViews';
import { scrollState, galleryState, contactControlState } from './portfolioState';
import { getInterpolatedPageState, clamp } from './utils/portfolioTimeline';

// Wrap the custom Effect class into a React component
const Wake = wrapEffect(WakeEffect);

// Normalized mouse position for parallax
const mouse = { x: 0, y: 0 };

/**
 * Custom ScrollSnapper to handle magnetic snapping using GSAP.
 * This provides a much smoother and more precise landing on each page
 * compared to standard CSS snapping.
 */
function ScrollSnapper() {
  const scroll = useScroll();
  const timeoutRef = useRef();
  const lastSnapIndex = useRef(0);

  useEffect(() => {
    const el = scroll.el;
    if (!el) return;

    // 1. Sensitivity Reducer: Scale down the scroll speed to make it less "slippery"
    const handleWheel = (e) => {
      // Only interfere if we aren't already in a GSAP animation
      if (gsap.isTweening(el)) return;

      e.preventDefault();
      // Scale down deltaY to reduce sensitivity (0.4 = 40% of original speed)
      el.scrollTop += e.deltaY * 0.5;
    };

    const handleScroll = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      gsap.killTweensOf(el);

      timeoutRef.current = setTimeout(() => {
        const pageCount = PORTFOLIO_PAGE_VIEWS.length;
        if (pageCount <= 1) return;

        const totalScrollableHeight = el.scrollHeight - el.clientHeight;
        const currentOffset = el.scrollTop / totalScrollableHeight;
        const exactPageIndex = currentOffset * (pageCount - 1);
        let nearestPageIndex = Math.round(exactPageIndex);

        // 1.5 Directional bias: If the user scrolls at least 10% towards the next page, 
        // assume they want to go there and snap forward/backward, instead of pushing them back.
        const diffFromLastSnap = exactPageIndex - lastSnapIndex.current;
        if (diffFromLastSnap > 0.1 && nearestPageIndex === lastSnapIndex.current) {
          nearestPageIndex = lastSnapIndex.current + 1;
        } else if (diffFromLastSnap < -0.1 && nearestPageIndex === lastSnapIndex.current) {
          nearestPageIndex = lastSnapIndex.current - 1;
        }

        // Keep it within bounds
        nearestPageIndex = Math.max(0, Math.min(nearestPageIndex, pageCount - 1));

        // 2. We removed the single-page guard so the user can scroll to the end of the page freely.
        const targetOffset = nearestPageIndex / (pageCount - 1);
        const targetScroll = targetOffset * totalScrollableHeight;

        // 3. Proximity Check: Only snap if we are within 100px of the target
        const distance = Math.abs(el.scrollTop - targetScroll);

        if (distance > 0) {
          gsap.to(el, {
            scrollTop: targetScroll,
            duration: 0.25,
            ease: 'power2.out',
            onComplete: () => {
              lastSnapIndex.current = nearestPageIndex;
            },
            overwrite: true
          });
        } else {
          lastSnapIndex.current = nearestPageIndex;
        }
      }, 40);
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [scroll]);

  return null;
}

function Scene() {
  const groupRef = useRef();
  const stationGroupRef = useRef();
  const sharedRotationRef = useRef();
  const currentRotation = useRef(0);
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

    const stationState = getInterpolatedPageState(PORTFOLIO_PAGES, offset, 'station');

    if (offset >= 0.75 && contactControlState.autoSpin) {
      contactControlState.ry += delta * 0.25;
    }

    if (stationGroupRef.current) {
      const contactProgress = clamp((offset - 0.75) / 0.25, 0, 1);

      if (stationState?.position) {
        const px = stationState.position[0] + contactControlState.px * contactProgress;
        const py = stationState.position[1] + contactControlState.py * contactProgress;
        const pz = stationState.position[2] + contactControlState.pz * contactProgress;
        stationGroupRef.current.position.set(px, py, pz);
      }

      if (typeof stationState?.scale === 'number') {
        stationGroupRef.current.scale.setScalar(stationState.scale);
      }

      if (stationState?.rotation) {
        const rx = stationState.rotation[0] + contactControlState.rx * contactProgress;
        const ry = stationState.rotation[1] + contactControlState.ry * contactProgress;
        const rz = stationState.rotation[2] + contactControlState.rz * contactProgress;
        stationGroupRef.current.rotation.set(rx, ry, rz);
      }
    }

    if (sharedRotationRef.current) {
      // Smoothly rotate the shared group (SpaceStation + Gallery) around the tilted X-axis
      currentRotation.current = THREE.MathUtils.lerp(currentRotation.current, galleryState.targetRotation, delta * 4);
      sharedRotationRef.current.rotation.x = currentRotation.current;
    }
  });

  return (
    <>
      <group ref={groupRef}>
      <Environment preset="city" />

      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-10, -10, -5]} intensity={1} color="#aaaaff" />
      <pointLight position={[-9, 2, -10]} intensity={8} color="#d900ff" distance={25} decay={2} />
      <pointLight position={[-6, -4, -8]} intensity={5} color="#fb00c9" distance={20} decay={2} />

      <group ref={stationGroupRef}>
        {/* The Tilted Axis: matches the rotation needed for the station's ring */}
        <group rotation={[1.9, 2.35, -.55]}>
          {/* The Spin: rotates both objects around the tilted X-axis */}
          <group ref={sharedRotationRef}>
            <SpaceStation
              scale={1}
              position={[0, 0, 0]}
              // Local rotation calculated to maintain the original look [0.2, 0, 0.5] inside the tilt
              rotation={[-1.4698, -0.4558, -1.8012]}
            />
            <ProjectsGallery />
            <ContactOrbit />
          </group>
          <WhoAmIGallery />
        </group>
      </group>
      <ArsenalGallery />
      </group>
    </>
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
        gl={{ powerPreference: "high-performance", antialias: true }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#0a0b10']} />

        <Suspense fallback={null}>
          <ScrollControls pages={PORTFOLIO_PAGE_VIEWS.length} damping={0.1}>
            <ScrollSnapper />
            <Scene />

            <Scroll html>
              <div style={{ width: '100vw' }}>
                {PORTFOLIO_PAGE_VIEWS.map((page) => (
                  <section key={page.id} style={{ height: '100vh', position: 'relative' }}>
                    {page.render()}
                  </section>
                ))}
              </div>
            </Scroll>
          </ScrollControls>

          <EffectComposer disableNormalPass multisampling={0}>
            <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.9} height={300} intensity={1.0} mipmapBlur />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={new Vector2(0.001, 0.001)}
            />
            {/* Directional water-wake effect — V-shaped waves trailing behind the cursor */}
            <Wake ref={rippleRef} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
