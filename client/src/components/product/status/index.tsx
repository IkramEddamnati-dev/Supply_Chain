import Chip, { type ChipProps } from "@mui/material/Chip";
import { useTranslate } from "@refinedev/core";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import { useTheme } from "@mui/material/styles";
import { green, red } from "@mui/material/colors";
import type { IProduct } from "../../../interfaces";

type Props = {
  value: IProduct["isActive"];
  size?: ChipProps["size"];
};

export const ProductStatus = (props: Props) => {
  const t = useTranslate();
  const { palette } = useTheme();
  const isDarkMode = palette.mode === "dark";

  // Set color to green for available and red for unavailable
  const color = props.value ? green[500] : red[500]; // Green if active, red if inactive

  // Set icon based on isActive value
  const icon: ChipProps["icon"] = props.value ? (
    <CheckCircleIcon
      sx={{
        fill: isDarkMode ? green[200] : green[600],
      }}
    />
  ) : (
    <BlockOutlinedIcon color="action" />
  );

  return (
    <Chip
      label={props.value ? "Available" : "Unavailable"}  // Label based on isActive
      icon={icon}
      variant="outlined"
      size={props?.size || "small"}
      sx={{
        borderColor: color,
        color: color,
      }}
    />
  );
};
