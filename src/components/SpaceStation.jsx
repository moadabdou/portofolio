import React, { useMemo, useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

export function SpaceStation(props) {
  const group = useRef();
  const { scene, animations } = useGLTF('/space_station_3.glb');
  const { actions } = useAnimations(animations, group);

  // Optional: We can traverse the scene to modify materials
  useMemo(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        // Change the base color to a dark metallic blue-purple
        child.material.color = new THREE.Color("#2a1b54");

        // Ensure it looks like polished metal
        child.material.metalness = 1.0;
        child.material.roughness = 0.3;

        if (child.material.emissiveIntensity !== undefined) {
          // Set the emissive color to purple so Bloom creates a purple halo
          child.material.emissive = new THREE.Color("#a629ff");
          child.material.emissiveIntensity = 1.5;
        }
      }
    });
  }, [scene]);

  // Play embedded animations if they exist
  useEffect(() => {
    if (actions) {
      Object.keys(actions).forEach((key) => {
        const action = actions[key];
        action.timeScale = 0.1; // Extremely slow (5% speed)
        action.play();
      });
    }
  }, [actions]);

  return (
    <group ref={group} {...props}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/space_station_3.glb');
