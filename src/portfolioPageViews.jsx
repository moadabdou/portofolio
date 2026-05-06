import React from 'react';

import MoadName from './components/MoadName';
import ProjectDetails from './components/ProjectDetails';
import KeyboardHint from './components/KeyboardHint';
import { WhoAmIGallery } from './components/WhoAmIGallery';
import { PORTFOLIO_PAGES } from './portfolioPageData';

const PORTFOLIO_PAGE_RENDERERS = {
  intro: () => <MoadName />,
  projects: () => (
    <>
      <ProjectDetails />
      <KeyboardHint />
    </>
  ),
  'who-am-i': () => null,
  'arsenal': () => <div style={{ color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '3rem', fontFamily: 'Orbitron' }}>ARSENAL COMING SOON</div>,
};

export const PORTFOLIO_PAGE_VIEWS = PORTFOLIO_PAGES.map((page) => ({
  ...page,
  render: PORTFOLIO_PAGE_RENDERERS[page.id] ?? (() => null),
}));