import React, { useEffect, useState } from "react";
import { useMemo } from "react";
import { useNavigation, useTranslate } from "@refinedev/core";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { EditButton, ShowButton, TextFieldComponent } from "@refinedev/mui";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { Avatar, IconButton } from "@mui/material";
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
        setRawMaterials(data);
      })
      .catch((error) => console.error("Error fetching raw materials:", error));
  }, []);

  const columns = useMemo<GridColDef<IRMS>[]>(() => [
    {
      field: "id",
      headerName: "ID",
      width: 72,
      renderCell: ({ row }) => <Typography>{row.id}</Typography>,
    },
    {
      field: "avatar",
      headerName: t("products.fields.images.label"),
      renderCell: function render({ row }) {
        return (
          <Avatar
            variant="rounded"
            sx={{
              width: 32,
              height: 32,
            }}
            src={row.image}
            alt={row.name}
          />
        );
      },
      width: 64,
      align: "center",
      headerAlign: "center",
      sortable: false,
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
        flex: 2,
        width: 120,
        renderCell: function render({ row }) {
          return <TextFieldComponent value={row.origin?.text} />;
        },
      },
    {
      field: "description",
      headerName: "Description",
      minWidth: 370,
    }
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
