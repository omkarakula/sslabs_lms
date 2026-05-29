import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User as UserIcon, Moon, Sun, ChevronDown, BookOpen, Layers, Laptop, PenTool, Database, Star, ArrowRight, HelpCircle, Check, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const megaMenuRef = useRef(null);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [isMegaOpen, setIsMegaOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const bellMenuRef = useRef(null);

  // Fetch notifications from server
  const fetchNotifications = () => {
    fetch('http://localhost:5000/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setNotifications(sorted);
        }
      })
      .catch(err => console.error('Error fetching notifications:', err));
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside for bell dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellMenuRef.current && !bellMenuRef.current.contains(event.target)) {
        setIsBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllAsRead = () => {
    fetch('http://localhost:5000/api/notifications/read-all', { method: 'POST' })
      .then(res => res.json())
      .then(() => fetchNotifications())
      .catch(err => console.error(err));
  };

  const handleClearAll = () => {
    fetch('http://localhost:5000/api/notifications/clear-all', { method: 'POST' })
      .then(res => res.json())
      .then(() => setNotifications([]))
      .catch(err => console.error(err));
  };

  const handleNotificationClick = () => {
    handleMarkAllAsRead();
    setIsBellOpen(false);
    navigate('/quizzes');
  };

  const [profileName, setProfileName] = useState(() => localStorage.getItem('userName') || 'Prasad R.');
  const [profileRole, setProfileRole] = useState(() => {
    const role = localStorage.getItem('userRole');
    const title = localStorage.getItem('userTitle');
    if (role) {
      return role.charAt(0).toUpperCase() + role.slice(1);
    }
    return title || 'Student';
  });
  const [profileAvatar, setProfileAvatar] = useState(() => localStorage.getItem('userAvatar') || '');

  useEffect(() => {
    const handleProfileUpdate = () => {
      setProfileName(localStorage.getItem('userName') || 'Prasad R.');
      setProfileAvatar(localStorage.getItem('userAvatar') || '');
      
      const role = localStorage.getItem('userRole');
      const title = localStorage.getItem('userTitle');
      if (role) {
        setProfileRole(role.charAt(0).toUpperCase() + role.slice(1));
      } else {
        setProfileRole(title || 'Student');
      }
    };

    window.addEventListener('profileUpdate', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdate', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
        setIsMegaOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className="navbar" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 99, background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}>
      
      {/* Left Search and Mega Menu Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }} ref={megaMenuRef}>
        {/* Search Bar */}
        {/* <div className="search-bar glass" style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', width: '300px', gap: '10px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search courses, modules..." 
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '13.5px' }}
          />
        </div> */}

        {/* Mega Menu Toggle Button */}
        {/* <button 
          onClick={() => setIsMegaOpen(!isMegaOpen)}
          className="btn-secondary"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '10px 16px', 
            fontSize: '13.5px', 
            fontWeight: 600,
            cursor: 'pointer',
            borderRadius: '10px',
            border: isMegaOpen ? '1px solid var(--primary)' : '1px solid var(--border)',
            color: isMegaOpen ? 'var(--primary)' : 'var(--text-main)',
            background: isMegaOpen ? 'rgba(99, 102, 241, 0.04)' : 'var(--glass-inner)'
          }}
        >
          <Layers size={16} />
          <span>Explore</span>
          <motion.div animate={{ rotate: isMegaOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} />
          </motion.div>
        </button> */}

        {/* MEGA MENU CONTAINER */}
        <AnimatePresence>
          {isMegaOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: '52px',
                left: 0,
                width: '740px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
                padding: '24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr) 1.2fr',
                gap: '24px',
                zIndex: 1000
              }}
            >
              {/* Column 1: Web Development */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--primary)' }}>
                  <Laptop size={16} />
                  <span style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Development</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <MegaItem to="/courses" title="React & Next.js Masterclass" subtitle="Frontend development" />
                  <MegaItem to="/courses" title="Node.js & Express" subtitle="Backend infrastructure" />
                  <MegaItem to="/courses" title="Python Bootcamp" subtitle="Data & scripting" />
                </div>
              </div>

              {/* Column 2: Design & UX */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#ec4899' }}>
                  <PenTool size={16} />
                  <span style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Design</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <MegaItem to="/courses" title="UI/UX Core Principles" subtitle="User-centered design" />
                  <MegaItem to="/courses" title="Figma Advanced Prototyping" subtitle="High-fidelity flows" />
                  <MegaItem to="/courses" title="Graphic Design Foundations" subtitle="Visual identities" />
                </div>
              </div>

              {/* Column 3: Data & Cloud */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#10b981' }}>
                  <Database size={16} />
                  <span style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data Science</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <MegaItem to="/courses" title="SQL & Databases" subtitle="Relational analytics" />
                  <MegaItem to="/courses" title="Data Visualization" subtitle="Insights & charting" />
                  <MegaItem to="/courses" title="AWS Cloud Architecture" subtitle="Scalable deployments" />
                </div>
              </div>

              {/* Column 4: Promo Card / Featured */}
              <div style={{
                background: 'rgba(99, 102, 241, 0.03)',
                border: '1px solid rgba(99, 102, 241, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    background: 'rgba(99, 102, 241, 0.08)',
                    color: 'var(--primary)',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                  }}>Featured Track</span>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>AI & Machine Learning</h4>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>Master Neural Networks and Deep Learning from first principles.</p>
                </div>

                <button 
                  onClick={() => { setIsMegaOpen(false); navigate('/courses'); }}
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = 0.9}
                  onMouseOut={(e) => e.currentTarget.style.opacity = 1}
                >
                  <span>Explore Track</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right User actions */}
      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="glass" onClick={toggleTheme} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '8px' }}>
          {isDark ? <Sun size={18} color="var(--text-muted)" /> : <Moon size={18} color="var(--text-muted)" />}
        </button>
        <div style={{ position: 'relative' }} ref={bellMenuRef}>
          <button 
            className="glass" 
            onClick={() => setIsBellOpen(!isBellOpen)} 
            style={{ 
              width: '40px', 
              height: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer', 
              borderRadius: '8px',
              position: 'relative' 
            }}
          >
            <Bell size={18} color="var(--text-muted)" />
            {notifications.some(n => !n.read) && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '10px',
                height: '10px',
                background: '#ef4444',
                borderRadius: '50%',
                border: '2px solid var(--bg-card)'
              }} />
            )}
          </button>

          {/* Bell Dropdown */}
          <AnimatePresence>
            {isBellOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  top: '52px',
                  right: 0,
                  width: '320px',
                  maxHeight: '400px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  zIndex: 1000
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>Notifications</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {notifications.length > 0 && (
                      <>
                        <button 
                          onClick={handleMarkAllAsRead} 
                          title="Mark all as read"
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}
                        >
                          <Check size={12} /> Read All
                        </button>
                        <button 
                          onClick={handleClearAll} 
                          title="Clear all"
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}
                        >
                          <Trash2 size={12} /> Clear
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, maxHeight: '280px', paddingRight: '4px' }}>
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const timeStr = new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
                      return (
                        <div 
                          key={n.id}
                          onClick={handleNotificationClick}
                          style={{
                            display: 'flex',
                            gap: '10px',
                            padding: '10px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: n.read ? 'transparent' : 'rgba(99, 102, 241, 0.04)',
                            borderLeft: n.read ? '3px solid transparent' : '3px solid var(--primary)',
                            border: '1px solid var(--border)',
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-inner)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(99, 102, 241, 0.04)'}
                        >
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <HelpCircle size={14} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                            <span style={{ fontSize: '12px', fontWeight: n.read ? 500 : 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
                              {n.message}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                              {timeStr}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div 
          className="user-profile glass" 
          onClick={() => navigate('/profile')}
          style={{ display: 'flex', alignItems: 'center', padding: '5px 12px 5px 5px', gap: '10px', cursor: 'pointer', borderRadius: '10px' }}
        >
          <div style={{ width: '30px', height: '30px', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)' }}>
            {profileAvatar ? (
              <img 
                src={profileAvatar} 
                alt={profileName} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const parent = e.target.parentElement;
                  if (parent) {
                    const fallback = parent.querySelector('.user-icon-fallback');
                    if (fallback) fallback.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div 
              className="user-icon-fallback" 
              style={{ 
                display: profileAvatar ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%'
              }}
            >
              <UserIcon size={16} color="white" />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{profileName}</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{profileRole}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for Mega Menu items with elegant hover state
const MegaItem = ({ to, title, subtitle }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Link 
      to={to} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '8px 12px',
        borderRadius: '8px',
        textDecoration: 'none',
        background: isHovered ? 'var(--glass-inner)' : 'transparent',
        transition: 'background 0.2s ease'
      }}
    >
      <span style={{ fontWeight: 600, fontSize: '12.5px', color: isHovered ? 'var(--primary)' : 'var(--text-main)' }}>{title}</span>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{subtitle}</span>
    </Link>
  );
};

export default Navbar;
