import React from "react";
import { useShow, useTranslate, useUpdate } from "@refinedev/core";
import { ListButton } from "@refinedev/mui";
import { useTheme } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Unstable_Grid2";
import Paper from "@mui/material/Paper";
import {
   
  
  Card,
} from "../../components";
import { RefineListView } from "../../components";
import type { IProduct } from "../../interfaces";
import { ProductRawMaterialsMap } from "../../components/order/map";

export const ProductShow = () => {
  const t = useTranslate();

  const { query: queryResult } = useShow<IProduct>();
  const record = queryResult.data?.data;
  

  const { mutate } = useUpdate({
    resource: "products",
    id: record?.id.toString(),
  });

  const theme = useTheme();

  

  return (
    <>
      <ListButton
        variant="outlined"
        sx={{
          borderColor: "GrayText",
          color: "GrayText",
          backgroundColor: "transparent",
        }}
        startIcon={<ArrowBack />}
      />
      <Divider
        sx={{
          marginBottom: "24px",
          marginTop: "24px",
        }}
      />
      <RefineListView
        title={
          <Typography variant="h5">
            Product #{record?.id}
          </Typography>
        }
       
      >
        <Grid container spacing={3}>
          <Grid xs={12} md={12} lg={12} height="max-content">
            <Card
              title={t("orders.titles.deliveryMap")}
              cardContentProps={{
                sx: {
                  height: "448px",
                  padding: 0,
                },
              }}
            >
            <ProductRawMaterialsMap product={record ? { id: record.id, rwIds: record.rwIds ,ManufacteurId:record.manufacturerId,produitOriginID:record.produitOriginID,productAddress:record.productAddress} : { id: 0, rwIds: [],ManufacteurId:0 ,produitOriginID:0,productAddress:"Casablanca"}} />
            </Card>
            <Grid xs={12} md={6} lg={4} height="max-content">
            <Card title={t("orders.titles.deliveryDetails")}>
              {/* <OrderDetails order={record} /> */}
            </Card>
          </Grid>
          </Grid>
          
        </Grid>
      </RefineListView>
    </>
  );
};
