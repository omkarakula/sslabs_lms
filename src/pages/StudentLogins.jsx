import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, 
  UserPlus, 
  Search, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Upload, 
  Trash2, 
  CheckCircle, 
  X, 
  FileText, 
  ArrowLeft, 
  AlertCircle, 
  Sparkles,
  Users,
  EyeIcon,
  Download
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const studentPhotos = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80"
];

const StudentLogins = () => {
  const fileInputRef = useRef(null);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [visiblePasswords, setVisiblePasswords] = useState({}); // Track password visibility per student

  // Modals state
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    name: '',
    email: '',
    password: '',
    status: 'Active',
    role: 'Student'
  });
  const [manualLoading, setManualLoading] = useState(false);

  // Bulk Form State
  const [csvInput, setCsvInput] = useState('');
  const [parsedLogins, setParsedLogins] = useState([]);
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    setIsLoading(true);
    fetch('http://localhost:5000/api/students')
      .then(res => res.json())
      .then(data => {
        const validData = Array.isArray(data) ? data.filter(s => s && s.name) : [];
        setStudents(validData);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const handleExportCSV = () => {
    if (students.length === 0) return;
    const headers = ['Name', 'Email', 'Password', 'Role', 'Status', 'Joined Date'];
    const csvRows = [
      headers.join(','),
      ...students.map(s => `"${s.name || ''}","${s.email || ''}","${s.password || 'Student@123'}","${s.role || 'Student'}","${s.status || 'Active'}","${s.joinedAt || ''}"`)
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_logins_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setManualForm(prev => ({ ...prev, password }));
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Submit manual student login
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: manualForm.name,
          email: manualForm.email,
          password: manualForm.password || 'Student@123',
          courses: 0,
          status: manualForm.status,
          role: manualForm.role || 'Student'
        })
      });
      if (response.ok) {
        const newStudent = await response.json();
        setStudents(prev => [newStudent, ...prev]);
        setManualModalOpen(false);
        setManualForm({ name: '', email: '', password: '', status: 'Active', role: 'Student' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setManualLoading(false);
    }
  };

  // Parse bulk csv pasted or loaded
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setBulkError('Please upload a valid .csv file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvInput(event.target.result);
      setBulkError('');
      setBulkSuccess('File loaded successfully! Click Preview to check.');
    };
    reader.readAsText(file);
  };

  const handleParseBulk = () => {
    setBulkError('');
    setBulkSuccess('');
    if (!csvInput.trim()) {
      setBulkError('Please paste or upload some CSV data.');
      return;
    }

    const lines = csvInput.split('\n');
    const parsed = [];
    let hasError = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',').map(p => p.trim());
      if (parts.length < 3) {
        setBulkError(`Error on line ${i + 1}: Format requires Name, Email, and Password.`);
        hasError = true;
        break;
      }

      const rawRole = parts[3] ? parts[3].trim() : 'Student';
      let parsedRole = 'Student';
      if (rawRole.toLowerCase().includes('admin')) {
        parsedRole = 'Administrator';
      } else if (rawRole.toLowerCase().includes('instruct') || rawRole.toLowerCase().includes('teacher')) {
        parsedRole = 'Instructor';
      }

      parsed.push({
        name: parts[0],
        email: parts[1],
        password: parts[2],
        role: parsedRole,
        courses: 0,
        status: 'Active'
      });
    }

    if (!hasError) {
      setParsedLogins(parsed);
      setBulkSuccess(`Successfully parsed ${parsed.length} credentials! Ready to upload.`);
    }
  };

  const handleBulkSubmit = async () => {
    if (parsedLogins.length === 0) return;
    setBulkLoading(true);
    setBulkError('');

    try {
      const response = await fetch('http://localhost:5000/api/students/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: parsedLogins })
      });

      if (response.ok) {
        setBulkSuccess(`Successfully created logins for ${parsedLogins.length} students!`);
        fetchStudents();
        setTimeout(() => {
          setBulkModalOpen(false);
          setParsedLogins([]);
          setCsvInput('');
          setBulkSuccess('');
        }, 1500);
      } else {
        setBulkError('Failed to import student logins.');
      }
    } catch (err) {
      setBulkError('Connection error while communicating with database.');
    } finally {
      setBulkLoading(false);
    }
  };

  // Delete Action State Router
  const confirmDelete = (idOrBulk) => {
    setStudentToDelete(idOrBulk);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!studentToDelete) return;
    const idsToDelete = studentToDelete === 'bulk' ? selectedIds : [studentToDelete];

    try {
      const response = await fetch('http://localhost:5000/api/students/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete })
      });
      if (response.ok) {
        setStudents(prev => prev.filter(s => !idsToDelete.includes(s.id)));
        setSelectedIds([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteModalOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredStudents.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredStudents = students.filter(s => 
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStudentPhoto = (student) => {
    if (student && student.avatar) return student.avatar;
    const name = (student && student.name) ? student.name : 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&rounded=true`;
  };

  const getRoleBadge = (role = 'Student') => {
    let dotColor = '#6366f1';
    let bgColor = 'rgba(99, 102, 241, 0.04)';
    let borderColor = 'rgba(99, 102, 241, 0.2)';
    let textColor = '#6366f1';

    if (role === 'Instructor') {
      dotColor = '#eab308';
      bgColor = 'rgba(234, 179, 8, 0.04)';
      borderColor = 'rgba(234, 179, 8, 0.2)';
      textColor = '#eab308';
    } else if (role === 'Administrator' || role === 'Admin') {
      dotColor = '#ec4899';
      bgColor = 'rgba(236, 72, 153, 0.04)';
      borderColor = 'rgba(236, 72, 153, 0.2)';
      textColor = '#ec4899';
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
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
        {role}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const isActive = status === 'Active';
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderRadius: '20px',
        background: isActive ? 'rgba(16, 185, 129, 0.04)' : 'rgba(244, 63, 94, 0.04)',
        border: isActive ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(244, 63, 94, 0.2)',
        color: isActive ? '#10b981' : '#f43f5e',
        fontSize: '11.5px',
        fontWeight: 600
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#10b981' : '#f43f5e' }} />
        {status || 'Active'}
      </span>
    );
  };

  if (isLoading) return <LoadingSpinner message="Retrieving credentials registry..." />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"Inter", sans-serif' }}
    >
      {/* Top Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>User Logins Manager</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage system authentication records, view passwords, and configure manual/bulk provisions for all users.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {selectedIds.length > 0 && (
            <button 
              className="btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f43f5e' }}
              onClick={() => confirmDelete('bulk')}
            >
              <Trash2 size={18} /> Delete Logins ({selectedIds.length})
            </button>
          )}
          <button 
            className="btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => setBulkModalOpen(true)}
          >
            <Upload size={18} /> Bulk Logins Import
          </button>
          <button 
            className="btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={handleExportCSV}
          >
            <Download size={18} /> Export Logins CSV
          </button>
          <button 
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => setManualModalOpen(true)}
          >
            <UserPlus size={18} /> Manual Login Add
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '12px', background: 'var(--glass-inner)', padding: '10px 16px', borderRadius: '10px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search students by name or authentication email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '14px' }}
          />
        </div>
      </div>

      {/* Interactive Directory Table */}
      {filteredStudents.length === 0 ? (
        <div className="glass" style={{ padding: '64px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Key size={48} color="var(--text-muted)" style={{ opacity: 0.6 }} />
          <h3 style={{ fontSize: '20px', fontWeight: 600 }}>No Logins Found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>No student credentials match your query. Try adding some manual logins or paste bulk data.</p>
        </div>
      ) : (
        <div className="table-container" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--glass-inner-darker)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ width: '50px', padding: '18px 24px' }}>
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll} 
                      checked={filteredStudents.length > 0 && selectedIds.length === filteredStudents.length} 
                      style={{ cursor: 'pointer' }} 
                    />
                  </th>
                  <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>User Info</th>
                  <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Login Email</th>
                  <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Login Password</th>
                  <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Role Type</th>
                  <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const isSelected = selectedIds.includes(student.id);
                  const isPasswordVisible = !!visiblePasswords[student.id];

                  return (
                    <tr key={student.id} style={{ background: isSelected ? 'rgba(99, 102, 241, 0.02)' : 'transparent', borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '18px 24px' }}>
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => handleSelect(student.id)} 
                          style={{ cursor: 'pointer' }} 
                        />
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img 
                            src={getStudentPhoto(student)} 
                            alt={student.name}
                            style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border)' }}
                          />
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14.5px' }}>{student.name}</div>
                        </div>
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontSize: '14px' }}>
                          <Mail size={14} color="var(--text-muted)" />
                          <span>{student.email}</span>
                        </div>
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Lock size={14} color="var(--text-muted)" />
                          <span style={{ 
                            fontFamily: isPasswordVisible ? 'monospace' : 'inherit', 
                            fontSize: '14px',
                            color: 'var(--text-main)',
                            letterSpacing: isPasswordVisible ? '0.5px' : '3px',
                            fontWeight: isPasswordVisible ? 600 : 800
                          }}>
                            {isPasswordVisible ? (student.password || 'Student@123') : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(student.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                          >
                            {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        {getRoleBadge(student.role)}
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        {getStatusBadge(student.status)}
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                        <button 
                          onClick={() => confirmDelete(student.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s', padding: 0 }}
                          onMouseOver={(e) => e.currentTarget.style.color = '#f43f5e'}
                          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* custom delete confirm modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass"
              style={{ width: '100%', maxWidth: '440px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: 'var(--shadow)' }}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(244, 63, 94, 0.08)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                <Trash2 size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 10px 0' }}>
                Delete Login Credentials?
              </h3>
              <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 28px 0' }}>
                Are you sure you want to permanently delete selected student login credentials? This action is irreversible.
              </p>
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button type="button" className="btn-secondary" onClick={() => { setDeleteModalOpen(false); setStudentToDelete(null); }} style={{ flex: 1, padding: '12px' }}>
                  Cancel
                </button>
                <button type="button" onClick={executeDelete} style={{ flex: 1, padding: '12px', background: '#f43f5e', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                  Delete permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual additions modal */}
      <AnimatePresence>
        {manualModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass"
              style={{ width: '100%', maxWidth: '520px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', boxShadow: 'var(--shadow)', position: 'relative' }}
            >
              <button 
                onClick={() => setManualModalOpen(false)}
                style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Add User Login</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '2px 0 0 0' }}>Provision single user login credentials manually.</p>
                </div>
              </div>

              <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={manualForm.name}
                    onChange={(e) => setManualForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. John Smith"
                    style={{ width: '100%', padding: '12px 16px', background: 'var(--glass-inner)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Account Type / Role</label>
                  <select 
                    value={manualForm.role}
                    onChange={(e) => setManualForm(prev => ({ ...prev, role: e.target.value }))}
                    style={{ width: '100%', padding: '12px 16px', background: 'var(--glass-inner)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                  >
                    <option value="Student" style={{ background: 'var(--bg-main)' }}>Student</option>
                    <option value="Instructor" style={{ background: 'var(--bg-main)' }}>Instructor</option>
                    <option value="Administrator" style={{ background: 'var(--bg-main)' }}>Administrator</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Login Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={manualForm.email}
                    onChange={(e) => setManualForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john.smith@gmail.com"
                    style={{ width: '100%', padding: '12px 16px', background: 'var(--glass-inner)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Login Password</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      required
                      value={manualForm.password}
                      onChange={(e) => setManualForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter or generate password"
                      style={{ flex: 1, padding: '12px 16px', background: 'var(--glass-inner)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-main)', outline: 'none', fontFamily: 'monospace' }}
                    />
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '0 16px' }}
                    >
                      <Sparkles size={14} /> Generate
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Initial Login Status</label>
                  <select 
                    value={manualForm.status}
                    onChange={(e) => setManualForm(prev => ({ ...prev, status: e.target.value }))}
                    style={{ width: '100%', padding: '12px 16px', background: 'var(--glass-inner)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                  >
                    <option value="Active" style={{ background: 'var(--bg-main)' }}>Active</option>
                    <option value="Suspended" style={{ background: 'var(--bg-main)' }}>Suspended</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setManualModalOpen(false)} style={{ flex: 1, padding: '12px' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={manualLoading} className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                    {manualLoading ? 'Saving...' : 'Add Credential'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk logins import modal */}
      <AnimatePresence>
        {bulkModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass"
              style={{ width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', boxShadow: 'var(--shadow)', position: 'relative' }}
            >
              <button 
                onClick={() => { setBulkModalOpen(false); setParsedLogins([]); setCsvInput(''); }}
                style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Bulk Import Credentials</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '2px 0 0 0' }}>Provision multiple student logins via pasting CSV records or file uploads.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>Option 1: Upload CSV</label>
                    <input 
                      type="file" 
                      accept=".csv" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      id="bulk-csv-logins"
                    />
                    <label 
                      htmlFor="bulk-csv-logins" 
                      className="btn-secondary" 
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%', justifyContent: 'center', padding: '12px' }}
                    >
                      <FileText size={18} /> Select .CSV File
                    </label>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>Format required: <code>Name, Email, Password, Role</code> (Role defaults to Student)</span>
                    <span style={{ marginTop: '4px' }}>Example: <code>Jane Watson, jane@example.com, Watson2026, Instructor</code></span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Option 2: Paste CSV Lines</label>
                  <textarea 
                    value={csvInput}
                    onChange={(e) => setCsvInput(e.target.value)}
                    placeholder="Jane Watson, jane@gmail.com, Watson2026, Student&#10;Thomas Lee, lee@gmail.com, ThomasLee!12, Instructor"
                    style={{ width: '100%', height: '140px', padding: '16px', background: 'var(--glass-inner)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none', resize: 'vertical', fontFamily: 'monospace' }}
                  />
                </div>

                {bulkError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(244, 63, 94, 0.08)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '8px', fontSize: '13.5px' }}>
                    <AlertCircle size={16} /> {bulkError}
                  </div>
                )}

                {bulkSuccess && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', fontSize: '13.5px' }}>
                    <CheckCircle size={16} /> {bulkSuccess}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-secondary" onClick={handleParseBulk}>Preview Credentials</button>
                  <button 
                    type="button" 
                    className="btn-primary"
                    disabled={bulkLoading || parsedLogins.length === 0}
                    onClick={handleBulkSubmit}
                    style={{ opacity: (bulkLoading || parsedLogins.length === 0) ? 0.6 : 1 }}
                  >
                    {bulkLoading ? 'Uploading...' : 'Import Logins'}
                  </button>
                </div>

                {parsedLogins.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Credentials Preview ({parsedLogins.length} Users)</h4>
                    <div className="table-container" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: 'var(--glass-inner-darker)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '12px 16px' }}>User Profile</th>
                            <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '12px 16px' }}>Login Email</th>
                            <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '12px 16px' }}>Password</th>
                            <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '12px 16px' }}>Role Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedLogins.map((student, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{student.name}</td>
                              <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{student.email}</td>
                              <td style={{ padding: '12px 16px', fontSize: '13px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-main)' }}>{student.password}</td>
                              <td style={{ padding: '12px 16px', fontSize: '13px' }}>{getRoleBadge(student.role)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StudentLogins;
