import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { Mail, Terminal, Briefcase, MessageSquare } from 'lucide-react';
import { getPortfolioPageIndex, PORTFOLIO_PAGES } from '../portfolioPageData';
import { clamp, getRelativeOffset, getPageFocus } from '../utils/portfolioTimeline';
import './ContactLinks.css';

const CONTACT_CHANNELS = [
  {
    id: 'gmail',
    label: 'Gmail',
    icon: Mail,
    url: 'mailto:moadabdou@gmail.com',
    cssClass: 'hex-gmail'
  },
  {
    id: 'github',
    label: 'GitHub',
    icon: Terminal,
    url: 'https://github.com/moadabdou',
    cssClass: 'hex-github'
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: Briefcase,
    url: 'https://linkedin.com/in/moad-abdou',
    cssClass: 'hex-linkedin'
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageSquare,
    url: 'https://wa.me/33600000000',
    cssClass: 'hex-whatsapp'
  }
];

export default function ContactLinks() {
  const scroll = useScroll();
  const pageIndex = getPortfolioPageIndex('contact');
  const pageCount = PORTFOLIO_PAGES.length;
  const containerRef = useRef();

  const playClickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(580, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(1250, audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}
  };

  useFrame(() => {
    if (!containerRef.current) return;

    const offset = scroll.offset;
    const pageOffset = getRelativeOffset(offset, pageIndex, pageCount);

    // Symmetrical timing fade-in: starts at 0.75 and fully locks in at 1.0
    const entranceProgress = clamp((offset - 0.75) / 0.25, 0, 1);
    const focus = getPageFocus(offset, pageIndex, pageCount);
    const visibility = entranceProgress * focus;

    containerRef.current.style.opacity = visibility;
    containerRef.current.style.transform = `translateY(calc(-50% + ${(1.0 - visibility) * 25}px))`;
    containerRef.current.style.visibility = visibility > 0.01 ? 'visible' : 'hidden';
  });

  const handleChannelClick = (url) => {
    playClickSound();
    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
    }, 150);
  };

  return (
    <div ref={containerRef} className="contact-links-container">
      {/* Visual left stencil vertical decoration matching ProjectDetails */}
      <div className="contact-links-decor-left">
        <div className="deco-square-left"></div>
        <div className="deco-line-left"></div>
        <div className="deco-square-left"></div>
      </div>

      <div className="contact-links-header">
        <h4 className="contact-links-sub">COMMUNICATION_HUB</h4>
        <h2 className="contact-links-title">SECURE LINKS</h2>
      </div>

      <div className="honeycomb-grid">
        {CONTACT_CHANNELS.map((channel) => {
          const IconComp = channel.icon;
          return (
            <div
              key={channel.id}
              className={`hex-btn-wrapper ${channel.cssClass}`}
              onClick={() => handleChannelClick(channel.url)}
            >
              <svg viewBox="0 0 120 138" className="hex-svg">
                {/* Concentric single polygon for both fill and outline */}
                <polygon
                  points="60,2 118,35 118,103 60,136 2,103 2,35"
                  className="hex-polygon"
                />
              </svg>
              <div className="hex-content">
                <IconComp className="hex-icon" />
                <span className="hex-label">{channel.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="contact-links-decor">
        <div className="decor-line"></div>
        <span className="decor-code">PROTO_v8.4.1</span>
      </div>
    </div>
  );
}
