import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User, Briefcase, Shield, ArrowRight } from 'lucide-react';

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedRole) {
      localStorage.setItem('userRole', selectedRole);
      if (selectedRole === 'admin') {
        window.location.href = '/admin';
      } else if (selectedRole === 'instructor') {
        window.location.href = '/instructor';
      } else {
        window.location.href = '/';
      }
    }
  };

  const roles = [
    { id: 'student', icon: <User size={32} />, title: 'Student', desc: 'I want to browse and take courses.', color: 'var(--primary)' },
    { id: 'instructor', icon: <Briefcase size={32} />, title: 'Instructor', desc: 'I want to create and teach courses.', color: '#6366f1' },
    { id: 'admin', icon: <Shield size={32} />, title: 'Administrator', desc: 'I manage the platform and users.', color: '#f43f5e' }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', padding: '24px' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '800px', textAlign: 'center' }}
      >
        <div style={{ display: 'inline-flex', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', width: '56px', height: '56px', borderRadius: '16px', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <BookOpen color="white" size={32} />
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>Choose Your Path</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '48px', maxWidth: '500px', margin: '0 auto 48px' }}>
          Welcome to SSLABS LMS! To personalize your dashboard and experience, please tell us how you'll be using the platform.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {roles.map((role, idx) => (
            <motion.div 
              key={role.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              onClick={() => setSelectedRole(role.id)}
              className="glass"
              style={{ 
                padding: '32px 24px', 
                cursor: 'pointer', 
                background: selectedRole === role.id ? 'var(--glass-inner)' : 'var(--glass-inner-darker)',
                border: selectedRole === role.id ? `2px solid ${role.color}` : '2px solid transparent',
                transform: selectedRole === role.id ? 'translateY(-4px)' : 'none',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ color: role.color, marginBottom: '20px' }}>
                {role.icon}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>{role.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>{role.desc}</p>
            </motion.div>
          ))}
        </div>

        <button 
          className="btn-primary" 
          onClick={handleContinue}
          disabled={!selectedRole}
          style={{ 
            padding: '16px 48px', 
            fontSize: '18px', 
            borderRadius: '30px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '12px',
            opacity: !selectedRole ? 0.5 : 1,
            cursor: !selectedRole ? 'not-allowed' : 'pointer'
          }}
        >
          Continue to Dashboard <ArrowRight size={20} />
        </button>
      </motion.div>
    </div>
  );
};

export default RoleSelection;
