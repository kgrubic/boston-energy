import {
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";

export default function HomePage() {
  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          Boston Energy
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Boston Energy is a regional energy trading company focused on renewable
          generation and long-term supply contracts.
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="h6" fontWeight={700}>
              Company snapshot
            </Typography>
            <List dense sx={{ py: 0 }}>
              <ListItem disableGutters>
                <ListItemText primary="Focuses on solar, wind, hydro, and gas contracts across the U.S." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Operates a live market for short- and medium-term energy delivery." />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Offers portfolio tools for buyers to track reserved and purchased contracts." />
              </ListItem>
            </List>
          </Stack>
        </CardContent>
      </Card>

    </Stack>
  );
}
