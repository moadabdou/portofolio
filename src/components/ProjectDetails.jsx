import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { PROJECTS } from './ProjectsGallery';
import './ProjectDetails.css';

export default function ProjectDetails() {
  const scroll = useScroll();
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const linkRef = useRef(null);

  useFrame(() => {
    if (!containerRef.current) return;

    // The gallery is on the second page (0.5 to 1.0)
    // We'll show the info when scroll is between 0.6 and 1.0
    const rawOffset = scroll.offset;
    const visibility = Math.min(1, Math.max(0, (rawOffset - 0.6) / 0.1));
    
    containerRef.current.style.opacity = visibility;
    containerRef.current.style.visibility = visibility <= 0.01 ? 'hidden' : 'visible';

    // Map scroll from 0.65 to 0.95 to project indices
    const projectProgress = Math.min(1, Math.max(0, (rawOffset - 0.65) / 0.3));
    const projectIndex = Math.min(PROJECTS.length - 1, Math.floor(projectProgress * PROJECTS.length));
    
    const project = PROJECTS[projectIndex];

    if (titleRef.current && titleRef.current.innerText !== project.title) {
      titleRef.current.innerText = project.title;
      titleRef.current.setAttribute('data-text', project.title);
      descRef.current.innerText = project.description;
      linkRef.current.href = project.github;
      
      // Trigger a small entrance animation for the text
      containerRef.current.classList.remove('update-anim');
      void containerRef.current.offsetWidth; // trigger reflow
      containerRef.current.classList.add('update-anim');
    }

    // Gentle parallax/float
    const floatY = Math.sin(Date.now() * 0.001) * 10;
    containerRef.current.style.transform = `translateY(calc(-50% + ${floatY}px))`;
  });

  return (
    <div className="project-details-container" ref={containerRef}>
      <div className="project-details-content">
        <div className="project-label">SELECTED PROJECT</div>
        <h2 className="project-title" ref={titleRef}></h2>
        <p className="project-description" ref={descRef}></p>
        <a 
          className="project-github-link" 
          ref={linkRef} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <svg className="github-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.414-4.041-1.414-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          VIEW SOURCE
          <span className="link-arrow">→</span>
        </a>
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
