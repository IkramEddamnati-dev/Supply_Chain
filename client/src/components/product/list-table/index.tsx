import { useMemo } from "react";
import { useGo, useNavigation, useTranslate } from "@refinedev/core";
import { NumberField, type UseDataGridReturnType } from "@refinedev/mui";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import type { ICategory, IProduct } from "../../../interfaces";
import { useLocation } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { ProductStatus } from "../status";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";

type Props = {
  categories: ICategory[];
} & UseDataGridReturnType<IProduct>;

export const ProductListTable = (props: Props) => {
  const go = useGo();
  const { pathname } = useLocation();
  const t = useTranslate();
  const { show } = useNavigation();


  const columns = useMemo<GridColDef<IProduct>[]>(
    () => [
      {
        field: "id",
        headerName: "ID #",
        description: "ID #",
        width: 52,
        renderCell: function render({ row }) {
          return <Typography>#{row.id}</Typography>;
        },
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
        headerName: t("products.fields.name"),
        width: 200,
        sortable: false,
      },
      {
        field: "description",
        headerName: t("products.fields.description"),
        minWidth: 320,
        flex: 1,
        sortable: false,
      },
      {
        field: "price",
        headerName: t("products.fields.price"),
        width: 120,
        sortable: false,
        align: "right",
        headerAlign: "right",
        renderCell: function render({ row }) {
          return (
            <NumberField
              value={row.price}
              options={{
                currency: "USD",
                style: "currency",
              }}
            />
          );
        },
      },
      {
        field: "categoryId.title",
        headerName: t("products.fields.category"),
        minWidth: 160,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          // Affiche le titre de la catégorie à partir de categoryId
          return <span>{params.row.categoryId?.title}</span>;
        }
        
      },
      {
        field: "isActive",
        headerName: "isActive",
        minWidth: 136,
        renderCell: function render({ row }) {
          return <ProductStatus value={row.isActive} />;
        },
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
            onClick={() => show("products", row.id)}
          >
            <VisibilityOutlined color="action" />
          </IconButton>
        ),
      },
    ],
    [t, props.categories, go, pathname],
  );

  return (
    <DataGrid
      {...props.dataGridProps}
      sx={{}}
      columns={columns}
      autoHeight
      pageSizeOptions={[12, 24, 48, 96]}
    />
  );
};
