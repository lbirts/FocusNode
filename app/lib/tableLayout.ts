import type { CSSProperties } from "react";

// The workload table pins its columns to the <colgroup> grid so a long task
// name truncates inside the Name column instead of stretching the row and
// shoving the Assignee / Due / Priority columns out of their lanes.
export const WORKLOAD_TABLE_LAYOUT: CSSProperties["tableLayout"] = "fixed";
