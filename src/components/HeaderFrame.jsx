import React, { useState, useEffect, useRef } from 'react';
import './HeaderFrame.css';
import { scrollState } from '../App';

const HeaderFrame = () => {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const pathRef = useRef(null);
  const traceRef = useRef(null);
  const cvPumpRef = useRef(null);
  const projPumpRef = useRef(null);

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
  const pW_cv = 160; // width of the CV pocket (middle)
  const pH_cv = 80;  // depth of the CV pocket
  const pW_proj = 210; // width of the Projects pocket
  const pH_proj = 80;
  const r = 50;   // consistent corner radius

  // Outer Path (CW)
  const outer = `M0,0 H${w} V${h} H0 Z`;

  useEffect(() => {
    let animationFrameId;

    const render = () => {
      const offset = scrollState?.offset || 0;
      let progress = offset;

      // Calculate pockets
      let cvScale = 1 - progress;
      let cvX = w / 2 - progress * (w * 0.22);
      let cvPillScale = Math.pow(cvScale, 1.5);
      let cvPocketScale = cvScale;
      let cvPillWidth = 60 + 70 * cvPillScale;
      let cvPocketWidth = 80 + 80 * cvPocketScale;

      let projScale = progress;
      let projX = w / 2 + (1 - progress) * (w * 0.22);
      let projPillScale = Math.pow(projScale, 1.5);
      let projPocketScale = projScale;
      let projPillWidth = 60 + 120 * projPillScale;
      let projPocketWidth = 80 + 130 * projPocketScale;

      let pockets = [];
      if (cvScale > 0.01) {
        pockets.push({ x: cvX, w: cvPocketWidth, d: pH_cv, scale: cvPocketScale, id: 'cv' });
      }
      if (projScale > 0.01) {
        pockets.push({ x: projX, w: projPocketWidth, d: pH_proj, scale: projPocketScale, id: 'proj' });
      }

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

      if (cvPumpRef.current) {
        cvPumpRef.current.style.width = `${cvPillWidth}px`;
        cvPumpRef.current.style.overflow = 'hidden';
        cvPumpRef.current.style.left = `${cvX}px`;
        cvPumpRef.current.style.top = `${(pH_cv * cvPocketScale) / 2 - 20}px`;
        cvPumpRef.current.style.transform = `translateX(-50%) scale(${cvPillScale})`;
        cvPumpRef.current.style.opacity = cvPillScale;
        cvPumpRef.current.style.pointerEvents = cvScale > 0.1 ? 'auto' : 'none';
      }

      if (projPumpRef.current) {
        projPumpRef.current.style.width = `${projPillWidth}px`;
        projPumpRef.current.style.overflow = 'hidden';
        projPumpRef.current.style.left = `${projX}px`;
        projPumpRef.current.style.top = `${(pH_proj * projPocketScale) / 2 - 20}px`;
        projPumpRef.current.style.transform = `translateX(-50%) scale(${projPillScale})`;
        projPumpRef.current.style.opacity = projPillScale;
        projPumpRef.current.style.pointerEvents = projScale > 0.1 ? 'auto' : 'none';
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [w, h, outer, t, r, pW, pH, pW_cv, pH_cv, pW_proj, pH_proj]);


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
        {/* CV Pump */}
        <a ref={cvPumpRef} href="/cv.pdf" download className="pump cv-pump">
          <div className="pump-info">
            <h2 className="pump-name">CV</h2>
            <p className="pump-label">DOWNLOAD</p>
          </div>
        </a>

        {/* Projects Pump */}
        <div ref={projPumpRef} className="pump cv-pump projects-pump">
          <div className="pump-info">
            <h2 className="pump-name">MY PROJECTS</h2>
            <p className="pump-label">EXPLORE</p>
          </div>
        </div>

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
