import  { useMemo, useState } from 'react';

export default function Sidebar({
  locations,
  selectedLocation,
  onSelectLocation,
  onEditLocation,
  onDeleteLocation,
  onToggleFavorite,
  searchQuery,
  setSearchQuery,
  isMobileOpen,
  setIsMobileOpen,
  isDarkMode,
  onToggleTheme,
}) {
  const [sortBy, setSortBy] = useState('newest');
  const [category, setCategory] = useState('All');

  // =========================================================
  // FILTER + SEARCH + SORT
  // =========================================================

  const displayedLocations = useMemo(() => {
    let result = [...locations];

    if (category !== 'All') {
      result = result.filter(
        (location) =>
          (location.category || 'Other') === category
      );
    }

    const query = String(searchQuery || '')
      .trim()
      .toLowerCase();

    if (query) {
      result = result.filter((location) => {
        const name = String(
          location.name || ''
        ).toLowerCase();

        const notes = String(
          location.notes || ''
        ).toLowerCase();

        const locationCategory = String(
          location.category || 'Other'
        ).toLowerCase();

        return (
          name.includes(query) ||
          notes.includes(query) ||
          locationCategory.includes(query)
        );
      });
    }

    if (sortBy === 'newest') {
      result.sort(
        (a, b) =>
          (Number(b.createdAt) || 0) -
          (Number(a.createdAt) || 0)
      );
    }

    if (sortBy === 'oldest') {
      result.sort(
        (a, b) =>
          (Number(a.createdAt) || 0) -
          (Number(b.createdAt) || 0)
      );
    }

    if (sortBy === 'name') {
      result.sort((a, b) =>
        String(a.name || '')
          .trim()
          .toLowerCase()
          .localeCompare(
            String(b.name || '')
              .trim()
              .toLowerCase()
          )
      );
    }

    if (sortBy === 'favorites') {
      result = result.filter(
        (location) =>
          location.isFavorite === true
      );

      result.sort(
        (a, b) =>
          (Number(b.createdAt) || 0) -
          (Number(a.createdAt) || 0)
      );
    }

    return result;
  }, [
    locations,
    category,
    searchQuery,
    sortBy,
  ]);

  // =========================================================
  // SELECT
  // =========================================================

  const handleSelect = (location) => {
    if (onSelectLocation) {
      onSelectLocation(location);
    }

    if (window.innerWidth <= 768) {
      setIsMobileOpen(false);
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (event, location) => {
    event.stopPropagation();

    if (onEditLocation) {
      onEditLocation(location, event);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = (event, location) => {
    event.stopPropagation();

    if (onDeleteLocation) {
      onDeleteLocation(location.id, event);
    }
  };

  // =========================================================
  // FAVORITE
  // =========================================================

  const handleFavorite = (event, location) => {
    event.stopPropagation();

    if (onToggleFavorite) {
      onToggleFavorite(location.id);
    }
  };

  // =========================================================
  // CATEGORY CLASS
  // =========================================================

  const getCategoryClass = (value) => {
    if (value === 'Home') {
      return 'category-home';
    }

    if (value === 'Work') {
      return 'category-work';
    }

    if (value === 'College') {
      return 'category-college';
    }

    return 'category-other';
  };

  // =========================================================
  // CATEGORY ICON
  // =========================================================

  const getCategoryIcon = (value) => {
    if (value === 'Home') {
      return '🏠';
    }

    if (value === 'Work') {
      return '💼';
    }

    if (value === 'College') {
      return '🎓';
    }

    return '📍';
  };

  // =========================================================
  // DATE
  // =========================================================

  const formatCreatedAt = (createdAt) => {
    if (!createdAt) {
      return '—';
    }

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // =========================================================
  // VIEW LABEL
  // =========================================================

  const getViewLabel = () => {
    if (sortBy === 'newest') {
      return 'Latest first';
    }

    if (sortBy === 'oldest') {
      return 'Oldest first';
    }

    if (sortBy === 'name') {
      return 'A → Z';
    }

    return 'Favorites';
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {/* MOBILE OVERLAY */}

      {isMobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`sidebar ${
          isMobileOpen ? 'sidebar-open' : ''
        } ${
          isDarkMode
            ? 'sidebar-dark'
            : 'sidebar-light'
        }`}
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="sidebar-header">
          <div className="sidebar-header-title">
            <h1>Saved Locations</h1>

            <p>
              {locations.length}{' '}
              {locations.length === 1
                ? 'location'
                : 'locations'}{' '}
              saved
            </p>
          </div>

          <div className="sidebar-header-actions">
            {/* THEME */}

            <button
              type="button"
              className="sidebar-theme-toggle"
              onClick={onToggleTheme}
              aria-label={`Switch to ${
                isDarkMode ? 'light' : 'dark'
              } mode`}
              title={`Switch to ${
                isDarkMode ? 'light' : 'dark'
              } mode`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {/* MOBILE CLOSE */}

            <button
              type="button"
              className="mobile-close-button"
              onClick={() =>
                setIsMobileOpen(false)
              }
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ===================================================
            SEARCH
        =================================================== */}

        <div className="sidebar-search">
          <div className="search-box">
            <span className="search-icon">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              aria-label="Search locations"
            />

            {searchQuery && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ===================================================
            CATEGORY
        =================================================== */}

        <div className="filter-section">
          <div className="filter-title">
            <span>Category</span>

            <span>
              {displayedLocations.length} shown
            </span>
          </div>

          <div className="category-buttons">
            <button
              type="button"
              className={`category-filter ${
                category === 'All'
                  ? 'active'
                  : ''
              }`}
              onClick={() => setCategory('All')}
            >
              All
            </button>

            <button
              type="button"
              className={`category-filter ${
                category === 'Home'
                  ? 'active home-active'
                  : ''
              }`}
              onClick={() => setCategory('Home')}
            >
              🏠 Home
            </button>

            <button
              type="button"
              className={`category-filter ${
                category === 'Work'
                  ? 'active work-active'
                  : ''
              }`}
              onClick={() => setCategory('Work')}
            >
              💼 Work
            </button>

            <button
              type="button"
              className={`category-filter ${
                category === 'College'
                  ? 'active college-active'
                  : ''
              }`}
              onClick={() =>
                setCategory('College')
              }
            >
              🎓 College
            </button>

            <button
              type="button"
              className={`category-filter ${
                category === 'Other'
                  ? 'active other-active'
                  : ''
              }`}
              onClick={() => setCategory('Other')}
            >
              📍 Other
            </button>
          </div>
        </div>

        {/* ===================================================
            VIEW
        =================================================== */}

        <div className="filter-section view-section">
          <div className="filter-title">
            <span>View</span>

            <span>{getViewLabel()}</span>
          </div>

          <div className="view-buttons">
            <button
              type="button"
              className={`view-button ${
                sortBy === 'newest'
                  ? 'active'
                  : ''
              }`}
              onClick={() => setSortBy('newest')}
            >
              Newest
            </button>

            <button
              type="button"
              className={`view-button ${
                sortBy === 'oldest'
                  ? 'active'
                  : ''
              }`}
              onClick={() => setSortBy('oldest')}
            >
              Oldest
            </button>

            <button
              type="button"
              className={`view-button ${
                sortBy === 'name'
                  ? 'active'
                  : ''
              }`}
              onClick={() => setSortBy('name')}
            >
              Name
            </button>

            <button
              type="button"
              className={`view-button ${
                sortBy === 'favorites'
                  ? 'favorite-active'
                  : ''
              }`}
              onClick={() =>
                setSortBy('favorites')
              }
            >
              ⭐ Favorites
            </button>
          </div>
        </div>

        {/* ===================================================
            LOCATION LIST
            ONLY THIS AREA SCROLLS
        =================================================== */}

        <div className="location-list">
          {/* NO LOCATIONS */}

          {locations.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                📍
              </div>

              <h3>No locations saved</h3>

              <p>
                Click anywhere on the map to add
                your first location.
              </p>
            </div>
          )}

          {/* NO RESULTS */}

          {locations.length > 0 &&
            displayedLocations.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  🔍
                </div>

                <h3>
                  {sortBy === 'favorites'
                    ? 'No favorite locations'
                    : 'No matches found'}
                </h3>

                <p>
                  {sortBy === 'favorites'
                    ? 'Click the star on a location to add it to favorites.'
                    : 'Try another search or category.'}
                </p>
              </div>
            )}

          {/* LOCATION CARDS */}

          {displayedLocations.length > 0 && (
            <div className="location-cards">
              {displayedLocations.map(
                (location) => {
                  const isSelected =
                    selectedLocation?.id ===
                    location.id;

                  const isFavorite =
                    location.isFavorite === true;

                  const locationCategory =
                    location.category || 'Other';

                  return (
                    <div
                      key={location.id}
                      className={`location-card ${
                        isSelected
                          ? 'location-card-selected'
                          : ''
                      }`}
                      onClick={() =>
                        handleSelect(location)
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter' ||
                          event.key === ' '
                        ) {
                          event.preventDefault();
                          handleSelect(location);
                        }
                      }}
                    >
                      {/* SELECTED BAR */}

                      {isSelected && (
                        <div className="selected-bar" />
                      )}

                      {/* CARD HEADER */}

                      <div className="card-header">
                        <div className="card-title-area">
                          <h3
                            title={
                              location.name ||
                              'Unnamed Location'
                            }
                          >
                            {location.name ||
                              'Unnamed Location'}
                          </h3>

                          {isFavorite && (
                            <span
                              className="favorite-star"
                              title="Favorite"
                            >
                              ★
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className={`favorite-button ${
                            isFavorite
                              ? 'favorite-button-active'
                              : ''
                          }`}
                          onClick={(event) =>
                            handleFavorite(
                              event,
                              location
                            )
                          }
                          title={
                            isFavorite
                              ? 'Remove from favorites'
                              : 'Add to favorites'
                          }
                          aria-label={
                            isFavorite
                              ? 'Remove from favorites'
                              : 'Add to favorites'
                          }
                        >
                          {isFavorite ? '★' : '☆'}
                        </button>
                      </div>

                      {/* CATEGORY */}

                      <span
                        className={`location-category ${getCategoryClass(
                          locationCategory
                        )}`}
                      >
                        {getCategoryIcon(
                          locationCategory
                        )}{' '}
                        {locationCategory}
                      </span>

                      {/* COORDINATES */}

                      <div className="coordinates">
                        {Number(location.lat).toFixed(
                          4
                        )}
                        ,{' '}
                        {Number(location.lng).toFixed(
                          4
                        )}
                      </div>

                      {/* NOTES */}

                      {location.notes && (
                        <p className="location-notes">
                          {location.notes}
                        </p>
                      )}

                      {/* DATE */}

                      <div className="created-date">
                        Added{' '}
                        {formatCreatedAt(
                          location.createdAt
                        )}
                      </div>

                      {/* ACTIONS */}

                      <div className="card-actions">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={(event) =>
                            handleEdit(
                              event,
                              location
                            )
                          }
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={(event) =>
                            handleDelete(
                              event,
                              location
                            )
                          }
                        >
                          🗑️ Delete
                        </button>
                      </div>

                      {/* SELECTED STATUS */}

                      {isSelected && (
                        <div className="selected-status">
                          ● Currently Selected
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}