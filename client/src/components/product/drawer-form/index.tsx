  import {
    type HttpError,
    useApiUrl,
    useGetToPath,
    useGo,
    useTranslate,
  } from "@refinedev/core";
  import { DeleteButton, useAutocomplete } from "@refinedev/mui";
  import { useSearchParams } from "react-router-dom";
  import { useForm } from "@refinedev/react-hook-form";
  import { Controller } from "react-hook-form";
  import Button from "@mui/material/Button";
  import Box from "@mui/material/Box";
  import FormControl from "@mui/material/FormControl";
  import FormHelperText from "@mui/material/FormHelperText";
  import TextField from "@mui/material/TextField";
  import Paper from "@mui/material/Paper";
  import Stack from "@mui/material/Stack";
  import InputAdornment from "@mui/material/InputAdornment";
  import Autocomplete from "@mui/material/Autocomplete";
  import ToggleButton from "@mui/material/ToggleButton";
  import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
  import FormLabel from "@mui/material/FormLabel";
  import { Drawer, DrawerHeader, ProductImageUpload } from "../../../components";
  import { useImageUpload } from "../../../utils";
  import type { ICategory, IFile, IProduct, IUser, Nullable } from "../../../interfaces";
  import { useEffect } from "react";

  type Props = {
    action: "create" | "edit";
  };

  export const ProductDrawerForm = (props: Props) => {
    const getToPath = useGetToPath();
    const [searchParams] = useSearchParams();
    const go = useGo();
    const t = useTranslate();
    const apiUrl = useApiUrl();

    const onDrawerCLose = () => {
      go({
        to:
          searchParams.get("to") ??
          getToPath({
            action: "list",
          }) ??
          "",
        query: {
          to: undefined,
        },
        options: {
          keepQuery: true,
        },
        type: "replace",
      });
    };
const manifactureId = localStorage.getItem("userId");

// Conversion de la valeur récupérée en nombre si elle existe et n'est pas nulle
const manufacturerId = manifactureId ? Number(manifactureId) : null;
    const {
      watch,
      control,
      setValue,
      handleSubmit,
      formState: { errors },
      refineCore: { onFinish, id, formLoading },
      saveButtonProps,
    } = useForm<IProduct, HttpError, Nullable<IProduct>>({
      defaultValues: {
        name: "",
        description: "",
        rwIds:[],
        price: 0,
        ManufacteurId:manufacturerId,
        categoryId: null,
        productAddress: "Casablanca",
        isActive: true,
        image: "",
        distributorId:null
      },
      refineCoreProps: {
        redirect: false,
        onMutationSuccess: () => {
          if (props.action === "create") {
            onDrawerCLose();
          }
        },
      },
    });
    // const imageInput: IFile[] | null = watch("image");

    const { autocompleteProps } = useAutocomplete<ICategory>({
      resource: "categories",
    });
    const { autocompleteProps:user } = useAutocomplete<IUser>({
      resource: "users/Distribution",
    });
    const { autocompleteProps: rawMaterialsAutocompleteProps } =
    useAutocomplete({
      resource: "raw_materials",
    });

  const rawMaterialsOptions = rawMaterialsAutocompleteProps?.options || [];

  const users = user?.options || []; // Liste des utilisateurs avec le rôle "manufacture"

  const generatePrice = (rwIds: number[], rawMaterials: any[]) => {
    const basePrice = rwIds.reduce((total, rwId) => {
      const rawMaterial = rawMaterials.find(rm => rm.id === rwId);
      if (!rawMaterial) {
        throw new Error(`Raw material with ID ${rwId} not found`);
      }
      return total + rawMaterial.price;
    }, 0);
  
    const shipmentCost = rwIds.length * 100;
    const finalPrice = (basePrice + shipmentCost) * 1.5;
  
    // Round the final price to ensure it's an integer
    return Math.floor(finalPrice); // or Math.round(finalPrice) if you want rounding
  };
  
  useEffect(() => {
    const subscription = watch((value) => {
      if (value.rwIds) {
        const filteredRwIds = value.rwIds.filter((id): id is number => id !== undefined);
        
        // Convert rawMaterialsOptions (readonly any[]) into a modifiable array
        const modifiableRawMaterials = [...rawMaterialsOptions];
        
        // Call generatePrice with the modifiable rawMaterials array
        const price = generatePrice(filteredRwIds, modifiableRawMaterials);
        
      
        setValue("price", price);
      }
    });
  
    return () => subscription.unsubscribe();
  }, [watch, rawMaterialsOptions, setValue]);
  
  
  
  

    return (
      <Drawer
        PaperProps={{ sx: { width: { sm: "100%", md: "416px" } } }}
        open
        anchor="right"
        onClose={onDrawerCLose}
      >
        <DrawerHeader
          title={t("products.actions.edit")}
          onCloseClick={onDrawerCLose}
        />
        <form
          onSubmit={handleSubmit((data) => {
            onFinish(data);
          })}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <Controller
              control={control}
              name="image"
              defaultValue=""
              rules={{
                required: t("errors.required.field", {
                  field: "image",
                }),
              }}
              render={({ field }) => {
                return (
                  <TextField
                    {...field}
                    variant="outlined"
                    id="image"
                    label={t("image")}
                    placeholder={"Image"}
                  />
                );
              }}
            />

            {errors.image && (
              <FormHelperText error>{errors.image.message}</FormHelperText>
            )}
          </Box>

          <Paper
            sx={{
              marginTop: "32px",
            }}
          >
            <Stack padding="24px" spacing="24px">
              <FormControl fullWidth>
                <Controller
                  control={control}
                  name="name"
                  defaultValue=""
                  rules={{
                    required: t("errors.required.field", {
                      field: "name",
                    }),
                  }}
                  render={({ field }) => {
                    return (
                      <TextField
                        {...field}
                        variant="outlined"
                        id="name"
                        label={t("products.fields.name")}
                        placeholder={t("products.fields.name")}
                      />
                    );
                  }}
                />
                {errors.name && (
                  <FormHelperText error>{errors.name.message}</FormHelperText>
                )}
              </FormControl>
              <FormControl fullWidth>
                <Controller
                  control={control}
                  name="description"
                  defaultValue=""
                  rules={{
                    required: t("errors.required.field", {
                      field: "category",
                    }),
                  }}
                  render={({ field }) => {
                    return (
                      <TextField
                        {...field}
                        variant="outlined"
                        id="description"
                        label={t("products.fields.description")}
                        placeholder={t("products.fields.description")}
                      />
                    );
                  }}
                />
                {errors.description && (
                  <FormHelperText error>
                    {errors.description.message}
                  </FormHelperText>
                )}
              </FormControl>
              <FormControl fullWidth>
                <Controller
                  control={control}
                  name="productAddress"
                  defaultValue=""
                  rules={{
                    required: t("errors.required.field", {
                      field: "productAddress",
                    }),
                  }}
                  render={({ field }) => {
                    return (
                      <TextField
                        {...field}
                        variant="outlined"
                        id="productAddress"
                        label="productAddress"
                        placeholder="productAddress"
                      />
                    );
                  }}
                />
                {errors.productAddress && (
                  <FormHelperText error>
                    {errors.productAddress.message}
                  </FormHelperText>
                )}
              </FormControl>
              
              <><FormControl fullWidth>
                  <FormLabel>rwIds</FormLabel>
                  <Controller
                    control={control}
                    name="rwIds"
                    defaultValue={[]}
                    rules={{
                      required: t("errors.required.field", {
                        field: "rwIds",
                      }),
                    }}
                    render={({ field }) => (
                      <Autocomplete
                        multiple
                        id="rwIds"
                        options={rawMaterialsOptions} // Liste des options disponibles
                        getOptionLabel={(option) => option.name} // Affiche le nom dans la liste
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        onChange={(_, value) => {
                          // Mettre à jour seulement les identifiants sélectionnés
                          const ids = value.map((item) => item.id);
                          field.onChange(ids);

                        } }
                        renderInput={(params) => (
                          <TextField
                            {...params}

                            label="rwIds"
                            placeholder=""




                            error={!!errors.rwIds}
                            helperText={errors.rwIds?.message} />
                        )} />
                    )} />
                  {errors.rwIds && (
                    <FormHelperText error>{errors.rwIds.message}</FormHelperText>
                  )}
                </FormControl><FormControl fullWidth>
                    <Controller
                      control={control}
                      name="distributorId"
                      defaultValue={null}
                      rules={{
                        required: "Manufacturer is required !",
                      }}
                      render={({ field }) => (

                        <Autocomplete
                          id="distributorId"
                          options={users}
                          getOptionLabel={(option) => option?.name}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          onChange={(_, value) => {
                            field.onChange(value ? value.id : null);
                          } }
                          // loading={isLoading}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Distribution"
                              variant="outlined"
                              error={!!errors.ManufacteurId}
                              helperText={errors.ManufacteurId?.message} />
                          )} />
                      )} />
                    {errors.ManufacteurId && (
                      <FormHelperText error>{errors.ManufacteurId.message}</FormHelperText>
                    )}
                  </FormControl><FormControl fullWidth>
                    <Controller
                      control={control}
                      name="price"
                      defaultValue={0}
                      rules={{
                        required: t("errors.required.field", {
                          field: "price",
                        }),
                      }}
                      render={({ field }) => {
                        return (
                          <TextField
                            {...field}
                            variant="outlined"
                            id="price"
                            label={t("products.fields.price")}
                            placeholder={t("products.fields.price")}
                            type="number"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">$</InputAdornment>
                              ),
                            }} />
                        );
                      } } />
                    {errors.price && (
                      <FormHelperText error>{errors.price.message}</FormHelperText>
                    )}
                  </FormControl><FormControl>
                    <Controller
                      control={control}
                      name="categoryId"
                      defaultValue={null}
                      rules={{
                        required: t("errors.required.field", {
                          field: "category",
                        }),
                      }}
                      render={({ field }) => (
                        <Autocomplete<ICategory>
                          id="category"
                          {...autocompleteProps}
                          onChange={(_, value) => {
                            // Envoyer uniquement l'ID de la catégorie sélectionnée
                            field.onChange(value ? value.id : null);
                          } }
                          getOptionLabel={(item) => {
                            return (
                              autocompleteProps?.options?.find(
                                (p) => p.id?.toString() === item?.id?.toString()
                              )?.title ?? ""
                            );
                          } }
                          isOptionEqualToValue={(option, value) => value === undefined ||
                            option?.id?.toString() === (value?.id ?? value)?.toString()}
                          renderInput={(params) => (
                            <TextField
                              {...params}

                              label="category"




                              margin="normal"
                              variant="outlined"
                              error={!!errors.categoryId}
                              helperText={errors.categoryId?.message}
                              required />
                          )} />
                      )} />
                    {errors.categoryId && (
                      <FormHelperText error>{errors.categoryId.message}</FormHelperText>
                    )}
                  </FormControl><FormControl>
                    <FormLabel>{t("products.fields.isActive.label")}</FormLabel>
                    <Controller
                      control={control}
                      name="isActive"
                      rules={{
                        validate: (value) => {
                          if (value === undefined) {
                            return t("errors.required.field", {
                              field: "isActive",
                            });
                          }
                          return true;
                        },
                      }}
                      defaultValue={false}
                      render={({ field }) => (
                        <ToggleButtonGroup
                          id="isActive"
                          {...field}
                          exclusive
                          color="primary"
                          onChange={(_, newValue) => {
                            setValue("isActive", newValue, {
                              shouldValidate: true,
                            });

                            return newValue;
                          } }
                        >
                          <ToggleButton value={true}>
                            {t("products.fields.isActive.true")}
                          </ToggleButton>
                          <ToggleButton value={false}>
                            {t("products.fields.isActive.false")}
                          </ToggleButton>
                        </ToggleButtonGroup>
                      )} />
                    {errors.isActive && (
                      <FormHelperText error>{errors.isActive.message}</FormHelperText>
                    )}
                  </FormControl></>
            </Stack>
          </Paper>
          <Stack
            direction="row"
            justifyContent="space-between"
            padding="16px 24px"
          >
            <Button variant="text" color="inherit" onClick={onDrawerCLose}>
              {t("buttons.cancel")}
            </Button>
            {props.action === "edit" && (
              <DeleteButton
                recordItemId={id}
                variant="contained"
                onSuccess={() => {
                  onDrawerCLose();
                }}
              />
            )}
            <Button {...saveButtonProps} variant="contained">
              {t("buttons.save")}
            </Button>
          </Stack>
        </form>
      </Drawer>
    );
  };
