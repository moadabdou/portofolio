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
        position: [7, -3, -15],
        scale: 2.0,
        rotation: [-1.2, 1.5, -0.8],
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
    details: "I am a creative developer specializing in the intersection of immersive 3D experiences and scalable backend architectures. With a focus on performance and visual fidelity, I build digital environments that push the boundaries of the modern web.",
    messageTitle: "MESSAGE STREAM:",
    message: "> INITIALIZING USER INTERACTION PROTOCOL. DATA LOG ACQUIRED. EXPLORE TO ACCESS CORE MEMORIES.<"
  },
  "WHAT I BUILD": {
    image: "/who_am_i/2.png",
    profileTitle: "SYSTEM ARCHITECTURE:",
    details: "Focusing on React, Three.js, and custom GLSL shaders, I craft interactive worlds that feel alive. My work blends cinematic aesthetics with high-performance engineering to create unique user journeys that resonate with modern digital culture.",
    messageTitle: "CONSTRUCTION LOG:",
    message: "> BUILDING IMMERSIVE DIGITAL WORLDS. FOCUSING ON PERFORMANCE AND VISUAL FIDELITY. SYSTEM STABLE.<"
  },
  "HOW I THINK": {
    image: "/who_am_i/3.png",
    profileTitle: "LOGIC CORE:",
    details: "A problem-solver at heart, I approach code as an art form. I prioritize clean, modular architecture and intuitive user experiences, ensuring every project I create is as robust as it is beautiful, focusing on long-term maintainability.",
    messageTitle: "COGNITIVE THREAD:",
    message: "> CODE IS ART. ARCHITECTING ELEGANT SOLUTIONS TO COMPLEX VISUAL CHALLENGES. PROCESSING...<"
  },
  "WHAT'S NEXT": {
    image: "/who_am_i/4.png",
    profileTitle: "FUTURE OBJECTIVES:",
    details: "Constantly exploring the frontier of WebGPU and generative AI, I am dedicated to bringing desktop-grade graphics to the browser. My goal is clear: pushing real-time interactivity to its absolute limit through hardware-accelerated innovation.",
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