import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
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

      <Typography variant="h6" fontWeight={700}>
        Selected
      </Typography>
      <Grid container spacing={2}>
        {items.map((it) => (
          <Grid key={it.id} size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
              <CardContent sx={{ pb: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  #{it.contract.id} • {it.contract.energy_type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {it.contract.quantity_mwh} MWh
                </Typography>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={async () => {
                    await removeFromPortfolio(it.contract.id);
                    qc.invalidateQueries({ queryKey: ["portfolio-items"] });
                    qc.invalidateQueries({ queryKey: ["portfolio-metrics"] });
                  }}
                >
                  Remove
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
