import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    courses: 0,
    status: 'Active',
    role: 'Student'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/students')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const student = data.find(s => String(s.id) === String(id));
          if (student) {
            setFormData({
              name: student.name || '',
              email: student.email || '',
              phone: student.phone || '',
              courses: student.courses || 0,
              status: student.status || 'Active',
              role: student.role || 'Student'
            });
          } else {
            console.error("Student not found");
          }
        }
      })
      .catch(err => console.error("Error fetching student", err))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`http://localhost:5000/api/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          courses: parseInt(formData.courses) || 0
        }),
      });

      if (response.ok) {
        navigate('/admin/students');
      } else {
        console.error('Failed to update student');
      }
    } catch (error) {
      console.error('Error updating student:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) return <LoadingSpinner message="Loading student details..." />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button 
          onClick={() => navigate('/admin/students')}
          style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--glass-inner)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '4px' }}>Edit Student Record</h1>
          <p style={{ color: 'var(--text-muted)' }}>Update the details of an existing student.</p>
        </div>
      </div>

      <div className="glass" style={{ padding: '32px', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Full Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ background: 'var(--glass-inner)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Email Address</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ background: 'var(--glass-inner)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Phone Number</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                style={{ background: 'var(--glass-inner)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Enrolled Courses Count</label>
              <input 
                type="number" 
                name="courses"
                value={formData.courses}
                onChange={handleChange}
                min="0"
                style={{ background: 'var(--glass-inner)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Status</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{ background: 'var(--glass-inner)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: '12px', color: 'var(--text-main)', outline: 'none', appearance: 'none' }}
              >
                <option value="Active" style={{ background: 'var(--bg-main)' }}>Active</option>
                <option value="Suspended" style={{ background: 'var(--bg-main)' }}>Suspended</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={() => navigate('/admin/students')}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isSaving ? <span>Saving...</span> : <><Save size={18} /> Update Student</>}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditStudent;
