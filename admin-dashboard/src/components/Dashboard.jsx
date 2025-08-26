'use client';

import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ show: false, src: '', title: '' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filter verifications by status and search term
  const filteredVerifications = verifications.filter(v => {
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      v.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.vehicleModel && v.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.plateNumber && v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

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
      color: '#1f2937',
      background: 'linear-gradient(107deg,rgba(74, 140, 140, 1) 26%, rgba(71, 71, 92, 1) 48%, rgba(0, 212, 255, 1) 86%);',
      minHeight: '100vh',
      padding: '20px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    statCard: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      border: 'none',
      borderRadius: '20px',
      padding: '28px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'default',
      position: 'relative',
      overflow: 'hidden'
    },
    statCardHover: {
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-8px) scale(1.02)'
    },
    statNumber: {
      fontSize: '48px',
      fontWeight: '800',
      margin: '12px 0',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    statLabel: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '8px'
    },
    headerSection: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      border: 'none',
      borderRadius: '24px',
      padding: '32px',
      marginBottom: '32px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)'
    },
    title: {
      fontSize: '32px',
      fontWeight: '800',
      margin: '0 0 8px 0',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    subtitle: {
      fontSize: '18px',
      color: '#6b7280',
      margin: '0 0 24px 0'
    },
    searchContainer: {
      position: 'relative',
      marginBottom: '20px',
      maxWidth: '400px'
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px 12px 48px',
      border: '2px solid #e5e7eb',
      borderRadius: '16px',
      fontSize: '16px',
      backgroundColor: '#ffffff',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    searchIcon: {
      position: 'absolute',
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af',
      fontSize: '18px'
    },
    filterButtons: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      marginBottom: '20px'
    },
    filterButton: {
      padding: '12px 20px',
      border: '2px solid transparent',
      borderRadius: '16px',
      backgroundColor: '#f3f4f6',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden'
    },
    filterButtonActive: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)'
    },
    refreshButton: {
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '16px',
      fontSize: '14px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
    },
    cardsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
      gap: '24px'
    },
    card: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      border: 'none',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative'
    },
    cardHover: {
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-8px) scale(1.02)'
    },
    cardHeader: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '24px',
      borderBottom: '1px solid #e5e7eb',
      position: 'relative'
    },
    cardHeaderContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    driverAvatar: {
      width: '48px',
      height: '48px',
      borderRadius: '16px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '18px',
      fontWeight: '700',
      marginRight: '16px'
    },
    driverInfo: {
      flex: 1
    },
    driverName: {
      fontSize: '20px',
      fontWeight: '800',
      margin: '0 0 4px 0',
      color: '#1f2937'
    },
    driverId: {
      fontSize: '14px',
      color: '#6b7280',
      margin: 0
    },
    statusBadge: {
      padding: '6px 16px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      border: '2px solid transparent'
    },
    statusPending: {
      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)'
    },
    statusApproved: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
    },
    statusRejected: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
    },
    cardBody: {
      padding: '24px'
    },
    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      marginBottom: '24px'
    },
    detailItem: {
      marginBottom: '16px'
    },
    detailLabel: {
      fontSize: '12px',
      fontWeight: '700',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '6px'
    },
    detailValue: {
      fontSize: '15px',
      fontWeight: '600',
      color: '#1f2937'
    },
    documentsSection: {
      marginBottom: '24px'
    },
    documentsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '12px'
    },
    documentThumbnail: {
      aspectRatio: '1',
      backgroundColor: '#f3f4f6',
      borderRadius: '16px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: '3px solid transparent',
      position: 'relative'
    },
    documentThumbnailHover: {
      borderColor: '#667eea',
      transform: 'scale(1.1)',
      boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
    },
    documentImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    documentLabel: {
      fontSize: '10px',
      textAlign: 'center',
      marginTop: '6px',
      color: '#6b7280',
      fontWeight: '600'
    },
    actionsSection: {
      paddingTop: '20px',
      borderTop: '2px solid #f3f4f6',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '16px'
    },
    actionButton: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '16px',
      fontSize: '14px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    rejectButton: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
    },
    approveButton: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(8px)'
    },
    modalContent: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '24px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      overflow: 'hidden',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
    },
    modalHeader: {
      padding: '20px 24px',
      borderBottom: '2px solid #f3f4f6',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: '700',
      margin: 0,
      color: '#1f2937'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '28px',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '12px',
      color: '#6b7280',
      transition: 'all 0.2s ease'
    },
    modalImage: {
      padding: '20px',
      textAlign: 'center'
    },
    modalImg: {
      maxWidth: '100%',
      maxHeight: '70vh',
      objectFit: 'contain',
      borderRadius: '16px',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
    },
    emptyState: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      border: 'none',
      borderRadius: '24px',
      padding: '64px',
      textAlign: 'center',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
    },
    emptyIcon: {
      fontSize: '64px',
      marginBottom: '20px'
    },
    emptyTitle: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '12px'
    },
    emptyText: {
      color: '#6b7280',
      fontSize: '16px'
    }
  };

  if (!mounted || loading) {
    return (
      <div style={{...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{color: 'white', fontSize: '18px', fontWeight: '600'}}>Loading verifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={{...styles.card, maxWidth: '500px', margin: '0 auto'}}>
          <div style={{...styles.cardBody, textAlign: 'center'}}>
            <div style={{fontSize: '64px', marginBottom: '20px'}}>⚠</div>
            <h3 style={{...styles.title, fontSize: '20px', marginBottom: '12px'}}>Connection Error</h3>
            <p style={{marginBottom: '20px', color: '#6b7280'}}>{error}</p>
            <button 
              onClick={fetchVerifications}
              style={styles.refreshButton}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px) scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0) scale(1)'}
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
      {/* Add keyframes for animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      {/* Enhanced Stats Cards */}
      <div style={styles.statsGrid}>
        <div 
          style={styles.statCard}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statCardHover)}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
          }}
        >
          <div style={styles.statLabel}>Total Verifications</div>
          <div style={styles.statNumber}>{stats.total}</div>
          <div style={{fontSize: '14px', color: '#9ca3af', fontWeight: '500'}}>All submissions</div>
        </div>

        <div 
          style={styles.statCard}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statCardHover)}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
          }}
        >
          <div style={styles.statLabel}>Pending Review</div>
          <div style={{...styles.statNumber, background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>{stats.pending}</div>
          <div style={{fontSize: '14px', color: '#9ca3af', fontWeight: '500'}}>Awaiting action</div>
        </div>

        <div 
          style={styles.statCard}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statCardHover)}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
          }}
        >
          <div style={styles.statLabel}>Approved</div>
          <div style={{...styles.statNumber, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>{stats.approved}</div>
          <div style={{fontSize: '14px', color: '#9ca3af', fontWeight: '500'}}>Active drivers</div>
        </div>

        <div 
          style={styles.statCard}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statCardHover)}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
          }}
        >
          <div style={styles.statLabel}>Rejected</div>
          <div style={{...styles.statNumber, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>{stats.rejected}</div>
          <div style={{fontSize: '14px', color: '#9ca3af', fontWeight: '500'}}>Declined</div>
        </div>
      </div>

      {/* Enhanced Header Section */}
      <div style={styles.headerSection}>
        <h2 style={styles.title}>Driver Verifications</h2>
        <p style={styles.subtitle}>Manage and review driver verification submissions</p>
        
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px'}}>
          <div style={{flex: '1', minWidth: '300px'}}>
            {/* Search Input */}
            <div style={styles.searchContainer}>
              <div style={styles.searchIcon}>🔍</div>
              <input
                type="text"
                placeholder="Search by name, ID, license, vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            {/* Filter Buttons */}
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
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filterStatus !== key) {
                      e.target.style.backgroundColor = '#f3f4f6';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={fetchVerifications}
            style={styles.refreshButton}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px) scale(1.05)';
              e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div style={{marginTop: '16px', padding: '12px 16px', backgroundColor: '#f0f9ff', borderRadius: '12px', border: '1px solid #0ea5e9'}}>
            <p style={{margin: 0, color: '#0369a1', fontWeight: '600'}}>
              Found {filteredVerifications.length} verification{filteredVerifications.length !== 1 ? 's' : ''} matching "{searchTerm}"
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Verifications */}
      {filteredVerifications.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📄</div>
          <h3 style={styles.emptyTitle}>No Verifications Found</h3>
          <p style={styles.emptyText}>
            {searchTerm
              ? `No verifications match "${searchTerm}"`
              : filterStatus === 'all' 
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
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
              }}
            >
              {/* Enhanced Card Header */}
              <div style={styles.cardHeader}>
                <div style={styles.cardHeaderContent}>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <div style={styles.driverAvatar}>
                      {verification.fullName ? verification.fullName.charAt(0).toUpperCase() : 'D'}
                    </div>
                    <div style={styles.driverInfo}>
                      <h3 style={styles.driverName}>{verification.fullName}</h3>
                      <p style={styles.driverId}>ID: {verification.userId}</p>
                    </div>
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

              {/* Enhanced Card Body */}
              <div style={styles.cardBody}>
                {/* Details Grid */}
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

                {/* Enhanced Documents */}
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
                              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.documentThumbnailHover)}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'transparent';
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              <img
                                src={getImageUrl(filename)}
                                alt={label}
                                style={styles.documentImage}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const placeholder = document.createElement('div');
                                  placeholder.innerHTML = '📄';
                                  placeholder.style.cssText = 'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #9ca3af; background: #f3f4f6;';
                                  e.target.parentNode.appendChild(placeholder);
                                }}
                              />
                            </div>
                          ) : (
                            <div style={{...styles.documentThumbnail, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'}}>
                              <span style={{fontSize: '24px', color: '#9ca3af'}}>📄</span>
                            </div>
                          )}
                          <div style={styles.documentLabel}>{label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Enhanced Actions */}
                {verification.status === 'pending' && (
                  <div style={styles.actionsSection}>
                    <button
                      onClick={() => handleAction(verification._id, 'rejected')}
                      style={{...styles.actionButton, ...styles.rejectButton}}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
                        e.target.style.transform = 'translateY(-2px) scale(1.05)';
                        e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                      }}
                    >
                      ❌ Reject
                    </button>
                    <button
                      onClick={() => handleAction(verification._id, 'approved')}
                      style={{...styles.actionButton, ...styles.approveButton}}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                        e.target.style.transform = 'translateY(-2px) scale(1.05)';
                        e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                      }}
                    >
                      ✅ Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Image Modal */}
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
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                ×
              </button>
            </div>
            <div style={styles.modalImage}>
              <img 
                src={selectedImage.src} 
                alt={selectedImage.title}
                style={styles.modalImg}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+PHRleHQgeD0iMTIiIHk9IjEyIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOUNBM0FGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
