import { useEffect } from "react";

/**
 * FR-048: warn the founder before any action that would discard unsaved, undownloaded model
 * data, since there is no server-side persistence (FR-045) to fall back on.
 */
export function useUnsavedChangesGuard(hasUnsavedWork: boolean): void {
  useEffect(() => {
    if (!hasUnsavedWork) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Chrome requires returnValue to be set to trigger the confirmation prompt.
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedWork]);
}
