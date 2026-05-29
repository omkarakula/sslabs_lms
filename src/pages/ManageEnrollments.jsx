import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Trash2, Search, Filter, UserPlus, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const ManageEnrollments = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [courseFilter, setCourseFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 8; // Fits beautifully

  useEffect(() => {
    fetch('http://localhost:5000/api/enrollments')
      .then(res => res.json())
      .then(data => {
        // Remove duplicate names
        const uniqueData = data.reduce((acc, current) => {
          if (!acc.find(item => item.name === current.name)) {
            acc.push(current);
          }
          return acc;
        }, []);
        setEnrollments(uniqueData);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleExportCSV = () => {
    if (enrollments.length === 0) return;
    const headers = ['Name', 'Email', 'Course', 'Enrolled Date', 'Progress'];
    const csvRows = [
      headers.join(','),
      ...enrollments.map(e => `"${e.name}","${e.email}","${e.course}","${e.enrolledDate}","${e.progress}%"`)
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enrollments_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredEnrollments.map(en => en.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDeleteEnrollment = async (id) => {
    if (!window.confirm("Are you sure you want to remove this enrollment?")) return;
    try {
      const response = await fetch('http://localhost:5000/api/enrollments/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] })
      });
      if (response.ok) {
        setEnrollments(prev => prev.filter(en => en.id !== id));
        setSelectedIds(prev => prev.filter(i => i !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to remove ${selectedIds.length} enrollments?`)) return;

    try {
      const response = await fetch('http://localhost:5000/api/enrollments/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (response.ok) {
        setEnrollments(prev => prev.filter(en => !selectedIds.includes(en.id)));
        setSelectedIds([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getProgressBadge = (progress) => {
    let dotColor = '#10b981'; // Green
    let bgColor = 'rgba(16, 185, 129, 0.04)';
    let borderColor = 'rgba(16, 185, 129, 0.2)';
    let textColor = '#10b981';
    let label = 'Completed';

    if (progress === 0) {
      dotColor = '#f43f5e'; // Red
      bgColor = 'rgba(244, 63, 94, 0.04)';
      borderColor = 'rgba(244, 63, 94, 0.2)';
      textColor = '#f43f5e';
      label = 'Not Started';
    } else if (progress < 100) {
      dotColor = '#3b82f6'; // Blue
      bgColor = 'rgba(59, 130, 246, 0.04)';
      borderColor = 'rgba(59, 130, 246, 0.2)';
      textColor = '#3b82f6';
      label = 'In Progress';
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 10px',
        borderRadius: '20px',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        color: textColor,
        fontSize: '11.5px',
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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const filteredEnrollments = enrollments.filter(e => {
    const matchesCourse = courseFilter === 'All' || e.course === courseFilter;
    const matchesSearch = (e.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (e.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (e.course || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  const uniqueCourses = ['All', ...new Set(enrollments.map(e => e.course))];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEnrollments = filteredEnrollments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);

  if (isLoading) return <LoadingSpinner message="Fetching enrollments..." />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Manage Enrollments</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track student progress and manage access to your courses.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '12px', background: 'var(--glass-inner)', padding: '10px 16px', borderRadius: '10px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '14px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {selectedIds.length > 0 && (
            <button
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f43f5e' }}
              onClick={handleBulkDelete}
            >
              <Trash2 size={18} /> Bulk Remove ({selectedIds.length})
            </button>
          )}
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleExportCSV}>
            <Download size={18} /> Export CSV
          </button>
          <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px' }}>
            <Filter size={18} color="var(--text-muted)" />
            <select 
              value={courseFilter}
              onChange={(e) => { setCourseFilter(e.target.value); setCurrentPage(1); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 500 }}
            >
              {uniqueCourses.map(course => (
                <option key={course} value={course} style={{ background: 'var(--bg-main)', color: 'var(--text-main)' }}>
                  {course === 'All' ? 'All Courses' : course}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn-primary"
            onClick={() => navigate('/bulk-add-students')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <UserPlus size={18} /> Bulk Enroll
          </button>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="table-container" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <div className="table-header" style={{ fontWeight: 700, fontSize: '18px', padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>Enrollment Ledger</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: '950px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--glass-inner-darker)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ width: '60px', padding: '18px 24px' }}>
                  <input type="checkbox" onChange={handleSelectAll} checked={filteredEnrollments.length > 0 && selectedIds.length === filteredEnrollments.length} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                </th>
                {/* <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>ID</th> */}
                <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Student</th>
                <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Enrolled Course</th>
                <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Enrolled Date</th>
                {/* <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Progress</th> */}
                <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEnrollments.map(enrollment => {
                const isSelected = selectedIds.includes(enrollment.id);
                const displayId = enrollment.id && enrollment.id.toString().startsWith('-N') 
                  ? `E${enrollment.id.toString().substring(3, 6).toUpperCase()}` 
                  : `E${enrollment.id}`;

                return (
                  <tr key={enrollment.id} style={{ background: isSelected ? 'rgba(99, 102, 241, 0.02)' : 'transparent', borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '18px 24px' }}>
                      <input type="checkbox" checked={isSelected} onChange={() => handleSelect(enrollment.id)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    </td>
                    {/* <td style={{ padding: '18px 24px', fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>{displayId}</td> */}
                    <td style={{ padding: '18px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px' }}>
                          {enrollment.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>{enrollment.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Mail size={12} /> {enrollment.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '18px 24px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>{enrollment.course}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Academic Track</div>
                    </td>
                    <td style={{ padding: '18px 24px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>{formatDate(enrollment.enrolledDate)}</div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>Joined</div>
                    </td>
                    {/* <td style={{ padding: '18px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '140px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {getProgressBadge(enrollment.progress)}
                          <span style={{ fontSize: '12px', fontWeight: 700, color: enrollment.progress === 100 ? '#10b981' : 'var(--text-main)' }}>{enrollment.progress}%</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--glass-inner-darker)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${enrollment.progress}%`, background: enrollment.progress === 100 ? '#10b981' : 'var(--primary)', borderRadius: '3px', transition: 'width 0.3s ease' }}></div>
                        </div>
                      </div>
                    </td> */}
                    <td style={{ padding: '18px 24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <button 
                          onClick={() => handleDeleteEnrollment(enrollment.id)}
                          title="Remove Enrollment"
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
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEnrollments.length)} of {filteredEnrollments.length} entries
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

export default ManageEnrollments;
