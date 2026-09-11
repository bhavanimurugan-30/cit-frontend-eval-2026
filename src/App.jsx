import React, { useEffect, useState } from 'react';

import InteractiveMap from './components/InteractiveMap';
import Sidebar from './components/Sidebar';
import AddLocationModal from './components/AddLocationModal';

export default function App() {
  // =========================================================
  // LOCATIONS (single source of truth for map + sidebar)
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
  // SELECTION + MODAL STATE
  // =========================================================

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [pendingCoords, setPendingCoords] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  // =========================================================
  // UI STATE
  // =========================================================

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletedLocation, setDeletedLocation] = useState(null);

  // =========================================================
  // SIDEBAR / MAP DARK-LIGHT THEME
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
  // PERSIST LOCATIONS
  // =========================================================

  useEffect(() => {
    try {
      localStorage.setItem('app_locations', JSON.stringify(locations));
    } catch (error) {
      console.error('Failed to save locations:', error);
    }
  }, [locations]);

  // =========================================================
  // PERSIST THEME
  // =========================================================

  useEffect(() => {
    try {
      localStorage.setItem('sidebar_theme', isDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save sidebar theme:', error);
    }
  }, [isDarkMode]);

  // =========================================================
  // MAP CLICK -> REVERSE GEOCODE -> OPEN "ADD" MODAL
  // =========================================================

  const handleMapClick = async (latlng) => {
    setIsGeocoding(true);

    // Close any modal/edit state left open from a previous action.
    setIsModalOpen(false);
    setEditingLocation(null);

    let placeName = '';

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
          latlng.lat
        )}&lon=${encodeURIComponent(latlng.lng)}&zoom=18&addressdetails=1`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      const address = data.address || {};

      // Priority: named place/POI -> road -> neighbourhood -> suburb ->
      // city district -> city -> town -> village -> municipality -> display name.
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

      if (!placeName) {
        placeName = `Location (${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)})`;
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      placeName = `Location (${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)})`;
    } finally {
      setIsGeocoding(false);
    }

    setPendingCoords({
      lat: latlng.lat,
      lng: latlng.lng,
      placeName,
    });

    setIsModalOpen(true);
  };

  // =========================================================
  // SAVE LOCATION (handles both "add" and "edit" flows)
  // =========================================================

  const handleSaveLocation = (locationData) => {
    if (editingLocation) {
      updateExistingLocation(locationData);
    } else if (pendingCoords) {
      addNewLocation(locationData);
    }

    setIsModalOpen(false);
    setPendingCoords(null);
    setEditingLocation(null);
  };

  const updateExistingLocation = (locationData) => {
    const updatedName =
      typeof locationData === 'string'
        ? locationData.trim()
        : locationData.name?.trim() || editingLocation.name || 'Unnamed Location';

    const updatedCategory =
      typeof locationData === 'object'
        ? locationData.category || 'Other'
        : editingLocation.category || 'Other';

    const updatedNotes =
      typeof locationData === 'object'
        ? locationData.notes || ''
        : editingLocation.notes || '';

    setLocations((previousLocations) =>
      previousLocations.map((location) =>
        location.id === editingLocation.id
          ? {
              ...location,
              name: updatedName,
              category: updatedCategory,
              notes: updatedNotes,
              isFavorite: location.isFavorite === true,
              createdAt: location.createdAt || Date.now(),
            }
          : location
      )
    );

    setSelectedLocation((previousSelected) =>
      previousSelected?.id === editingLocation.id
        ? { ...previousSelected, name: updatedName, category: updatedCategory, notes: updatedNotes }
        : previousSelected
    );
  };

  const addNewLocation = (locationData) => {
    const enteredName =
      typeof locationData === 'string' ? locationData.trim() : locationData.name?.trim();

    const newLocation = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,

      // User-entered name takes priority; reverse-geocoded name is the fallback.
      name: enteredName || pendingCoords.placeName || 'Unnamed Location',

      category: typeof locationData === 'object' ? locationData.category || 'Other' : 'Other',
      notes: typeof locationData === 'object' ? locationData.notes || '' : '',

      lat: pendingCoords.lat,
      lng: pendingCoords.lng,

      isFavorite: false,
      createdAt: Date.now(),
    };

    setLocations((previousLocations) => [...previousLocations, newLocation]);
    setSelectedLocation(newLocation);
  };

  // =========================================================
  // MODAL OPEN / CLOSE
  // =========================================================

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPendingCoords(null);
    setEditingLocation(null);
  };

  const handleEditLocation = (location, event) => {
    event?.stopPropagation();

    setEditingLocation(location);
    setPendingCoords(null);
    setIsModalOpen(true);
  };

  // =========================================================
  // DELETE + UNDO
  // =========================================================

  const handleDeleteLocation = (id, event) => {
    event?.stopPropagation();

    const locationToDelete = locations.find((location) => location.id === id);
    if (!locationToDelete) {
      return;
    }

    setDeletedLocation(locationToDelete);

    setLocations((previousLocations) =>
      previousLocations.filter((location) => location.id !== id)
    );

    if (selectedLocation?.id === id) {
      setSelectedLocation(null);
      removeLocationFromUrl();
    }

    // Auto-dismiss the undo toast after 5s unless a newer delete replaced it.
    setTimeout(() => {
      setDeletedLocation((current) => (current?.id === id ? null : current));
    }, 5000);
  };

  const handleUndoDelete = () => {
    if (!deletedLocation) {
      return;
    }

    setLocations((previousLocations) => {
      const alreadyExists = previousLocations.some(
        (location) => location.id === deletedLocation.id
      );

      return alreadyExists ? previousLocations : [...previousLocations, deletedLocation];
    });

    setSelectedLocation(deletedLocation);
    setLocationInUrl(deletedLocation.id);
    setDeletedLocation(null);
  };

  // =========================================================
  // FAVORITE TOGGLE
  // =========================================================

  const handleToggleFavorite = (id) => {
    setLocations((previousLocations) =>
      previousLocations.map((location) =>
        location.id === id ? { ...location, isFavorite: !location.isFavorite } : location
      )
    );

    setSelectedLocation((previousSelected) =>
      previousSelected?.id === id
        ? { ...previousSelected, isFavorite: !previousSelected.isFavorite }
        : previousSelected
    );
  };

  // =========================================================
  // SELECTION <-> URL SYNC
  // =========================================================

  const setLocationInUrl = (id) => {
    const url = new URL(window.location.href);
    url.searchParams.set('location', id);
    window.history.replaceState({}, '', url);
  };

  const removeLocationFromUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('location');
    window.history.replaceState({}, '', url);
  };

  const handleSelectLocationWithUrl = (location) => {
    setSelectedLocation(location);
    setLocationInUrl(location.id);

    if (window.innerWidth <= 768) {
      setIsMobileOpen(false);
    }
  };

  // Restore selection from a shared/reloaded URL once locations are loaded.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('location');

    if (!id) {
      return;
    }

    const location = locations.find((item) => String(item.id) === String(id));

    if (location) {
      setSelectedLocation(location);
    }
  }, [locations]);

  // =========================================================
  // MARKER DRAG (updates coordinates)
  // =========================================================

  const handleMarkerDrag = (id, newCoordinates) => {
    setLocations((previousLocations) =>
      previousLocations.map((location) =>
        location.id === id ? { ...location, ...newCoordinates } : location
      )
    );

    setSelectedLocation((previousSelected) =>
      previousSelected?.id === id
        ? { ...previousSelected, ...newCoordinates }
        : previousSelected
    );
  };

  // =========================================================
  // THEME TOGGLE
  // =========================================================

  const handleToggleTheme = () => {
    setIsDarkMode((previous) => !previous);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <Sidebar
        locations={locations}
        selectedLocation={selectedLocation}
        onSelectLocation={handleSelectLocationWithUrl}
        onEditLocation={handleEditLocation}
        onDeleteLocation={handleDeleteLocation}
        onToggleFavorite={handleToggleFavorite}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* MAP AREA */}
      <main className="map-area">
        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open sidebar"
        >
          ☰
        </button>

        {isGeocoding && (
          <div className="geocoding-loading">
            <span className="loading-spinner"></span>
            <span>Finding location...</span>
          </div>
        )}

        <InteractiveMap
          locations={locations}
          selectedLocation={selectedLocation}
          onMapClick={handleMapClick}
          onSelectLocation={handleSelectLocationWithUrl}
          onMarkerDrag={handleMarkerDrag}
          isDarkMode={isDarkMode}
        />
      </main>

      {/* ADD / EDIT MODAL */}
      <AddLocationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveLocation}
        initialName={editingLocation ? editingLocation.name : pendingCoords?.placeName || ''}
        initialCategory={editingLocation ? editingLocation.category : 'Home'}
        initialNotes={editingLocation ? editingLocation.notes : ''}
        isEditing={Boolean(editingLocation)}
      />

      {/* UNDO DELETE TOAST */}
      {deletedLocation && (
        <div className="undo-notification">
          <span>
            <strong>{deletedLocation.name}</strong> deleted
          </span>

          <button type="button" onClick={handleUndoDelete}>
            Undo
          </button>

          <button
            type="button"
            className="undo-close"
            onClick={() => setDeletedLocation(null)}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
