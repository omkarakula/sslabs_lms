import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddStudent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    courses: 0,
    status: 'Active'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/students', {
        method: 'POST',
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
        console.error('Failed to add student');
      }
    } catch (error) {
      console.error('Error adding student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '4px' }}>Add New Student</h1>
          <p style={{ color: 'var(--text-muted)' }}>Register a new student to the platform.</p>
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
                style={{ 
                  background: 'var(--glass-inner)', 
                  border: '1px solid var(--border)', 
                  padding: '12px 16px', 
                  borderRadius: '12px', 
                  color: 'var(--text-main)',
                  outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                placeholder="e.g. John Doe"
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
                style={{ 
                  background: 'var(--glass-inner)', 
                  border: '1px solid var(--border)', 
                  padding: '12px 16px', 
                  borderRadius: '12px', 
                  color: 'var(--text-main)',
                  outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                placeholder="john@example.com"
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
                style={{ 
                  background: 'var(--glass-inner)', 
                  border: '1px solid var(--border)', 
                  padding: '12px 16px', 
                  borderRadius: '12px', 
                  color: 'var(--text-main)',
                  outline: 'none',
                  transition: 'border-color 0.3s'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Initial Enrolled Courses (Optional)</label>
              <input 
                type="number" 
                name="courses"
                value={formData.courses}
                onChange={handleChange}
                min="0"
                style={{ 
                  background: 'var(--glass-inner)', 
                  border: '1px solid var(--border)', 
                  padding: '12px 16px', 
                  borderRadius: '12px', 
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
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
                style={{ 
                  background: 'var(--glass-inner)', 
                  border: '1px solid var(--border)', 
                  padding: '12px 16px', 
                  borderRadius: '12px', 
                  color: 'var(--text-main)',
                  outline: 'none',
                  appearance: 'none'
                }}
              >
                <option value="Active" style={{ background: 'var(--bg-main)' }}>Active</option>
                <option value="Inactive" style={{ background: 'var(--bg-main)' }}>Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => navigate('/admin/students')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save size={18} /> Add Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddStudent;
