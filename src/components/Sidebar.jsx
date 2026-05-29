import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  User, 
  Users, 
  Settings, 
  LogOut, 
  Layout, 
  HelpCircle, 
  FileText, 
  ChevronDown, 
  Plus, 
  FilePlus, 
  Grid,
  MessageSquare,
  Key,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
  // Normalize stored role to lower‑case and handle Administrator alias
  React.useEffect(() => {
    const stored = localStorage.getItem('userRole');
    if (stored) {
      const normalized = stored.toLowerCase() === 'administrator' ? 'admin' : stored.toLowerCase();
      if (normalized !== stored) {
        localStorage.setItem('userRole', normalized);
      }
    }
  }, []);


  const rawRole = localStorage.getItem('userRole') || 'student';
  const userRole = rawRole.toLowerCase() === 'administrator' ? 'admin' : rawRole.toLowerCase();

  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState({
    courses: location.pathname.startsWith('/admin/courses') || location.pathname.startsWith('/admin/add-course'),
    users: location.pathname.startsWith('/admin/students') || location.pathname.startsWith('/bulk-add-students') || location.pathname.startsWith('/admin/students/logins')
  });

  const toggleSubmenu = (menu) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    window.location.href = '/auth';
  };

  return (
    <div className="sidebar" style={{ position: 'sticky', top: '0', width: '270px', margin: '0', height: '100vh', display: 'flex', flexDirection: 'column', padding: '32px 20px', background: 'var(--bg-card)', borderRight: '1px solid var(--border)', zIndex: 100 }}>
      {/* Brand Logo */}
      <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', flexShrink: 0 }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}>
          <Layout color="white" size={18} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.75px', color: 'var(--text-main)', textTransform: 'uppercase', margin: 0 }}>SSLABS LMS</h2>
      </div>

      {/* Main Navigation */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', paddingRight: '4px', minHeight: 0 }}>
        
        {/* STUDENT PORTAL MENU */}
        {userRole === 'student' && (
          <>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: '12px 12px 8px 12px' }}>Student Menu</div>
            <NavItem to="/" icon={<Home size={18} />} label="Dashboard" />
            <NavItem to="/courses" icon={<BookOpen size={18} />} label="My Courses" />
            <NavItem to="/quizzes" icon={<HelpCircle size={18} />} label="My Quizzes" />
            <NavItem to="/practice" icon={<Code size={18} />} label="Practice Questions" />
          </>
        )}

        {/* INSTRUCTOR PORTAL MENU */}
        {userRole === 'instructor' && (
          <>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: '12px 12px 8px 12px' }}>Instructor Menu</div>
            <NavItem to="/instructor" icon={<Layout size={18} />} label="Instructor Dashboard" />
            <NavItem to="/instructor/enrollments" icon={<Users size={18} />} label="Manage Enrollments" />
            <NavItem to="/instructor/quizzes" icon={<HelpCircle size={18} />} label="Manage Quizzes" />
            <NavItem to="/instructor/practice" icon={<Code size={18} />} label="Manage Practice Qs" />
            <NavItem to="/reports" icon={<FileText size={18} />} label="Student Reports" />
          </>
        )}

        {/* ADMIN PORTAL MENU WITH COLLAPSIBLE SUB-MENUS */}
        {userRole === 'admin' && (
          <>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: '12px 12px 8px 12px' }}>Admin Menu</div>
            
            <NavItem to="/admin" icon={<Home size={18} />} label="Admin Dashboard" />

            {/* Courses Collapsible Submenu */}
            <CollapsibleParent 
              label="Course Hub" 
              icon={<BookOpen size={18} />} 
              isOpen={openSubmenus.courses} 
              onClick={() => toggleSubmenu('courses')}
            />
            <AnimatePresence initial={false}>
              {openSubmenus.courses && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}
                >
                  <SubNavItem to="/admin/courses" label="Course Directory" icon={<Grid size={14} />} />
                  <SubNavItem to="/admin/add-course" label="Create Course" icon={<Plus size={14} />} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Users Collapsible Submenu */}
            <CollapsibleParent 
              label="User Manager" 
              icon={<Users size={18} />} 
              isOpen={openSubmenus.users} 
              onClick={() => toggleSubmenu('users')}
            />
            <AnimatePresence initial={false}>
              {openSubmenus.users && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}
                >
                  <SubNavItem to="/admin/students" label="Student Directory" icon={<Users size={14} />} />
                  <SubNavItem to="/admin/students/logins" label="User Logins" icon={<Key size={14} />} />
                  <SubNavItem to="/bulk-add-students" label="Bulk Import" icon={<FilePlus size={14} />} />
                </motion.div>
              )}
            </AnimatePresence>

            <NavItem to="/admin/enrollments" icon={<Users size={18} />} label="Enrollment Ledger" />
            <NavItem to="/reports" icon={<FileText size={18} />} label="Student Reports" />
            <NavItem to="/admin/feedback" icon={<MessageSquare size={18} />} label="Received Feedback" />
            <NavItem to="/admin/practice" icon={<Code size={18} />} label="Manage Practice Qs" />
            <NavItem to="/settings" icon={<Settings size={18} />} label="Settings" />
          </>
        )}

        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: '16px 12px 8px 12px' }}>Account</div>
        <NavItem to="/profile" icon={<User size={18} />} label="Profile" />
      </nav>

      {/* Logout Action */}
      <div className="logout" style={{ marginTop: 'auto', flexShrink: 0, paddingTop: '16px' }}>
        <button 
          className="btn-secondary" 
          onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', padding: '12px', borderRadius: '12px', fontWeight: 600 }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
};

// Main NavItem Link Component
const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    style={({ isActive }) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '12px',
      textDecoration: 'none',
      color: isActive ? 'var(--primary)' : 'var(--text-main)',
      background: isActive ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
      paddingLeft: isActive ? '13px' : '16px',
      fontWeight: isActive ? 700 : 500,
      fontSize: '14px',
      transition: 'all 0.2s ease',
    })}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

// Collapsible Submenu Header Component
const CollapsibleParent = ({ icon, label, isOpen, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      padding: '12px 16px',
      borderRadius: '12px',
      background: 'none',
      border: 'none',
      color: 'var(--text-main)',
      fontWeight: 500,
      fontSize: '14px',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'background 0.2s ease',
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-inner)'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {icon}
      <span>{label}</span>
    </div>
    <motion.div
      animate={{ rotate: isOpen ? 180 : 0 }}
      transition={{ duration: 0.2 }}
      style={{ display: 'flex', alignItems: 'center' }}
    >
      <ChevronDown size={16} color="var(--text-muted)" />
    </motion.div>
  </button>
);

// Collapsible Submenu Item Component
const SubNavItem = ({ to, label, icon }) => (
  <NavLink
    to={to}
    style={({ isActive }) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 16px',
      borderRadius: '8px',
      textDecoration: 'none',
      color: isActive ? 'var(--primary)' : 'var(--text-muted)',
      background: isActive ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
      fontWeight: isActive ? 600 : 500,
      fontSize: '13px',
      transition: 'all 0.2s ease',
    })}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export default Sidebar;
