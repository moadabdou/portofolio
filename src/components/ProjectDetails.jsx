import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import gsap from 'gsap';
import { PROJECTS } from './ProjectsGallery';
import { galleryState } from '../portfolioState';
import { getPortfolioPage, getPortfolioPageIndex, PORTFOLIO_PAGES } from '../portfolioPageData';
import { clamp, getPageOffset, getPageFocus } from '../utils/portfolioTimeline';
import './ProjectDetails.css';

export default function ProjectDetails() {
  const scroll = useScroll();
  const projectsPage = getPortfolioPage('projects');
  const projectsPageIndex = getPortfolioPageIndex('projects');
  const pageCount = PORTFOLIO_PAGES.length;
  const nextPageOffset = getPageOffset(projectsPageIndex + 1, pageCount);
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const magneticRef = useRef(null);
  const proximityRef = useRef(0);
  const glitchAudioCtxRef = useRef(null);
  const glitchAudioBufferRef = useRef(null);
  const isSectionVisible = useRef(false);

  // Pre-decode glitch sound for zero-latency playback
  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    glitchAudioCtxRef.current = ctx;
    fetch('/audio/virtual_vibes-glitch-sound-effect-hd-379466.mp3')
      .then((r) => r.arrayBuffer())
      .then((ab) => ctx.decodeAudioData(ab))
      .then((buf) => { glitchAudioBufferRef.current = buf; })
      .catch(() => {});
    return () => ctx.close();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!magneticRef.current) return;
      
      const { pageX, pageY } = e;
      const rect = magneticRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2 + window.scrollX;
      const centerY = rect.top + rect.height / 2 + window.scrollY;

      const dx = pageX - centerX;
      const dy = pageY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = 250; // Detection radius

      if (dist < radius) {
        const power = (1 - dist / radius);
        const moveX = dx * power * 0.35;
        const moveY = dy * power * 0.35;
        const scale = 1 + power * 0.15;
        
        gsap.to(magneticRef.current, {
          x: moveX,
          y: moveY,
          scale: scale,
          rotationZ: moveX * 0.2,
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto"
        });

        // Set glitch intensity variable on the magnetic ref
        if (magneticRef.current) {
          magneticRef.current.style.setProperty('--proximity-glitch', power);
        }
        proximityRef.current = power;
      } else {
        if (gsap.getProperty(magneticRef.current, "x") !== 0) {
          gsap.to(magneticRef.current, {
            x: 0,
            y: 0,
            scale: 1,
            rotationZ: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.5)",
            overwrite: "auto"
          });
          if (magneticRef.current) {
            magneticRef.current.style.setProperty('--proximity-glitch', 0);
          }
          proximityRef.current = 0;
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const playGlitchSound = () => {
    if (glitchAudioCtxRef.current && glitchAudioBufferRef.current) {
      if (glitchAudioCtxRef.current.state === 'suspended') {
        glitchAudioCtxRef.current.resume();
      }
      const src = glitchAudioCtxRef.current.createBufferSource();
      src.buffer = glitchAudioBufferRef.current;
      const gain = glitchAudioCtxRef.current.createGain();
      gain.gain.value = 0.2;
      src.connect(gain);
      gain.connect(glitchAudioCtxRef.current.destination);
      src.start(glitchAudioCtxRef.current.currentTime + 0.5);
    }
  };

  useFrame(() => {
    if (!containerRef.current) return;

    const rawOffset = scroll.offset;
    const focus = getPageFocus(rawOffset, projectsPageIndex, pageCount);
    const start = projectsPage?.timing.projectDetailsStart ?? 0.3;
    const fadeDistance = projectsPage?.timing.projectDetailsFadeDistance ?? 0.1;
    const enterVisibility = clamp((rawOffset - start) / fadeDistance, 0, 1);
    
    const visibility = focus * enterVisibility;

    containerRef.current.style.opacity = visibility;
    containerRef.current.style.visibility = visibility <= 0.001 ? 'hidden' : 'visible';

    // Sync with galleryState
    const projectIndex = galleryState.index;
    const project = PROJECTS[projectIndex];
    const isTitleDifferent = titleRef.current && titleRef.current.innerText !== project.title;

    if (visibility > 0.1) {
      if (isTitleDifferent) {
        const isInitialLoad = titleRef.current && titleRef.current.innerText === "";

        // Update Text
        if (titleRef.current) {
          titleRef.current.innerText = project.title;
          titleRef.current.setAttribute('data-text', project.title);
          descRef.current.innerText = project.description;
          descRef.current.setAttribute('data-text', project.description);
          const actualLink = magneticRef.current.querySelector('a');
          if (actualLink) actualLink.href = project.github;
        }

        // Trigger Glitch (Sound + CSS) ONLY on navigation (not initial load)
        if (!isInitialLoad) {
          playGlitchSound();
          containerRef.current.classList.remove('update-anim');
          void containerRef.current.offsetWidth;
          containerRef.current.classList.add('update-anim');
        }
      }
      isSectionVisible.current = true;
    } else if (visibility < 0.05) {
      isSectionVisible.current = false;
    }

    // Gentle parallax/float
    const floatY = Math.sin(Date.now() * 0.001) * 10;
    containerRef.current.style.transform = `translateY(calc(-50% + ${floatY}px))`;
  });

  return (
    <div className="project-details-container" ref={containerRef}>
      <div className="project-details-content">
        <h2 className="project-title" ref={titleRef}></h2>
        <p className="project-description" ref={descRef} data-text=""></p>
        <div className="github-magnetic-wrapper" ref={magneticRef}>
          <a
            className="project-github-link"
            href="#" // will be set by ref
            data-text="VIEW SOURCE"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="github-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.414-4.041-1.414-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            VIEW SOURCE
            <span className="link-arrow">→</span>
          </a>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="project-details-decoration">
        <div className="deco-square"></div>
        <div className="deco-line"></div>
        <div className="deco-square"></div>
      </div>
    </div>
  );
}
