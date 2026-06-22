export const MONO_FONT = '13px ui-monospace, monospace';
export const MONO_LINE_HEIGHT = 20;

export function contentWidth(el: HTMLElement): number {
  const cs = getComputedStyle(el);
  const paddingX = parseFloat(cs.marginLeft) + parseFloat(cs.marginRight);
  return el.clientWidth - paddingX;
}
