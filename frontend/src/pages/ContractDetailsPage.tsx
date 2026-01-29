import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Link, useLocation, useParams } from "react-router-dom";
import { fetchContractById } from "../api/contracts";
import { addToPortfolio } from "../api/portfolio";
import { useNotifications } from "../contexts/NotificationContext";

type LocationState = {
  from?: string;
};

export default function ContractDetailsPage() {
  const { contractId } = useParams();
  const qc = useQueryClient();
  const { notify } = useNotifications();
  const location = useLocation();
  const backTo = (location.state as LocationState | null)?.from ?? "/";

  const id = useMemo(() => Number(contractId), [contractId]);
  const {
    data: contract,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["contract", id],
    queryFn: () => fetchContractById(id),
    enabled: Number.isFinite(id),
  });

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (error || !contract) {
    return <Alert severity="error">Unable to load contract details.</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Button
          component={Link}
          to={backTo}
          startIcon={<ArrowBackRoundedIcon />}
        >
          Back to contracts
        </Button>
      </Stack>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ sm: "center" }}
              justifyContent="space-between"
              spacing={1}
            >
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Contract #{contract.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {contract.energy_type} • {contract.location}
                </Typography>
              </Box>
              <Chip label={contract.status} color="success" variant="outlined" />
            </Stack>

            <Divider />

            <Stack spacing={1}>
              <Typography variant="body1">
                {contract.quantity_mwh} MWh @ ${contract.price_per_mwh}/MWh
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Delivery window: {contract.delivery_start} →{" "}
                {contract.delivery_end}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="flex-end">
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={async () => {
                  try {
                    await addToPortfolio(contract.id);
                    qc.invalidateQueries({ queryKey: ["portfolio-items"] });
                    qc.invalidateQueries({ queryKey: ["portfolio-metrics"] });
                    notify({
                      message: `Added contract #${contract.id} to portfolio`,
                      severity: "success",
                    });
                  } catch {
                    notify({
                      message: "Failed to add contract to portfolio",
                      severity: "error",
                    });
                  }
                }}
              >
                Add to portfolio
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
