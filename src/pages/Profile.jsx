import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Edit2 } from 'lucide-react';

const Profile = () => {
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: localStorage.getItem('userName') || 'Prasad R.',
    email: localStorage.getItem('userEmail') || 'prasad.r@gmail.com',
    phone: localStorage.getItem('userPhone') || '+91 98765 43210',
    dob: localStorage.getItem('userDob') || '12 May 2001',
    joinedDate: localStorage.getItem('userJoinedDate') || 'January 10, 2026',
    role: (localStorage.getItem('userRole') || 'Student').charAt(0).toUpperCase() + (localStorage.getItem('userRole') || 'Student').slice(1),
    title: localStorage.getItem('userTitle') || 'Student',
    location: localStorage.getItem('userLocation') || 'Bangalore, India',
    bio: localStorage.getItem('userBio') || 'I am a passionate software learner pursuing computer science. I focus on learning modern web development frameworks and architectures, practicing my frontend designs, and exploring backend engineering.',
    avatar: localStorage.getItem('userAvatar') || '',
    password: '••••••••'
  });

  const [editForm, setEditForm] = useState({ ...profileData });

  useEffect(() => {
    setEditForm({ ...profileData });
  }, [profileData]);

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatar = reader.result;
        setEditForm(prev => ({ ...prev, avatar: newAvatar }));
        setProfileData(prev => ({ ...prev, avatar: newAvatar }));
        localStorage.setItem('userAvatar', newAvatar);
        window.dispatchEvent(new Event('profileUpdate'));
        
        const userId = localStorage.getItem('userId');
        if (userId) {
          fetch(`http://localhost:5000/api/students/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatar: newAvatar })
          }).catch(err => console.error("Failed to sync avatar to backend", err));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setProfileData({ ...editForm });
    localStorage.setItem('userName', editForm.name);
    localStorage.setItem('userEmail', editForm.email);
    localStorage.setItem('userPhone', editForm.phone);
    localStorage.setItem('userDob', editForm.dob);
    localStorage.setItem('userJoinedDate', editForm.joinedDate);
    localStorage.setItem('userRole', editForm.role);
    localStorage.setItem('userTitle', editForm.title);
    localStorage.setItem('userLocation', editForm.location);
    localStorage.setItem('userBio', editForm.bio);
    localStorage.setItem('userAvatar', editForm.avatar);
    
    // Dispatch event to sync other components like Navbar
    window.dispatchEvent(new Event('profileUpdate'));
    
    const userId = localStorage.getItem('userId');
    if (userId) {
      fetch(`http://localhost:5000/api/students/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: editForm.name,
          email: editForm.email,
          role: editForm.role
        })
      }).catch(err => console.error("Failed to sync details to backend", err));
    }
    
    alert('Changes saved successfully!');
  };

  // Inline SVGs for social media icons to guarantee perfect fidelity and loading
  const socialIcons = [
    { name: 'Facebook', bg: '#e0f2fe', color: '#0284c7', svg: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" /></svg> },
    { name: 'X', bg: '#f1f5f9', color: '#334155', svg: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
    { name: 'Instagram', bg: '#fce7f3', color: '#db2777', svg: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" /></svg> },
    { name: 'YouTube', bg: '#fee2e2', color: '#dc2626', svg: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.553a3.002 3.002 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.553 9.388.553 9.388.553s7.518 0 9.388-.553a3.002 3.002 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg> },
    { name: 'LinkedIn', bg: '#e0f2fe', color: '#2563eb', svg: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg> },
    { name: 'Pinterest', bg: '#fee2e2', color: '#be123c', svg: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12.289 2C6.617 2 2 6.617 2 12.289c0 4.338 2.705 8.014 6.56 9.516-.09-.81-.17-2.06.03-2.95l1.74-7.37s-.44-.89-.44-2.2c0-2.06 1.2-3.6 2.69-3.6 1.27 0 1.88.95 1.88 2.1 0 1.27-.81 3.18-1.23 4.95-.35 1.48.74 2.69 2.2 2.69 2.64 0 4.67-2.78 4.67-6.8 0-3.56-2.56-6.05-6.21-6.05-4.24 0-6.73 3.18-6.73 6.47 0 1.28.49 2.66 1.11 3.41.12.15.14.28.1.44l-.42 1.74c-.07.28-.23.35-.53.21-1.97-.92-3.2-3.81-3.2-6.14 0-5.01 3.64-9.61 10.5-9.61 5.51 0 9.79 3.93 9.79 9.17 0 5.48-3.46 9.89-8.26 9.89-1.61 0-3.13-.84-3.65-1.83l-1 3.79c-.36 1.39-1.34 3.12-2 4.21 1.54.48 3.18.74 4.88.74 5.67 0 10.289-4.617 10.289-10.289C22.578 6.617 17.961 2 12.289 2z" /></svg> },
    { name: 'Telegram', bg: '#e0f2fe', color: '#0284c7', svg: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.37.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" /></svg> },
    { name: 'TikTok', bg: '#f1f5f9', color: '#1e293b', svg: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31.02 2.61.1 3.9.24V4.7c-.88-.28-1.8-.42-2.73-.42-.51 0-1 .08-1.5.24-.75.25-1.43.68-1.97 1.25-.54.56-.93 1.27-1.11 2.05-.12.52-.18 1.06-.18 1.6v2.85h4.64c-.16 1.44-.8 2.76-1.8 3.72-.94.9-2.18 1.4-3.48 1.4-1.3 0-2.54-.5-3.48-1.4a5.006 5.006 0 0 1-1.47-3.56c0-1.36.54-2.66 1.47-3.56.9-.88 2.13-1.38 3.41-1.4V.02zm8.85 5.53a5.59 5.59 0 0 1-3.6-1.37V.02h4.37c0 1.23.4 2.42 1.13 3.41a5.61 5.61 0 0 1 2.5 2.12h-4.4z" /></svg> },
    { name: 'Reddit', bg: '#ffedd5', color: '#ea580c', svg: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.23-1.72l1.3-4.14 4.23.9c.04.97.84 1.76 1.82 1.76 1 0 1.8-0.8 1.8-1.8s-0.8-1.8-1.8-1.8c-0.84 0-1.56.58-1.75 1.36l-4.75-1.02c-0.18-.04-.38.04-.46.2l-1.6 5.08c-2.47.04-4.75.68-6.43 1.7-0.54-.74-1.42-1.2-2.37-1.2-1.65 0-3 1.35-3 3 0 1.12.63 2.1 1.56 2.6-.06.27-.1.54-.1.82 0 4.14 4.93 7.5 11 7.5s11-3.36 11-7.5c0-.28-.04-.55-.1-.82.9-.5 1.53-1.48 1.53-2.6zm-18.5 2c0-1.1.9-2 2-2s2 .9 2 2-1 .9-2 2-2-.9-2-2zm10 4.5c-1.77 1.77-5.23 1.77-7 0-0.15-.15-.15-.38 0-.53.15-.15.38-.15.53 0 1.48 1.48 4.46 1.48 5.94 0 0.15-.15.38-.15.53 0 0.15.15 0 .38-.15.53zm-1.5-2.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" /></svg> }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1200px', margin: '0 auto', fontFamily: '"Inter", sans-serif', paddingBottom: '40px' }}
    >
      {/* Dynamic Header Card */}
      <div className="glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px', borderRadius: '16px', background: 'var(--glass-bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={editForm.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
              alt={editForm.name}
              style={{ width: '92px', height: '92px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--glass-bg)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'; }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Change Profile Picture"
              style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#2563eb', border: '2px solid var(--glass-bg)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ffffff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
            >
              <Camera size={14} />
            </button>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 14px 0' }}>{profileData.name}</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ display: 'inline-block', padding: '4px 12px', background: '#2563eb', color: '#ffffff', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                {profileData.role}
              </span>
            </div>
          </div>
        </div>

        {/* <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" style={{ background: '#2563eb', border: '1px solid #2563eb', padding: '10px 22px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Message
          </button>
          <button className="btn-secondary" style={{ border: '1px solid #f97316', color: '#f97316', padding: '10px 22px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, background: 'transparent' }}>
            Follow
          </button>
        </div> */}
      </div>

      {/* Main Grid Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '28px' }}>

        {/* Left Side Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Basic Information Card */}
          <div className="glass" style={{ padding: '24px', borderRadius: '16px', background: 'var(--glass-bg)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Basic Information</h3>
              <button
                onClick={() => { const input = document.getElementById('form-name'); if (input) input.focus(); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Edit Details"
              >
                <Edit2 size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</span>
                <div style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 600, marginTop: '4px' }}>{profileData.name}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</span>
                <div style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 600, marginTop: '4px', wordBreak: 'break-all' }}>{profileData.email}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</span>
                <div style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 600, marginTop: '4px' }}>{profileData.phone}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date of Birth</span>
                <div style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 600, marginTop: '4px' }}>{profileData.dob}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Joined Date</span>
                <div style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 600, marginTop: '4px' }}>{profileData.joinedDate}</div>
              </div>
            </div>
          </div>

          {/* Social Media Links Card */}
          {/* <div className="glass" style={{ padding: '24px', borderRadius: '16px', background: 'var(--glass-bg)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 18px 0', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>Social Media Links</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              {socialIcons.map((social) => (
                <a
                  key={social.name}
                  href="#"
                  title={social.name}
                  onClick={(e) => e.preventDefault()}
                  style={{ width: '42px', height: '42px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: social.bg, color: social.color, transition: 'transform 0.2s', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {social.svg}
                </a>
              ))}
            </div>
          </div> */}

          {/* Expertise Card */}
          {/* <div className="glass" style={{ padding: '24px', borderRadius: '16px', background: 'var(--glass-bg)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 18px 0', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>Expertise</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
                  <span>Javascript</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--glass-inner-darker)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '80%', background: '#2563eb', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
                  <span>PHP</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--glass-inner-darker)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '90%', background: '#2563eb', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
                  <span>Photoshop</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--glass-inner-darker)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '50%', background: '#2563eb', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
                  <span>illustrator</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--glass-inner-darker)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '85%', background: '#2563eb', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>
          </div> */}

        </div>

        {/* Right Side Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Account Settings Form Card */}
          <div className="glass" style={{ padding: '32px', borderRadius: '16px', background: 'var(--glass-bg)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 24px 0', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>Account Settings</h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="form-name" style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Full Name</label>
                  <input
                    type="text"
                    id="form-name"
                    name="name"
                    value={editForm.name}
                    onChange={handleChange}
                    style={{ padding: '12px 16px', background: 'var(--glass-inner)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', fontSize: '14px' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="form-email" style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Email</label>
                  <input
                    type="email"
                    id="form-email"
                    name="email"
                    value={editForm.email}
                    onChange={handleChange}
                    style={{ padding: '12px 16px', background: 'var(--glass-inner)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="form-phone" style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Phone</label>
                  <input
                    type="text"
                    id="form-phone"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleChange}
                    style={{ padding: '12px 16px', background: 'var(--glass-inner)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', fontSize: '14px' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="form-role" style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Role</label>
                  <input
                    type="text"
                    id="form-role"
                    name="role"
                    value={editForm.role}
                    onChange={handleChange}
                    style={{ padding: '12px 16px', background: 'var(--glass-inner-darker)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-muted)', outline: 'none', fontSize: '14px', cursor: 'not-allowed' }}
                    disabled
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="form-location" style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Location</label>
                  <input
                    type="text"
                    id="form-location"
                    name="location"
                    value={editForm.location}
                    onChange={handleChange}
                    style={{ padding: '12px 16px', background: 'var(--glass-inner)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', fontSize: '14px' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="form-password" style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>New Password</label>
                  <input
                    type="password"
                    id="form-password"
                    name="password"
                    value={editForm.password}
                    onChange={handleChange}
                    style={{ padding: '12px 16px', background: 'var(--glass-inner)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="form-bio" style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Bio</label>
                <textarea
                  id="form-bio"
                  name="bio"
                  value={editForm.bio}
                  onChange={handleChange}
                  rows="4"
                  style={{ padding: '14px 16px', background: 'var(--glass-inner)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', fontSize: '14px', resize: 'vertical', lineHeight: '1.6' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ background: '#10b981', border: '1px solid #10b981', padding: '12px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone Card */}
          {/* <div style={{ padding: '32px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ef4444', margin: 0 }}>Danger Zone</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 24px 0', fontWeight: 500 }}>Critical actions that affect your account.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ paddingRight: '20px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#ef4444', margin: 0 }}>Delete Account</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '6px 0 0 0', lineHeight: 1.5 }}>This action is <strong>permanent</strong> and cannot be undone. Please make sure you really want to delete your account.</p>
                </div>
                <button className="btn-primary" style={{ background: '#ef4444', border: '1px solid #ef4444', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, flexShrink: 0 }}>
                  Delete Account
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ paddingRight: '20px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--primary)', margin: 0 }}>Export Your Data</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '6px 0 0 0', lineHeight: 1.5 }}>Backup your data in case you decide to delete your account later.</p>
                </div>
                <button className="btn-secondary" style={{ border: '1px solid var(--primary)', color: 'var(--primary)', background: 'transparent', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, flexShrink: 0 }}>
                  Export Data
                </button>
              </div>

            </div>
          </div> */}

        </div>

      </div>
    </motion.div>
  );
};

export default Profile;
