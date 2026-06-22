// Geometry helpers for the pretext-measured monospace "Session log" panel.
// pretext lays the log text out in JS; the panel is then sized to the wrapped
// height it reports, so the wrap WIDTH handed to pretext must match exactly
// where the CSS text box wraps.

// Canvas-format font string for pretext's measurement — must match the panel's
// rendered font (monospace 13px / 20px line-height).
export const MONO_FONT = '13px ui-monospace, monospace';
export const MONO_LINE_HEIGHT = 20;

// The wrap width is the element's CONTENT width: its clientWidth minus the
// horizontal padding (clientWidth already excludes borders + scrollbar). This
// is exactly the box the CSS text wraps inside. Measuring offsetWidth instead
// would wrongly fold the padding into the wrap width.
export function contentWidth(el: HTMLElement): number {
  const cs = getComputedStyle(el);
  const paddingX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
  return el.clientWidth - paddingX;
}
