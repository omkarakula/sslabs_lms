import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, CheckCircle, XCircle, Trash2, Eye, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    setIsLoading(true);
    fetch('http://localhost:5000/api/courses')
      .then(res => res.json())
      .then(data => {
        const validData = Array.isArray(data) ? data.filter(c => c && c.id && c.title) : [];
        const uniqueData = validData.reduce((acc, current) => {
          if (!acc.find(item => item.title === current.title)) {
            acc.push(current);
          }
          return acc;
        }, []);
        setCourses(uniqueData);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const getStatusBadge = (status) => {
    let dotColor = '#10b981'; // Green
    let bgColor = 'rgba(16, 185, 129, 0.04)';
    let borderColor = 'rgba(16, 185, 129, 0.2)';
    let textColor = '#10b981';
    let label = 'Published';

    if (status === 'Pending Review' || !status) {
      dotColor = '#f59e0b'; // Orange
      bgColor = 'rgba(245, 158, 11, 0.04)';
      borderColor = 'rgba(245, 158, 11, 0.2)';
      textColor = '#f59e0b';
      label = 'Pending';
    } else if (status === 'Rejected') {
      dotColor = '#f43f5e'; // Red
      bgColor = 'rgba(244, 63, 94, 0.04)';
      borderColor = 'rgba(244, 63, 94, 0.2)';
      textColor = '#f43f5e';
      label = 'Rejected';
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '20px',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        color: textColor,
        fontSize: '12px',
        fontWeight: 600
      }}>
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: dotColor
        }} />
        {label}
      </span>
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredCourses.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setCourses(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const response = await fetch('http://localhost:5000/api/courses/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] })
      });
      if (response.ok) {
        setCourses(prev => prev.filter(c => c.id !== id));
        setSelectedIds(prev => prev.filter(i => i !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} courses?`)) return;

    try {
      const response = await fetch('http://localhost:5000/api/courses/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (response.ok) {
        setCourses(prev => prev.filter(c => !selectedIds.includes(c.id)));
        setSelectedIds([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesSearch = (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (c.instructor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const uniqueStatuses = ['All', ...new Set(courses.map(c => c.status || 'Pending Review'))];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  if (isLoading) return <LoadingSpinner message="Loading global course directory..." />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Global Course Directory</h1>
          <p style={{ color: 'var(--text-muted)' }}>Approve, reject, and monitor all courses on the platform.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '12px', background: 'var(--glass-inner)', padding: '10px 16px', borderRadius: '10px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search all courses by title, instructor, or category..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '14px' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {selectedIds.length > 0 && (
            <button 
              className="btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f43f5e' }}
              onClick={handleBulkDelete}
            >
              <Trash2 size={18} /> Bulk Delete ({selectedIds.length})
            </button>
          )}

          <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px' }}>
            <Filter size={18} color="var(--text-muted)" />
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 500 }}
            >
              {uniqueStatuses.map(status => (
                <option key={status} value={status} style={{ background: 'var(--bg-main)', color: 'var(--text-main)' }}>
                  {status === 'All' ? 'All Statuses' : status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course Table */}
      <div className="table-container" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <div className="table-header" style={{ fontWeight: 700, fontSize: '18px', padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>Course Inventory & Reviews</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: '950px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--glass-inner-darker)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ width: '60px', padding: '18px 24px' }}>
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll} 
                    checked={filteredCourses.length > 0 && selectedIds.length === filteredCourses.length} 
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </th>
                {/* <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>ID</th> */}
                <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Course Title</th>
                <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Lessons & Rating</th>
                <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Instructor</th>
                <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Status</th>
                <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCourses.map(course => {
                const isSelected = selectedIds.includes(course.id);
                const displayId = course.id && course.id.toString().startsWith('-N') 
                  ? `C${course.id.toString().substring(3, 6).toUpperCase()}` 
                  : `C${course.id}`;

                return (
                  <tr 
                    key={course.id} 
                    style={{ 
                      background: isSelected ? 'rgba(99, 102, 241, 0.02)' : 'transparent',
                      borderBottom: '1px solid var(--border)',
                      transition: 'background 0.2s'
                    }}
                  >
                    <td style={{ padding: '18px 24px' }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => handleSelect(course.id)} 
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </td>
                    {/* <td style={{ padding: '18px 24px', fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>{displayId}</td> */}
                    <td style={{ padding: '18px 24px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14.5px' }}>{course.title}</div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{course.category} • {course.price ? `₹${course.price}` : 'Free'}</div>
                    </td>
                    <td style={{ padding: '18px 24px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>{course.lessons || 8} Lessons</div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>★ {course.rating || '4.8'} Avg Rating</div>
                    </td>
                    <td style={{ padding: '18px 24px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>{course.instructor || 'Alex Rivers'}</div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>ID: {course.instructor ? course.instructor.split(' ')[0] : 'Admin'}</div>
                    </td>
                    <td style={{ padding: '18px 24px' }}>{getStatusBadge(course.status)}</td>
                    <td style={{ padding: '18px 24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                        <Link 
                          to={`/course/${course.id}`} 
                          title="View Course Details"
                          style={{ color: 'var(--text-muted)', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
                          onMouseOver={(e) => e.currentTarget.style.color = '#3b82f6'}
                          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          <Eye size={18} />
                        </Link>
                        <Link 
                          to={`/admin/edit-course/${course.id}`}
                          title="Edit Course"
                          style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
                          onMouseOver={(e) => e.currentTarget.style.color = '#f59e0b'}
                          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          <Edit size={18} />
                        </Link>
                        {course.status !== 'Published' && (
                          <button 
                            onClick={() => handleUpdateStatus(course.id, 'Published')}
                            title="Approve & Publish"
                            style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#10b981'}
                            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {course.status !== 'Rejected' && (
                          <button 
                            onClick={() => handleUpdateStatus(course.id, 'Rejected')}
                            title="Reject Course"
                            style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#f43f5e'}
                            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteCourse(course.id)}
                          title="Delete Course"
                          style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
                          onMouseOver={(e) => e.currentTarget.style.color = '#f43f5e'}
                          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCourses.length)} of {filteredCourses.length} entries
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-secondary" 
                style={{ padding: '8px 16px', fontSize: '13.5px', opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-secondary" 
                style={{ padding: '8px 16px', fontSize: '13.5px', opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminCourses;
