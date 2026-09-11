import React, { useEffect, useRef, useState } from 'react';

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';

import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';


/* =========================================================
   DEFAULT MARKER
========================================================= */

const defaultIcon = new L.Icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


/* =========================================================
   SELECTED MARKER
========================================================= */

const selectedIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',

  shadowUrl: markerShadow,

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


/* =========================================================
   LIGHT MAP TILE
   OpenStreetMap - NO API KEY REQUIRED
========================================================= */

const LIGHT_TILE_URL =
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';


/* =========================================================
   MAP CLICK
========================================================= */

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(event) {
      onMapClick(event.latlng);
    },
  });

  return null;
}


/* =========================================================
   MAP FOCUS
========================================================= */

function MapFocusHandler({ selectedLocation }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedLocation) {
      return;
    }

    const lat = Number(selectedLocation.lat);
    const lng = Number(selectedLocation.lng);

    if (
      Number.isNaN(lat) ||
      Number.isNaN(lng)
    ) {
      return;
    }

    map.flyTo(
      [lat, lng],
      15,
      {
        duration: 1.2,
      }
    );
  }, [selectedLocation, map]);

  return null;
}


/* =========================================================
   KEYBOARD ACCESSIBILITY
========================================================= */

function KeyboardMapHandler({
  locations,
  onSelectLocation,
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {

      /*
        Alt + number selects location.

        Alt + 1 → first location
        Alt + 2 → second location
      */

      if (!event.altKey) {
        return;
      }

      if (event.key < '1' || event.key > '9') {
        return;
      }

      const index = Number(event.key) - 1;

      const location = locations[index];

      if (!location) {
        return;
      }

      event.preventDefault();

      onSelectLocation(location);
    };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [locations, onSelectLocation]);

  return null;
}


/* =========================================================
   TILE THEME SYNC

   react-leaflet's TileLayer only re-applies the `opacity`
   and `zIndex` props reactively (see updateGridLayer in
   @react-leaflet/core). The `className` prop is only used
   once, at layer creation time, so toggling isDarkMode never
   updates the tile container's class on its own.

   This grabs the underlying Leaflet layer via ref and toggles
   the dark-mode class directly on its DOM container whenever
   isDarkMode changes.
========================================================= */

function useTileThemeSync(tileLayerRef, isDarkMode) {
  useEffect(() => {
    const layer = tileLayerRef.current;
    const container = layer?.getContainer?.();

    if (!container) {
      return;
    }

    container.classList.toggle('dark-map-tiles', isDarkMode);
  }, [isDarkMode, tileLayerRef]);
}


/* =========================================================
   MAIN MAP
========================================================= */

export default function InteractiveMap({
  locations,
  selectedLocation,
  onMapClick,
  onSelectLocation,
  onMarkerClick,
  onMarkerDrag,
  isDarkMode,
}) {

  const tileLayerRef = useRef(null);

  useTileThemeSync(tileLayerRef, isDarkMode);

  // Alt+1-9 shortcuts only work with a physical keyboard, so the hint
  // in the popup is hidden on mobile-width screens where it isn't useful.
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= 768
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMarkerSelect = (location) => {

    if (onSelectLocation) {
      onSelectLocation(location);
      return;
    }

    if (onMarkerClick) {
      onMarkerClick(location);
    }
  };


  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >

      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        scrollWheelZoom={true}
        style={{
          width: '100%',
          height: '100%',
        }}
      >

        {/* =================================================
            MAP TILES

            LIGHT:
            Normal OpenStreetMap

            DARK:
            Same OpenStreetMap tiles with CSS dark filter

            NO API KEY REQUIRED
        ================================================= */}

        <TileLayer
          ref={tileLayerRef}
          attribution="&copy; OpenStreetMap contributors"
          url={LIGHT_TILE_URL}
          className={
            isDarkMode
              ? 'dark-map-tiles'
              : ''
          }
        />


        {/* =================================================
            MAP CLICK HANDLER
        ================================================= */}

        <MapClickHandler
          onMapClick={onMapClick}
        />


        {/* =================================================
            SELECTED LOCATION FOCUS
        ================================================= */}

        <MapFocusHandler
          selectedLocation={selectedLocation}
        />


        {/* =================================================
            KEYBOARD ACCESSIBILITY
        ================================================= */}

        <KeyboardMapHandler
          locations={locations}
          onSelectLocation={handleMarkerSelect}
        />


        {/* =================================================
            MARKERS
        ================================================= */}

        {locations.map((location, index) => {

          const isSelected =
            selectedLocation?.id === location.id;

          const lat = Number(location.lat);
          const lng = Number(location.lng);

          if (
            Number.isNaN(lat) ||
            Number.isNaN(lng)
          ) {
            return null;
          }


          return (
            <Marker
              key={location.id}

              position={[
                lat,
                lng,
              ]}

              icon={
                isSelected
                  ? selectedIcon
                  : defaultIcon
              }

              draggable={true}

              eventHandlers={{

                /* ===============================
                   CLICK
                =============================== */

                click: () => {
                  handleMarkerSelect(location);
                },


                /* ===============================
                   DRAG
                =============================== */

                dragend: (event) => {

                  const marker =
                    event.target;

                  const position =
                    marker.getLatLng();

                  if (onMarkerDrag) {
                    onMarkerDrag(
                      location.id,
                      {
                        lat: position.lat,
                        lng: position.lng,
                      }
                    );
                  }
                },

              }}

            >

              {/* =================================================
                  POPUP
              ================================================= */}

              <Popup>

                <div
                  style={{
                    minWidth: '230px',
                    fontFamily:
                      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  }}
                >

                  {/* NAME */}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >

                    <strong
                      style={{
                        fontSize: '16px',
                        color:
                          '#1e293b',
                      }}
                    >
                      {location.name ||
                        'Unnamed Location'}
                    </strong>


                    {location.isFavorite && (
                      <span
                        style={{
                          fontSize: '18px',
                        }}
                        title="Favorite"
                      >
                        ⭐
                      </span>
                    )}

                  </div>


                  {/* CATEGORY */}

                  <div
                    style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '999px',

                      backgroundColor:
                        location.category ===
                        'Home'
                          ? '#dcfce7'
                          : location.category ===
                            'Work'
                          ? '#dbeafe'
                          : '#f1f5f9',

                      color:
                        location.category ===
                        'Home'
                          ? '#166534'
                          : location.category ===
                            'Work'
                          ? '#1d4ed8'
                          : '#475569',

                      fontSize: '11px',
                      fontWeight: '600',
                      marginBottom: '10px',
                    }}
                  >
                    {location.category ||
                      'Other'}
                  </div>


                  {/* NOTES */}

                  {location.notes && (
                    <div
                      style={{
                        borderTop:
                          '1px solid #e2e8f0',

                        paddingTop: '8px',
                        marginBottom: '8px',

                        color: '#475569',
                        fontSize: '12px',
                      }}
                    >
                      <strong>
                        Notes:
                      </strong>{' '}
                      {location.notes}
                    </div>
                  )}


                  {/* DETAILS */}

                  <div
                    style={{
                      borderTop:
                        '1px solid #e2e8f0',
                      paddingTop: '8px',
                    }}
                  >

                    {/* ID */}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        marginBottom: '5px',
                      }}
                    >

                      <span
                        style={{
                          color: '#64748b',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}
                      >
                        ID
                      </span>

                      <span
                        style={{
                          color: '#334155',
                          fontSize: '10px',
                          fontFamily:
                            'monospace',
                          marginLeft: '10px',
                        }}
                      >
                        {location.id}
                      </span>

                    </div>


                    {/* LATITUDE */}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        marginBottom: '5px',
                      }}
                    >

                      <span
                        style={{
                          color: '#64748b',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}
                      >
                        Latitude
                      </span>

                      <span
                        style={{
                          color: '#334155',
                          fontSize: '11px',
                          fontFamily:
                            'monospace',
                        }}
                      >
                        {lat.toFixed(6)}
                      </span>

                    </div>


                    {/* LONGITUDE */}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        marginBottom: '5px',
                      }}
                    >

                      <span
                        style={{
                          color: '#64748b',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}
                      >
                        Longitude
                      </span>

                      <span
                        style={{
                          color: '#334155',
                          fontSize: '11px',
                          fontFamily:
                            'monospace',
                        }}
                      >
                        {lng.toFixed(6)}
                      </span>

                    </div>


                    {/* CREATED */}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                      }}
                    >

                      <span
                        style={{
                          color: '#64748b',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}
                      >
                        Created
                      </span>

                      <span
                        style={{
                          color: '#334155',
                          fontSize: '11px',
                        }}
                      >
                        {location.createdAt
                          ? new Date(
                              location.createdAt
                            ).toLocaleDateString()
                          : '—'}
                      </span>

                    </div>

                  </div>


                  {/* SELECTED */}

                  {isSelected && (
                    <div
                      style={{
                        marginTop: '10px',
                        paddingTop: '8px',
                        borderTop:
                          '1px solid #e2e8f0',
                        color: '#dc2626',
                        fontSize: '11px',
                        fontWeight: '700',
                      }}
                    >
                      ● Currently Selected
                    </div>
                  )}


                  {/* KEYBOARD */}

                  {index < 9 && !isMobile && (
                    <div
                      style={{
                        marginTop: '8px',
                        color: '#94a3b8',
                        fontSize: '10px',
                      }}
                    >
                      ⌨️ Alt + {index + 1}
                      {' '}
                      to select
                    </div>
                  )}


                  {/* DRAG */}

                  <div
                    style={{
                      marginTop: '6px',
                      color: '#94a3b8',
                      fontSize: '10px',
                    }}
                  >
                    💡 Drag marker to update
                    coordinates
                  </div>

                </div>

              </Popup>

            </Marker>
          );
        })}

      </MapContainer>

    </div>
  );
}