import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, Text } from '@react-three/drei';
import * as THREE from 'three';
import { clamp } from '../utils/portfolioTimeline';

export function ContactOrbit() {
  const ringRef = useRef();
  const scroll = useScroll();

  // Settings to wrap beautifully around the SpaceStation fuselage
  const radius = 2.8;
  const xOffset = 0;

  const originalText = "GET IN TOUCH";
  const [displayText, setDisplayText] = useState(originalText);
  const [isGlitching, setIsGlitching] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const glitchTimer = useRef(0);

  useFrame((state, delta) => {
    // Rotation spin has been completely removed to keep the text static and readable

    const offset = scroll.offset;
    // Fade in during the scroll transition from arsenal (0.75) to contact (1.0)
    const nextOpacity = clamp((offset - 0.75) / 0.25, 0, 1);

    if (Math.abs(nextOpacity - opacity) > 0.001) {
      setOpacity(nextOpacity);
    }

    // Cyberpunk Text Glitch Loop
    glitchTimer.current += delta;
    if (glitchTimer.current > 0.12) {
      glitchTimer.current = 0;

      const shouldGlitch = Math.random() > 0.8;
      if (shouldGlitch && nextOpacity > 0.05) {
        setIsGlitching(true);

        // Character Corruption
        const chars = originalText.split('');
        const glitchChars = ['█', '░', 'Ø', '▲', '1', '0', '_', '*', '%', '$', '#', '@', '!', '?'];
        const numCorruptions = Math.floor(Math.random() * 3) + 1;

        for (let k = 0; k < numCorruptions; k++) {
          const idx = Math.floor(Math.random() * chars.length);
          if (chars[idx] !== ' ') {
            chars[idx] = glitchChars[Math.floor(Math.random() * glitchChars.length)];
          }
        }
        setDisplayText(chars.join(''));
      } else {
        setIsGlitching(false);
        setDisplayText(originalText);
      }
    }
  });

  // Split string into characters to position them along the circle
  const characters = useMemo(() => displayText.split(''), [displayText]);
  const totalChars = characters.length;

  // Symmetrical arch tightly packed over the top/front half
  const wide = Math.PI * .40;
  const startAngle = Math.PI * 0.7;
  const endAngle = startAngle - wide;

  return (
    <group ref={ringRef}>
      {/* Main Glitch Text Ring - Wrapped around the YZ circle */}
      {characters.map((char, i) => {
        const angle = totalChars > 1
          ? startAngle + (i / (totalChars - 1)) * (endAngle - startAngle)
          : 0;
        const y = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;

        return (
          <Text
            key={`char-${i}`}
            position={[xOffset, y, z]}
            // Orthogonal to the orbit plane, wrapping like the project cards
            rotation={[-angle, 0, -Math.PI / 2]}
            fontSize={0.30}
            font="/static/Orbitron-ExtraBold.ttf"
            color="white"
            fillOpacity={opacity}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
          >
            {char}
          </Text>
        );
      })}

      {/* Chromatic Aberration Glitch Overlay */}
      {isGlitching && opacity > 0.05 && (
        <>
          {/* Red Glitch Ring */}
          {characters.map((char, i) => {
            const angle = totalChars > 1
              ? startAngle + (i / (totalChars - 1)) * (endAngle - startAngle)
              : 0;
            // Slight jitter on the circle coordinates
            const jitterY = (Math.random() - 0.5) * 0.03;
            const jitterZ = (Math.random() - 0.5) * 0.03;
            const y = Math.sin(angle) * radius + jitterY;
            const z = Math.cos(angle) * radius + jitterZ;

            return (
              <Text
                key={`red-char-${i}`}
                position={[xOffset - 0.012, y, z]}
                rotation={[-angle, 0, -Math.PI / 2]}
                fontSize={0.30}
                font="/static/Orbitron-ExtraBold.ttf"
                color="#ff003c"
                fillOpacity={opacity * 0.55}
                textAlign="center"
                anchorX="center"
                anchorY="middle"
              >
                {char}
              </Text>
            );
          })}

          {/* Cyan Glitch Ring */}
          {characters.map((char, i) => {
            const angle = totalChars > 1
              ? startAngle + (i / (totalChars - 1)) * (endAngle - startAngle)
              : 0;
            const jitterY = (Math.random() - 0.5) * 0.03;
            const jitterZ = (Math.random() - 0.5) * 0.03;
            const y = Math.sin(angle) * radius + jitterY;
            const z = Math.cos(angle) * radius + jitterZ;

            return (
              <Text
                key={`cyan-char-${i}`}
                position={[xOffset + 0.012, y, z]}
                rotation={[-angle, 0, -Math.PI / 2]}
                fontSize={0.30}
                font="/static/Orbitron-ExtraBold.ttf"
                color="#00ffff"
                fillOpacity={opacity * 0.55}
                textAlign="center"
                anchorX="center"
                anchorY="middle"
              >
                {char}
              </Text>
            );
          })}
        </>
      )}
    </group>
  );
}
