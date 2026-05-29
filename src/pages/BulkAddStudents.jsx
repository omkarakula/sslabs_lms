import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowLeft, Upload, AlertCircle, CheckCircle, FileText, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BulkAddStudents = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [csvData, setCsvData] = useState('');
  const [parsedStudents, setParsedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 5;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid .csv file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvData(event.target.result);
      setError('');
      setSuccess('File loaded successfully! Click Preview Data to verify.');
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
    };
    reader.readAsText(file);
  };

  const handleParse = () => {
    setError('');
    setSuccess('');
    if (!csvData.trim()) {
      setError('Please enter some CSV data first.');
      return;
    }

    const lines = csvData.split('\n');
    const students = [];
    let hasError = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split(',').map(p => p.trim());
      if (parts.length < 2) {
        setError(`Error on line ${i + 1}: Each line must have at least a Name and Email.`);
        hasError = true;
        break;
      }

      students.push({
        name: parts[0],
        email: parts[1],
        courses: parts[2] ? parseInt(parts[2]) : 0,
        status: 'Active'
      });
    }

    if (!hasError) {
      setParsedStudents(students);
      setCurrentPage(1);
    }
  };

  const filteredStudentsList = parsedStudents.filter(s => 
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudentsList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudentsList.length / itemsPerPage);

  const handleSubmit = async () => {
    if (parsedStudents.length === 0) {
      setError('No students to upload. Please parse data first.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/students/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ students: parsedStudents }),
      });

      if (response.ok) {
        setSuccess(`Successfully added ${parsedStudents.length} students!`);
        setCsvData('');
        setParsedStudents([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      } else {
        const errData = await response.json();
        setError(errData.error || 'Failed to upload students.');
      }
    } catch (err) {
      setError('An error occurred while communicating with the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--glass-inner)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '4px' }}>Bulk Import Students</h1>
          <p style={{ color: 'var(--text-muted)' }}>Quickly add multiple students by uploading or pasting CSV data.</p>
        </div>
      </div>

      <div className="glass" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Option 1: Upload CSV File</label>
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="csv-upload"
            />
            <label 
              htmlFor="csv-upload" 
              className="btn-secondary" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <FileText size={18} /> Select .CSV File
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Option 2: Paste CSV Data</label>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Format required: <code>Name, Email, Enrolled Courses (Optional)</code>. Example: <br/><code>Jane Doe, jane@example.com, 2</code><br/><code>John Smith, john@example.com</code></p>
          <textarea 
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            placeholder="Jane Doe, jane@example.com, 2&#10;John Smith, john@smith.com, 0"
            style={{ width: '100%', height: '200px', padding: '16px', background: 'var(--glass-inner)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none', resize: 'vertical', fontFamily: 'monospace' }}
          />
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>
            <CheckCircle size={18} /> {success}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button className="btn-secondary" onClick={handleParse}>Preview Data</button>
          <button 
            className="btn-primary" 
            onClick={handleSubmit} 
            disabled={loading || parsedStudents.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: (loading || parsedStudents.length === 0) ? 0.6 : 1 }}
          >
            <Upload size={18} /> {loading ? 'Uploading...' : 'Upload Students'}
          </button>
        </div>

        {parsedStudents.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Preview ({parsedStudents.length} Students)</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--glass-inner)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <Search size={14} color="var(--text-muted)" />
                <input 
                  type="text" 
                  placeholder="Search preview..." 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', fontSize: '13px', width: '150px' }}
                />
              </div>
            </div>
            
            <div className="table-container" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--glass-inner-darker)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '16px 20px', letterSpacing: '0.5px' }}>Student Info</th>
                      <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '16px 20px', letterSpacing: '0.5px' }}>Enrolled Courses</th>
                      <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '16px 20px', letterSpacing: '0.5px' }}>Import Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents.map((student, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '13px' }}>
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>{student.name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>{student.courses} Courses</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Assigned</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            background: 'rgba(16, 185, 129, 0.04)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            color: '#10b981',
                            fontSize: '11.5px',
                            fontWeight: 600
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                            Ready
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStudentsList.length)} of {filteredStudentsList.length} entries
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '12px', opacity: currentPage === 1 ? 0.5 : 1 }}
                    >
                      Previous
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
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BulkAddStudents;
