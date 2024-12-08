import { useForm } from "@refinedev/react-hook-form";
import { useDebounceValue } from "usehooks-ts";
import { useEffect, useState } from "react";
import { getLatLngWithAddress, convertLatLng, getAddressWithLatLng } from "../../../utils";
import type { HttpError } from "@refinedev/core";
export interface IRMS {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  origin: string;
  longitude:number;
  latitude:number;
  
}
type Props = {
  action: "create" | "edit";
  onMutationSuccess?: () => void;
};

export const useStoreForm = (props: Props) => {
  const form = useForm<IRMS, HttpError, IRMS>({
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      image: "",
      origin: "",
      latitude: undefined,
      longitude: undefined,
    },
    refineCoreProps: {
      action: props.action,
      redirect: props.action === "create" ? "list" : false,
      onMutationSuccess: () => {
        props.onMutationSuccess?.();
      },
    },
  });

  const store = form.refineCore.queryResult?.data?.data;
  const [latLng, setLatLng] = useState({ lat: 33.5731, lng: -7.5898 }); // Default to Casablanca

  useEffect(() => {
    if (store) {
      form.setValue("name", store.name);
      form.setValue("description", store.description);
      form.setValue("price", store.price);
      form.setValue("image", store.image);
      form.setValue("origin", store.origin);
      form.setValue("latitude", store.latitude);
      form.setValue("longitude", store.longitude);

      setLatLng({
        lat: store.latitude ?? 33.5731,
        lng: store.longitude ?? -7.5898,
      });
    }
  }, [store, form]);

  // Handle address-to-coordinates conversion
  const [debouncedAdressValue, setDebouncedAdressValue] = useDebounceValue(form?.getValues("origin"), 500);
  useEffect(() => {
    if (debouncedAdressValue) {
      getLatLngWithAddress(debouncedAdressValue).then((data) => {
        if (data) {
          const { lat, lng } = convertLatLng({ lat: data.lat, lng: data.lng });
          form.setValue("latitude", lat);
          form.setValue("longitude", lng);
          setLatLng({ lat, lng });
        }
      });
    }
  }, [debouncedAdressValue]);

  const handleMapOnDragEnd = async ({ lat, lng }: { lat: number; lng: number }) => {
    const data = await getAddressWithLatLng({ lat, lng });
    if (data) {
      form.setValue("origin", data.origin);
    }
  };

  const isLoading = form.refineCore?.queryResult?.isFetching || form.refineCore.formLoading;

  return {
    ...form,
    store,
    formLoading: isLoading,
    latLng,
    handleAddressChange: (origin: string) => setDebouncedAdressValue(origin),
    handleMapOnDragEnd,
  };
};
