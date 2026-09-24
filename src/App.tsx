import { AppStateProvider } from "./state/AppStateContext";
import { GuidedFlow } from "./pages/GuidedFlow";

export function App() {
  return (
    <AppStateProvider>
      <h1>Profitability Calculator</h1>
      <GuidedFlow />
    </AppStateProvider>
  );
}
