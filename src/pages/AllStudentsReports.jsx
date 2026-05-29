import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, Award, Clock, Search, Download, Filter, CheckCircle, XCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const AllStudentsReports = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Tab control: 'progress' | 'quizzes'
  const [activeTab, setActiveTab] = useState('progress');
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [quizSearchQuery, setQuizSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetch('http://localhost:5000/api/students')
      .then(res => res.json())
      .then(data => {
        // Filter out instructors and admins, keeping only actual students
        const studentUsers = data.filter(s => (s.role || '').toLowerCase() === 'student');
        
        // Enriched mock metrics including quiz submissions for each student
        const enrichedStudents = studentUsers.map((s, index) => {
          const score1 = Math.floor(Math.random() * 4) + 7; // 7-10
          const score2 = Math.floor(Math.random() * 5) + 5; // 5-10
          
          return {
            ...s,
            completionRate: Math.floor(Math.random() * 60) + 40, // 40-100%
            avgScore: Math.floor((score1 + score2) * 5), // average percentage
            timeSpent: Math.floor(Math.random() * 50) + 10, // 10-60 hours
            lastActive: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString(),
            quizzesTaken: [
              {
                id: `q-${s.id}-1`,
                courseTitle: index % 2 === 0 ? 'React & Next.js Masterclass' : 'UX/UI Design Principles',
                moduleName: 'Module 1: Fundamentals & Concepts',
                score: score1,
                totalQuestions: 10,
                timeTaken: `${Math.floor(Math.random() * 5) + 8}m ${Math.floor(Math.random() * 50) + 10}s`,
                status: (score1 / 10) >= 0.7 ? 'Pass' : 'Fail',
                date: new Date(Date.now() - Math.floor(Math.random() * 3000000000)).toLocaleDateString()
              },
              {
                id: `q-${s.id}-2`,
                courseTitle: index % 2 === 0 ? 'React & Next.js Masterclass' : 'UX/UI Design Principles',
                moduleName: 'Module 2: Core Workflows',
                score: score2,
                totalQuestions: 10,
                timeTaken: `${Math.floor(Math.random() * 6) + 9}m ${Math.floor(Math.random() * 50) + 10}s`,
                status: (score2 / 10) >= 0.7 ? 'Pass' : 'Fail',
                date: new Date(Date.now() - Math.floor(Math.random() * 5000000000)).toLocaleDateString()
              }
            ]
          };
        });
        setStudents(enrichedStudents);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  // Flatten quiz attempts from all students
  const allQuizAttempts = [];
  students.forEach(student => {
    if (student.quizzesTaken) {
      student.quizzesTaken.forEach(attempt => {
        allQuizAttempts.push({
          ...attempt,
          studentName: student.name,
          studentEmail: student.email
        });
      });
    }
  });

  // Reset pagination when tab or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, quizSearchQuery, statusFilter]);

  // Export reports to CSV
  const handleExportCSV = () => {
    if (students.length === 0) return;
    
    let csvString = '';
    let filename = '';

    if (activeTab === 'progress') {
      const headers = ['Name', 'Email', 'Completion Rate', 'Avg Score', 'Time Spent (hrs)', 'Last Active'];
      const csvRows = [
        headers.join(','),
        ...students.map(s => `"${s.name}","${s.email}","${s.completionRate}%","${s.avgScore}","${s.timeSpent}","${s.lastActive}"`)
      ];
      csvString = csvRows.join('\n');
      filename = 'student_progress_report.csv';
    } else {
      const headers = ['Student Name', 'Student Email', 'Course', 'Module', 'Score Achieved', 'Total Questions', 'Time Taken', 'Result', 'Attempt Date'];
      const csvRows = [
        headers.join(','),
        ...allQuizAttempts.map(q => `"${q.studentName}","${q.studentEmail}","${q.courseTitle}","${q.moduleName}","${q.score}","${q.totalQuestions}","${q.timeTaken}","${q.status}","${q.date}"`)
      ];
      csvString = csvRows.join('\n');
      filename = 'student_quizzes_report.csv';
    }

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Filter progress students
  const filteredStudents = students.filter(student =>
    (student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter quiz attempts
  const filteredQuizzes = allQuizAttempts.filter(quiz => {
    const matchesSearch = 
      (quiz.studentName || '').toLowerCase().includes(quizSearchQuery.toLowerCase()) ||
      (quiz.courseTitle || '').toLowerCase().includes(quizSearchQuery.toLowerCase()) ||
      (quiz.moduleName || '').toLowerCase().includes(quizSearchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || quiz.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const currentQuizzes = filteredQuizzes.slice(indexOfFirstItem, indexOfLastItem);
  
  const totalPages = activeTab === 'progress' 
    ? Math.ceil(filteredStudents.length / itemsPerPage) 
    : Math.ceil(filteredQuizzes.length / itemsPerPage);

  if (isLoading) return <LoadingSpinner message="Generating consolidated reports..." />;

  // Aggregate Progress Stats
  const avgCompletion = Math.round(students.reduce((acc, curr) => acc + curr.completionRate, 0) / (students.length || 1));
  const avgPlatformScore = Math.round(students.reduce((acc, curr) => acc + curr.avgScore, 0) / (students.length || 1));
  const totalHours = students.reduce((acc, curr) => acc + curr.timeSpent, 0);

  // Aggregate Quiz Stats
  const totalQuizAttemptsCount = allQuizAttempts.length;
  const passedQuizAttemptsCount = allQuizAttempts.filter(q => q.status === 'Pass').length;
  const passPercent = totalQuizAttemptsCount > 0 ? Math.round((passedQuizAttemptsCount / totalQuizAttemptsCount) * 100) : 0;
  const averageQuizScore = totalQuizAttemptsCount > 0 
    ? Math.round(allQuizAttempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions) * 100, 0) / totalQuizAttemptsCount)
    : 0;

  const getResultBadge = (status) => {
    const isPass = status === 'Pass';
    const dotColor = isPass ? '#10b981' : '#f43f5e';
    const bgColor = isPass ? 'rgba(16, 185, 129, 0.04)' : 'rgba(244, 63, 94, 0.04)';
    const borderColor = isPass ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)';
    const textColor = isPass ? '#10b981' : '#f43f5e';

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
        {status}
      </span>
    );
  };

  const getProgressBadge = (progress) => {
    let dotColor = '#3b82f6';
    let bgColor = 'rgba(59, 130, 246, 0.04)';
    let borderColor = 'rgba(59, 130, 246, 0.2)';
    let textColor = '#3b82f6';
    let label = 'In Progress';

    if (progress === 100) {
      dotColor = '#10b981';
      bgColor = 'rgba(16, 185, 129, 0.04)';
      borderColor = 'rgba(16, 185, 129, 0.2)';
      textColor = '#10b981';
      label = 'Completed';
    } else if (progress === 0) {
      dotColor = '#64748b';
      bgColor = 'rgba(100, 116, 139, 0.04)';
      borderColor = 'rgba(100, 116, 139, 0.2)';
      textColor = '#64748b';
      label = 'Not Started';
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
        fontSize: '11px',
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

  const getScoreBadge = (score) => {
    let dotColor = '#10b981'; // Green
    let bgColor = 'rgba(16, 185, 129, 0.04)';
    let borderColor = 'rgba(16, 185, 129, 0.2)';
    let textColor = '#10b981';

    if (score < 60) {
      dotColor = '#f43f5e'; // Red
      bgColor = 'rgba(244, 63, 94, 0.04)';
      borderColor = 'rgba(244, 63, 94, 0.2)';
      textColor = '#f43f5e';
    } else if (score < 80) {
      dotColor = '#3b82f6'; // Blue
      bgColor = 'rgba(59, 130, 246, 0.04)';
      borderColor = 'rgba(59, 130, 246, 0.2)';
      textColor = '#3b82f6';
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
        fontSize: '11px',
        fontWeight: 600
      }}>
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: dotColor
        }} />
        {score}%
      </span>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"Inter", sans-serif' }}
    >
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="glass" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--glass-bg)', border: '1px solid var(--border)' }}>
            <FileText size={24} color="var(--primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Platform Reports</h1>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '14px' }}>Comprehensive analytics and detailed performance summaries.</p>
          </div>
        </div>
        <button 
          className="btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '14px', fontWeight: 600 }}
          onClick={handleExportCSV}
        >
          <Download size={18} /> Export Full {activeTab === 'progress' ? 'Progress' : 'Quiz'} Report
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', gap: '24px' }}>
        <button 
          onClick={() => setActiveTab('progress')}
          style={{ 
            padding: '12px 4px', 
            fontSize: '15px', 
            fontWeight: 700, 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'progress' ? '3px solid var(--primary)' : '3px solid transparent', 
            color: activeTab === 'progress' ? 'var(--primary)' : 'var(--text-muted)', 
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          📊 Student Progress
        </button>
        <button 
          onClick={() => setActiveTab('quizzes')}
          style={{ 
            padding: '12px 4px', 
            fontSize: '15px', 
            fontWeight: 700, 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'quizzes' ? '3px solid var(--primary)' : '3px solid transparent', 
            color: activeTab === 'quizzes' ? 'var(--primary)' : 'var(--text-muted)', 
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          📝 Quiz Performance Reports
        </button>
      </div>

      {/* Aggregate Stats Cards */}
      {activeTab === 'progress' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          <div className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--border)' }}>
            <div style={{ padding: '14px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '12px', color: 'var(--primary)' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 4px 0', fontWeight: 600 }}>Avg. Completion Rate</p>
              <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{avgCompletion}%</h3>
            </div>
          </div>
          <div className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--border)' }}>
            <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', color: '#10b981' }}>
              <Award size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 4px 0', fontWeight: 600 }}>Avg. Assessment Score</p>
              <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{avgPlatformScore}%</h3>
            </div>
          </div>
          <div className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--border)' }}>
            <div style={{ padding: '14px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '12px', color: '#f59e0b' }}>
              <Clock size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 4px 0', fontWeight: 600 }}>Total Learning Hours</p>
              <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{totalHours} hrs</h3>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          <div className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--border)' }}>
            <div style={{ padding: '14px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '12px', color: 'var(--primary)' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 4px 0', fontWeight: 600 }}>Total Quiz Attempts</p>
              <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{totalQuizAttemptsCount}</h3>
            </div>
          </div>
          <div className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--border)' }}>
            <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', color: '#10b981' }}>
              <Award size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 4px 0', fontWeight: 600 }}>Passing Accuracy</p>
              <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{passPercent}%</h3>
            </div>
          </div>
          <div className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--border)' }}>
            <div style={{ padding: '14px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '12px', color: '#3b82f6' }}>
              <Clock size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 4px 0', fontWeight: 600 }}>Average Quiz Score</p>
              <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{averageQuizScore}%</h3>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Panel */}
      {activeTab === 'progress' ? (
        <div className="glass" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '12px', background: 'var(--glass-inner)', padding: '10px 16px', borderRadius: '10px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search students by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '14px' }}
            />
          </div>
        </div>
      ) : (
        <div className="glass" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '12px', background: 'var(--glass-inner)', padding: '10px 16px', borderRadius: '10px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search by student, course, or module..." 
              value={quizSearchQuery}
              onChange={(e) => setQuizSearchQuery(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '14px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px' }}>
              <Filter size={18} color="var(--text-muted)" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 500 }}
              >
                <option value="All" style={{ background: 'var(--bg-main)', color: 'var(--text-main)' }}>All Results</option>
                <option value="Pass" style={{ background: 'var(--bg-main)', color: 'var(--text-main)' }}>Pass</option>
                <option value="Fail" style={{ background: 'var(--bg-main)', color: 'var(--text-main)' }}>Fail</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab Specific Content Tables */}
      {activeTab === 'progress' ? (
        <div className="table-container" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="table-header" style={{ fontWeight: 700, fontSize: '18px', padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>Student Progress Log</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
              <thead>
                <tr style={{ background: 'var(--glass-inner-darker)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Student Info</th>
                  <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Completion Rate</th>
                  <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Avg. Score</th>
                  <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Time Spent</th>
                  <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontWeight: 500 }}>No progress reports found matching your search.</td>
                  </tr>
                ) : (
                  currentStudents.map(student => (
                    <tr key={student.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '14px' }}>
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14.5px' }}>{student.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '140px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {getProgressBadge(student.completionRate)}
                            <span style={{ fontSize: '12.5px', fontWeight: 700, color: student.completionRate === 100 ? '#10b981' : 'var(--text-main)' }}>{student.completionRate}%</span>
                          </div>
                          <div style={{ height: '6px', background: 'var(--glass-inner-darker)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${student.completionRate}%`, background: student.completionRate > 85 ? '#10b981' : 'var(--primary)', borderRadius: '3px', transition: 'width 0.3s ease' }}></div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>{student.avgScore}%</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {student.avgScore >= 85 ? 'Excellent' : (student.avgScore < 70 ? 'Needs Focus' : 'Good Progress')}
                        </div>
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>{student.timeSpent} hrs</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Dedicated Study</div>
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>{student.lastActive}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Last Access</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="table-container" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="table-header" style={{ fontWeight: 700, fontSize: '18px', padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>Quiz Attempt Summary</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
              <thead>
                <tr style={{ background: 'var(--glass-inner-darker)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Student Info</th>
                  <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Course & Module Assessment</th>
                  <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Score achieved</th>
                  <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Time Taken</th>
                  <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Result</th>
                  <th style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Date Attempted</th>
                </tr>
              </thead>
              <tbody>
                {currentQuizzes.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontWeight: 500 }}>No quiz reports found matching your criteria.</td>
                  </tr>
                ) : (
                  currentQuizzes.map(quiz => (
                    <tr key={quiz.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '14px' }}>
                            {quiz.studentName.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>{quiz.studentName}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{quiz.studentEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>{quiz.courseTitle}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 500 }}>{quiz.moduleName}</div>
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px', color: quiz.status === 'Pass' ? '#10b981' : '#f43f5e' }}>
                            {quiz.score} / {quiz.totalQuestions}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                            ({Math.round((quiz.score / quiz.totalQuestions) * 100)}%)
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '18px 24px', color: 'var(--text-main)', fontWeight: 600, fontSize: '14px' }}>
                        {quiz.timeTaken}
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        {getResultBadge(quiz.status)}
                      </td>
                      <td style={{ padding: '18px 24px', color: 'var(--text-muted)', fontSize: '13.5px', fontWeight: 500 }}>
                        {quiz.date}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '16px', background: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, activeTab === 'progress' ? filteredStudents.length : filteredQuizzes.length)} of {activeTab === 'progress' ? filteredStudents.length : filteredQuizzes.length} entries
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-secondary" 
              style={{ padding: '8px 16px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', opacity: currentPage === 1 ? 0.5 : 1, transition: 'all 0.2s' }}
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-secondary" 
              style={{ padding: '8px 16px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, transition: 'all 0.2s' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AllStudentsReports;
