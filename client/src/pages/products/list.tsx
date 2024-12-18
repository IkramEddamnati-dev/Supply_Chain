import React, { PropsWithChildren, useState } from "react";
import { useTranslate, useGo, useNavigation, useList } from "@refinedev/core";
import { CreateButton, useAutocomplete, useDataGrid } from "@refinedev/mui";
import ListOutlinedIcon from "@mui/icons-material/ListOutlined";
import BorderAllOutlinedIcon from "@mui/icons-material/BorderAllOutlined";
import { useLocation } from "react-router-dom";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Paper from "@mui/material/Paper";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

import {
  ProductListCard,
  ProductListTable,
  RefineListView,
} from "../../components";
import type { ICategory, IProduct, IUser } from "../../interfaces";

type RWId = { id: number; name: string };
type UserId = { id: number; name: string };
type View = "table" | "card";

export const ProductList = ({ children }: PropsWithChildren) => {
  const [view, setView] = useState<View>(() => {
    const view = localStorage.getItem("product-view") as View;
    return view || "table";
  });
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const go = useGo();
  const { replace } = useNavigation();
  const { pathname } = useLocation();
  const { createUrl } = useNavigation();
  const t = useTranslate();
  const manifactureId = localStorage.getItem("userId");

  const manufacturerId = manifactureId ? Number(manifactureId) : null;
  const [formValues, setFormValues] = useState({
    produitOriginID: 0,
    newName: "",
    newPrice: "",
    rwIds: [] as RWId[],
    newDescription: "",
    newImage: "",
    newAddress: "",
    manufacturerIdNew: manufacturerId,
    distributorId: null as UserId | null,
  });

  const dataGrid = useDataGrid<IProduct>({
    resource: "products",
    pagination: {
      pageSize: 12,
    },
  });

  const storedRole = localStorage.getItem("userRole");

  const { data: categoriesData } = useList<ICategory>({
    resource: "categories",
    pagination: {
      mode: "off",
    },
  });
  const categories = categoriesData?.data || [];

  const { autocompleteProps: user } = useAutocomplete({
    resource: "users/Distribution",
  });
  const { autocompleteProps: products } = useAutocomplete({
    resource: "products",
  });
  const productsID = products?.options || [];

  const distrubuteurs = user?.options || [];

  const { autocompleteProps: rawMaterialsAutocompleteProps } = useAutocomplete({
    resource: "raw_materials",
  });
  const rwIds = rawMaterialsAutocompleteProps?.options || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleViewChange = (_e: React.MouseEvent<HTMLElement>, newView: View) => {
    replace("");
    setView(newView);
    localStorage.setItem("product-view", newView);
  };

  const validateForm = () => {
    // Check for required fields
    if (!formValues.produitOriginID || !formValues.newName || !formValues.newPrice || !formValues.distributorId) {
      return false;
    }

    // Validate rwIds
    if (formValues.rwIds.length === 0) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission
  
    if (!validateForm()) {
      alert("Please fill in all required fields correctly.");
      return;
    }
  
    const backendUrl = "http://127.0.0.1:8000/duplicate_product"; 
    const payload = {
      produitOriginID: formValues.produitOriginID ? formValues.produitOriginID.id : null, // Only pass the ID
      distributorId: formValues.distributorId ? formValues.distributorId.id : null, // Only pass the ID
      newName: formValues.newName,
      newDescription: formValues.newDescription,
      rwIds: formValues.rwIds.map((rw) => rw.id), // Ensure rwIds contains only IDs
      newPrice: formValues.newPrice,
      newImage: formValues.newImage,
      newAddress: formValues.newAddress,
      manufacturerIdNew: formValues.manufacturerIdNew,
    };
  
    try {
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Produit dupliqué avec succès :", data);
      } else {
        console.error("Erreur lors de la duplication du produit :", response.status);
      }
    } catch (error) {
      console.error("Erreur lors de la requête :", error);
    } finally {
      handleClose();
    }
  };
  

  return (
    <>
      <RefineListView
        headerButtons={(props) => [
          <ToggleButtonGroup
            key="view-toggle"
            value={view}
            exclusive
            onChange={handleViewChange}
            aria-label="text alignment"
          >
            <ToggleButton value="table" aria-label="table view" size="small">
              <ListOutlinedIcon />
            </ToggleButton>
            <ToggleButton value="card" aria-label="card view" size="small">
              <BorderAllOutlinedIcon />
            </ToggleButton>
          </ToggleButtonGroup>,
          storedRole !== "Customer" && (
            <CreateButton
              {...props.createButtonProps}
              key="create"
              size="medium"
              sx={{ height: "40px" }}
              onClick={() => {
                return go({
                  to: `${createUrl("products")}`,
                  query: {
                    to: pathname,
                  },
                  options: {
                    keepQuery: true,
                  },
                  type: "replace",
                });
              }}
            >
              {t("products.actions.add")}
            </CreateButton>
          ),
          <Button onClick={handleOpen}>Add From other Product</Button>
        ]}
      >
        {view === "table" && (
          <Paper>
            <ProductListTable {...dataGrid} categories={categories} />
          </Paper>
        )}
        {view === "card" && (
          <ProductListCard {...dataGrid} categories={categories} />
        )}
      </RefineListView>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            ...style,
            maxHeight: "90vh", 
            overflowY: "auto", 
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {t("products.actions.add")}
          </Typography>
          <form onSubmit={handleSubmit}> {/* Attach handleSubmit here */}
            <Autocomplete
              options={productsID}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, value) => {
                setFormValues({ ...formValues, produitOriginID: value });
              }}
              value={formValues.produitOriginID}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Product"
                  margin="normal"
                  variant="outlined"
                />
              )}
            />

            <TextField
              name="newName"
              value={formValues.newName}
              onChange={handleChange}
              label="Product Name"
              margin="normal"
              variant="outlined"
              fullWidth
            />

            <TextField
              name="newPrice"
              value={formValues.newPrice}
              onChange={handleChange}
              label="Price"
              margin="normal"
              variant="outlined"
              fullWidth
              type="number"
            />

            <TextField
              name="newDescription"
              value={formValues.newDescription}
              onChange={handleChange}
              label="Description"
              margin="normal"
              variant="outlined"
              fullWidth
            />

            <TextField
              name="newImage"
              value={formValues.newImage}
              onChange={handleChange}
              label="Image URL"
              margin="normal"
              variant="outlined"
              fullWidth
            />

            <TextField
              name="newAddress"
              value={formValues.newAddress}
              onChange={handleChange}
              label="Address"
              margin="normal"
              variant="outlined"
              fullWidth
            />

            <Autocomplete
              options={distrubuteurs}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, value) => {
                setFormValues({ ...formValues, distributorId: value });
              }}
              value={formValues.distributorId}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Distributor"
                  margin="normal"
                  variant="outlined"
                  fullWidth
                />
              )}
            />

            <Autocomplete
              multiple
              options={rwIds}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, value) => {
                setFormValues({ ...formValues, rwIds: value });
              }}
              value={formValues.rwIds}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Raw Materials"
                  margin="normal"
                  variant="outlined"
                  fullWidth
                />
              )}
            />

            <Box sx={{ marginTop: 2 }}>
              <Button variant="contained" color="primary" type="submit">
                Submit
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleClose}>
                Cancel
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </>
  );
};
