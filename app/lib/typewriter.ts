// The "Sync activity" latest line is revealed left-to-right with a CSS steps()
// typewriter. The animation runs `width: 0 → <content>` quantised into N equal
// steps, so each step must uncover exactly one monospace glyph. That only holds
// when the step count equals the character count: then every sampled frame sits
// on a glyph boundary. If the two disagree the reveal advances by a fractional
// glyph per step and any mid-animation frame clips a character down the middle.
export function typewriterSteps(text: string): number {
  return text.length;
}
