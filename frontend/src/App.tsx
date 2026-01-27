import ContractsPage from "./pages/ContractsPage";
import { useState } from "react";
import PortfolioPage from "./pages/PortfolioPage";

export default function App() {
  const [tab, setTab] = useState<"contracts" | "portfolio">("contracts");

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <button onClick={() => setTab("contracts")}>Contracts</button>
        <button onClick={() => setTab("portfolio")}>Portfolio</button>
      </header>
      {tab === "contracts" ? <ContractsPage /> : <PortfolioPage />}
    </div>
  );
}
