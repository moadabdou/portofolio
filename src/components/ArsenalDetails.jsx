import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { arsenalState } from '../portfolioState';
import { getPortfolioPageIndex, PORTFOLIO_PAGES } from '../portfolioPageData';
import { clamp, getRelativeOffset, getPageFocus } from '../utils/portfolioTimeline';
import './ArsenalDetails.css';

const ARSENAL_DATA = [
  { 
    name: 'LANGUAGES', 
    items: ['PYTHON', 'C++', 'JAVA', 'TYPESCRIPT', 'PHP'],
    descriptions: [
      'Advanced scripting, scripting-based systems automation, data manipulation pipelines, and machine learning model training.',
      'Low-level system programming, custom memory management, hardware-accelerated vectorization, and high-performance engines.',
      'Enterprise-grade backends, multithreaded concurrency models leveraging Virtual Threads, robust memory models, and modular architectures.',
      'Strict compile-time type safety for complex frontend application logic, solid patterns, and clean structural typing.',
      'Server-side web applications, robust templating, and rapid backend API prototyping with high interoperability.'
    ]
  },
  { 
    name: 'FRAMEWORKS & LIBS', 
    items: ['REACT', 'SPRING BOOT', 'PYTORCH', 'NUMPY', 'PANDAS'],
    descriptions: [
      'Component-driven single-page interfaces, state synchronization across highly interactive, real-time reactive displays.',
      'Enterprise Java backend structures, secure APIs, dependency injection, and integrated transactional operations.',
      'Custom neural network training, dynamic computational graphs, GPU-accelerated tensor operations, and architectural experimentation.',
      'High-performance multi-dimensional array operations, scientific computing, mathematical vectorization, and linear algebra.',
      'Large-scale tabular data manipulation, statistical analysis, data cleaning pipelines, and structured dataframe operations.'
    ]
  },
  { 
    name: 'DATABASES & DEVOPS', 
    items: ['MONGODB', 'MYSQL', 'POSTGRES', 'ORACLE DB', 'DOCKER', 'GIT', 'CI/CD'],
    descriptions: [
      'Document-oriented NoSQL database for rapid unstructured data models and flexible JSON-like document routing.',
      'Relational database operations, complex transactional queries, robust relational database schemas, and structured storage.',
      'Advanced object-relational database offering acid-compliance, custom indexing strategies, and robust data persistence.',
      'Enterprise-grade relational database optimized for massive concurrent operations, secure scaling, and high availability.',
      'Consistent containerization pipelines for clean software packaging, isolated stateful service environments, and reproducibility.',
      'Distributed version control system for atomic commits, branching workflows, and conflict-free collaboration patterns.',
      'Automated pipelines ensuring constant integration, automated linting, test suite execution, and robust production deployments.'
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
