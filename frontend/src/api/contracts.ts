import { api } from "./client";

export type Contract = {
  id: number;
  energy_type: string;
  quantity_mwh: number;
  price_per_mwh: number;
  delivery_start: string;
  delivery_end: string;
  location: string;
  status: string;
};

export type ContractFilters = Partial<{
  energy_type: string[]; // backend expects repeated query params: energy_type=Solar&energy_type=Wind
  location: string[]; // backend expects repeated query params
  price_min: number;
  price_max: number;
  qty_min: number;
  qty_max: number;
  start_from: string;
  end_to: string;
}>;

export async function fetchContracts(filters: ContractFilters) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) v.forEach((x) => params.append(k, x));
    else params.set(k, String(v));
  }
  const { data } = await api.get<Contract[]>(`contracts?${params.toString()}`);

  return data;
}

export async function fetchContractLocations() {
  const { data } = await api.get<string[]>("/contracts/locations");
  return data;
}
