import { Authenticated, GitHubBanner, Refine } from "@refinedev/core";
import { KBarProvider } from "@refinedev/kbar";
import {
  ErrorComponent,
  useNotificationProvider,
  ThemedLayoutV2,
  RefineSnackbarProvider,
} from "@refinedev/mui";
import GlobalStyles from "@mui/material/GlobalStyles";
import CssBaseline from "@mui/material/CssBaseline";
import dataProvider from "@refinedev/simple-rest";
import routerProvider, {
  CatchAllNavigate,
  NavigateToResource,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router-v6";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MopedOutlined from "@mui/icons-material/MopedOutlined";
import Dashboard from "@mui/icons-material/Dashboard";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import FastfoodOutlinedIcon from "@mui/icons-material/FastfoodOutlined";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
import Box from "@mui/material/Box";
import { authProvider } from "./authProvider";
import { DashboardPage } from "./pages/dashboard";
import { OrderList, OrderShow } from "./pages/orders";
import { CustomerShow, CustomerList } from "./pages/customers";
import { ShipmentList } from "./pages/couriers";
import AuthPage from "./pages/auth";
import { StoreList, StoreEdit, StoreCreate } from "./pages/stores";
import { ProductEdit, ProductList, ProductCreate } from "./pages/products";
import { CategoryList } from "./pages/categories";
import { ColorModeContextProvider } from "./contexts";
import { Header, Title } from "./components";
import PrivateRoute from "./PrivateRoute";

import { useState, useEffect } from "react";

const API_URL = "http://127.0.0.1:8000";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const { t, i18n } = useTranslation();
  const TOKEN_KEY = "refine-auth-token";
  const role=localStorage.getItem("userRole");
  // Simulate user authentication (replace this with your actual login mechanism)
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
  
    if (token) {
      // Replace with actual logic to fetch user data and role
      setIsAuthenticated(true);
    }
  }, []);

  const resources = [
    {
      name: "dashboard",
      list: "/",
      meta: {
        label: "Dashboard",
        icon: <Dashboard />,
      },
    },
    {
      name: "orders",
      list: "/orders",
      show: "/orders/:id",
      meta: {
        icon: <ShoppingBagOutlinedIcon />,
      },
    },
    {
      name: "users",
      list: "/customers",
      show: "/customers/:id",
      meta: {
        icon: <AccountCircleOutlinedIcon />,
      },
    },
    {
      name: "products",
      list: "/products",
      create: "/products/new",
      edit: "/products/:id/edit",
      show: "/products/:id",
      meta: {
        icon: <FastfoodOutlinedIcon />,
      },
    },
    {
      name: "categories",
      list: "/categories",
      meta: {
        icon: <LabelOutlinedIcon />,
      },
    },
    {
      name: "raw_materials",
      list: "/raw_materials",
      create: "/raw_materials/new",
      edit: "/raw_materials/:id/edit",
      meta: {
        icon: <StoreOutlinedIcon />,
      },
    },
    {
      name: "shipement",
      list: "/shipements",
      meta: {
        icon: <MopedOutlined />,
      },
    },
  ];

  // Filter resources based on the user role
  const filteredResources = resources.filter(resource => {
    if (role === 'Manufacture') {
      return ['users', 'raw_materials'].includes(resource.name);
    }
    if (role === 'Raw Material') {
      return !['users', 'raw_materials'].includes(resource.name);
    }

    // Example: Regular user cannot access 'users' or 'raw_materials'
    if (role === 'Distribution') {
      return ['dashboard', 'shipement'].includes(resource.name);
    }

    if (role === 'Customer') {
      return ['orders', 'products'].includes(resource.name);
    }

    // Default fallback: Show resources for 'guest' or other roles
    return false;
  });
  const i18nProvider = {
    translate: (key: string, params: object) => t(key, params),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

 
  return (
    <BrowserRouter>
      <KBarProvider>
        <ColorModeContextProvider>
          <CssBaseline />
          <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
          <RefineSnackbarProvider>
            <Refine
              routerProvider={routerProvider}
              dataProvider={dataProvider(API_URL)}
              authProvider={authProvider}
              i18nProvider={i18nProvider}
              notificationProvider={useNotificationProvider}
              resources={filteredResources}
            >
              
              <Routes>
                
                <Route
                  element={
                    <ThemedLayoutV2 Header={Header} Title={Title}>
                      <Outlet />
                    </ThemedLayoutV2>
                  }
                >
                  <Route
              path="/"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated} element={<DashboardPage />} />
              }
            />
             <Route
              path="/orders"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated} element={<OrderList />} />
              }
            />
            <Route
              path="/orders/:id"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated} element={<OrderShow />} />
              }
            />
            <Route
              path="/customers"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated} element={<CustomerList />} />
              }
            />
            <Route
              path="/customers/:id"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated} element={<CustomerShow />} />
              }
            />
            <Route
              path="/products"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated} element={<ProductList />} />
              }
            />
            <Route
              path="/products/new"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated} element={<ProductCreate />} />
              }
            />
            <Route
              path="/products/:id/edit"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated} element={<ProductEdit />} />
              }
            />
            <Route
              path="/stores"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated} element={<StoreList />} />
              }
            />
            <Route
              path="/stores/new"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated} element={<StoreCreate />} />
              }
            />
            <Route
              path="/stores/:id/edit"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated} element={<StoreEdit />} />
              }
            />
            <Route
              path="/categories"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated} element={<CategoryList />} />
              }
            />
            <Route
              path="/shipements"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated} element={<ShipmentList />} />
              }
            />
            

                </Route>

                {/* Login and Registration Routes */}
                
                <Route path="/login" element={<AuthPage type="login" />} />
                <Route path="/register" element={<AuthPage type="register" />} />

                {/* Catch-all route for errors */}
                <Route path="*" element={<ErrorComponent />} />
              </Routes>
            </Refine>
          </RefineSnackbarProvider>
        </ColorModeContextProvider>
      </KBarProvider>
    </BrowserRouter>
  );
};

export default App;
