import { FC, useEffect, useState } from "react";
import { GoogleMap, MapMarker } from "../../map";
import MapWrapper, { Polyline } from "../../map/map";

type RawMaterial = {
  id: number;
  name: string;  // Ajout du nom pour la matière première
  description: string;
  price: number;
  image: string;
  origin: {
    text: string;
    coordinate: [number, number];
  };
};

type Product = {
  id: number;
  rwIds: number[];
  ManufacteurId: number;
  produitOriginID: number | null;
  productAddress: string;
  name: string;  // Ajout du nom pour le produit
};

type Props = {
  product: Product;
};

export const ProductRawMaterialsMap: FC<Props> = ({ product }) => {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [productCoordinates, setProductCoordinates] = useState<[number, number] | null>(null);
  const [originProduct, setOriginProduct] = useState<Product | null>(null);
  const [originRawMaterials, setOriginRawMaterials] = useState<RawMaterial[]>([]);
  const [originCoordinates, setOriginCoordinates] = useState<[number, number] | null>(null);

  const API_KEY = "79e9428274814401aace6fdfdbffb8ae";

  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${API_KEY}`
      );
      const geocodeData = await response.json();
      if (geocodeData.results.length > 0) {
        const { lat, lng } = geocodeData.results[0].geometry;
        return [lat, lng];
      }
    } catch (error) {
      console.error("Erreur lors du géocodage:", error);
    }
    return null;
  };

  const fetchRawMaterials = async (rwIds: number[]) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/raw_materials");
      const allRawMaterials: RawMaterial[] = await response.json();
      return allRawMaterials.filter((rm) => rwIds.includes(rm.id));
    } catch (error) {
      console.error("Erreur lors de la récupération des matières premières:", error);
      return [];
    }
  };

  const fetchOriginProduct = async (originID: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/products/${originID}`);
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération du produit d'origine:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadProductData = async () => {
      const [materials, coordinates] = await Promise.all([
        fetchRawMaterials(product.rwIds),
        geocodeAddress(product.productAddress),
      ]);
      setRawMaterials(materials);
      setProductCoordinates(coordinates);
    };
    loadProductData();
  }, [product]);

  useEffect(() => {
    const loadOriginProductData = async () => {
      if (product.produitOriginID) {
        const origin = await fetchOriginProduct(product.produitOriginID);
        if (origin) {
          setOriginProduct(origin);
          const [materials, coordinates] = await Promise.all([
            fetchRawMaterials(origin.rwIds),
            geocodeAddress(origin.productAddress),
          ]);
          setOriginRawMaterials(materials);
          setOriginCoordinates(coordinates);
        }
      }
    };
    loadOriginProductData();
  }, [product.produitOriginID]);

  // Définir le symbole de flèche
  const arrowSymbol = {
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,  // Symbole de flèche
    scale: 3,  // Taille de la flèche
    strokeColor: '#FF0000',  // Couleur de la flèche
  };

  return (
    <MapWrapper
      mapProps={{
        center: { lat: 33.5731, lng: -7.5898 },
        zoom: 9,
      }}
    >
      {/* Raw materials of the current product */}
      {rawMaterials.map((rm) => (
        <MapMarker
          key={`raw-material-${rm.id}`}
          position={{
            lat: rm.origin.coordinate[0],
            lng: rm.origin.coordinate[1],
          }}
          label={rm.name}  // Afficher le nom de la matière première
        />
      ))}

      {/* Current product coordinates */}
      {productCoordinates && (
        <MapMarker
          position={{
            lat: productCoordinates[0],
            lng: productCoordinates[1],
          }}
          label={product?.name}  // Afficher le nom du produit
        />
      )}

      {/* Lines between raw materials and the current product */}
      {productCoordinates &&
        rawMaterials.map((rm) => (
          <Polyline
            key={`polyline-${rm.id}`}
            path={[
              { lat: rm.origin.coordinate[0], lng: rm.origin.coordinate[1] },
              { lat: productCoordinates[0], lng: productCoordinates[1] },
            ]}
            options={{
              strokeColor: "#FF0000",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              icons: [
                {
                  icon: arrowSymbol,
                  offset: '100%',  // La flèche sera affichée à la fin de la ligne
                },
              ],
            }}
          />
        ))}

      {/* Origin product coordinates */}
      {originCoordinates && (
        <MapMarker
          position={{
            lat: originCoordinates[0],
            lng: originCoordinates[1],
          }}
          label={originProduct?.name}  // Afficher le nom du produit d'origine
        />
      )}

      {/* Lines between the origin product and the current product */}
      {productCoordinates && originCoordinates && (
        <Polyline
          path={[
            { lat: originCoordinates[0], lng: originCoordinates[1] },
            { lat: productCoordinates[0], lng: productCoordinates[1] },
          ]}
          options={{
            strokeColor: "#00FF00",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            icons: [
              {
                icon: arrowSymbol,
                offset: '100%',  // La flèche sera affichée à la fin de la ligne
              },
            ],
          }}
        />
      )}

      {/* Raw materials of the origin product */}
      {originRawMaterials.map((rm) => (
        <MapMarker
          key={`origin-raw-material-${rm.id}`}
          position={{
            lat: rm.origin.coordinate[0],
            lng: rm.origin.coordinate[1],
          }}
          label={rm.name}  // Afficher le nom de la matière première d'origine
        />
      ))}

      {/* Lines between raw materials of the origin product and the origin product */}
      {originCoordinates &&
        originRawMaterials.map((rm) => (
          <Polyline
            key={`origin-polyline-${rm.id}`}
            path={[
              { lat: rm.origin.coordinate[0], lng: rm.origin.coordinate[1] },
              { lat: originCoordinates[0], lng: originCoordinates[1] },
            ]}
            options={{
              strokeColor: "#0000FF",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              icons: [
                {
                  icon: arrowSymbol,
                  offset: '100%',  // La flèche sera affichée à la fin de la ligne
                },
              ],
            }}
          />
        ))}
    </MapWrapper>
  );
};
