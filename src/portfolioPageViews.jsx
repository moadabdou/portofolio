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
};

export const PORTFOLIO_PAGE_VIEWS = PORTFOLIO_PAGES.map((page) => ({
  ...page,
  render: PORTFOLIO_PAGE_RENDERERS[page.id] ?? (() => null),
}));