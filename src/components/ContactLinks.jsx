import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { getPortfolioPageIndex, PORTFOLIO_PAGES } from '../portfolioPageData';
import { clamp, getRelativeOffset, getPageFocus } from '../utils/portfolioTimeline';
import './ContactLinks.css';

// Premium High-Fidelity SVG Brand Icons
const GmailIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const WhatsappIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.004 2C6.482 2 2 6.482 2 12.004c0 1.762.455 3.486 1.325 5.006L2 22l5.125-1.303a9.96 9.96 0 004.879 1.307c5.52 0 10.004-4.482 10.004-10.004C22.008 6.482 17.524 2 12.004 2zm0 1.5c4.69 0 8.504 3.814 8.504 8.504 0 4.69-3.814 8.504-8.504 8.504a8.44 8.44 0 01-4.321-1.187l-.31-.184-3.037.773.788-2.956-.202-.32a8.447 8.447 0 01-1.422-4.63c0-4.69 3.814-8.504 8.504-8.504zm-3.666 4.715c-.2 0-.398.083-.54.225-.262.262-.51.685-.51 1.157 0 .848.43 1.83 1.258 2.658.828.828 1.81 1.258 2.658 1.258.472 0 .895-.248 1.157-.51.142-.142.225-.34.225-.54v-.253c0-.203-.083-.4-.225-.54l-1.013-1.012c-.142-.142-.337-.225-.54-.225h-.101c-.203 0-.398.083-.54.225l-.253.253c-.156.156-.379.167-.54.025a5.5 5.5 0 01-1.393-1.393c-.142-.161-.131-.384.025-.54l.253-.253c.142-.142.225-.337.225-.54v-.101c0-.203-.083-.398-.225-.54l-1.012-1.013a.76.76 0 00-.54-.225z" />
  </svg>
);

const CONTACT_CHANNELS = [
  {
    id: 'gmail',
    label: 'Gmail',
    icon: GmailIcon,
    url: 'mailto:moadabdou@gmail.com',
    cssClass: 'hex-gmail'
  },
  {
    id: 'github',
    label: 'GitHub',
    icon: GithubIcon,
    url: 'https://github.com/moadabdou',
    cssClass: 'hex-github'
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: LinkedinIcon,
    url: 'https://linkedin.com/in/moad-abdou',
    cssClass: 'hex-linkedin'
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: WhatsappIcon,
    url: 'https://wa.me/33600000000',
    cssClass: 'hex-whatsapp'
  }
];

export default function ContactLinks() {
  const scroll = useScroll();
  const pageIndex = getPortfolioPageIndex('contact');
  const pageCount = PORTFOLIO_PAGES.length;
  const containerRef = useRef();

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
    window.open(url, '_blank', 'noopener,noreferrer');
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
