import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchContracts } from "../api/contracts";
import { addToPortfolio } from "../api/portfolio";

export default function ContractsPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["contracts", {}],
    queryFn: () => fetchContracts({}),
  });

  if (isLoading) return <div>Loading…</div>;
  if (error) return <div>Error loading contracts</div>;

  return (
    <div>
      <h2>Available Contracts</h2>
      <div style={{ marginBottom: 8 }}>Matches: {data?.length ?? 0}</div>

      <div style={{ display: "grid", gap: 10 }}>
        {data?.map((c) => (
          <div
            key={c.id}
            style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>
                #{c.id} • {c.energy_type}
              </strong>
              <span>{c.location}</span>
            </div>

            <div style={{ marginTop: 6 }}>
              {c.quantity_mwh} MWh @ ${c.price_per_mwh}/MWh
            </div>
            <div style={{ marginTop: 6 }}>
              {c.delivery_start} → {c.delivery_end}
            </div>

            <button
              style={{ marginTop: 10 }}
              onClick={async () => {
                await addToPortfolio(c.id);
                qc.invalidateQueries({ queryKey: ["portfolio-items"] });
                qc.invalidateQueries({ queryKey: ["portfolio-metrics"] });
              }}
            >
              Add to Portfolio
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
