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
      keyboardHintStart: 0.7, // Start hint after moving away from center
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
      // Relative to Projects page range (centered at 0.5)
      projectDetailsStart: 0.3,
      projectDetailsFadeDistance: 0.2,
      projectDetailsExitFadeDistance: 0.2,
      keyboardHintStart: 0.25,
      keyboardHintExitFadeDistance: 0.2,
      galleryEntryStart: 0.25,
      galleryScaleStart: 0.3,
      galleryScaleEnd: 0.5,
      galleryGlitchStart: 0.25,
      galleryGlitchEnd: 0.5,
      galleryExitFadeDistance: 0.2,
      keyboardNavigationStart: 0.45,
      exitResetThreshold: 0.2,
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
      label: 'IDENTITY',
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
      galleryEntryStart: 0.25,
      galleryScaleStart: 0.2,
      galleryScaleEnd: 0.48,
      galleryExitFadeDistance: 0.2,
    },
  },
  {
    id: 'arsenal',
    scene: {
      station: {
        position: [-4, 4, 4],
        scale: 1.5,
        rotation: [0, Math.PI / 4, 0],
      },
    },
    headerBump: {
      id: 'arsenal',
      kind: 'button',
      title: 'ARSENAL',
      label: 'SKILLS',
      edge: 'left',
      direction: 'inverse',
      horizontalShift: 0.22,
      pillBaseWidth: 60,
      pillWidthDelta: 100,
      pocketBaseWidth: 80,
      pocketWidthDelta: 110,
      pocketDepth: 80,
      topOffset: -20,
    },
    timing: {
      galleryEntryStart: 0.4,
      galleryScaleStart: 0.35,
      galleryScaleEnd: 0.6,
      galleryExitFadeDistance: 0.2,
    },
  },
  {
    id: 'contact',
    scene: {
      station: {
        position: [4.85, -5.15, -4.45],
        scale: 2.0,
        rotation: [-0.31, 6.24, -1.10],
      },
    },
    headerBump: {
      id: 'contact',
      kind: 'button',
      title: 'CONTACT ME',
      label: 'CONNECT',
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
      galleryExitFadeDistance: 0.2,
    },
  },
];



export const WHO_AM_I_INFO = {
  "WHO I AM": {
    image: "/who_am_i/1.png",
    profileTitle: "PROFILE INSIGHT:",
    details: "I am Moad Elabdellaoui, a software engineering student based in Morocco specializing in backend development, systems programming, and DevOps. My technical approach prioritizes deep foundational knowledge of complex systems over superficial framework application.",
    messageTitle: "MESSAGE STREAM:",
    message: "> INITIALIZING USER INTERACTION PROTOCOL. DATA LOG ACQUIRED. EXPLORE TO ACCESS CORE MEMORIES.<"
  },
  "WHAT I BUILD": {
    image: "/who_am_i/2.png",
    profileTitle: "SYSTEM ARCHITECTURE:",
    details: "I engineer scalable backend infrastructure, custom networking protocols like ArimaSSH, and distributed systems such as FernOS. Additionally, my technical scope extends to researching machine learning architectures and performing advanced Linux system optimization.",
    messageTitle: "CONSTRUCTION LOG:",
    message: "> BUILDING IMMERSIVE DIGITAL WORLDS. FOCUSING ON PERFORMANCE AND VISUAL FIDELITY. SYSTEM STABLE.<"
  },
  "HOW I THINK": {
    image: "/who_am_i/3.png",
    profileTitle: "LOGIC CORE:",
    details: "My engineering philosophy centers on architectural integrity and system internals. Whether analyzing Java ClassLoaders, implementing concurrent processing with Virtual Threads, or designing cryptographic solutions, I operate with strict analytical rigor.",
    messageTitle: "COGNITIVE THREAD:",
    message: "> CODE IS ART. ARCHITECTING ELEGANT SOLUTIONS TO COMPLEX VISUAL CHALLENGES. PROCESSING...<"
  },
  "WHAT'S NEXT": {
    image: "/who_am_i/4.png",
    profileTitle: "FUTURE OBJECTIVES:",
    details: "I am actively pursuing my Java SE 21 and OCI DevOps Professional certifications. Concurrently, I am seeking a rigorous software engineering internship in Morocco for summer 2026, specifically targeting enterprise-grade projects with complex architectural requirements.",
    messageTitle: "UPCOMING STREAM:",
    message: "> PUSHING THE BOUNDARIES OF WHAT'S POSSIBLE IN THE BROWSER. THE FUTURE IS REAL-TIME 3D.<"
  }
};

export const PROJECTS_PAGE_ID = 'projects';

export function getPortfolioPage(pageId) {
  return PORTFOLIO_PAGES.find((page) => page.id === pageId);
}

export function getPortfolioPageIndex(pageId) {
  return PORTFOLIO_PAGES.findIndex((page) => page.id === pageId);
}