import React, { useState, useEffect, useRef } from 'react';
import { contactControlState, scrollState } from '../portfolioState';
import { PORTFOLIO_PAGES } from '../portfolioPageData';
import './ContactDetails.css';

export default function ContactDetails() {
  const [rx, setRx] = useState(0);
  const [ry, setRy] = useState(0);
  const [rz, setRz] = useState(0);
  const [px, setPx] = useState(0);
  const [py, setPy] = useState(0);
  const [pz, setPz] = useState(0);

  const [autoSpin, setAutoSpin] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Dynamic config base retrieval
  const contactPage = PORTFOLIO_PAGES.find((p) => p.id === 'contact');
  const basePos = contactPage?.scene?.station?.position || [2, -3, -2];
  const baseRot = contactPage?.scene?.station?.rotation || [-0.8, 1.2, 0.5];

  // Sync state values continuously in case R3F updates them
  useEffect(() => {
    let active = true;
    const updateLoop = () => {
      if (!active) return;
      if (contactControlState.autoSpin) {
        setRy(contactControlState.ry);
      }
      // Check scroll state offset to fade overlay in/out
      const offset = scrollState.offset;
      setIsVisible(offset >= 0.88);

      requestAnimationFrame(updateLoop);
    };
    updateLoop();
    return () => {
      active = false;
    };
  }, []);

  const handleSliderChange = (axis, val) => {
    if (calibrating) return;
    const floatVal = parseFloat(val);
    if (axis === 'x') {
      setRx(floatVal);
      contactControlState.rx = floatVal;
    } else if (axis === 'y') {
      setRy(floatVal);
      contactControlState.ry = floatVal;
    } else if (axis === 'z') {
      setRz(floatVal);
      contactControlState.rz = floatVal;
    } else if (axis === 'px') {
      setPx(floatVal);
      contactControlState.px = floatVal;
    } else if (axis === 'py') {
      setPy(floatVal);
      contactControlState.py = floatVal;
    } else if (axis === 'pz') {
      setPz(floatVal);
      contactControlState.pz = floatVal;
    }
  };

  const toggleAutoSpin = () => {
    const next = !autoSpin;
    setAutoSpin(next);
    contactControlState.autoSpin = next;
    playBeepSound(next ? 880 : 440);
  };

  const resetCalibration = () => {
    if (calibrating) return;
    setCalibrating(true);
    playGlitchBeep();

    // Smoothly animate back to 0
    const startX = contactControlState.rx;
    const startY = contactControlState.ry;
    const startZ = contactControlState.rz;
    const startPX = contactControlState.px;
    const startPY = contactControlState.py;
    const startPZ = contactControlState.pz;
    const duration = 800; // ms
    const startTime = performance.now();

    const animateReset = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      const nextX = startX * (1 - ease);
      const nextY = startY * (1 - ease);
      const nextZ = startZ * (1 - ease);
      const nextPX = startPX * (1 - ease);
      const nextPY = startPY * (1 - ease);
      const nextPZ = startPZ * (1 - ease);

      setRx(nextX);
      setRy(nextY);
      setRz(nextZ);
      setPx(nextPX);
      setPy(nextPY);
      setPz(nextPZ);
      
      contactControlState.rx = nextX;
      contactControlState.ry = nextY;
      contactControlState.rz = nextZ;
      contactControlState.px = nextPX;
      contactControlState.py = nextPY;
      contactControlState.pz = nextPZ;

      if (progress < 1) {
        requestAnimationFrame(animateReset);
      } else {
        setCalibrating(false);
        setAutoSpin(false);
        contactControlState.autoSpin = false;
        playBeepSound(600);
      }
    };

    requestAnimationFrame(animateReset);
  };

  // Clipboard Copier for developer presets
  const handleCopyConfig = () => {
    const finalPX = (basePos[0] + px).toFixed(2);
    const finalPY = (basePos[1] + py).toFixed(2);
    const finalPZ = (basePos[2] + pz).toFixed(2);

    const finalRX = (baseRot[0] + rx).toFixed(2);
    const finalRY = (baseRot[1] + ry).toFixed(2);
    const finalRZ = (baseRot[2] + rz).toFixed(2);

    const configCode = `station: {
  position: [${finalPX}, ${finalPY}, ${finalPZ}],
  scale: 2.0,
  rotation: [${finalRX}, ${finalRY}, ${finalRZ}],
}`;

    navigator.clipboard.writeText(configCode)
      .then(() => {
        setCopied(true);
        playBeepSound(1000);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };

  const playBeepSound = (freq) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  const playGlitchBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.setValueAtTime(800, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(200, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  };

  const toDegrees = (rad) => {
    const deg = Math.round((rad * 180) / Math.PI) % 360;
    return deg >= 0 ? `+${deg}°` : `${deg}°`;
  };

  const formatCoord = (base, offset) => {
    const val = base + offset;
    return val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2);
  };

  return (
    <div className={`telemetry-dashboard ${isVisible ? 'active' : ''}`}>
      <div className="scanlines"></div>

      <div className="dashboard-header">
        <div className="status-indicator">
          <span className={`status-dot ${autoSpin ? 'spinning' : 'active'}`}></span>
          <span className="status-label">
            {autoSpin ? 'AUTO-ORBIT ACTIVE' : 'CALIBRATOR LINK ONLINE'}
          </span>
        </div>
        <div className="dashboard-title">STATION POSITION & ANGLE</div>
      </div>

      <div className="dashboard-content">
        {/* Rotation Inputs */}
        <div className="slider-section-header">ROTATION telemetry</div>
        
        <div className="slider-group">
          <div className="slider-header">
            <span className="slider-name">PITCH (X)</span>
            <span className="slider-value">{toDegrees(rx)}</span>
          </div>
          <input
            type="range"
            min={-Math.PI}
            max={Math.PI}
            step={0.01}
            value={rx}
            disabled={calibrating}
            onChange={(e) => handleSliderChange('x', e.target.value)}
            className="neon-slider purple"
          />
        </div>

        <div className="slider-group">
          <div className="slider-header">
            <span className="slider-name">YAW (Y)</span>
            <span className="slider-value">{toDegrees(ry)}</span>
          </div>
          <input
            type="range"
            min={-Math.PI * 2}
            max={Math.PI * 2}
            step={0.01}
            value={ry}
            disabled={calibrating}
            onChange={(e) => handleSliderChange('y', e.target.value)}
            className="neon-slider purple"
          />
        </div>

        <div className="slider-group">
          <div className="slider-header">
            <span className="slider-name">ROLL (Z)</span>
            <span className="slider-value">{toDegrees(rz)}</span>
          </div>
          <input
            type="range"
            min={-Math.PI}
            max={Math.PI}
            step={0.01}
            value={rz}
            disabled={calibrating}
            onChange={(e) => handleSliderChange('z', e.target.value)}
            className="neon-slider purple"
          />
        </div>

        {/* Position Inputs */}
        <div className="slider-section-header">POSITION coordinates</div>

        <div className="slider-group">
          <div className="slider-header">
            <span className="slider-name">POSITION X</span>
            <span className="slider-value">{formatCoord(basePos[0], px)}</span>
          </div>
          <input
            type="range"
            min={-8.0}
            max={8.0}
            step={0.05}
            value={px}
            disabled={calibrating}
            onChange={(e) => handleSliderChange('px', e.target.value)}
            className="neon-slider blue"
          />
        </div>

        <div className="slider-group">
          <div className="slider-header">
            <span className="slider-name">POSITION Y</span>
            <span className="slider-value">{formatCoord(basePos[1], py)}</span>
          </div>
          <input
            type="range"
            min={-8.0}
            max={8.0}
            step={0.05}
            value={py}
            disabled={calibrating}
            onChange={(e) => handleSliderChange('py', e.target.value)}
            className="neon-slider blue"
          />
        </div>

        <div className="slider-group">
          <div className="slider-header">
            <span className="slider-name">POSITION Z</span>
            <span className="slider-value">{formatCoord(basePos[2], pz)}</span>
          </div>
          <input
            type="range"
            min={-15.0}
            max={15.0}
            step={0.05}
            value={pz}
            disabled={calibrating}
            onChange={(e) => handleSliderChange('pz', e.target.value)}
            className="neon-slider blue"
          />
        </div>

        <div className="dashboard-actions">
          <button 
            className={`tech-btn ${autoSpin ? 'active' : ''}`}
            onClick={toggleAutoSpin}
            disabled={calibrating}
          >
            <span className="btn-inner">AUTO-SPIN</span>
          </button>
          
          <button 
            className={`tech-btn copy-btn ${copied ? 'active' : ''}`}
            onClick={handleCopyConfig}
            disabled={calibrating}
          >
            <span className="btn-inner">{copied ? 'COPIED!' : 'COPY CODE'}</span>
          </button>

          <button 
            className="tech-btn reset"
            onClick={resetCalibration}
            disabled={calibrating}
          >
            <span className="btn-inner">RESET</span>
          </button>
        </div>
      </div>

      <div className="corner-decor top-left"></div>
      <div className="corner-decor top-right"></div>
      <div className="corner-decor bottom-left"></div>
      <div className="corner-decor bottom-right"></div>
    </div>
  );
}
