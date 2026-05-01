'use client';
import { useState, useEffect } from 'react';
import { getProfiles, createProfile, deleteProfile } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function ProfileManagement({ userRole, onProfileUpdate, onStatsUpdate }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 15 });

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles(page = 1) {
    setLoading(true);
    try {
      const data = await getProfiles({ page, limit: 15 });
      console.log('Profiles data:', data);
      setProfiles(data?.data || []);
      setMeta({
        page: data?.page || 1,
        totalPages: data?.total_pages || 1,
        total: data?.total || 0,
        limit: data?.limit || 15,
      });
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  }

  async function refreshStats() {
    // Call the parent's stats update function
    if (onStatsUpdate) {
      await onStatsUpdate();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a name');
      return;
    }
    
    setSubmitting(true);
    let loadingToastId = null;
    
    try {
      loadingToastId = toast.loading('Creating profile...');
      
      const result = await createProfile(formData.name);
      console.log('Create profile result:', result);
      
      toast.dismiss(loadingToastId);
      
      if (result && (result.data || result.status === 'success')) {
        const newProfile = result.data || result;
        
        toast.success(
          `✅ Profile Created Successfully!\n\n` +
          `📝 Name: ${newProfile.name}\n` +
          `🚻 Gender: ${newProfile.gender || 'N/A'}\n` +
          `🎂 Age: ${newProfile.age || 'N/A'}\n` +
          `🌍 Country: ${newProfile.country_id || 'N/A'}`,
          { 
            duration: 5000,
            style: {
              whiteSpace: 'pre-line',
              maxWidth: 400,
            }
          }
        );
        
        setShowModal(false);
        setFormData({ name: '' });
        await loadProfiles();
        
        // Update stats immediately
        await refreshStats();
        
        if (onProfileUpdate) {
          onProfileUpdate(result.data);
        }
      } else {
        toast.error('Failed to create profile. Please try again.');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      toast.error('Failed to create profile: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteProfile(id, profileName) {
    if (confirm(`Are you sure you want to delete "${profileName}"? This action cannot be undone.`)) {
      const loadingToastId = toast.loading('Deleting profile...');
      
      try {
        await deleteProfile(id);
        toast.dismiss(loadingToastId);
        toast.success(`Profile "${profileName}" deleted successfully`, { duration: 3000 });
        await loadProfiles();
        
        // Update stats immediately
        await refreshStats();
      } catch (error) {
        console.error('Error deleting profile:', error);
        toast.dismiss(loadingToastId);
        toast.error('Failed to delete profile');
      }
    }
  }

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

  const buttonPrimaryStyle = {
    background: 'var(--accent)',
    border: 'none',
    color: '#000',
    fontFamily: 'JetBrains Mono',
    fontSize: 12,
    fontWeight: 600,
    padding: '10px 20px',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid rgba(0,229,160,0.1)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p>Loading profiles...</p>
      </div>
    );
  }

  return (
    <div>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            fontFamily: 'JetBrains Mono',
            fontSize: 13,
          },
          success: {
            iconTheme: {
              primary: 'var(--accent)',
              secondary: '#000',
            },
            duration: 5000,
          },
          error: {
            iconTheme: {
              primary: 'var(--danger)',
              secondary: '#fff',
            },
            duration: 4000,
          },
        }}
      />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Profile Management</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Create new profiles - The system will automatically generate demographic data
          </p>
        </div>
        <button 
          onClick={() => {
            setFormData({ name: '' });
            setShowModal(true);
          }} 
          style={buttonPrimaryStyle}
        >
          + Add New Profile
        </button>
      </div>

      {profiles.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: 48, 
          background: 'var(--bg-secondary)',
          borderRadius: 8,
          border: '1px solid var(--border)'
        }}>
          <p style={{ color: 'var(--text-secondary)' }}>No profiles found. Click "Add New Profile" to create one.</p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>ID</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Name</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Gender</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Age</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Age Group</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Country</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Created At</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono', fontSize: 12 }}>{profile.id}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{profile.name}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        background: profile.gender === 'male' ? 'rgba(56,189,248,0.1)' : 'rgba(167,139,250,0.1)',
                        color: profile.gender === 'male' ? '#38bdf8' : '#a78bfa',
                      }}>
                        {profile.gender || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{profile.age || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {profile.age_group && (
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          background: 'rgba(0,229,160,0.1)',
                          color: 'var(--accent)',
                        }}>
                          {profile.age_group}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono', fontSize: 12 }}>{profile.country_id || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>
                      {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button 
                        onClick={() => handleDeleteProfile(profile.id, profile.name)} 
                        style={{
                          padding: '6px 12px',
                          background: 'var(--danger)',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#fff',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Simple Pagination for Profile Management */}
          {meta.totalPages > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              marginTop: 20,
              padding: '16px 0',
            }}>
              <button
                onClick={() => loadProfiles(meta.page - 1)}
                disabled={meta.page <= 1}
                style={{
                  padding: '6px 14px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  cursor: meta.page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: meta.page <= 1 ? 0.5 : 1,
                  color: 'var(--text-primary)',
                }}
              >
                ← Previous
              </button>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Page {meta.page} of {meta.totalPages} · {meta.total} total
              </span>
              <button
                onClick={() => loadProfiles(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                style={{
                  padding: '6px 14px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  cursor: meta.page >= meta.totalPages ? 'not-allowed' : 'pointer',
                  opacity: meta.page >= meta.totalPages ? 0.5 : 1,
                  color: 'var(--text-primary)',
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Add Profile Modal */}
      {showModal && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
        >
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 12,
            padding: 32,
            width: '100%',
            maxWidth: 450,
            border: '1px solid var(--border)',
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Add New Profile</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
              Enter a name - The system will automatically generate demographic data
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g., John Doe, Mary Smith"
                  autoFocus
                  disabled={submitting}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  disabled={submitting}
                  style={{
                    padding: '10px 20px',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: 12,
                    fontWeight: 600,
                    opacity: submitting ? 0.5 : 1,
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--accent)',
                    border: 'none',
                    borderRadius: 8,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    color: '#000',
                    fontSize: 12,
                    fontWeight: 600,
                    opacity: submitting ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {submitting ? (
                    <>
                      <div style={{
                        width: 16,
                        height: 16,
                        border: '2px solid rgba(0,0,0,0.2)',
                        borderTopColor: '#000',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite',
                      }} />
                      Creating...
                    </>
                  ) : (
                    'Create Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
