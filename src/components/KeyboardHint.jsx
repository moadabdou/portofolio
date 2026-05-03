import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';
import './KeyboardHint.css';

const KeyboardHint = () => {
  const scroll = useScroll();
  const hintRef = useRef();

  useFrame(() => {
    if (!hintRef.current) return;
    
    // Show hint only when projects are visible (scroll > 0.6)
    const offset = scroll.offset;
    const opacity = Math.min(1, Math.max(0, (offset - 0.7) * 10)); // Fade in quickly after 0.7
    
    hintRef.current.style.opacity = opacity;
    hintRef.current.style.visibility = opacity <= 0.01 ? 'hidden' : 'visible';
    hintRef.current.style.transform = `translateY(${THREE.MathUtils.lerp(20, 0, opacity)}px)`;
  });

  return (
    <div className="keyboard-hint-container" ref={hintRef}>
      <div className="hint-content">
        <div className="key-icon left-key">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" />
          </svg>
        </div>
        <div className="hint-text">USE ARROW KEYS TO NAVIGATE</div>
        <div className="key-icon right-key">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" />
          </svg>
        </div>
      </div>
      <div className="hint-glow"></div>
    </div>
  );
};

export default KeyboardHint;
