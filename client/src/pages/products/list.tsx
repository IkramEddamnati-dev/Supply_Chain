import React, { type PropsWithChildren, useState } from "react";
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

type RWId = { id: number; name: string }; // Définir le type pour RawMaterial

type View = "table" | "card";

export const ProductList = ({ children }: PropsWithChildren) => {
  const [view, setView] = useState<View>(() => {
    const view = localStorage.getItem("product-view") as View;
    return view || "table";
  });
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const go = useGo();
  const { replace } = useNavigation();
  const { pathname } = useLocation();
  const { createUrl } = useNavigation();
  const t = useTranslate();
  const [formValues, setFormValues] = useState({
    produitOriginID: 0,
    newName: "",
    newPrice: "",
    rwIds: [] as RWId[], // Assurez-vous que rwIds est de type RWId[]
    newDescription: "",
    newImage: "",
    newAddress: "",
    manufacturerIdNew: 1,
  });

  const dataGrid = useDataGrid<IProduct>({
    resource: "products",
    pagination: {
      pageSize: 12,
    },
  });
  const produits = dataGrid?.current || [];
  const { data: categoriesData } = useList<ICategory>({
    resource: "categories",
    pagination: {
      mode: "off",
    },
  });
  const categories = categoriesData?.data || [];

  const { autocompleteProps: manufacturersData } = useAutocomplete({
    resource: "users",  
    
  });
  const manufacturers = manufacturersData?.options || [];

  const { autocompleteProps: rawMaterialsAutocompleteProps } = useAutocomplete({
    resource: "raw_materials",
  });
  const rwIds = rawMaterialsAutocompleteProps?.options || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleViewChange = (
    _e: React.MouseEvent<HTMLElement>,
    newView: View,
  ) => {
    replace("");
    setView(newView);
    localStorage.setItem("product-view", newView);
  };

  const handleSubmit = async () => {
    const backendUrl = "http://127.0.0.1:8000/duplicate_product"; 
    const payload = {
      produitOriginID: formValues.produitOriginID,
      newName: formValues.newName,
      
      newDescription: formValues.newDescription,
      rwIds: formValues.rwIds,
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
          </CreateButton>,
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
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {t("products.actions.add")}
          </Typography>
          <form onSubmit={(e) => e.preventDefault()}>
            <TextField
              label="New Name"
              name="newName"
              value={formValues.newName}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="New Price"
              name="newPrice"
              value={formValues.newPrice}
              onChange={handleChange}
              fullWidth
              margin="normal"
              type="number"
            />
            <TextField
              label="New Description"
              name="newDescription"
              value={formValues.newDescription}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="New Image URL"
              name="newImage"
              value={formValues.newImage}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="New Address"
              name="newAddress"
              value={formValues.newAddress}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <Autocomplete
              options={manufacturers}
              getOptionLabel={(option) => option.name}
isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, newValue) => {
                setFormValues({ ...formValues, manufacturerIdNew: newValue?.id || 0 });
              }}
              value={formValues.manufacturerIdNew}
              renderInput={(params) => (
                <TextField {...params} label="Manufacturer" fullWidth margin="normal" />
              )}
            />

            <Autocomplete
              multiple
              options={rwIds}
              getOptionLabel={(option) => option.name} // Affiche le nom dans la liste
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, value) => {
                // Met à jour la valeur de rwIds avec les IDs sélectionnés
                setFormValues({ ...formValues, rwIds: value });
              }}
              value={formValues.rwIds}
              renderInput={(params) => <TextField {...params} label="Raw Materials" />}
            />

            <Button onClick={handleSubmit}>Submit</Button>
          </form>
        </Box>
      </Modal>
    </>
  );
};
