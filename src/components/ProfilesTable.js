'use client';
import { useState } from 'react';
import ProfileModal from './ProfileModal';
import Pagination from './Pagination';

function GenderBadge({ gender }) {
  const style = gender === 'male'
    ? { background: 'rgba(56,189,248,.12)', color: '#38bdf8', border: '1px solid rgba(56,189,248,.25)' }
    : { background: 'rgba(167,139,250,.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,.25)' };
  return (
    <span style={{ ...style, fontFamily: 'JetBrains Mono', fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
      {gender}
    </span>
  );
}

function AgeBadge({ group }) {
  return (
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(0,229,160,.08)', color: '#00e5a0', border: '1px solid rgba(0,229,160,.2)' }}>
      {group}
    </span>
  );
}

export default function ProfilesTable({ data, page, totalPages, total, limit, onPageChange, userRole, onProfileUpdate }) {
  const [selected, setSelected] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);

  if (!data?.length) {
    return <div style={{ textAlign: 'center', padding: 48, fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--text-secondary)' }}>No profiles found.</div>;
  }

  const handleRowClick = (profile) => {
    setSelected(profile);
  };

  const handleEdit = (profile, e) => {
    e.stopPropagation();
    setEditingProfile(profile);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditingProfile(null);
  };

  const handleSaveEdit = (updatedProfile) => {
    if (onProfileUpdate) {
      onProfileUpdate(updatedProfile);
    }
    handleCloseEdit();
    // Update the selected profile if it was the one being edited
    if (selected && selected.id === updatedProfile.id) {
      setSelected(updatedProfile);
    }
  };

  return (
    <>
      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Name', 'Gender', 'Age', 'Age Group', 'Country', 'Country Name', 'G. Prob.', 'Actions'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '12px 14px',
                  background: 'var(--bg-secondary)', fontFamily: 'JetBrains Mono',
                  fontSize: 10, color: 'var(--text-secondary)', letterSpacing: '.08em',
                  textTransform: 'uppercase', borderBottom: '1px solid var(--border)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr
                key={p.id}
                onClick={() => handleRowClick(p)}
                style={{ cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>{p.name}</td>
                <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}><GenderBadge gender={p.gender} /></td>
                <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', fontFamily: 'JetBrains Mono' }}>{p.age}</td>
                <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}><AgeBadge group={p.age_group} /></td>
                <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', fontFamily: 'JetBrains Mono', color: '#38bdf8' }}>{p.country_id}</td>
                <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{p.country_name || '—'}</td>
                <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>{((p.gender_probability || 0) * 100).toFixed(0)}%</td>
                <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                  {userRole === 'admin' && (
                    <button
                      onClick={(e) => handleEdit(p, e)}
                      style={{
                        padding: '4px 12px',
                        background: 'var(--accent)',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#000',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onChange={onPageChange} />
      
      <ProfileModal 
        profile={selected} 
        onClose={() => setSelected(null)} 
        userRole={userRole}
        onEdit={handleEdit}
      />
      
      {showEditModal && editingProfile && (
        <EditProfileModal
          profile={editingProfile}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
}