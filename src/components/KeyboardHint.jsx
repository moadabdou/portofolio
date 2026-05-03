import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import './KeyboardHint.css';

const KeyboardHint = () => {
  const scroll = useScroll();
  const hintRef = useRef();

  useFrame(() => {
    if (!hintRef.current) return;

    // Show hint when page 2 starts (offset > 0.5)
    const offset = scroll.offset;
    const opacity = Math.min(1, Math.max(0, (offset - 0.5) * 10));

    hintRef.current.style.opacity = opacity;
    hintRef.current.style.visibility = opacity <= 0.01 ? 'hidden' : 'visible';

    // Set static transform
    if (opacity > 0) {
      hintRef.current.style.transform = `translateX(-50%)`;
    }
  });

  return (
    <div className="keyboard-hint-container" ref={hintRef}>
      <div className="arrow-cluster">
        <div className="arrow-row top-row">
          <div className="key-cap up-key inactive">
            <ChevronUp size={20} />
          </div>
        </div>
        <div className="arrow-row bottom-row">
          <div className="key-cap left-key active-glow">
            <ChevronLeft size={20} />
          </div>
          <div className="key-cap down-key inactive">
            <ChevronDown size={20} />
          </div>
          <div className="key-cap right-key active-glow">
            <ChevronRight size={20} />
          </div>
        </div>
      </div>
      <div className="hint-note">USE KEYBOARD TO NAVIGATE</div>
    </div>
  );
};

export default KeyboardHint;
