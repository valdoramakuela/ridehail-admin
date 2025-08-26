'use client';

import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ show: false, src: '', title: '' });
  const [filterStatus, setFilterStatus] = useState('all');

  const API_BASE = 'https://ridehail-backend.onrender.com';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchVerifications();
    }
  }, [mounted]);

  const fetchVerifications = async () => {
    if (!mounted) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/verification/all`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.success && Array.isArray(data.verifications)) {
        setVerifications(data.verifications);
      } else {
        setVerifications([]);
      }
      
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setVerifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    if (!id || !mounted) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/verification/action`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result && result.success) {
        await fetchVerifications();
      } else {
        throw new Error(result?.error || 'Action failed');
      }
      
    } catch (err) {
      console.error('Action error:', err);
    }
  };

  const getImageUrl = (filename) => {
    if (!filename) return null;
    return `${API_BASE}/uploads/${filename}`;
  };

  const openImageModal = (filename, title) => {
    const imageUrl = getImageUrl(filename);
    if (imageUrl) {
      setSelectedImage({ show: true, src: imageUrl, title });
    }
  };

  const filteredVerifications = verifications.filter(v => 
    filterStatus === 'all' || v.status === filterStatus
  );

  const stats = {
    total: verifications.length,
    pending: verifications.filter(v => v.status === 'pending').length,
    approved: verifications.filter(v => v.status === 'approved').length,
    rejected: verifications.filter(v => v.status === 'rejected').length
  };

  const styles = {
    container: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      lineHeight: '1.5',
      color: '#374151'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease',
      cursor: 'default'
    },
    statCardHover: {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transform: 'translateY(-2px)'
    },
    statNumber: {
      fontSize: '36px',
      fontWeight: 'bold',
      margin: '8px 0'
    },
    statLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    headerSection: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: '0 0 8px 0'
    },
    subtitle: {
      fontSize: '16px',
      color: '#6b7280',
      margin: '0 0 20px 0'
    },
    filterButtons: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginBottom: '16px'
    },
    filterButton: {
      padding: '8px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: '#f9fafb',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    },
    filterButtonActive: {
      backgroundColor: '#3b82f6',
      borderColor: '#3b82f6',
      color: 'white'
    },
    refreshButton: {
      padding: '10px 20px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    cardsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '20px'
    },
    card: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease'
    },
    cardHeader: {
      backgroundColor: '#f8fafc',
      padding: '20px',
      borderBottom: '1px solid #e5e7eb'
    },
    cardHeaderContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    driverName: {
      fontSize: '18px',
      fontWeight: 'bold',
      margin: '0 0 4px 0'
    },
    driverId: {
      fontSize: '14px',
      color: '#6b7280',
      margin: 0
    },
    statusBadge: {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    statusPending: {
      backgroundColor: '#fef3c7',
      color: '#92400e',
      border: '1px solid #f59e0b'
    },
    statusApproved: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      border: '1px solid #10b981'
    },
    statusRejected: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      border: '1px solid #ef4444'
    },
    cardBody: {
      padding: '20px'
    },
    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '20px'
    },
    detailItem: {
      marginBottom: '12px'
    },
    detailLabel: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '4px'
    },
    detailValue: {
      fontSize: '14px',
      fontWeight: '500'
    },
    documentsSection: {
      marginBottom: '20px'
    },
    documentsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '8px'
    },
    documentThumbnail: {
      aspectRatio: '1',
      backgroundColor: '#f3f4f6',
      borderRadius: '8px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: '2px solid transparent'
    },
    documentThumbnailHover: {
      borderColor: '#3b82f6',
      transform: 'scale(1.05)'
    },
    documentImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    documentLabel: {
      fontSize: '10px',
      textAlign: 'center',
      marginTop: '4px',
      color: '#6b7280'
    },
    actionsSection: {
      paddingTop: '16px',
      borderTop: '1px solid #f3f4f6',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px'
    },
    actionButton: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    rejectButton: {
      backgroundColor: '#ef4444',
      color: 'white'
    },
    approveButton: {
      backgroundColor: '#10b981',
      color: 'white'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      overflow: 'hidden'
    },
    modalHeader: {
      padding: '16px 20px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: '600',
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      color: '#6b7280'
    },
    modalImage: {
      padding: '16px',
      textAlign: 'center'
    },
    modalImg: {
      maxWidth: '100%',
      maxHeight: '70vh',
      objectFit: 'contain',
      borderRadius: '8px'
    },
    emptyState: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '48px',
      textAlign: 'center'
    },
    emptyIcon: {
      fontSize: '48px',
      color: '#d1d5db',
      marginBottom: '16px'
    },
    emptyTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px'
    },
    emptyText: {
      color: '#6b7280'
    }
  };

  if (!mounted || loading) {
    return (
      <div style={{...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #f3f4f6',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Loading verifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={{...styles.card, maxWidth: '500px', margin: '0 auto'}}>
          <div style={{...styles.cardBody, textAlign: 'center'}}>
            <div style={{fontSize: '48px', color: '#ef4444', marginBottom: '16px'}}>⚠</div>
            <h3 style={{...styles.title, fontSize: '18px', marginBottom: '8px'}}>Connection Error</h3>
            <p style={{marginBottom: '16px'}}>{error}</p>
            <button 
              onClick={fetchVerifications}
              style={styles.refreshButton}
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Add keyframes for loading animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div 
          style={styles.statCard}
          onMouseEnter={(e) => Object.assign(e.target.style, styles.statCardHover)}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <div style={styles.statLabel}>Total Verifications</div>
          <div style={{...styles.statNumber, color: '#374151'}}>{stats.total}</div>
          <div style={{fontSize: '12px', color: '#9ca3af'}}>All submissions</div>
        </div>

        <div 
          style={styles.statCard}
          onMouseEnter={(e) => Object.assign(e.target.style, styles.statCardHover)}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <div style={styles.statLabel}>Pending Review</div>
          <div style={{...styles.statNumber, color: '#f59e0b'}}>{stats.pending}</div>
          <div style={{fontSize: '12px', color: '#9ca3af'}}>Awaiting action</div>
        </div>

        <div 
          style={styles.statCard}
          onMouseEnter={(e) => Object.assign(e.target.style, styles.statCardHover)}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <div style={styles.statLabel}>Approved</div>
          <div style={{...styles.statNumber, color: '#10b981'}}>{stats.approved}</div>
          <div style={{fontSize: '12px', color: '#9ca3af'}}>Active drivers</div>
        </div>

        <div 
          style={styles.statCard}
          onMouseEnter={(e) => Object.assign(e.target.style, styles.statCardHover)}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <div style={styles.statLabel}>Rejected</div>
          <div style={{...styles.statNumber, color: '#ef4444'}}>{stats.rejected}</div>
          <div style={{fontSize: '12px', color: '#9ca3af'}}>Declined</div>
        </div>
      </div>

      {/* Header Section */}
      <div style={styles.headerSection}>
        <h2 style={styles.title}>Driver Verifications</h2>
        <p style={styles.subtitle}>Manage and review driver verification submissions</p>
        
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px'}}>
          <div style={styles.filterButtons}>
            {[
              { key: 'all', label: 'All', count: stats.total },
              { key: 'pending', label: 'Pending', count: stats.pending },
              { key: 'approved', label: 'Approved', count: stats.approved },
              { key: 'rejected', label: 'Rejected', count: stats.rejected }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                style={{
                  ...styles.filterButton,
                  ...(filterStatus === key ? styles.filterButtonActive : {})
                }}
                onMouseEnter={(e) => {
                  if (filterStatus !== key) {
                    e.target.style.backgroundColor = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filterStatus !== key) {
                    e.target.style.backgroundColor = '#f9fafb';
                  }
                }}
              >
                {label} ({count})
              </button>
            ))}
          </div>
          
          <button 
            onClick={fetchVerifications}
            style={styles.refreshButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Verifications */}
      {filteredVerifications.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📄</div>
          <h3 style={styles.emptyTitle}>No Verifications Found</h3>
          <p style={styles.emptyText}>
            {filterStatus === 'all' 
              ? 'No driver verifications have been submitted yet.'
              : `No ${filterStatus} verifications found.`
            }
          </p>
        </div>
      ) : (
        <div style={styles.cardsGrid}>
          {filteredVerifications.map((verification) => (
            <div 
              key={verification._id} 
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Card Header */}
              <div style={styles.cardHeader}>
                <div style={styles.cardHeaderContent}>
                  <div>
                    <h3 style={styles.driverName}>{verification.fullName}</h3>
                    <p style={styles.driverId}>ID: {verification.userId}</p>
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    ...(verification.status === 'pending' ? styles.statusPending :
                        verification.status === 'approved' ? styles.statusApproved :
                        styles.statusRejected)
                  }}>
                    {verification.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div style={styles.cardBody}>
                {/* Details */}
                <div style={styles.detailsGrid}>
                  <div>
                    <div style={styles.detailItem}>
                      <div style={styles.detailLabel}>License Number</div>
                      <div style={styles.detailValue}>{verification.licenseNumber}</div>
                    </div>
                    <div style={styles.detailItem}>
                      <div style={styles.detailLabel}>Vehicle</div>
                      <div style={styles.detailValue}>{verification.vehicleModel || 'Not provided'}</div>
                    </div>
                  </div>
                  <div>
                    <div style={styles.detailItem}>
                      <div style={styles.detailLabel}>Plate Number</div>
                      <div style={styles.detailValue}>{verification.plateNumber || 'Not provided'}</div>
                    </div>
                    <div style={styles.detailItem}>
                      <div style={styles.detailLabel}>Submitted</div>
                      <div style={styles.detailValue}>{new Date(verification.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div style={styles.documentsSection}>
                  <div style={styles.detailLabel}>Documents</div>
                  <div style={styles.documentsGrid}>
                    {[
                      { key: 'idFront', label: 'ID Front' },
                      { key: 'licenseFront', label: 'License Front' },
                      { key: 'licenseBack', label: 'License Back' },
                      { key: 'vehicleRegistration', label: 'Vehicle Reg.' },
                      { key: 'profileImage', label: 'Profile' }
                    ].map(({ key, label }) => {
                      const filename = verification[key];
                      return (
                        <div key={key}>
                          {filename ? (
                            <div
                              onClick={() => openImageModal(filename, label)}
                              style={styles.documentThumbnail}
                              onMouseEnter={(e) => Object.assign(e.target.style, styles.documentThumbnailHover)}
                              onMouseLeave={(e) => {
                                e.target.style.borderColor = 'transparent';
                                e.target.style.transform = 'scale(1)';
                              }}
                            >
                              <img
                                src={getImageUrl(filename)}
                                alt={label}
                                style={styles.documentImage}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <div style={{...styles.documentThumbnail, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                              <span style={{fontSize: '20px', color: '#9ca3af'}}>📄</span>
                            </div>
                          )}
                          <div style={styles.documentLabel}>{label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                {verification.status === 'pending' && (
                  <div style={styles.actionsSection}>
                    <button
                      onClick={() => handleAction(verification._id, 'rejected')}
                      style={{...styles.actionButton, ...styles.rejectButton}}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(verification._id, 'approved')}
                      style={{...styles.actionButton, ...styles.approveButton}}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage.show && (
        <div 
          style={styles.modal}
          onClick={() => setSelectedImage({ show: false, src: '', title: '' })}
        >
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{selectedImage.title}</h3>
              <button 
                onClick={() => setSelectedImage({ show: false, src: '', title: '' })}
                style={styles.closeButton}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>
            <div style={styles.modalImage}>
              <img 
                src={selectedImage.src} 
                alt={selectedImage.title}
                style={styles.modalImg}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
