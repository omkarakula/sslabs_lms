import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Star, IndianRupee, Plus, Edit2, CheckCircle, Trash2, Search, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [gradingQueue, setGradingQueue] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 5;

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/metrics/instructor').then(res => res.json()),
      fetch('http://localhost:5000/api/courses').then(res => res.json())
    ])
      .then(([metricsData, coursesData]) => {
        if (metricsData.stats) {
          setStats([
            { title: 'Total Students', value: metricsData.stats.totalStudents, icon: <Users size={24} color="var(--primary)" /> },
            { title: 'Course Rating', value: metricsData.stats.courseRating, icon: <Star size={24} color="#f59e0b" /> },
            { title: 'Revenue', value: metricsData.stats.revenue, icon: <IndianRupee size={24} color="#10b981" /> },
            { title: 'Active Courses', value: metricsData.stats.activeCourses, icon: <BookOpen size={24} color="var(--secondary)" /> }
          ]);
        }
        if (metricsData.gradingQueue) {
          setGradingQueue(Array.isArray(metricsData.gradingQueue) ? metricsData.gradingQueue : []);
        }
        const validCourses = Array.isArray(coursesData) ? coursesData.filter(c => c && c.id && c.title) : [];
        setCourses(validCourses);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

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
      } else {
        console.error('Failed to bulk delete');
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

  const filteredCourses = courses.filter(c => 
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  if (isLoading) return <LoadingSpinner message="Fetching your instructor dashboard..." />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Instructor Portal</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your courses, grade assignments, and track performance.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/admin/add-course')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Create New Course
        </button>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        {stats.map((stat, idx) => (
          <div key={idx} className="glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--glass-inner-darker)', borderRadius: '12px' }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>{stat.title}</p>
              <h3 style={{ fontSize: '24px', fontWeight: 700 }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.3fr', gap: '24px', alignItems: 'start' }}>
        {/* Course Management */}
        <div className="table-container" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>My Course Inventory</h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--glass-inner)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <Search size={14} color="var(--text-muted)" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', fontSize: '13px', width: '100px' }}
                />
              </div>
              {selectedIds.length > 0 && (
                <button onClick={handleBulkDelete} style={{ background: '#f43f5e', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
                  <Trash2 size={14} /> Delete Selected
                </button>
              )}
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--glass-inner-darker)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ width: '50px', padding: '16px 20px' }}>
                    <input type="checkbox" onChange={handleSelectAll} checked={filteredCourses.length > 0 && selectedIds.length === filteredCourses.length} style={{ cursor: 'pointer' }} />
                  </th>
                  <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '16px 20px', letterSpacing: '0.5px' }}>Course</th>
                  <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '16px 20px', letterSpacing: '0.5px' }}>Students</th>
                  <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '16px 20px', letterSpacing: '0.5px' }}>Rating</th>
                  <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '16px 20px', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '16px 20px', letterSpacing: '0.5px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCourses.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No courses found.</td>
                  </tr>
                ) : (
                  currentCourses.map(course => {
                    const isSelected = selectedIds.includes(course.id);
                    return (
                      <tr key={course.id} style={{ background: isSelected ? 'rgba(99, 102, 241, 0.02)' : 'transparent', borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <input type="checkbox" checked={isSelected} onChange={() => handleSelect(course.id)} style={{ cursor: 'pointer' }} />
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>{course.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{course.category}</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>{course.students || 0}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Enrolled</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>
                            <Star size={14} color="#f59e0b" fill="#f59e0b" /> {course.rating || '0.0'}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Feedback Score</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>{getStatusBadge(course.status)}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px' }}>
                            <Link 
                              to={`/course/${course.id}`} 
                              title="View Course"
                              style={{ color: 'var(--text-muted)', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
                              onMouseOver={(e) => e.currentTarget.style.color = '#3b82f6'}
                              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                              <Eye size={18} />
                            </Link>
                            <Link 
                              to={`/admin/edit-course/${course.id}`}
                              title="Edit Course"
                              style={{ color: 'var(--text-muted)', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
                              onMouseOver={(e) => e.currentTarget.style.color = '#10b981'}
                              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                              <Edit2 size={16} />
                            </Link>
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
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredCourses.length)} of {filteredCourses.length}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '12px', opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  Prev
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '12px', opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Grading Queue */}
        <div className="glass" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Grading Queue</h2>
            <span style={{ background: 'var(--primary)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{gradingQueue.length} Pending</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {gradingQueue.length > 0 ? gradingQueue.map(item => (
              <div key={item.id} style={{ background: 'var(--glass-inner-darker)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>{item.student}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.submitted}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {item.course} • {item.assignment}
                </div>
                <button title="Grade Assignment" className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px' }}>
                  <CheckCircle size={16} /> Grade Now
                </button>
              </div>
            )) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>All caught up! No assignments pending.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InstructorDashboard;
