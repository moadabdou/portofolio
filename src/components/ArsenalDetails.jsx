import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { arsenalState } from '../portfolioState';
import { getPortfolioPageIndex, PORTFOLIO_PAGES } from '../portfolioPageData';
import { clamp, getRelativeOffset, getPageFocus } from '../utils/portfolioTimeline';
import './ArsenalDetails.css';

const ARSENAL_DATA = [
  { 
    name: 'FOUNDATION', 
    items: ['REACT', 'THREE.JS', 'NODE.JS', 'TYPESCRIPT', 'GLSL'],
    descriptions: [
      'The core of modern web architecture, enabling dynamic and component-driven interfaces.',
      'A powerful 3D library that brings high-performance WebGL graphics to the browser.',
      'Scalable server-side runtime for building high-concurrency network applications.',
      'A robust superset of JavaScript providing static typing for mission-critical code.',
      'Low-level shader language for crafting high-fidelity visual effects and mathematics.'
    ]
  },
  { 
    name: 'STATION TOOLS', 
    items: ['GIT', 'DOCKER', 'VITE', 'GSAP', 'FIGMA', 'POSTGRES'],
    descriptions: [
      'Distributed version control for seamless multi-developer synchronization.',
      'Containerization technology for consistent deployment across any environment.',
      'Next-generation frontend tooling with lightning-fast HMR and build times.',
      'The industry standard for high-performance timeline-based web animations.',
      'Professional interface design tool for crafting high-fidelity prototypes.',
      'Advanced open-source relational database for robust data persistence.'
    ]
  },
  { 
    name: 'PROTOCOLS', 
    items: ['GRAPHQL', 'CI/CD', 'REST', 'UI/UX', '3D MATH'],
    descriptions: [
      'Declarative data fetching for complex API structures and optimized payloads.',
      'Automated pipelines for continuous integration and stable delivery workflows.',
      'Standard architectural style for interoperable and scalable web services.',
      'Holistic approach to crafting intuitive and aesthetically premium user journeys.',
      'The mathematical foundation of 3D space, physics, and procedural generation.'
    ]
  }
];

export default function ArsenalDetails() {
  const scroll = useScroll();
  const pageIndex = getPortfolioPageIndex('arsenal');
  const pageCount = PORTFOLIO_PAGES.length;
  const containerRef = useRef();
  
  const [displayData, setDisplayData] = useState({ title: '', desc: '', category: '' });
  const prevTitle = useRef('');

  useFrame(() => {
    if (!containerRef.current) return;
    
    const offset = scroll.offset;
    const pageOffset = getRelativeOffset(offset, pageIndex, pageCount);
    
    const entranceStart = 0.3;
    const entranceEnd = 0.5;
    const entranceProgress = clamp((pageOffset - entranceStart) / (entranceEnd - entranceStart), 0, 1);
    
    const focus = getPageFocus(offset, pageIndex, pageCount);
    const visibility = entranceProgress * focus;
    containerRef.current.style.opacity = visibility;
    containerRef.current.style.visibility = visibility > 0.01 ? 'visible' : 'hidden';

    // Update content from state
    const level = arsenalState.activeLevel;
    const index = arsenalState.focusIndices[level];
    const data = ARSENAL_DATA[level];
    const title = data.items[index];
    const desc = data.descriptions[index];
    const category = data.name;

    if (title !== prevTitle.current && visibility > 0.1) {
      setDisplayData({ title, desc, category });
      prevTitle.current = title;
      
      // Trigger glitch animation
      containerRef.current.classList.remove('update-glitch');
      void containerRef.current.offsetWidth;
      containerRef.current.classList.add('update-glitch');
    }
  });

  return (
    <div ref={containerRef} className="arsenal-details-container">
      <div className="arsenal-details-content">
        <span className="arsenal-label">TECH_SPEC // {displayData.category}</span>
        <h2 className="arsenal-title" data-text={displayData.title}>{displayData.title}</h2>
        <p className="arsenal-description" data-text={displayData.desc}>
          {displayData.desc}
        </p>
      </div>

      <div className="arsenal-details-decoration">
        <div className="deco-square-v"></div>
        <div className="deco-line-v"></div>
        <div className="deco-square-v"></div>
      </div>
    </div>
  );
}
