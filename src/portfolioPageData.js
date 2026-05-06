export const PORTFOLIO_PAGES = [
  {
    id: 'intro',
    scene: {
      station: {
        position: [-8, -1, -12],
        scale: 2.5,
        rotation: [-0.5, -0.5, -0.5],
      },
    },
    headerBump: {
      id: 'cv',
      kind: 'link',
      href: '/cv.pdf',
      download: true,
      title: 'CV',
      label: 'DOWNLOAD',
      edge: 'left',
      direction: 'inverse',
      horizontalShift: 0.22,
      pillBaseWidth: 60,
      pillWidthDelta: 70,
      pocketBaseWidth: 80,
      pocketWidthDelta: 80,
      pocketDepth: 80,
      topOffset: -20,
    },
    timing: {
      keyboardHintStart: 0.5,
    },
  },
  {
    id: 'projects',
    scene: {
      station: {
        position: [-9.5, 0.2, -10.5],
        scale: 3.2,
        rotation: [2, 0.2, 0.2],
      },
    },
    headerBump: {
      id: 'projects',
      kind: 'button',
      title: 'MY PROJECTS',
      label: 'EXPLORE',
      edge: 'left',
      direction: 'inverse',
      horizontalShift: 0.22,
      pillBaseWidth: 60,
      pillWidthDelta: 120,
      pocketBaseWidth: 80,
      pocketWidthDelta: 130,
      pocketDepth: 80,
      topOffset: -20,
    },
    timing: {
      projectDetailsStart: 0.3,
      projectDetailsFadeDistance: 0.1,
      projectDetailsExitFadeDistance: 0.15,
      keyboardHintStart: 0.25,
      keyboardHintExitFadeDistance: 0.15,
      galleryEntryStart: 0.25,
      galleryScaleStart: 0.15,
      galleryScaleEnd: 0.4,
      galleryGlitchStart: 0.1,
      galleryGlitchEnd: 0.4,
      galleryExitFadeDistance: 0.15,
      keyboardNavigationStart: 0.4,
      exitResetThreshold: 0.3,
    },
  },
  {
    id: 'who-am-i',
    scene: {
      station: {
        position: [-12.5, 0.2, -14.5],
        scale: 2,
        rotation: [2, 0.2, 0.2],
      },
    },
    headerBump: {
      id: 'who-am-i',
      kind: 'button',
      title: 'WHO AM I',
      label: '',
      edge: 'left',
      direction: 'inverse',
      horizontalShift: 0.22,
      pillBaseWidth: 60,
      pillWidthDelta: 150,
      pocketBaseWidth: 80,
      pocketWidthDelta: 160,
      pocketDepth: 80,
      topOffset: -20,
    },
    timing: {
      galleryEntryStart: 0.7,
      galleryScaleStart: 0.6,
      galleryScaleEnd: 0.9,
      galleryExitFadeDistance: 0.1,
    },
  },
];

export const PROJECTS_PAGE_ID = 'projects';

export function getPortfolioPage(pageId) {
  return PORTFOLIO_PAGES.find((page) => page.id === pageId);
}

export function getPortfolioPageIndex(pageId) {
  return PORTFOLIO_PAGES.findIndex((page) => page.id === pageId);
}