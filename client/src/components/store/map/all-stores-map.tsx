import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { GoogleMap, AdvancedMarker } from "../../map";
import type { IRMS } from "../../../interfaces";

export const AllStoresMap = () => {
  const [rawMaterials, setRawMaterials] = useState<IRMS[]>([]); // État pour stocker les données
  const [map, setMap] = useState<google.maps.Map>();
  const [selectedStore, setSelectedStore] = useState<IRMS | null>(null);

  // Utilisation de useEffect pour récupérer les données avec fetch
  useEffect(() => {
    fetch("http://127.0.0.1:8000/raw_materials")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data.raw_materials);
        setRawMaterials(data.raw_materials);
      })
      .catch((error) => console.error("Error fetching raw materials:", error));
  }, []);
  
  // Pour vérifier map
  useEffect(() => {
    if (map) {
      console.log("Google Map initialized:", map);
    }
  }, [map]);
  
  const handleMarkerClick = (store: IRMS) => {
    setSelectedStore(store);
  };

  return (
    <Box
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <GoogleMap
        mapProps={{
          setMap,
          mapId: "all-stores-map",
          disableDefaultUI: true,
          center: {
            lat: 40.73061,
            lng: -73.935242,
          },
          zoom: 10,
        }}
      >
      {rawMaterials.map((store) => {
  const lat = Number(store.origin?.coordinate?.[0]);
  const lng = Number(store.origin?.coordinate?.[1]);

  // Filtrer les coordonnées invalides
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    console.warn(`Invalid coordinates: Lat ${lat}, Lng ${lng}`);
    return null; // Ignore the invalid marker
  }

  console.log("Lat:", lat, "Lng:", lng); // Vérifiez les coordonnées valides

  return (
    <AdvancedMarker
      key={store.id}
      map={map}
      zIndex={selectedStore?.id === store.id ? 1 : 0}
      position={{ lat, lng }}
      onClick={() => handleMarkerClick(store)}
    >
      {(selectedStore?.id !== store.id || !selectedStore) && (
        <img src="/images/marker-store.svg" alt={store.name} />
      )}
      {selectedStore?.id === store.id && (
        <Card
          onClick={(e) => {
            e.stopPropagation();
            setSelectedStore(null);
          }}
          sx={{
            padding: "16px",
            position: "relative",
            marginBottom: "16px",
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{store.name}</Typography>
          </Box>
          <Box mt="16px" color="text.secondary">
            <Divider />
            <Stack direction="row" alignItems="center" gap="8px">
              <PlaceOutlinedIcon />
              <Typography py="8px">{store.origin?.text}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" alignItems="center" gap="8px">
              <LocalPhoneOutlinedIcon />
              <Typography py="8px">{store.price}</Typography>
            </Stack>
          </Box>
        </Card>
      )}
    </AdvancedMarker>
  );
})}

      </GoogleMap>
    </Box>
  );
};
