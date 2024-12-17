import { useEffect, useState, useRef, Children, cloneElement, isValidElement, type Dispatch, type SetStateAction, type FC, type PropsWithChildren } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";

interface MapProps extends Exclude<google.maps.MapOptions, "center"> {
  setMap?: Dispatch<SetStateAction<google.maps.Map | undefined>>;
  center?: google.maps.LatLngLiteral;
  onDragStart?: (event: google.maps.FeatureMouseEvent) => void;
}

const MapComponent: FC<PropsWithChildren<MapProps>> = ({
  children,
  center,
  zoom = 12,
  onDragStart,
  mapId,
  setMap: setMapFromProps,
  ...options
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();

  useEffect(() => {
    if (map && center) {
      map.setCenter(center);
    }
  }, [center, map]);

  useEffect(() => {
    if (map) {
      map.setOptions({ ...options, zoom, center });
      setMapFromProps?.(map);
      if (onDragStart) {
        map.addListener("dragstart", onDragStart);
      }
    }
  }, [map, center, onDragStart, options, setMapFromProps, zoom]);

  useEffect(() => {
    if (ref.current && !map) {
      const mapInstance = new window.google.maps.Map(ref.current, { mapId });
      setMap(mapInstance);
      setMapFromProps?.(mapInstance);
    }
  }, [map, mapId, setMapFromProps]);

  return (
    <>
      <div ref={ref} style={{ flexGrow: "1", height: "100%" }} />
      {Children.map(children, (child) =>
        isValidElement(child) ? cloneElement<any>(child, { map }) : null
      )}
    </>
  );
};

type MapWrapperProps = {
  mapProps?: MapProps;
};

const MapWrapper: FC<PropsWithChildren<MapWrapperProps>> = ({
  children,
  mapProps,
}) => {
  return (
    <Wrapper
      version="beta"
      libraries={["geometry", "marker"]}  // Utilisez la même configuration
      apiKey={import.meta.env.VITE_APP_MAP_ID}
    >
      <MapComponent {...mapProps}>{children}</MapComponent>
    </Wrapper>
  );
};


export default MapWrapper;

// ------------ Ajouter un composant Polyline -----------------

interface PolylineProps {
  map?: google.maps.Map;
  path: google.maps.LatLngLiteral[];
  options?: google.maps.PolylineOptions;
}

export const Polyline: FC<PolylineProps> = ({ map, path, options }) => {
  useEffect(() => {
    if (!map) return;

    // Crée la polyligne
    const polyline = new google.maps.Polyline({
      map,
      path,
      ...options,
    });

    // Ajoute une flèche à l'extrémité de la polyligne
    const arrowSymbol = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 3, // Taille de la flèche
      rotation: google.maps.geometry.spherical.computeHeading(
        path[path.length - 2], // Point précédent
        path[path.length - 1], // Dernier point
      ), // Calcul de la direction de la flèche
      anchor: new google.maps.Point(0, 0), // Position de la flèche
      strokeColor: "#FF0000", // Couleur de la flèche
    };

    // Crée un marker à la fin de la polyligne avec la flèche
    const arrowMarker = new google.maps.Marker({
      position: path[path.length - 1], // Dernier point de la polyligne
      map,
      icon: arrowSymbol,
    });

    return () => {
      polyline.setMap(null); // Supprimer la polyligne de la carte lorsqu'elle est démontée.
      arrowMarker.setMap(null); // Supprimer le marqueur de flèche lorsqu'il est démonté.
    };
  }, [map, path, options]);

  return null;
};
