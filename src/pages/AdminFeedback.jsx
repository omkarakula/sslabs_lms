import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Trash2, 
  Filter, 
  Star, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle, 
  ThumbsUp, 
  Activity, 
  Trash, 
  RefreshCw 
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showFullComment, setShowFullComment] = useState(null);

  const fetchFeedbacks = () => {
    setIsLoading(true);
    fetch('http://localhost:5000/api/feedback')
      .then(res => res.json())
      .then(data => {
        setFeedbacks(data || []);
      })
      .catch(err => {
        console.error('Error fetching feedbacks:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student feedback?")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/feedback/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setFeedbacks(prev => prev.filter(f => f.id !== id));
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected feedbacks?`)) return;

    try {
      const response = await fetch('http://localhost:5000/api/feedback/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (response.ok) {
        setFeedbacks(prev => prev.filter(f => !selectedIds.includes(f.id)));
        setSelectedIds([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredFeedbacks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFeedbacks.map(f => f.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  // Filtering Logic
  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = 
      (feedback.courseName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (feedback.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (feedback.comment || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRating = ratingFilter === 'All' || feedback.rating === parseInt(ratingFilter);
    
    return matchesSearch && matchesRating;
  });

  // Calculate Summary metrics
  const totalReviews = feedbacks.length;
  const avgRating = totalReviews > 0 
    ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
    : '0.0';
  
  const positiveReviews = feedbacks.filter(f => f.rating >= 4).length;
  const positivePercent = totalReviews > 0 
    ? Math.round((positiveReviews / totalReviews) * 100) 
    : 0;

  const fiveStarReviews = feedbacks.filter(f => f.rating === 5).length;

  if (isLoading) {
    return <LoadingSpinner message="Retrieving platform feedback metrics..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>Student Feedbacks</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Review and manage course ratings and detailed feedback from students.</p>
        </div>
        <button 
          onClick={fetchFeedbacks}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px' }}
        >
          <RefreshCw size={16} /> Refresh Feedbacks
        </button>
      </div>

      {/* Summary Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <MetricCard 
          icon={<MessageSquare size={22} color="var(--primary)" />} 
          label="Total Reviews" 
          value={totalReviews} 
          subtext="Submitted across all courses" 
        />
        <MetricCard 
          icon={<Star size={22} color="#fb923c" />} 
          label="Average Rating" 
          value={`${avgRating} / 5.0`} 
          subtext="Overall learning satisfaction" 
        />
        <MetricCard 
          icon={<CheckCircle size={22} color="#10b981" />} 
          label="Positive Sentiment" 
          value={`${positivePercent}%`} 
          subtext={`${positiveReviews} reviews rated 4+ stars`} 
        />
        <MetricCard 
          icon={<ThumbsUp size={22} color="#8b5cf6" />} 
          label="5-Star Reviews" 
          value={fiveStarReviews} 
          subtext="Perfect scores submitted" 
        />
      </div>

      {/* Search & Actions bar */}
      <div className="glass" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderRadius: '14px' }}>
        
        {/* Search and Ratings Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', background: 'var(--glass-inner-darker)', border: '1px solid var(--border)', borderRadius: '10px', width: '320px', gap: '8px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search feedbacks, courses..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              style={{
                padding: '10px 14px',
                background: 'var(--glass-inner-darker)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--text-main)',
                fontSize: '13.5px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Bulk delete action */}
        {selectedIds.length > 0 && (
          <motion.button 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handleBulkDelete}
            className="btn-secondary"
            style={{ 
              background: '#f43f5e', 
              color: 'white', 
              border: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 18px', 
              borderRadius: '10px',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(244, 63, 94, 0.2)'
            }}
          >
            <Trash size={16} /> Delete Selected ({selectedIds.length})
          </motion.button>
        )}
      </div>

      {/* Feedbacks Grid / Table */}
      <div className="glass" style={{ padding: '0', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--glass-inner)' }}>
              <th style={{ padding: '16px 24px', width: '48px' }}>
                <input 
                  type="checkbox"
                  checked={filteredFeedbacks.length > 0 && selectedIds.length === filteredFeedbacks.length}
                  onChange={toggleSelectAll}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Student Info</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Course Context</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rating</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Comment / Feedback</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Submitted</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', width: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <AlertCircle size={36} color="var(--text-muted)" />
                      <span style={{ fontSize: '16px', fontWeight: 600 }}>No feedbacks matched your filters.</span>
                      <span style={{ fontSize: '13px' }}>Try adjusting your search criteria or rating filter.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map((feedback) => (
                  <motion.tr 
                    key={feedback.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ 
                      borderBottom: '1px solid var(--border)', 
                      background: selectedIds.includes(feedback.id) ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <td style={{ padding: '20px 24px' }}>
                      <input 
                        type="checkbox"
                        checked={selectedIds.includes(feedback.id)}
                        onChange={() => toggleSelect(feedback.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </td>
                    
                    {/* Student Info */}
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '14px' }}>{feedback.studentName}</span>
                        {feedback.studentName === 'Anonymous' ? (
                          <span style={{ display: 'inline-block', alignSelf: 'flex-start', padding: '2px 8px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', fontSize: '10px', fontWeight: 700 }}>PRIVACY ON</span>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Verified Student</span>
                        )}
                      </div>
                    </td>

                    {/* Course Context */}
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14.5px' }}>{feedback.courseName || 'General Feedback'}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {feedback.courseId}</span>
                      </div>
                    </td>

                    {/* Rating stars display */}
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={16} 
                            fill={feedback.rating >= star ? '#fb923c' : 'none'} 
                            color={feedback.rating >= star ? '#fb923c' : 'var(--text-muted)'} 
                          />
                        ))}
                      </div>
                    </td>

                    {/* Feedback comment with excerpt and detail modal */}
                    <td style={{ padding: '20px 24px', maxWidth: '320px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-main)', lineHeight: '1.5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {feedback.comment}
                        </p>
                        {feedback.comment.length > 40 && (
                          <button 
                            onClick={() => setShowFullComment(feedback)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '11px', alignSelf: 'flex-start', cursor: 'pointer', padding: 0 }}
                          >
                            Read Full Review
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Submitted Date */}
                    <td style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      {feedback.date}
                    </td>

                    {/* Delete action */}
                    <td style={{ padding: '20px 24px' }}>
                      <button 
                        onClick={() => handleDelete(feedback.id)}
                        style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.08)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Full Review Detail Modal overlay */}
      <AnimatePresence>
        {showFullComment && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', maxWidth: '500px', width: '90%', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700 }}>Review Details</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Submitted by {showFullComment.studentName}</span>
                </div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={16} 
                      fill={showFullComment.rating >= star ? '#fb923c' : 'none'} 
                      color={showFullComment.rating >= star ? '#fb923c' : 'var(--text-muted)'} 
                    />
                  ))}
                </div>
              </div>

              <div style={{ padding: '16px', background: 'var(--glass-inner)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px' }}>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text-main)', fontStyle: 'italic' }}>
                  "{showFullComment.comment}"
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Course: {showFullComment.courseName}</span>
                <button 
                  className="btn-primary" 
                  onClick={() => setShowFullComment(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}
                >
                  Close Review
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

// Summary Metric Card Component
const MetricCard = ({ icon, label, value, subtext }) => (
  <div className="glass" style={{ padding: '24px', display: 'flex', gap: '16px', borderRadius: '16px', background: 'var(--bg-card)' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--glass-inner)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>{value}</span>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{subtext}</span>
    </div>
  </div>
);

export default AdminFeedback;
