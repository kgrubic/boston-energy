import { api } from "./client";
import type { Contract } from "./contracts";

export type PortfolioItem = { id: number; contract: Contract };

export type PortfolioMetrics = {
  total_contracts: number;
  total_capacity_mwh: number;
  total_cost: number;
  weighted_avg_price_per_mwh: number;
  by_energy_type: Record<string, { capacity_mwh: number; cost: number }>;
};

export const fetchPortfolioItems = async () => {
  const { data } = await api.get<PortfolioItem[]>("/portfolio/items");
  return data;
};

export const fetchPortfolioMetrics = async () => {
  const { data } = await api.get<PortfolioMetrics>("/portfolio/metrics");
  return data;
};

export const addToPortfolio = async (contractId: number) => {
  await api.post(`/portfolio/items/${contractId}`);
};

export const removeFromPortfolio = async (contractId: number) => {
  await api.delete(`/portfolio/items/${contractId}`);
};
