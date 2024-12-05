import type { ReactNode } from "react";
import { useTranslate } from "@refinedev/core";
import {
  Box,
  Divider,
  Paper,
  Skeleton,
  type SxProps,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowDropDownCircleOutlinedIcon from "@mui/icons-material/ArrowDropDownCircleOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import type { IRMS } from "../../../interfaces";
import { StoreStatus } from "../status";

type Props = {
  store?: IRMS;
};

export const StoreInfoCard = (props: Props) => {
  const t = useTranslate();
  const { origin, description, price, image } = props?.store || {};

  return (
    <Paper>
     
      <Divider />
      <Info
        icon={<PlaceOutlinedIcon />}
        label={t("stores.fields.address")}
        value={origin?.text}
        sx={{
          height: "80px",
        }}
      />
      <Divider />
      <Info
        icon={<AccountCircleOutlinedIcon />}
        label={t("stores.fields.email")}
        value={description}
      />
      <Divider />
      <Info
        icon={<PhoneOutlinedIcon />}
        label={t("stores.fields.gsm")}
        value={price}
      />
    </Paper>
  );
};

type InfoProps = {
  icon: ReactNode;
  label: string;
  value?: ReactNode;
  sx?: SxProps;
};

const Info = ({ icon, label, value, sx }: InfoProps) => {
  const { palette } = useTheme();

  return (
    <Box
      display="flex"
      alignItems="flex-start"
      justifyContent="flex-start"
      p="16px 0px 16px 24px"
      sx={sx}
    >
      <Box
        mr="8px"
        display="flex"
        alignItems="flex-start"
        justifyContent="flex-start"
        sx={{
          color: palette.primary.main,
        }}
      >
        {icon}
      </Box>
      <Box mr="8px" display="flex" alignItems="center" width="112px">
        {label}
      </Box>

      {value ?? (
        <Skeleton variant="text" sx={{ fontSize: "1rem", width: "200px" }} />
      )}
    </Box>
  );
};
