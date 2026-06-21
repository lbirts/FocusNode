// The Add Task "Details" disclosure auto-expands when the form is submitted
// invalid, so the required-field error rendered inside the collapsible panel
// is revealed instead of being clipped away by the collapsed (height:0) panel.
export function detailsExpanded(invalid: boolean): boolean {
  return invalid;
}
