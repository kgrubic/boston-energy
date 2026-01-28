import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
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
  Paper,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { fetchContracts, type ContractFilters } from "../api/contracts";
import { addToPortfolio } from "../api/portfolio";

const ENERGY_OPTIONS = [
  "Solar",
  "Wind",
  "Natural Gas",
  "Nuclear",
  "Coal",
  "Hydro",
];

const DEFAULT_PRICE_RANGE: [number, number] = [0, 100];

const toNumberOrUndefined = (value: string) => {
  if (!value.trim()) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

export default function ContractsPage() {
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialParamsRef = useRef<URLSearchParams | null>(null);
  if (!initialParamsRef.current) {
    initialParamsRef.current = new URLSearchParams(window.location.search);
  }
  const initialParams = initialParamsRef.current;
  const hasInitialPriceParamsRef = useRef(
    initialParams.has("price_min") || initialParams.has("price_max"),
  );

  const [energyTypes, setEnergyTypes] = useState<string[]>(
    initialParams.getAll("energy_type"),
  );
  const [location, setLocation] = useState(
    initialParams.get("location") ?? "",
  );
  const deferredLocation = useDeferredValue(location);
  const [priceBounds, setPriceBounds] = useState<[number, number] | null>(null);
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
  const [qtyMin, setQtyMin] = useState(
    initialParams.get("qty_min") ?? "",
  );
  const [qtyMax, setQtyMax] = useState(
    initialParams.get("qty_max") ?? "",
  );
  const [startDate, setStartDate] = useState<Dayjs | null>(() => {
    const value = initialParams.get("start_from");
    return value ? dayjs(value) : null;
  });
  const [endDate, setEndDate] = useState<Dayjs | null>(() => {
    const value = initialParams.get("end_to");
    return value ? dayjs(value) : null;
  });

  const filters = useMemo<ContractFilters>(() => {
    const next: ContractFilters = {};
    if (energyTypes.length > 0) next.energy_type = energyTypes;

    const trimmedLocation = deferredLocation.trim();
    if (trimmedLocation) next.location = trimmedLocation;

    if (priceBounds) {
      const [minPrice, maxPrice] = priceRange;
      if (minPrice !== priceBounds[0]) next.price_min = minPrice;
      if (maxPrice !== priceBounds[1]) next.price_max = maxPrice;
    }

    const qtyMinValue = toNumberOrUndefined(qtyMin);
    if (qtyMinValue !== undefined) next.qty_min = qtyMinValue;
    const qtyMaxValue = toNumberOrUndefined(qtyMax);
    if (qtyMaxValue !== undefined) next.qty_max = qtyMaxValue;

    if (startDate) next.start_from = startDate.format("YYYY-MM-DD");
    if (endDate) next.end_to = endDate.format("YYYY-MM-DD");

    return next;
  }, [
    deferredLocation,
    endDate,
    energyTypes,
    priceBounds,
    priceRange,
    qtyMax,
    qtyMin,
    startDate,
  ]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["contracts", filters],
    queryFn: () => fetchContracts(filters),
  });

  useEffect(() => {
    if (!priceBounds && data && data.length > 0) {
      const prices = data.map((c) => Number(c.price_per_mwh));
      const minPrice = Math.floor(Math.min(...prices));
      const maxPrice = Math.ceil(Math.max(...prices));
      const nextBounds: [number, number] = [minPrice, maxPrice];
      setPriceBounds(nextBounds);
      setPriceRange((prev) => {
        const hasInitialPriceParams = hasInitialPriceParamsRef.current;
        if (!hasInitialPriceParams) return nextBounds;
        return [
          Math.max(nextBounds[0], prev[0]),
          Math.min(nextBounds[1], prev[1]),
        ];
      });
    }
  }, [data, priceBounds]);

  const resultsCount = data?.length ?? 0;
  const bounds = priceBounds ?? DEFAULT_PRICE_RANGE;

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (energyTypes.length > 0) {
      energyTypes.forEach((value) => nextParams.append("energy_type", value));
    }

    const trimmedLocation = location.trim();
    if (trimmedLocation) nextParams.set("location", trimmedLocation);

    if (priceBounds) {
      if (priceRange[0] !== priceBounds[0]) {
        nextParams.set("price_min", String(priceRange[0]));
      }
      if (priceRange[1] !== priceBounds[1]) {
        nextParams.set("price_max", String(priceRange[1]));
      }
    }

    const qtyMinValue = toNumberOrUndefined(qtyMin);
    if (qtyMinValue !== undefined) nextParams.set("qty_min", String(qtyMinValue));
    const qtyMaxValue = toNumberOrUndefined(qtyMax);
    if (qtyMaxValue !== undefined) nextParams.set("qty_max", String(qtyMaxValue));

    if (startDate) nextParams.set("start_from", startDate.format("YYYY-MM-DD"));
    if (endDate) nextParams.set("end_to", endDate.format("YYYY-MM-DD"));

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    endDate,
    energyTypes,
    location,
    priceBounds,
    priceRange,
    qtyMax,
    qtyMin,
    searchParams,
    setSearchParams,
    startDate,
  ]);

  const handleClear = () => {
    setEnergyTypes([]);
    setLocation("");
    setQtyMin("");
    setQtyMax("");
    setStartDate(null);
    setEndDate(null);
    setPriceRange(priceBounds ?? DEFAULT_PRICE_RANGE);
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
            Available Contracts
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
                      <Chip key={value} label={value} size="small" />
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
            <TextField
              fullWidth
              label="Location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Price range ($/MWh)
            </Typography>
            <Slider
              value={priceRange}
              min={bounds[0]}
              max={bounds[1]}
              onChange={(_, value) =>
                setPriceRange(value as [number, number])
              }
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `$${value}`}
              disableSwap
              disabled={!priceBounds}
            />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                ${priceRange[0]}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ${priceRange[1]}
              </Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Quantity min (MWh)"
              type="number"
              value={qtyMin}
              onChange={(event) => setQtyMin(event.target.value)}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Quantity max (MWh)"
              type="number"
              value={qtyMax}
              onChange={(event) => setQtyMax(event.target.value)}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <DatePicker
              label="Delivery start"
              value={startDate}
              onChange={setStartDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <DatePicker
              label="Delivery end"
              value={endDate}
              onChange={setEndDate}
              slotProps={{ textField: { fullWidth: true } }}
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
          {data?.map((c) => (
            <Grid key={c.id} size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
                <CardContent sx={{ pb: 1 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Typography variant="subtitle1" fontWeight={700}>
                      #{c.id} • {c.energy_type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {c.location}
                    </Typography>
                  </Stack>
                  <Divider sx={{ my: 1.5 }} />
                  <Stack spacing={0.5}>
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
                    <Typography variant="body2" color="text.secondary">
                      Delivery {c.delivery_start} → {c.delivery_end}
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={async () => {
                      await addToPortfolio(c.id);
                      qc.invalidateQueries({ queryKey: ["portfolio-items"] });
                      qc.invalidateQueries({ queryKey: ["portfolio-metrics"] });
                    }}
                  >
                    Add to Portfolio
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}
