import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
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

  if (itemsQ.isLoading || metricsQ.isLoading)
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
        <CircularProgress />
      </Stack>
    );
  if (itemsQ.error || metricsQ.error)
    return <Alert severity="error">Unable to load portfolio.</Alert>;

  const items = itemsQ.data ?? [];
  const m = metricsQ.data!;
  const breakdown = Object.entries(m.by_energy_type ?? {});

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>
        Portfolio
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Total contracts
            </Typography>
            <Typography variant="h6">{m.total_contracts}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Total capacity
            </Typography>
            <Typography variant="h6">{m.total_capacity_mwh} MWh</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Total cost
            </Typography>
            <Typography variant="h6">${m.total_cost}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Weighted avg
            </Typography>
            <Typography variant="h6">
              ${m.weighted_avg_price_per_mwh}/MWh
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Accordion
        defaultExpanded
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreRoundedIcon />}
          sx={{ px: 2 }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            Breakdown by energy type
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 2, pb: 2 }}>
          {breakdown.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No energy breakdown yet.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {breakdown.map(([type, values]) => {
                const avg =
                  values.capacity_mwh > 0
                    ? values.cost / values.capacity_mwh
                    : 0;
                return (
                  <Paper
                    key={type}
                    variant="outlined"
                    sx={{ p: 1.5, borderRadius: 2 }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, md: 3 }}>
                        <Typography variant="body1" fontWeight={600}>
                          {type}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="caption" color="text.secondary">
                          Capacity
                        </Typography>
                        <Typography variant="body2">
                          {values.capacity_mwh} MWh
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="caption" color="text.secondary">
                          Cost
                        </Typography>
                        <Typography variant="body2">${values.cost}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <Typography variant="caption" color="text.secondary">
                          Avg price
                        </Typography>
                        <Typography variant="body2">
                          ${avg.toFixed(2)}/MWh
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </AccordionDetails>
      </Accordion>

      <Typography variant="h6" fontWeight={700}>
        Selected
      </Typography>
      <Grid container spacing={2}>
        {items.map((it) => (
          <Grid key={it.id} size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
              <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  #{it.contract.id} • {it.contract.energy_type}
                </Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mt: "auto", pt: 1 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {it.contract.quantity_mwh} MWh • ${it.contract.price_per_mwh}/MWh
                  </Typography>
                  <Tooltip title="Remove" arrow>
                    <IconButton
                      color="error"
                      aria-label="Remove from portfolio"
                      onClick={async () => {
                        await removeFromPortfolio(it.contract.id);
                        qc.invalidateQueries({ queryKey: ["portfolio-items"] });
                        qc.invalidateQueries({ queryKey: ["portfolio-metrics"] });
                      }}
                      size="small"
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
