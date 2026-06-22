import type { CSSProperties } from "react";

export const WRAP_SIDE: CSSProperties["float"] = "left";
export const WRAP_DIAMETER = 96;
export const WRAP_MARGIN = 12;

export function magazineSpacerStyle(): CSSProperties {
  return {
    float: WRAP_SIDE,
    width: WRAP_DIAMETER,
    height: WRAP_DIAMETER,
    shapeOutside: "circle(50%)",
    shapeMargin: WRAP_MARGIN,
  };
}
