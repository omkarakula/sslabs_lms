import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, User, ArrowRight } from 'lucide-react';

const AuthGateway = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');
    const name = formData.get('name');

    if (!isLogin) {
      try {
        const response = await fetch('http://localhost:5000/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            password,
            role: 'Student',
            courses: 0,
            status: 'Active'
          })
        });
        if (response.ok) {
          const newUser = await response.json();
          localStorage.setItem('userId', newUser.id || newUser.name);
          localStorage.setItem('userName', newUser.name);
          localStorage.setItem('userEmail', newUser.email);
          localStorage.setItem('userRole', 'Student');
          navigate('/');
        } else {
          setError('Failed to create account. Email may already be in use.');
        }
      } catch (err) {
        setError('Registration server error. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/students');
      if (!response.ok) {
        throw new Error('Failed to reach authentication gateway.');
      }
      const data = await response.json();
      const users = Array.isArray(data) ? data : [];

      const matchedUser = users.find(
        u => u && u.email && u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (matchedUser) {
        localStorage.setItem('userId', matchedUser.id);
        localStorage.setItem('userName', matchedUser.name);
        localStorage.setItem('userEmail', matchedUser.email);
        localStorage.setItem('userRole', matchedUser.role || 'Student');
        if (matchedUser.avatar) {
          localStorage.setItem('userAvatar', matchedUser.avatar);
        } else {
          localStorage.removeItem('userAvatar');
        }

        const role = matchedUser.role || 'Student';
        if (role === 'Administrator' || role === 'Admin') {
          navigate('/admin');
        } else if (role === 'Instructor') {
          navigate('/instructor');
        } else {
          navigate('/');
        }
      } else {
        setError('Invalid credentials. Please enter a valid login provisioned in the User Logins Manager.');
      }
    } catch (err) {
      setError('Authentication server error. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', padding: '24px' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass"
        style={{ width: '100%', maxWidth: '480px', padding: '40px', background: 'var(--glass-inner)' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <BookOpen color="white" size={28} />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {isLogin ? 'Sign in to access your dashboard' : 'Join SSLABS LMS and start learning today'}
          </p>
        </div>

        {/* Toggle Login / Register */}
        <div style={{ display: 'flex', background: 'var(--glass-inner-darker)', padding: '4px', borderRadius: '12px', marginBottom: '32px' }}>
          <button 
            type="button"
            onClick={() => setIsLogin(true)}
            style={{ 
              flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.3s',
              background: isLogin ? 'var(--glass-inner)' : 'transparent',
              color: isLogin ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: isLogin ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            Login
          </button>
          <button 
            type="button"
            onClick={() => setIsLogin(false)}
            style={{ 
              flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.3s',
              background: !isLogin ? 'var(--glass-inner)' : 'transparent',
              color: !isLogin ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: !isLogin ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  name="name"
                  required 
                  placeholder="John Doe"
                  style={{ width: '100%', padding: '14px 16px 14px 44px', background: 'var(--glass-inner-darker)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                name="email"
                required 
                placeholder="you@example.com"
                style={{ width: '100%', padding: '14px 16px 14px 44px', background: 'var(--glass-inner-darker)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Password</label>
              {isLogin && <span style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Forgot?</span>}
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                name="password"
                required 
                placeholder="••••••••"
                style={{ width: '100%', padding: '14px 16px 14px 44px', background: 'var(--glass-inner-darker)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>
          </div>

          {error && (
            <div style={{ 
              padding: '12px', 
              background: 'rgba(244, 63, 94, 0.08)', 
              color: '#f43f5e', 
              border: '1px solid rgba(244, 63, 94, 0.2)', 
              borderRadius: '10px', 
              fontSize: '13.5px',
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary" 
            style={{ width: '100%', padding: '16px', marginTop: '12px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (isLogin ? 'Signing In...' : 'Creating Account...') : (isLogin ? 'Sign In' : 'Create Account')} <ArrowRight size={18} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AuthGateway;
