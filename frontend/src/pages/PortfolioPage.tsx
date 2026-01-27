import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchPortfolioItems,
  fetchPortfolioMetrics,
  removeFromPortfolio,
} from "../api/portfolio";

export default function PortfolioPage() {
  const qc = useQueryClient();

  const itemsQ = useQuery({
    queryKey: ["portfolio-items"],
    queryFn: fetchPortfolioItems,
  });

  const metricsQ = useQuery({
    queryKey: ["portfolio-metrics"],
    queryFn: fetchPortfolioMetrics,
  });

  if (itemsQ.isLoading || metricsQ.isLoading) return <div>Loading…</div>;
  if (itemsQ.error || metricsQ.error) return <div>Error loading portfolio</div>;

  const items = itemsQ.data ?? [];
  const m = metricsQ.data!;

  return (
    <div>
      <h2>Portfolio</h2>

      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
        <div>Total contracts: {m.total_contracts}</div>
        <div>Total capacity: {m.total_capacity_mwh} MWh</div>
        <div>Total cost: ${m.total_cost}</div>
        <div>Weighted avg: ${m.weighted_avg_price_per_mwh}/MWh</div>
      </div>

      <h3 style={{ marginTop: 16 }}>Selected</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((it) => (
          <div
            key={it.id}
            style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}
          >
            <div>
              <strong>#{it.contract.id}</strong> • {it.contract.energy_type} •{" "}
              {it.contract.quantity_mwh} MWh
            </div>
            <button
              style={{ marginTop: 8 }}
              onClick={async () => {
                await removeFromPortfolio(it.contract.id);
                qc.invalidateQueries({ queryKey: ["portfolio-items"] });
                qc.invalidateQueries({ queryKey: ["portfolio-metrics"] });
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
