import React, { useEffect, useState } from "react";
import { useMemo } from "react";
import { useNavigation, useTranslate } from "@refinedev/core";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { EditButton, ShowButton, TextFieldComponent } from "@refinedev/mui";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { IconButton } from "@mui/material";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import { IRMS } from "../../../interfaces";

export const StoreTable = () => {
  const [rawMaterials, setRawMaterials] = useState<IRMS[]>([]);
  const t = useTranslate();
  const { edit } = useNavigation();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/raw_materials")
      .then((response) => response.json())
      .then((data) => {
        setRawMaterials(data.raw_materials);
      })
      .catch((error) => console.error("Error fetching raw materials:", error));
  }, []);

  const columns = useMemo<GridColDef<IRMS>[]>(() => [
    {
      field: "id",
      headerName: "ID #",
      width: 72,
      renderCell: ({ row }) => <Typography>#{row.id}</Typography>,
    },
    {
      field: "image",
      headerName: "image",
      minWidth: 200,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 132,
    },
    {
      field: "price",
      headerName: "price",
      minWidth: 132,
    },
    {
      field: "origin",
      headerName: "Origin",
      minWidth: 132,
    },
    {
      field: "description",
      headerName: "Description",
      minWidth: 132,
    },
    {
      field: "actions",
      headerName: t("table.actions"),
      type: "actions",
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }) => (
        <IconButton
          sx={{ cursor: "pointer" }}
          onClick={() => edit("stores", row.id)}
        >
          <VisibilityOutlined color="action" />
        </IconButton>
      ),
    },
  ], [t]);

  return (
    <Paper>
      <DataGrid
        rows={rawMaterials} // Passez les données récupérées ici
        columns={columns}
        disableColumnSelector
        autoHeight
        pageSizeOptions={[10, 20, 50, 100]}
      />
    </Paper>
  );
};
