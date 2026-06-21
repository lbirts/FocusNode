import type { CSSProperties } from "react";

// Magazine-style circular text wrap for the focus-timer "Session brief" card.
// The brief paragraph flows around the round priority puck via CSS Shapes.
// CSS Shapes only reserve a wrap contour on a *floated* element, so the float
// side is what carries the layout; the diameter is sized a touch larger than
// the painted 84px ring so the text clears it with a small margin.
export const WRAP_SIDE: CSSProperties["float"] = "left";
export const WRAP_DIAMETER = 96;
export const WRAP_MARGIN = 12;

// Transparent in-flow spacer that reserves the circular contour the brief
// wraps around. The visible ring is painted separately on top of it.
export function magazineSpacerStyle(): CSSProperties {
  return {
    float: WRAP_SIDE,
    width: WRAP_DIAMETER,
    height: WRAP_DIAMETER,
    shapeOutside: "circle(50%)",
    shapeMargin: WRAP_MARGIN,
  };
}
