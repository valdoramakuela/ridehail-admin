// src/components/Dashboard.jsx
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

  // ✅ Fixed: No trailing spaces
  const API_BASE = 'https://ridehail-backend.onrender.com';

  useEffect(() => {
    setMounted(true);
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
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (data?.success && Array.isArray(data.verifications)) {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();

      if (result?.success) {
        await fetchVerifications(); // Refresh list
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
    const url = getImageUrl(filename);
    if (url) {
      setSelectedImage({ show: true, src: url, title });
    }
  };

  // 🔍 Search + Filter
  const filteredVerifications = verifications.filter(v => {
    const matchesSearch = !searchTerm ||
      v.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.licenseNumber.includes(searchTerm) ||
      v.userId.includes(searchTerm);

    const matchesFilter = filterStatus === 'all' || v.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: verifications.length,
    pending: verifications.filter(v => v.status === 'pending').length,
    approved: verifications.filter(v => v.status === 'approved').length,
    rejected: verifications.filter(v => v.status === 'rejected').length
  };

  // ✅ Styles (same as yours — clean, modern)
  const styles = { /* ... your styles object ... */ };

  if (!mounted || loading) {
    return <LoadingState styles={styles} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchVerifications} styles={styles} />;
  }

  return (
    <div style={styles.container}>
      <style jsx>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      {/* Stats */}
      <StatsCards stats={stats} styles={styles} />

      {/* Header */}
      <HeaderSection
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onRefresh={fetchVerifications}
        styles={styles}
      />

      {/* Verifications */}
      {filteredVerifications.length === 0 ? (
        <EmptyState filterStatus={filterStatus} styles={styles} />
      ) : (
        <div style={styles.cardsGrid}>
          {filteredVerifications.map(v => (
            <VerificationCard
              key={v._id}
              verification={v}
              styles={styles}
              getImageUrl={getImageUrl}
              openImageModal={openImageModal}
              handleAction={handleAction}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedImage.show && (
        <ImageModal
          selectedImage={selectedImage}
          onClose={() => setSelectedImage({ show: false, src: '', title: '' })}
          styles={styles}
        />
      )}
    </div>
  );
}

// ✅ Modular Components (Optional for readability)
const LoadingState = ({ styles }) => (
  <div style={{ ...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '32px', height: '32px', border: '3px solid #f3f4f6',
        borderTop: '3px solid #3b82f6', borderRadius: '50%',
        animation: 'spin 1s linear infinite', margin: '0 auto 16px'
      }}></div>
      <p>Loading verifications...</p>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry, styles }) => (
  <div style={styles.container}>
    <div style={{ ...styles.card, maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ ...styles.cardBody, textAlign: 'center' }}>
        <div style={{ fontSize: '48px', color: '#ef4444', marginBottom: '16px' }}>⚠</div>
        <h3 style={{ ...styles.title, fontSize: '18px', marginBottom: '8px' }}>Connection Error</h3>
        <p style={{ marginBottom: '16px' }}>{error}</p>
        <button onClick={onRetry} style={styles.refreshButton}>Retry</button>
      </div>
    </div>
  </div>
);

const StatsCards = ({ stats, styles }) => (
  <div style={styles.statsGrid}>
    {[
      { label: 'Total Verifications', value: stats.total, color: '#374151', sub: 'All submissions' },
      { label: 'Pending Review', value: stats.pending, color: '#f59e0b', sub: 'Awaiting action' },
      { label: 'Approved', value: stats.approved, color: '#10b981', sub: 'Active drivers' },
      { label: 'Rejected', value: stats.rejected, color: '#ef4444', sub: 'Declined' }
    ].map((stat, i) => (
      <div key={i} style={styles.statCard}>
        <div style={styles.statLabel}>{stat.label}</div>
        <div style={{ ...styles.statNumber, color: stat.color }}>{stat.value}</div>
        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{stat.sub}</div>
      </div>
    ))}
  </div>
);

const HeaderSection = ({ filterStatus, setFilterStatus, searchTerm, setSearchTerm, onRefresh, styles }) => (
  <div style={styles.headerSection}>
    <h2 style={styles.title}>Driver Verifications</h2>
    <p style={styles.subtitle}>Manage and review driver verification submissions</p>
    
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '16px', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {['all', 'pending', 'approved', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              ...styles.filterButton,
              ...(filterStatus === status ? styles.filterButtonActive : {})
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({{
              all: stats.total,
              pending: stats.pending,
              approved: stats.approved,
              rejected: stats.rejected
            }[status]})
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1, maxWidth: '400px' }}>
        <input
          type="text"
          placeholder="Search by name, license, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1, padding: '10px 12px', border: '1px solid #e5e7eb',
            borderRadius: '8px', fontSize: '14px', outline: 'none'
          }}
        />
        <button onClick={onRefresh} style={styles.refreshButton}>Refresh</button>
      </div>
    </div>
  </div>
);

const EmptyState = ({ filterStatus, styles }) => (
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
);

const VerificationCard = ({ verification, styles, getImageUrl, openImageModal, handleAction }) => (
  <div style={styles.card}>
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

    <div style={styles.cardBody}>
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
                  >
                    <img src={getImageUrl(filename)} alt={label} style={styles.documentImage} />
                  </div>
                ) : (
                  <div style={{ ...styles.documentThumbnail, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '20px', color: '#9ca3af' }}>📄</span>
                  </div>
                )}
                <div style={styles.documentLabel}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {verification.status === 'pending' && (
        <div style={styles.actionsSection}>
          <button
            onClick={() => handleAction(verification._id, 'rejected')}
            style={{ ...styles.actionButton, ...styles.rejectButton }}
          >
            Reject
          </button>
          <button
            onClick={() => handleAction(verification._id, 'approved')}
            style={{ ...styles.actionButton, ...styles.approveButton }}
          >
            Approve
          </button>
        </div>
      )}
    </div>
  </div>
);

const ImageModal = ({ selectedImage, onClose, styles }) => (
  <div style={styles.modal} onClick={onClose}>
    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
      <div style={styles.modalHeader}>
        <h3 style={styles.modalTitle}>{selectedImage.title}</h3>
        <button onClick={onClose} style={styles.closeButton}>×</button>
      </div>
      <div style={styles.modalImage}>
        <img src={selectedImage.src} alt={selectedImage.title} style={styles.modalImg} />
      </div>
    </div>
  </div>
);

export default Dashboard;
