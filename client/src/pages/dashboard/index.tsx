import React, { useEffect, useState } from "react";
import { useTranslate } from "@refinedev/core";
import Grid from "@mui/material/Grid";
import { NumberField } from "@refinedev/mui";
import { Card } from "../../components";
import {
  BarChart,
  PieChart,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  Line,
  Pie,
  Cell,
} from "recharts";
import {
  MonetizationOnOutlined,
  ShoppingBagOutlined,
  AssessmentOutlined,
} from "@mui/icons-material";

export const DashboardPage: React.FC = () => {
  const t = useTranslate();
  const [shipments, setShipments] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      const [shipmentsResponse, productsResponse, materialsResponse] = await Promise.all([
        fetch("http://127.0.0.1:8000/shipments").then((res) => res.json()),
        fetch("http://127.0.0.1:8000/products").then((res) => res.json()),
        fetch("http://127.0.0.1:8000/raw_materials").then((res) => res.json()),
      ]);

      setShipments(shipmentsResponse);
      setProducts(productsResponse);
      setMaterials(materialsResponse);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Calculate metrics
  const totalRevenue = [
    ...shipments.map((s) => s.price || 0),
    ...products.map((p) => p.price || 0),
    ...materials.map((m) => m.price || 0),
  ].reduce((acc, value) => acc + value, 0);

  const totalShipments = shipments.length;
  const totalProducts = products.length;

  const statusBreakdown = shipments.reduce((acc, shipment) => {
    acc[shipment.status] = (acc[shipment.status] || 0) + 1;
    return acc;
  }, {});

  const statusMapping: { [key: string]: string } = {
    "0": "Pending",
    "1": "In Transit",
    "2": "Delivered",
  };

  const statusData = Object.keys(statusBreakdown).map((status) => ({
    name: statusMapping[status] || `Status ${status}`,
    value: statusBreakdown[status],
  }));

  const revenueTrendData = shipments.map((shipment) => ({
    date: shipment.date,
    revenue: shipment.price,
  }));

  const productPriceData = products.map((product) => ({
    name: product.name,
    price: product.price,
  }));

  const materialPriceTrend = materials.map((material) => ({
    name: material.name,
    price: material.price,
  }));

  // Bar Chart for Shipments by Month
  const shipmentsByMonth = shipments.reduce((acc, shipment) => {
    const month = new Date(shipment.date).getMonth();
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const shipmentsMonthlyData = Object.keys(shipmentsByMonth).map((month) => ({
    month,
    shipments: shipmentsByMonth[month],
  }));

  return (
    <Grid container spacing={3}>
      {/* Overall Metrics */}
      <Grid item xs={12} sm={4}>
        <Card
          title={t("Total Revenue")}
          icon={<MonetizationOnOutlined style={{ color: "#4caf50" }} />}
          style={{ background: "#e8f5e9" }}
        >
           <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          <NumberField
            value={totalRevenue}
            label="Total Revenue"
            options={{ style: "currency", currency: "USD" }}
            sx={{ fontSize: "2rem", textAlign: "center"  }}
          />
          </div>
        </Card>
      </Grid>
      <Grid item xs={12} sm={4}>
  <Card
    title={t("Total Shipments")}
    icon={<ShoppingBagOutlined style={{ color: "#2196f3" }} />}
    style={{ background: "#e3f2fd" }}
  >
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
      <NumberField
        value={totalShipments}
        label="Total Shipments"
        sx={{ fontSize: "2rem", textAlign: "center" }}
      />
    </div>
  </Card>
</Grid>

      <Grid item xs={12} sm={4}>
        <Card
          title={t("Total Products")}
          icon={<AssessmentOutlined style={{ color: "#f57c00" }} />}
          style={{ background: "#fff3e0" }}
        >
           <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          <NumberField
            value={totalProducts}
            label="Total Products"
            sx={{ fontSize: "2rem" , textAlign: "center" }}
          />
          </div>
        </Card>
      </Grid>

      {/* Revenue Trend */}
      <Grid item xs={12} md={6}>
        <Card title={t("Revenue Trend")}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Grid>

      {/* Shipment Status Distribution */}
      <Grid item xs={12} md={6}>
        <Card title={t("Shipment Status Distribution")}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                labelLine={false}
                outerRadius={80}
                fill="#82ca9d"
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index % 2 === 0 ? "#8884d8" : "#82ca9d"}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </Grid>

      {/* Product Prices */}
      <Grid item xs={12} md={6}>
        <Card title={t("Product Prices")}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productPriceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="price" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Grid>

      {/* Raw Material Price Trends */}
      <Grid item xs={12} md={6}>
        <Card title={t("Raw Material Price Trends")}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={materialPriceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Grid>
    </Grid>
  );
};
