export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpValue(a, b, t) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.map((value, index) => lerpValue(value, b[index], t));
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return lerp(a, b, t);
  }

  return t < 0.5 ? a : b;
}

export function lerpObject(a, b, t) {
  const result = {};
  const keys = new Set([...(a ? Object.keys(a) : []), ...(b ? Object.keys(b) : [])]);

  keys.forEach((key) => {
    if (a && b && Object.prototype.hasOwnProperty.call(a, key) && Object.prototype.hasOwnProperty.call(b, key)) {
      result[key] = lerpValue(a[key], b[key], t);
    } else if (a && Object.prototype.hasOwnProperty.call(a, key)) {
      result[key] = a[key];
    } else if (b && Object.prototype.hasOwnProperty.call(b, key)) {
      result[key] = b[key];
    }
  });

  return result;
}

export function getInterpolatedPageState(pages, offset, selector) {
  const states = pages
    .map((page) => page?.scene?.[selector])
    .filter(Boolean);

  if (states.length === 0) return null;
  if (states.length === 1) return states[0];

  const scaled = clamp(offset, 0, 1) * (states.length - 1);
  const index = clamp(Math.floor(scaled), 0, states.length - 2);
  const t = scaled - index;

  return lerpObject(states[index], states[index + 1], t);
}

export function getPageOffset(pageIndex, pageCount) {
  if (pageCount <= 1) return 0;
  return clamp(pageIndex / (pageCount - 1), 0, 1);
}

export function getPageFocus(offset, pageIndex, pageCount) {
  if (pageCount <= 1) return 1;

  const center = getPageOffset(pageIndex, pageCount);
  const step = 1 / (pageCount - 1);
  const distance = Math.abs(offset - center);

  // Use a sharper curve (0.6 of the step) to ensure pages don't overlap too much
  return clamp(1 - distance / (step * 0.6), 0, 1);
}

export function buildHeaderBumpState(bump, offset, viewportWidth, visibilityFactor = 1, pageCenter = 0) {
  const visible = clamp(visibilityFactor, 0, 1);
  
  // Flow logic: elements come from the right and exit to the left.
  // If offset < pageCenter, we are on the "entrance" side -> shift right.
  // If offset > pageCenter, we are on the "exit" side -> shift left.
  const relativeOffset = offset - pageCenter;
  // Let's be extremely explicit:
  // We want:
  // Entrance (relativeOffset < 0) -> Right side (x > viewportWidth / 2)
  // Exit (relativeOffset > 0) -> Left side (x < viewportWidth / 2)
  
  // Use visibilityFactor (page focus) directly for scaling
  const pillScale = Math.pow(visible, bump.pillScaleExponent ?? 1.5);
  const pocketScale = visible;
  const shiftFactor = 1 - visible;

  let x = viewportWidth / 2;
  const shiftAmount = shiftFactor * viewportWidth * (bump.horizontalShift ?? 0.22);
  
  if (relativeOffset < 0) {
    x += shiftAmount; // Entrance from Right
  } else {
    x -= shiftAmount; // Exit to Left
  }

  return {
    x,
    pillWidth: (bump.pillBaseWidth ?? 60) + (bump.pillWidthDelta ?? 120) * pillScale,
    pocketWidth: (bump.pocketBaseWidth ?? 80) + (bump.pocketWidthDelta ?? 130) * pocketScale,
    pocketDepth: bump.pocketDepth ?? 80,
    pocketScale,
    pillScale,
    opacity: pillScale,
    pointerEvents: visible > (bump.pointerEventsThreshold ?? 0.1) ? 'auto' : 'none',
    topOffset: bump.topOffset ?? -20,
  };
}