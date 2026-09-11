import React from 'react';

/* =========================================================
   LOCATION POPUP

   Content shown inside a marker's Leaflet <Popup>.
   Extracted out of InteractiveMap.jsx so that file only
   deals with map/marker wiring, not popup markup.
========================================================= */

export default function LocationPopup({
  location,
  isSelected,
  lat,
  lng,
  index,
  isMobile,
}) {
  return (
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
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >

        <strong
          style={{
            fontSize: '16px',
            color: '#1e293b',
          }}
        >
          {location.name || 'Unnamed Location'}
        </strong>

        {location.isFavorite && (
          <span
            style={{ fontSize: '18px' }}
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
            location.category === 'Home'
              ? '#dcfce7'
              : location.category === 'Work'
              ? '#dbeafe'
              : '#f1f5f9',

          color:
            location.category === 'Home'
              ? '#166534'
              : location.category === 'Work'
              ? '#1d4ed8'
              : '#475569',

          fontSize: '11px',
          fontWeight: '600',
          marginBottom: '10px',
        }}
      >
        {location.category || 'Other'}
      </div>

      {/* NOTES */}

      {location.notes && (
        <div
          style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: '8px',
            marginBottom: '8px',
            color: '#475569',
            fontSize: '12px',
          }}
        >
          <strong>Notes:</strong> {location.notes}
        </div>
      )}

      {/* DETAILS */}

      <div
        style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '8px',
        }}
      >

        {/* ID */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
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
              fontFamily: 'monospace',
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
            justifyContent: 'space-between',
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
              fontFamily: 'monospace',
            }}
          >
            {lat.toFixed(6)}
          </span>
        </div>

        {/* LONGITUDE */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
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
              fontFamily: 'monospace',
            }}
          >
            {lng.toFixed(6)}
          </span>
        </div>

        {/* CREATED */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
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
              ? new Date(location.createdAt).toLocaleDateString()
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
            borderTop: '1px solid #e2e8f0',
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
          ⌨️ Alt + {index + 1} to select
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
        💡 Drag marker to update coordinates
      </div>

    </div>
  );
}