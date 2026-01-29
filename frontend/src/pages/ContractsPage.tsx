import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Slider,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  fetchContractLocations,
  fetchContracts,
  type ContractFilters,
} from "../api/contracts";
import { addToPortfolio } from "../api/portfolio";
import { useNotifications } from "../contexts/NotificationContext";

const ENERGY_OPTIONS = [
  "Solar",
  "Wind",
  "Natural Gas",
  "Nuclear",
  "Coal",
  "Hydro",
];

const DEFAULT_PRICE_RANGE: [number, number] = [0, 100];
const PAGE_SIZE = 8;
const BOUNDS_PAGE_SIZE = 100;

const toNumberOrUndefined = (value: string) => {
  if (!value.trim()) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const toPositiveIntOrUndefined = (value: string) => {
  if (!value.trim()) return undefined;
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : undefined;
};

type ContractsPageProps = {
  statusFilter?: string;
  title?: string;
};

export default function ContractsPage({
  statusFilter,
  title = "Available Contracts",
}: ContractsPageProps) {
  const qc = useQueryClient();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { notify } = useNotifications();
  const [initialParams] = useState(
    () => new URLSearchParams(window.location.search),
  );
  const [hasInitialPriceParams] = useState(
    () => initialParams.has("price_min") || initialParams.has("price_max"),
  );

  const [energyTypes, setEnergyTypes] = useState<string[]>(() =>
    initialParams.getAll("energy_type"),
  );
  const [locations, setLocations] = useState<string[]>(() =>
    initialParams.getAll("location"),
  );
  const initialPriceMin = toNumberOrUndefined(
    initialParams.get("price_min") ?? "",
  );
  const initialPriceMax = toNumberOrUndefined(
    initialParams.get("price_max") ?? "",
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialPriceMin ?? DEFAULT_PRICE_RANGE[0],
    initialPriceMax ?? DEFAULT_PRICE_RANGE[1],
  ]);
  const [priceTouched, setPriceTouched] = useState(false);
  const [page, setPage] = useState(() => {
    const value = toPositiveIntOrUndefined(initialParams.get("page") ?? "");
    return value ?? 1;
  });
  const [qtyMin, setQtyMin] = useState(
    () => initialParams.get("qty_min") ?? "",
  );
  const [qtyMax, setQtyMax] = useState(
    () => initialParams.get("qty_max") ?? "",
  );
  const [startDate, setStartDate] = useState<Dayjs | null>(() => {
    const value = initialParams.get("start_from");
    return value ? dayjs(value) : null;
  });
  const [endDate, setEndDate] = useState<Dayjs | null>(() => {
    const value = initialParams.get("end_to");
    return value ? dayjs(value) : null;
  });

  const qtyMinValue = toNumberOrUndefined(qtyMin);
  const qtyMaxValue = toNumberOrUndefined(qtyMax);
  const qtyRangeInvalid =
    qtyMinValue !== undefined &&
    qtyMaxValue !== undefined &&
    qtyMaxValue < qtyMinValue;

  const filters = useMemo<ContractFilters>(() => {
    const next: ContractFilters = {};
    if (statusFilter) next.status = statusFilter;
    if (energyTypes.length > 0) next.energy_type = energyTypes;

    if (locations.length > 0) next.location = locations;

    const shouldUsePriceFilter = hasInitialPriceParams || priceTouched;
    if (shouldUsePriceFilter) {
      const [minPrice, maxPrice] = priceRange;
      next.price_min = minPrice;
      next.price_max = maxPrice;
    }

    if (qtyMinValue !== undefined) next.qty_min = qtyMinValue;
    if (qtyMaxValue !== undefined) next.qty_max = qtyMaxValue;

    if (startDate) next.start_from = startDate.format("YYYY-MM-DD");
    if (endDate) next.end_to = endDate.format("YYYY-MM-DD");
    next.page = page;
    next.page_size = PAGE_SIZE;

    return next;
  }, [
    endDate,
    energyTypes,
    locations,
    page,
    priceRange,
    priceTouched,
    qtyMaxValue,
    qtyMinValue,
    startDate,
    statusFilter,
  ]);

  const filtersWithoutPrice = useMemo<ContractFilters>(() => {
    const next: ContractFilters = {};
    if (statusFilter) next.status = statusFilter;
    if (energyTypes.length > 0) next.energy_type = energyTypes;

    if (locations.length > 0) next.location = locations;

    if (qtyMinValue !== undefined) next.qty_min = qtyMinValue;
    if (qtyMaxValue !== undefined) next.qty_max = qtyMaxValue;

    if (startDate) next.start_from = startDate.format("YYYY-MM-DD");
    if (endDate) next.end_to = endDate.format("YYYY-MM-DD");
    next.page = 1;
    next.page_size = BOUNDS_PAGE_SIZE;

    return next;
  }, [
    endDate,
    energyTypes,
    locations,
    qtyMaxValue,
    qtyMinValue,
    startDate,
    statusFilter,
  ]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["contracts", filters],
    queryFn: () => fetchContracts(filters),
    enabled: !qtyRangeInvalid,
  });

  const boundsQ = useQuery({
    queryKey: ["contracts-price-bounds", filtersWithoutPrice],
    queryFn: () => fetchContracts(filtersWithoutPrice),
    enabled: !qtyRangeInvalid,
  });

  const locationsQ = useQuery({
    queryKey: ["contract-locations"],
    queryFn: fetchContractLocations,
  });

  const priceBounds = useMemo<[number, number]>(() => {
    if (!boundsQ.data || boundsQ.data.items.length === 0)
      return DEFAULT_PRICE_RANGE;
    const prices = boundsQ.data.items.map((c) => Number(c.price_per_mwh));
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [boundsQ.data]);

  const clampedPriceRange: [number, number] = [
    Math.max(priceBounds[0], priceRange[0]),
    Math.min(priceBounds[1], priceRange[1]),
  ];

  const resultsCount = data?.total ?? 0;
  const bounds = priceBounds;

  const filterSignature = useMemo(
    () =>
      JSON.stringify({
        energyTypes,
        locations,
        priceRange,
        priceTouched,
        qtyMin,
        qtyMax,
        startDate: startDate?.format("YYYY-MM-DD") ?? "",
        endDate: endDate?.format("YYYY-MM-DD") ?? "",
        statusFilter: statusFilter ?? "",
      }),
    [
      endDate,
      energyTypes,
      locations,
      priceRange,
      priceTouched,
      qtyMax,
      qtyMin,
      startDate,
      statusFilter,
    ],
  );
  const prevFilterSignature = useRef(filterSignature);

  useEffect(() => {
    if (prevFilterSignature.current !== filterSignature) {
      prevFilterSignature.current = filterSignature;
      setPage(1);
    }
  }, [filterSignature]);

  useEffect(() => {
    const [min, max] = priceBounds;
    if (!hasInitialPriceParams && !priceTouched) {
      setPriceRange([min, max]);
      return;
    }
    setPriceRange((prev) => [
      Math.max(min, prev[0]),
      Math.min(max, prev[1]),
    ]);
  }, [hasInitialPriceParams, priceBounds, priceTouched]);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (energyTypes.length > 0) {
      energyTypes.forEach((value) => nextParams.append("energy_type", value));
    }

    if (locations.length > 0) {
      locations.forEach((value) => nextParams.append("location", value));
    }

    const shouldUsePriceFilter = hasInitialPriceParams || priceTouched;
    if (shouldUsePriceFilter) {
      nextParams.set("price_min", String(priceRange[0]));
      nextParams.set("price_max", String(priceRange[1]));
    }

    const qtyMinValue = toNumberOrUndefined(qtyMin);
    if (qtyMinValue !== undefined)
      nextParams.set("qty_min", String(qtyMinValue));
    const qtyMaxValue = toNumberOrUndefined(qtyMax);
    if (qtyMaxValue !== undefined)
      nextParams.set("qty_max", String(qtyMaxValue));

    if (startDate) nextParams.set("start_from", startDate.format("YYYY-MM-DD"));
    if (endDate) nextParams.set("end_to", endDate.format("YYYY-MM-DD"));
    if (page > 1) nextParams.set("page", String(page));

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    endDate,
    energyTypes,
    locations,
    priceRange,
    priceTouched,
    qtyMax,
    qtyMin,
    searchParams,
    setSearchParams,
    startDate,
    page,
  ]);

  const handleClear = () => {
    setEnergyTypes([]);
    setLocations([]);
    setQtyMin("");
    setQtyMax("");
    setStartDate(null);
    setEndDate(null);
    setPriceTouched(false);
    setPriceRange(DEFAULT_PRICE_RANGE);
    setPage(1);
  };

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
      >
        <div>
          <Typography variant="h5" fontWeight={700}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Matches: {resultsCount}
          </Typography>
        </div>
        <Chip label="Live market" color="success" variant="outlined" />
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel id="energy-type-label">Energy type</InputLabel>
              <Select
                labelId="energy-type-label"
                label="Energy type"
                multiple
                value={energyTypes}
                onChange={(event) =>
                  setEnergyTypes(
                    typeof event.target.value === "string"
                      ? event.target.value.split(",")
                      : event.target.value,
                  )
                }
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        size="small"
                        onDelete={(event) => {
                          event.stopPropagation();
                          setEnergyTypes((prev) =>
                            prev.filter((item) => item !== value),
                          );
                        }}
                        onMouseDown={(event) => event.stopPropagation()}
                      />
                    ))}
                  </Box>
                )}
              >
                {ENERGY_OPTIONS.map((name) => (
                  <MenuItem key={name} value={name}>
                    <Checkbox checked={energyTypes.indexOf(name) > -1} />
                    <ListItemText primary={name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Autocomplete
              options={locationsQ.data ?? []}
              multiple
              value={locations}
              onChange={(_, value) => setLocations(value)}
              disableCloseOnSelect
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox checked={selected} sx={{ mr: 1 }} />
                  {option}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label="Locations"
                  placeholder="Select locations"
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Price range ($/MWh)
            </Typography>
            <Slider
              value={clampedPriceRange}
              min={bounds[0]}
              max={bounds[1]}
              onChange={(_, value) => {
                setPriceTouched(true);
                setPriceRange(value as [number, number]);
              }}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `$${value}`}
              disableSwap
            />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                ${clampedPriceRange[0]}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ${clampedPriceRange[1]}
              </Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Quantity min (MWh)"
              type="number"
              value={qtyMin}
              onChange={(event) => setQtyMin(event.target.value)}
              inputProps={{ min: 0 }}
              error={qtyRangeInvalid}
              helperText={qtyRangeInvalid ? "Min must be ≤ max" : " "}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Quantity max (MWh)"
              type="number"
              value={qtyMax}
              onChange={(event) => setQtyMax(event.target.value)}
              inputProps={{ min: 0 }}
              error={qtyRangeInvalid}
              helperText={qtyRangeInvalid ? "Max must be ≥ min" : " "}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <DatePicker
              label="Delivery start"
              value={startDate}
              onChange={setStartDate}
              slotProps={{ textField: { fullWidth: true, helperText: " " } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <DatePicker
              label="Delivery end"
              value={endDate}
              onChange={setEndDate}
              slotProps={{ textField: { fullWidth: true, helperText: " " } }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Stack direction="row" justifyContent="flex-end">
              <Button onClick={handleClear}>Clear filters</Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {isLoading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
          <CircularProgress />
        </Stack>
      ) : error ? (
        <Alert severity="error">Unable to load contracts. Try again.</Alert>
      ) : (
        <Grid container spacing={2}>
          {data?.items.map((c) => (
            <Grid key={c.id} size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title="View details" arrow>
                        <Button
                          size="small"
                          component={Link}
                          to={`/contract/${c.id}`}
                          state={{
                            from: `${location.pathname}${location.search}`,
                          }}
                          sx={{ minWidth: 0, paddingX: 1 }}
                        >
                          #{c.id}
                        </Button>
                      </Tooltip>
                      <Typography variant="subtitle1" fontWeight={700}>
                        • {c.energy_type}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {c.location}
                    </Typography>
                  </Stack>
                  <Divider sx={{ my: 1.5 }} />
                  <Stack spacing={0.75}>
                    <Typography variant="body1">
                      {c.quantity_mwh} MWh{" "}
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        @ ${c.price_per_mwh}/MWh
                      </Typography>
                    </Typography>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Delivery {c.delivery_start} → {c.delivery_end}
                      </Typography>
                      <Tooltip title="Add to portfolio" arrow>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          aria-label="Add to portfolio"
                          onClick={async () => {
                            try {
                              await addToPortfolio(c.id);
                              qc.invalidateQueries({
                                queryKey: ["portfolio-items"],
                              });
                              qc.invalidateQueries({
                                queryKey: ["portfolio-metrics"],
                              });
                              notify({
                                message: `Added contract #${c.id} to portfolio`,
                                severity: "success",
                              });
                            } catch {
                              notify({
                                message: "Failed to add contract to portfolio",
                                severity: "error",
                              });
                            }
                          }}
                          sx={{
                            minWidth: 0,
                            paddingX: 1,
                          }}
                        >
                          <AddRoundedIcon fontSize="small" />
                        </Button>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {data && data.total > data.page_size ? (
        <Stack alignItems="center" sx={{ pt: 1 }}>
          <Pagination
            count={Math.max(1, Math.ceil(data.total / data.page_size))}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Stack>
      ) : null}
    </Stack>
  );
}
