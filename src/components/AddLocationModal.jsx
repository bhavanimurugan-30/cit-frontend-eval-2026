import { useState } from 'react';

export default function AddLocationModal({
  isOpen,
  onClose,
  onSave,
  initialName = '',
  initialCategory = 'Home',
  initialNotes = '',
  isEditing = false,
}) {
  const [name, setName] = useState(initialName || '');
  const [category, setCategory] = useState(initialCategory || 'Home');
  const [notes, setNotes] = useState(initialNotes || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Location name is required.');
      return;
    }

    onSave({
      name: name.trim(),
      category,
      notes: notes.trim(),
    });

    setName('');
    setCategory('Home');
    setNotes('');
    setError('');
  };

  const handleClose = () => {
    setName('');
    setCategory('Home');
    setNotes('');
    setError('');
    onClose();
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(5px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '430px',
          background: '#ffffff',
          borderRadius: '18px',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            padding: '22px 24px 18px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                marginBottom: '5px',
              }}
            >
              <span style={{ fontSize: '22px' }}>📍</span>

              <h2
                style={{
                  margin: 0,
                  fontSize: '19px',
                  fontWeight: '700',
                  color: '#0f172a',
                }}
              >
                {isEditing ? 'Edit Location' : 'Add New Location'}
              </h2>
            </div>

            <p
              style={{
                margin: 0,
                fontSize: '12px',
                color: '#64748b',
              }}
            >
              {isEditing
                ? 'Update your saved location details.'
                : 'Save this place to your favorite locations.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            style={{
              width: '30px',
              height: '30px',
              border: 'none',
              borderRadius: '8px',
              background: '#f8fafc',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '17px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '22px 24px' }}>
            <div style={{ marginBottom: '18px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#334155',
                }}
              >
                Location Name <span style={{ color: '#ef4444' }}>*</span>
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="e.g. My Home"
                autoFocus
                style={{
                  width: '100%',
                  padding: '11px 13px',
                  boxSizing: 'border-box',
                  border: error
                    ? '1px solid #ef4444'
                    : '1px solid #cbd5e1',
                  borderRadius: '9px',
                  fontSize: '13px',
                  outline: 'none',
                  color: '#1e293b',
                  background: '#ffffff',
                }}
              />

              {error && (
                <p
                  style={{
                    margin: '6px 0 0',
                    color: '#ef4444',
                    fontSize: '11px',
                  }}
                >
                  {error}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#334155',
                }}
              >
                Category <span style={{ color: '#ef4444' }}>*</span>
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 13px',
                  boxSizing: 'border-box',
                  border: '1px solid #cbd5e1',
                  borderRadius: '9px',
                  fontSize: '13px',
                  outline: 'none',
                  color: '#1e293b',
                  background: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <option value="Home">🏠 Home</option>
                <option value="Work">💼 Work</option>
                <option value="College">🎓 College</option>
                <option value="Other">📍 Other</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#334155',
                }}
              >
                Notes <span style={{ color: '#94a3b8' }}>(Optional)</span>
              </label>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a note about this place..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '11px 13px',
                  boxSizing: 'border-box',
                  border: '1px solid #cbd5e1',
                  borderRadius: '9px',
                  fontSize: '13px',
                  outline: 'none',
                  color: '#1e293b',
                  background: '#ffffff',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          <div
            style={{
              padding: '15px 24px',
              background: '#f8fafc',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '9px',
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: '9px 16px',
                border: '1px solid #cbd5e1',
                borderRadius: '9px',
                background: '#ffffff',
                color: '#475569',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                padding: '9px 18px',
                border: 'none',
                borderRadius: '9px',
                background: '#4f46e5',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 3px 8px rgba(79, 70, 229, 0.25)',
              }}
            >
              {isEditing ? 'Save Changes' : 'Add Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}