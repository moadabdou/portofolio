import React, { useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import gsap from 'gsap';
import { getRelativeOffset, clamp } from '../utils/portfolioTimeline';
import { PORTFOLIO_PAGES } from '../portfolioPageData';
import './MoadName.css';

export default function MoadName() {
  const scroll = useScroll();
  const containerRef = useRef(null);
  const lettersRef = useRef([]);
  const introLettersRef = useRef([]);
  const positionsRef = useRef([]);

  useFrame(() => {
    if (containerRef.current) {
      const pageOffset = getRelativeOffset(scroll.offset, 0, PORTFOLIO_PAGES.length);
      // For the first page, pageOffset 0.5 is the center (scroll 0).
      // We fade out as we move from 0.5 towards 1.0.
      const fadeStart = 0.5;
      const fadeEnd = 0.8;
      const opacity = 1 - clamp((pageOffset - fadeStart) / (fadeEnd - fadeStart), 0, 1);
      
      containerRef.current.style.opacity = opacity;
      containerRef.current.style.visibility = opacity <= 0.01 ? 'hidden' : 'visible';
      
      // Use CSS variable to avoid overwriting base CSS transform
      containerRef.current.style.setProperty('--scroll-y', `${scroll.offset * -100}px`);
    }
  });

  const introText = "Passionate about the intersection of deep learning and systems engineering — building resilient, low-latency backend architectures designed to sustain the next generation of intelligent applications.";
  const introChars = useMemo(() => introText.split(''), [introText]);

  useEffect(() => {
    // 1. Initial positions calculation
    const calculatePositions = () => {
      // Ensure we measure the "clean" state by resetting transformations
      const nameElements = lettersRef.current.filter(Boolean);
      const introElements = introLettersRef.current.filter(Boolean);
      const allElements = [...nameElements, ...introElements];
      
      // Momentarily reset for measurement
      allElements.forEach(el => {
        gsap.set(el, { x: 0, y: 0, skewX: 0, skewY: 0, rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1 });
      });

      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;

      positionsRef.current = allElements.map(el => {
        const rect = el.getBoundingClientRect();
        return {
          el,
          docX: rect.left + rect.width / 2 + scrollX,
          docY: rect.top + rect.height / 2 + scrollY,
          isMainName: el.classList.contains('letter')
        };
      });
    };

    // Calculate after a delay to ensure layout is fully settled
    const timer = setTimeout(calculatePositions, 500);
    window.addEventListener('resize', calculatePositions);
    window.addEventListener('scroll', calculatePositions);


    // 2. Optimized Mouse Interaction
    const handleMouseMove = (e) => {
      // Use pageX/Y for document-relative mouse position
      const { pageX, pageY } = e;
      const radius = 160; 

      positionsRef.current.forEach((pos) => {
        const dx = pageX - pos.docX;
        const dy = pageY - pos.docY;
        const distSq = dx * dx + dy * dy;
        const radSq = radius * radius;

        if (distSq < radSq) {
          const dist = Math.sqrt(distSq);
          const power = (1 - dist / radius) * 45;
          const angle = Math.atan2(dy, dx);
          const moveX = -Math.cos(angle) * power;
          const moveY = -Math.sin(angle) * power;

          gsap.to(pos.el, {
            x: moveX,
            y: moveY,
            skewX: moveX * 1.5,
            skewY: moveY * 0.8,
            rotateZ: moveX * 0.5,
            rotateY: moveX * 2,
            rotateX: moveY * -2,
            scale: 1 + Math.abs(moveX) * 0.02,
            color: "#fff",
            textShadow: pos.isMainName 
              ? `${-moveX/5}px 0 rgba(255,0,0,0.8), ${moveX/5}px 0 rgba(0,255,255,0.8), 0 0 15px #d900ff`
              : `0 0 10px rgba(255,255,255,0.8)`,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto"
          });
        } else {
          // Check if the element is currently manipulated by GSAP
          if (gsap.getProperty(pos.el, "x") !== 0) {
            gsap.to(pos.el, {
              x: 0,
              y: 0,
              skewX: 0,
              skewY: 0,
              rotateZ: 0,
              rotateY: 0,
              rotateX: 0,
              scale: 1,
              color: pos.isMainName ? "#cf00f3" : "#ffffff",
              textShadow: pos.isMainName ? "0 0 8px rgba(207, 0, 243, 0.5)" : "0 0 0px rgba(0,0,0,0)",
              duration: 0.8,
              ease: "elastic.out(1, 0.5)",
              overwrite: "auto"
            });
          }
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    gsap.fromTo(
      containerRef.current,
      { x: -100, opacity: 0 },
      { x: 0, opacity: 1, duration: 2, ease: "power3.out", delay: 0.5 }
    );

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculatePositions);
      window.removeEventListener('scroll', calculatePositions);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [introChars]);

  const lines = ["MOAD", "ELABDELLAOUI"];

  return (
    <div className="moad-name-container" ref={containerRef} style={{ perspective: '1200px' }}>
      <h1 className="moad-name-text">
        {lines.map((line, lIdx) => (
          <div key={lIdx} className="name-line">
            {line.split('').map((char, cIdx) => (
              <span 
                key={cIdx} 
                ref={el => {
                  if (el) lettersRef.current[lIdx * 50 + cIdx] = el;
                }}
                className="letter"
              >
                {char}
              </span>
            ))}
          </div>
        ))}
      </h1>

      <p className="hero-intro">
        {introChars.map((char, iIdx) => (
          <span 
            key={iIdx} 
            ref={el => {
              if (el) introLettersRef.current[iIdx] = el;
            }}
            className="intro-char"
          >
            {char}
          </span>
        ))}
      </p>
      
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="liquid" x="-100%" y="-100%" width="300%" height="300%">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.05" numOctaves="2" seed="1" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </div>
  );
}



