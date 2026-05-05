import React, { useState, useEffect, useRef } from 'react';
import './HeaderFrame.css';
import { scrollState } from '../portfolioState';
import { PORTFOLIO_PAGES } from '../portfolioPageData';
import { buildHeaderBumpState, getPageFocus, getPageOffset } from '../utils/portfolioTimeline';

const HeaderFrame = () => {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const pathRef = useRef(null);
  const traceRef = useRef(null);
  const pumpRefs = useRef({});

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const t = 10; // frame thickness
  const { width: w, height: h } = size;

  // Pocket dimensions
  const pW = 450; // width of the main pockets (right)
  const pH = 100; // depth of the main pockets
  const r = 50;   // consistent corner radius

  // Outer Path (CW)
  const outer = `M0,0 H${w} V${h} H0 Z`;

  useEffect(() => {
    let animationFrameId;

    const render = () => {
      const offset = scrollState?.offset || 0;
      const pageCount = PORTFOLIO_PAGES.length;
      const pockets = PORTFOLIO_PAGES.map((page, pageIndex) => {
        const pageFocus = getPageFocus(offset, pageIndex, pageCount);
        const pageCenter = getPageOffset(pageIndex, pageCount);
        const state = buildHeaderBumpState(page.headerBump, offset, w, pageFocus, pageCenter);

        return {
          ...page.headerBump,
          x: state.x,
          w: state.pocketWidth,
          d: state.pocketDepth,
          scale: state.pocketScale,
          pillScale: state.pillScale,
          pillWidth: state.pillWidth,
          opacity: state.opacity,
          pointerEvents: state.pointerEvents,
          topOffset: state.topOffset,
        };
      }).filter((pocket) => pocket.scale > 0.01);

      pockets.sort((a, b) => a.x - b.x);

      // Build path
      let topEdge = `M ${t}, ${t + r} Q ${t},${t} ${t + r},${t}`;

      pockets.forEach(p => {
        const actW = p.w * p.scale;
        const actD = p.d * p.scale;
        const pr = Math.min(r, actW / 2, actD / 2);

        const startX = p.x - actW / 2;
        const endX = p.x + actW / 2;

        topEdge += ` H ${startX - pr}`;
        topEdge += ` Q ${startX},${t} ${startX},${t + pr}`;
        topEdge += ` V ${t + actD - pr}`;
        topEdge += ` Q ${startX},${t + actD} ${startX + pr},${t + actD}`;
        topEdge += ` H ${endX - pr}`;
        topEdge += ` Q ${endX},${t + actD} ${endX},${t + actD - pr}`;
        topEdge += ` V ${t + pr}`;
        topEdge += ` Q ${endX},${t} ${endX + pr},${t}`;
      });

      topEdge += ` H ${w - pW}`;

      const cutoutEnd = `
        Q ${w - pW + r},${t} ${w - pW + r},${t + r} 
        V ${pH - r} 
        Q ${w - pW + r},${pH} ${w - pW + 2 * r},${pH} 
        H ${w - t - r} 
        Q ${w - t},${pH} ${w - t},${pH + r} 
        V ${h - pH - r}
        Q ${w - t},${h - pH} ${w - t - r},${h - pH}
        H ${w - pW + 2 * r}
        Q ${w - pW + r},${h - pH} ${w - pW + r},${h - pH + r}
        V ${h - t - r}
        Q ${w - pW + r},${h - t} ${w - pW},${h - t}
        H ${t + r}
        Q ${t},${h - t} ${t},${h - t - r}
        Z
      `;

      const newCutout = topEdge + cutoutEnd;
      const newFramePath = outer + newCutout;

      if (pathRef.current) pathRef.current.setAttribute('d', newFramePath);
      if (traceRef.current) traceRef.current.setAttribute('d', newCutout);

      PORTFOLIO_PAGES.forEach((page) => {
        const element = pumpRefs.current[page.headerBump.id];
        if (!element) return;

        const pocket = pockets.find(p => p.id === page.headerBump.id);
        if (pocket) {
          element.style.width = `${pocket.pillWidth}px`;
          element.style.overflow = 'hidden';
          element.style.left = `${pocket.x}px`;
          element.style.top = `${(pocket.pocketDepth * pocket.scale) / 2 + pocket.topOffset}px`;
          element.style.transform = `translateX(-50%) scale(${pocket.pillScale})`;
          element.style.opacity = pocket.opacity;
          element.style.pointerEvents = pocket.pointerEvents;
          element.style.display = 'flex';
        } else {
          element.style.opacity = 0;
          element.style.pointerEvents = 'none';
          element.style.display = 'none';
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [w, h, outer, t, r, pW, pH]);


  return (
    <div className="header-frame-wrapper">
      <svg
        className="cader-svg"
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        <path ref={pathRef} fill="#8f02a8" fillRule="evenodd" />

        {/* Energy Trace Line */}
        <path
          ref={traceRef}
          className="energy-trace"
          fill="none"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="2.5"
          filter="url(#glow)"
        />

        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div className="frame-pills">
        {PORTFOLIO_PAGES.map((page) => {
          const isLink = page.headerBump.kind === 'link';
          const PumpTag = isLink ? 'a' : 'div';

          return (
            <PumpTag
              key={page.headerBump.id}
              ref={(node) => {
                pumpRefs.current[page.headerBump.id] = node;
              }}
              href={isLink ? page.headerBump.href : undefined}
              download={isLink ? page.headerBump.download : undefined}
              className={`pump cv-pump ${page.headerBump.id === 'projects' ? 'projects-pump' : ''}`}
            >
              <div className="pump-info">
                <h2 className="pump-name">{page.headerBump.title}</h2>
                {page.headerBump.label ? <p className="pump-label">{page.headerBump.label}</p> : null}
              </div>
            </PumpTag>
          );
        })}

        {/* Upper Pump */}
        <div className="pump upper-pump">

          <div className="pump-info">
            <h2 className="pump-name">DAERO</h2>
            <p className="pump-label">PROFILE</p>
          </div>
          <div className="pump-image">
            <img src="/upper.png" alt="Profile Upper" />
          </div>
        </div>

        {/* Lower Pump */}
        <div className="pump lower-pump">
          <div className="pump-info">
            <h2 className="pump-name">DAERO</h2>
            <p className="pump-label">PROFILE</p>
          </div>
          <div className="pump-image">
            <img src="/lower.png" alt="Profile Lower" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderFrame;
