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
      libraries={["marker"]}
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

    const polyline = new google.maps.Polyline({
      map,
      path,
      ...options,
    });

    return () => {
      polyline.setMap(null); // Supprimer la polyligne de la carte lorsqu'elle est démontée.
    };
  }, [map, path, options]);

  return null;
};