import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import './KeyboardHint.css';
import { getPortfolioPage, getPortfolioPageIndex, PORTFOLIO_PAGES } from '../portfolioPageData';
import { clamp, getPageOffset, getPageFocus } from '../utils/portfolioTimeline';

const KeyboardHint = () => {
  const scroll = useScroll();
  const hintRef = useRef();
  const projectsPage = getPortfolioPage('projects');
  const projectsPageIndex = getPortfolioPageIndex('projects');
  const pageCount = PORTFOLIO_PAGES.length;
  const nextPageOffset = getPageOffset(projectsPageIndex + 1, pageCount);

  useFrame(() => {
    if (!hintRef.current) return;

    const offset = scroll.offset;
    const focus = getPageFocus(offset, projectsPageIndex, pageCount);
    const start = projectsPage?.timing.keyboardHintStart ?? 0.5;
    const enterOpacity = clamp((offset - start) * 10, 0, 1);
    
    const opacity = focus * enterOpacity;

    hintRef.current.style.opacity = opacity;
    hintRef.current.style.visibility = opacity <= 0.001 ? 'hidden' : 'visible';

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
