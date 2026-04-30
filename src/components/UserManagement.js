'use client';
import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'analyst',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await getUsers();
      console.log('Users data:', data);
      setUsers(data?.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingUser) {
        const updateData = { ...formData };
        if (!formData.password) {
          delete updateData.password;
        }
        await updateUser(editingUser.id, updateData);
      } else {
        await createUser(formData);
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ username: '', email: '', password: '', role: 'analyst' });
      await loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user: ' + (error.message || 'Unknown error'));
    }
  }

  async function handleDelete(id) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(id);
        await loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user: ' + (error.message || 'Unknown error'));
      }
    }
  }

  function handleEdit(user) {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
    });
    setShowModal(true);
  }

  const inputStyle = {
    background: 'var(--bg-secondary)',
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

  const buttonDangerStyle = {
    background: 'var(--danger)',
    border: 'none',
    color: '#fff',
    fontFamily: 'JetBrains Mono',
    fontSize: 12,
    fontWeight: 600,
    padding: '8px 16px',
    borderRadius: 6,
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
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>User Management</h2>
        <button 
          onClick={() => {
            setEditingUser(null);
            setFormData({ username: '', email: '', password: '', role: 'analyst' });
            setShowModal(true);
          }} 
          style={buttonPrimaryStyle}
        >
          + Add New User
        </button>
      </div>

      {users.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: 48, 
          background: 'var(--bg-secondary)',
          borderRadius: 8,
          border: '1px solid var(--border)'
        }}>
          <p style={{ color: 'var(--text-secondary)' }}>No users found. Click "Add New User" to create one.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Username</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Email</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Created At</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{user.username}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{user.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      background: user.role === 'admin' ? 'rgba(0,229,160,0.1)' : 'rgba(56,189,248,0.1)',
                      color: user.role === 'admin' ? 'var(--accent)' : '#38bdf8',
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        onClick={() => handleEdit(user)} 
                        style={{
                          padding: '6px 12px',
                          background: 'var(--bg-hover)',
                          border: '1px solid var(--border)',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 11,
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)} 
                        style={buttonDangerStyle}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
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
            maxWidth: 500,
            border: '1px solid var(--border)',
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
              {editingUser ? 'Edit User' : 'Add New User'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Username *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  style={inputStyle}
                  placeholder="Enter username"
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={inputStyle}
                  placeholder="Enter email address"
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                  {editingUser ? 'Password (leave blank to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={inputStyle}
                  placeholder={editingUser ? 'Enter new password to change' : 'Enter password'}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={inputStyle}
                >
                  <option value="analyst">Analyst (Read-only)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  style={{
                    padding: '10px 20px',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  Cancel
                </button>
                <button type="submit" style={buttonPrimaryStyle}>
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}