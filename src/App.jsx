import React, { useEffect, useState } from 'react';

import InteractiveMap from './components/InteractiveMap';
import Sidebar from './components/Sidebar';
import AddLocationModal from './components/AddLocationModal';

export default function App() {
  // =========================================================
  // LOCATIONS
  // =========================================================

  const [locations, setLocations] = useState(() => {
    try {
      const saved = localStorage.getItem('app_locations');

      if (!saved) {
        return [];
      }

      const parsed = JSON.parse(saved);

      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Failed to load locations:', error);
      return [];
    }
  });

  // =========================================================
  // SELECTED LOCATION
  // =========================================================

  const [selectedLocation, setSelectedLocation] = useState(null);

  // =========================================================
  // PENDING MAP COORDINATES
  // =========================================================

  const [pendingCoords, setPendingCoords] = useState(null);

  // =========================================================
  // REVERSE GEOCODING LOADING
  // =========================================================

  const [isGeocoding, setIsGeocoding] = useState(false);

  // =========================================================
  // MODAL
  // =========================================================

  const [isModalOpen, setIsModalOpen] = useState(false);

  // =========================================================
  // EDITING LOCATION
  // =========================================================

  const [editingLocation, setEditingLocation] = useState(null);

  // =========================================================
  // MOBILE SIDEBAR
  // =========================================================

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // =========================================================
  // SEARCH
  // =========================================================

  const [searchQuery, setSearchQuery] = useState('');

  // =========================================================
  // UNDO DELETE
  // =========================================================

  const [deletedLocation, setDeletedLocation] = useState(null);

  // =========================================================
  // SIDEBAR DARK / LIGHT THEME
  // =========================================================

  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('sidebar_theme');

      return savedTheme === 'dark';
    } catch (error) {
      return false;
    }
  });

  // =========================================================
  // SAVE LOCATIONS
  // =========================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        'app_locations',
        JSON.stringify(locations)
      );
    } catch (error) {
      console.error('Failed to save locations:', error);
    }
  }, [locations]);

  // =========================================================
  // SAVE SIDEBAR THEME
  // =========================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        'sidebar_theme',
        isDarkMode ? 'dark' : 'light'
      );
    } catch (error) {
      console.error('Failed to save sidebar theme:', error);
    }
  }, [isDarkMode]);

  // =========================================================
  // MAP CLICK + REVERSE GEOCODING
  // =========================================================

  const handleMapClick = async (latlng) => {
    // ---------------------------------------------------------
    // START LOADING
    // ---------------------------------------------------------

    setIsGeocoding(true);

    // Close previous modal/edit state
    setIsModalOpen(false);
    setEditingLocation(null);

    // ---------------------------------------------------------
    // DEFAULT NAME
    // ---------------------------------------------------------

    let placeName = '';

    try {
      // -------------------------------------------------------
      // NOMINATIM REVERSE GEOCODING
      // -------------------------------------------------------

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
          latlng.lat
        )}&lon=${encodeURIComponent(
          latlng.lng
        )}&zoom=18&addressdetails=1`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Reverse geocoding failed: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        'Reverse geocoding response:',
        data
      );

      // -------------------------------------------------------
      // ADDRESS OBJECT
      // -------------------------------------------------------

      const address = data.address || {};

      // -------------------------------------------------------
      // FIND BEST PLACE NAME
      // -------------------------------------------------------

      placeName =
        data.name?.trim() ||
        address.road?.trim() ||
        address.neighbourhood?.trim() ||
        address.suburb?.trim() ||
        address.city_district?.trim() ||
        address.city?.trim() ||
        address.town?.trim() ||
        address.village?.trim() ||
        address.municipality?.trim() ||
        data.display_name?.trim() ||
        '';

      // -------------------------------------------------------
      // IF NOTHING WAS RETURNED
      // -------------------------------------------------------

      if (!placeName) {
        placeName = `Location (${latlng.lat.toFixed(
          5
        )}, ${latlng.lng.toFixed(5)})`;
      }
    } catch (error) {
      console.warn(
        'Reverse geocoding failed:',
        error
      );

      // -------------------------------------------------------
      // FALLBACK
      // -------------------------------------------------------

      placeName = `Location (${latlng.lat.toFixed(
        5
      )}, ${latlng.lng.toFixed(5)})`;
    } finally {
      setIsGeocoding(false);
    }

    // ---------------------------------------------------------
    // STORE COORDINATES + PLACE NAME
    // ---------------------------------------------------------

    setPendingCoords({
      lat: latlng.lat,
      lng: latlng.lng,
      placeName: placeName,
    });

    // ---------------------------------------------------------
    // OPEN MODAL
    // ---------------------------------------------------------

    setIsModalOpen(true);
  };

  // =========================================================
  // SAVE / EDIT LOCATION
  // =========================================================

  const handleSaveLocation = (locationData) => {
    // =======================================================
    // EDIT EXISTING LOCATION
    // =======================================================

    if (editingLocation) {
      const updatedName =
        typeof locationData === 'string'
          ? locationData.trim()
          : locationData.name?.trim() ||
            editingLocation.name ||
            'Unnamed Location';

      const updatedCategory =
        typeof locationData === 'object'
          ? locationData.category || 'Other'
          : editingLocation.category || 'Other';

      const updatedNotes =
        typeof locationData === 'object'
          ? locationData.notes || ''
          : editingLocation.notes || '';

      setLocations((previousLocations) =>
        previousLocations.map((location) => {
          if (
            location.id !== editingLocation.id
          ) {
            return location;
          }

          return {
            ...location,

            name: updatedName,

            category: updatedCategory,

            notes: updatedNotes,

            lat: location.lat,

            lng: location.lng,

            isFavorite:
              location.isFavorite === true,

            createdAt:
              location.createdAt || Date.now(),
          };
        })
      );

      // -------------------------------------------------------
      // UPDATE SELECTED LOCATION
      // -------------------------------------------------------

      setSelectedLocation((previousSelected) => {
        if (
          !previousSelected ||
          previousSelected.id !== editingLocation.id
        ) {
          return previousSelected;
        }

        return {
          ...previousSelected,

          name: updatedName,

          category: updatedCategory,

          notes: updatedNotes,
        };
      });
    }

    // =======================================================
    // ADD NEW LOCATION
    // =======================================================

    else if (pendingCoords) {
      const enteredName =
        typeof locationData === 'string'
          ? locationData.trim()
          : locationData.name?.trim();

      const newLocation = {
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`,

        // ---------------------------------------------------
        // USER NAME FIRST
        // REVERSE GEOCODED NAME SECOND
        // ---------------------------------------------------

        name:
          enteredName ||
          pendingCoords.placeName ||
          'Unnamed Location',

        category:
          typeof locationData === 'object'
            ? locationData.category || 'Other'
            : 'Other',

        notes:
          typeof locationData === 'object'
            ? locationData.notes || ''
            : '',

        lat: pendingCoords.lat,

        lng: pendingCoords.lng,

        isFavorite: false,

        createdAt: Date.now(),
      };

      setLocations((previousLocations) => [
        ...previousLocations,
        newLocation,
      ]);

      setSelectedLocation(newLocation);
    }

    // =======================================================
    // CLOSE MODAL
    // =======================================================

    setIsModalOpen(false);
    setPendingCoords(null);
    setEditingLocation(null);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPendingCoords(null);
    setEditingLocation(null);
  };

  // =========================================================
  // EDIT LOCATION
  // =========================================================

  const handleEditLocation = (location, event) => {
    if (event) {
      event.stopPropagation();
    }

    setEditingLocation(location);

    setPendingCoords(null);

    setIsModalOpen(true);
  };

  // =========================================================
  // DELETE LOCATION
  // =========================================================

  const handleDeleteLocation = (id, event) => {
    if (event) {
      event.stopPropagation();
    }

    const locationToDelete = locations.find(
      (location) => location.id === id
    );

    if (!locationToDelete) {
      return;
    }

    setDeletedLocation(locationToDelete);

    setLocations((previousLocations) =>
      previousLocations.filter(
        (location) => location.id !== id
      )
    );

    if (selectedLocation?.id === id) {
      setSelectedLocation(null);

      const url = new URL(
        window.location.href
      );

      url.searchParams.delete('location');

      window.history.replaceState(
        {},
        '',
        url
      );
    }

    setTimeout(() => {
      setDeletedLocation((current) => {
        if (current?.id === id) {
          return null;
        }

        return current;
      });
    }, 5000);
  };

  // =========================================================
  // UNDO DELETE
  // =========================================================

  const handleUndoDelete = () => {
    if (!deletedLocation) {
      return;
    }

    setLocations((previousLocations) => {
      const alreadyExists =
        previousLocations.some(
          (location) =>
            location.id === deletedLocation.id
        );

      if (alreadyExists) {
        return previousLocations;
      }

      return [
        ...previousLocations,
        deletedLocation,
      ];
    });

    setSelectedLocation(deletedLocation);

    const url = new URL(
      window.location.href
    );

    url.searchParams.set(
      'location',
      deletedLocation.id
    );

    window.history.replaceState(
      {},
      '',
      url
    );

    setDeletedLocation(null);
  };

  // =========================================================
  // TOGGLE FAVORITE
  // =========================================================

  const handleToggleFavorite = (id) => {
    setLocations((previousLocations) =>
      previousLocations.map((location) =>
        location.id === id
          ? {
              ...location,

              isFavorite:
                !location.isFavorite,
            }
          : location
      )
    );

    setSelectedLocation((previousSelected) => {
      if (
        !previousSelected ||
        previousSelected.id !== id
      ) {
        return previousSelected;
      }

      return {
        ...previousSelected,

        isFavorite:
          !previousSelected.isFavorite,
      };
    });
  };

  // =========================================================
  // SELECT LOCATION + URL
  // =========================================================

  const handleSelectLocationWithUrl = (location) => {
    setSelectedLocation(location);

    const url = new URL(
      window.location.href
    );

    url.searchParams.set(
      'location',
      location.id
    );

    window.history.replaceState(
      {},
      '',
      url
    );

    if (window.innerWidth <= 768) {
      setIsMobileOpen(false);
    }
  };

  // =========================================================
  // RESTORE LOCATION FROM URL
  // =========================================================

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const id = params.get('location');

    if (!id) {
      return;
    }

    const location = locations.find(
      (item) =>
        String(item.id) === String(id)
    );

    if (location) {
      setSelectedLocation(location);
    }
  }, [locations]);

  // =========================================================
  // MARKER DRAG
  // =========================================================

  const handleMarkerDrag = (
    id,
    newCoordinates
  ) => {
    setLocations((previousLocations) =>
      previousLocations.map((location) =>
        location.id === id
          ? {
              ...location,

              lat: newCoordinates.lat,

              lng: newCoordinates.lng,
            }
          : location
      )
    );

    setSelectedLocation((previousSelected) => {
      if (
        !previousSelected ||
        previousSelected.id !== id
      ) {
        return previousSelected;
      }

      return {
        ...previousSelected,

        lat: newCoordinates.lat,

        lng: newCoordinates.lng,
      };
    });
  };

  // =========================================================
  // TOGGLE SIDEBAR THEME
  // =========================================================

  const handleToggleTheme = () => {
    setIsDarkMode(
      (previous) => !previous
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="app-container">

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <Sidebar
        locations={locations}

        selectedLocation={selectedLocation}

        onSelectLocation={
          handleSelectLocationWithUrl
        }

        onEditLocation={
          handleEditLocation
        }

        onDeleteLocation={
          handleDeleteLocation
        }

        onToggleFavorite={
          handleToggleFavorite
        }

        searchQuery={searchQuery}

        setSearchQuery={setSearchQuery}

        isMobileOpen={isMobileOpen}

        setIsMobileOpen={setIsMobileOpen}

        isDarkMode={isDarkMode}

        onToggleTheme={
          handleToggleTheme
        }
      />

      {/* ===================================================
          MAP AREA
      =================================================== */}

      <main className="map-area">

        {/* MOBILE MENU */}

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() =>
            setIsMobileOpen(true)
          }
          aria-label="Open sidebar"
        >
          ☰
        </button>

        {/* =================================================
            REVERSE GEOCODING LOADING
        ================================================= */}

        {isGeocoding && (
          <div className="geocoding-loading">
            <span className="loading-spinner"></span>

            <span>
              Finding location...
            </span>
          </div>
        )}

        {/* =================================================
            MAP
        ================================================= */}

        <InteractiveMap
          locations={locations}
          selectedLocation={selectedLocation}
          onMapClick={handleMapClick}
          onSelectLocation={
            handleSelectLocationWithUrl
          }
          onMarkerDrag={handleMarkerDrag}
          isDarkMode={isDarkMode}
        />

      </main>

      {/* ===================================================
          ADD / EDIT MODAL
      =================================================== */}

      <AddLocationModal
        isOpen={isModalOpen}

        onClose={handleCloseModal}

        onSave={handleSaveLocation}

        initialName={
          editingLocation
            ? editingLocation.name
            : pendingCoords?.placeName || ''
        }

        initialCategory={
          editingLocation
            ? editingLocation.category
            : 'Home'
        }

        initialNotes={
          editingLocation
            ? editingLocation.notes
            : ''
        }

        isEditing={
          Boolean(editingLocation)
        }
      />

      {/* ===================================================
          UNDO DELETE
      =================================================== */}

      {deletedLocation && (
        <div className="undo-notification">

          <span>
            <strong>
              {deletedLocation.name}
            </strong>{' '}
            deleted
          </span>

          <button
            type="button"
            onClick={
              handleUndoDelete
            }
          >
            Undo
          </button>

          <button
            type="button"
            className="undo-close"
            onClick={() =>
              setDeletedLocation(null)
            }
            aria-label="Close notification"
          >
            ✕
          </button>

        </div>
      )}

    </div>
  );
}