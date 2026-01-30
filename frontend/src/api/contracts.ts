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

export type ContractList = {
  items: Contract[];
  page: number;
  page_size: number;
  total: number;
};

export type ContractPriceBounds = {
  min_price: number | null;
  max_price: number | null;
};

export type ContractFilters = Partial<{
  energy_type: string[]; // backend expects repeated query params: energy_type=Solar&energy_type=Wind
  location: string[]; // backend expects repeated query params
  status: string;
  sort_by: string;
  sort_dir: string;
  page: number;
  page_size: number;
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
  const { data } = await api.get<ContractList>(`contracts?${params.toString()}`);

  return data;
}

export async function fetchContractLocations() {
  const { data } = await api.get<string[]>("/contracts/locations");
  return data;
}

export async function fetchContractPriceBounds(filters: ContractFilters) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) v.forEach((x) => params.append(k, x));
    else params.set(k, String(v));
  }
  const { data } = await api.get<ContractPriceBounds>(
    `/contracts/price-bounds?${params.toString()}`,
  );
  return data;
}

export async function fetchContractById(contractId: number) {
  const { data } = await api.get<Contract>(`/contracts/${contractId}`);
  return data;
}

export async function markContractSold(contractId: number) {
  const { data } = await api.patch<Contract>(`/contracts/${contractId}`, {
    status: "Sold",
  });
  return data;
}
