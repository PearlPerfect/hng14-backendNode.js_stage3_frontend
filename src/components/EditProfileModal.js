'use client';
import { useState } from 'react';
import { updateProfile } from '@/lib/api';

export default function EditProfileModal({ profile, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    gender: profile.gender || '',
    age: profile.age || '',
    age_group: profile.age_group || '',
    country_id: profile.country_id || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ageGroups = ['child', 'teenager', 'adult', 'senior'];
  const genders = ['male', 'female'];
  const countries = [
    'NG', 'GH', 'KE', 'ZA', 'EG', 'MA', 'NG', 'TZ', 'UG', 'AO',
    'CM', 'CI', 'ZM', 'SN', 'ML', 'RW', 'BJ', 'NE', 'BF', 'GW'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const updated = await updateProfile(profile.id, formData);
      if (updated && updated.data) {
        onSave(updated.data);
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    fontFamily: 'JetBrains Mono',
    fontSize: 13,
    padding: '10px 14px',
    borderRadius: 8,
    outline: 'none',
    width: '100%',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: 8,
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 32,
        maxWidth: 500,
        width: '100%',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: 20,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
        
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Edit Profile</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
          ID: {profile.id}
        </p>

        {error && (
          <div style={{
            background: 'rgba(244,63,94,0.1)',
            border: '1px solid var(--danger)',
            borderRadius: 8,
            padding: 12,
            marginBottom: 20,
            color: 'var(--danger)',
            fontSize: 12,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              style={inputStyle}
              required
            >
              <option value="">Select gender</option>
              {genders.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Age</label>
            <input
              type="number"
              required
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
              style={inputStyle}
              min="0"
              max="120"
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Age Group</label>
            <select
              value={formData.age_group}
              onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
              style={inputStyle}
              required
            >
              <option value="">Select age group</option>
              {ageGroups.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Country</label>
            <select
              value={formData.country_id}
              onChange={(e) => setFormData({ ...formData, country_id: e.target.value })}
              style={inputStyle}
              required
            >
              <option value="">Select country</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 8,
                cursor: 'pointer',
                color: 'var(--text-primary)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: 'var(--accent)',
                border: 'none',
                borderRadius: 8,
                cursor: loading ? 'not-allowed' : 'pointer',
                color: '#000',
                fontSize: 12,
                fontWeight: 600,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}