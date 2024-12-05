import { useTranslate } from "@refinedev/core";
import { Controller } from "react-hook-form";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import { useStoreForm } from "./useStoreForm";

type Props = {
  action: "create" | "edit";
  form: ReturnType<typeof useStoreForm>;
  onCancel?: () => void;
};

export const StoreForm = (props: Props) => {
  const t = useTranslate();
  const { register, control, formState: { errors }, saveButtonProps, setValue, handleAddressChange } = props.form;

  return (
    <form>
      <Card sx={{ display: "flex", flexDirection: "column", gap: "24px", padding: "24px" }}>
        {/* Name Field */}
        
        <FormControl fullWidth>
          <Controller
            name="name"
            control={control}
            defaultValue=""
            rules={{ required: t("errors.required.field", { field: "name" }) }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Name"
                required
                size="small"
                margin="none"
                variant="outlined"
              />
            )}
          />
          {errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
        </FormControl>

        {/* Description Field */}
        <FormControl fullWidth>
          <Controller
            name="description"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                required
                size="small"
                margin="none"
                variant="outlined"
              />
            )}
          />
          {errors.description && <FormHelperText error>{errors.description.message}</FormHelperText>}
        </FormControl>

        {/* Image URL Field */}
        <FormControl fullWidth>
          <Controller
            name="image"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="Image URL"
                required
                size="small"
                margin="none"
                variant="outlined"
              />
            )}
          />
          {errors.image && <FormHelperText error>{errors.image.message}</FormHelperText>}
        </FormControl>

        {/* Origin Field */}
        <FormControl fullWidth>
          <Controller
            name="origin"
            control={control}
            defaultValue=""
            rules={{ required: t("errors.required.field", { field: "origin" }) }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Origin"
                required
                size="small"
                margin="none"
                variant="outlined"
                onChange={(e) => {
                  field.onChange(e);
                  handleAddressChange(e.target.value);
                }}
              />
            )}
          />
          {errors.origin && <FormHelperText error>{errors.origin.message}</FormHelperText>}
        </FormControl>

        {/* Price Field */}
        <FormControl fullWidth>
          <Controller
            name="price"
            control={control}
            defaultValue={0}
            rules={{
              required: t("errors.required.field", { field: "price" }),
            }}
            render={({ field }) => (
              <TextField
                {...field}
                variant="outlined"
                label="Price"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            )}
          />
          {errors.price && <FormHelperText error>{errors.price.message}</FormHelperText>}
        </FormControl>

        <Box sx={{ display: "none" }}>
          <input {...register("latitude", { required: true })} type="hidden" />
          <input {...register("longitude", { required: true })} type="hidden" />
        </Box>

        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Button variant="text" color="inherit" onClick={props.onCancel}>
            Cancel
          </Button>
          <Button {...saveButtonProps} variant="contained">
            Save
          </Button>
        </Stack>
      </Card>
    </form>
  );
};
