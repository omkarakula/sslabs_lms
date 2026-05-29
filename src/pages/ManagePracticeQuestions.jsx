import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, 
  Plus, 
  Upload, 
  Download, 
  Search, 
  Trash2, 
  X, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  HelpCircle
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const ManagePracticeQuestions = () => {
  const fileInputRef = useRef(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals state
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    title: '',
    difficulty: 'Easy',
    category: 'Algorithms',
    acceptance: '50.0%',
    description: '',
    input1: '',
    output1: '',
    explanation1: '',
    constraint1: '',
    constraint2: ''
  });
  const [manualLoading, setManualLoading] = useState(false);

  // Bulk Form State
  const [csvInput, setCsvInput] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = () => {
    setIsLoading(true);
    fetch('http://localhost:5000/api/practice-questions')
      .then(res => res.json())
      .then(data => {
        const validData = Array.isArray(data) ? data.filter(q => q && q.title) : [];
        setQuestions(validData);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const handleExportCSV = () => {
    if (questions.length === 0) return;
    const headers = ['Title', 'Difficulty', 'Category', 'Acceptance', 'Description'];
    const csvRows = [
      headers.join(','),
      ...questions.map(q => `"${q.title || ''}","${q.difficulty || 'Easy'}","${q.category || 'Algorithms'}","${q.acceptance || '50%'}","${(q.description || '').replace(/"/g, '""')}"`)
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'practice_questions_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Helper to generate typical boilerplate templates/solutions based on title
  const generateTemplatesAndSolutions = (title) => {
    const cleanTitle = title.replace(/\s+/g, '');
    const methodName = cleanTitle.charAt(0).toLowerCase() + cleanTitle.slice(1);
    
    return {
      templates: {
        java: `class Solution {\n    public void ${methodName}() {\n        // Write your Java code here\n        \n    }\n}`,
        python3: `class Solution:\n    def ${methodName}(self):\n        # Write your Python 3 code here\n        pass`,
        python: `class Solution(object):\n    def ${methodName}(self):\n        # Write your Python code here\n        pass`,
        javascript: `/**\n * Solution function\n */\nvar ${methodName} = function() {\n    // Write your JavaScript code here\n    \n};`,
        typescript: `function ${methodName}(): void {\n    // Write your TypeScript code here\n    \n};`
      },
      solutions: {
        java: `class Solution {\n    public void ${methodName}() {\n        // Completed solution code\n        System.out.println("Hello World");\n    }\n}`,
        python3: `class Solution:\n    def ${methodName}(self):\n        # Completed solution code\n        print("Hello World")`,
        python: `class Solution(object):\n    def ${methodName}(self):\n        # Completed solution code\n        print "Hello World"`,
        javascript: `var ${methodName} = function() {\n    // Completed solution code\n    console.log("Hello World");\n};`,
        typescript: `function ${methodName}(): void {\n    // Completed solution code\n    console.log("Hello World");\n};`
      }
    };
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualLoading(true);

    const { templates, solutions } = generateTemplatesAndSolutions(manualForm.title);
    const newQuestion = {
      title: manualForm.title,
      difficulty: manualForm.difficulty,
      category: manualForm.category,
      acceptance: manualForm.acceptance || '50.0%',
      description: manualForm.description || `Write an algorithm for ${manualForm.title}.`,
      examples: [
        {
          input: manualForm.input1 || 'N/A',
          output: manualForm.output1 || 'N/A',
          explanation: manualForm.explanation1 || ''
        }
      ],
      constraints: [
        manualForm.constraint1 || 'Time complexity: O(n)',
        manualForm.constraint2 || 'Space complexity: O(1)'
      ],
      templates,
      solutions,
      editorial: `### Approach\n\nAnalyze the constraints and implement the logical partition strategy to solve this optimally.`
    };

    try {
      const response = await fetch('http://localhost:5000/api/practice-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
      });
      if (response.ok) {
        const questionWithId = await response.json();
        setQuestions(prev => [questionWithId, ...prev]);
        setManualModalOpen(false);
        setManualForm({
          title: '',
          difficulty: 'Easy',
          category: 'Algorithms',
          acceptance: '50.0%',
          description: '',
          input1: '',
          output1: '',
          explanation1: '',
          constraint1: '',
          constraint2: ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setManualLoading(false);
    }
  };

  // Bulk File Upload Parsing
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

    // Check if headers exist
    const startIndex = lines[0].toLowerCase().includes('title') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
      if (parts.length < 3) {
        setBulkError(`Error on line ${i + 1}: CSV must contain Title, Difficulty, and Category.`);
        hasError = true;
        break;
      }

      const title = parts[0];
      const difficulty = parts[1] || 'Easy';
      const category = parts[2] || 'Algorithms';
      const acceptance = parts[3] || '50.0%';
      const description = parts[4] || `Write an algorithm for ${title}.`;

      const { templates, solutions } = generateTemplatesAndSolutions(title);

      parsed.push({
        title,
        difficulty,
        category,
        acceptance,
        description,
        examples: [{ input: 'N/A', output: 'N/A', explanation: '' }],
        constraints: ['Time complexity: O(n)', 'Space complexity: O(1)'],
        templates,
        solutions,
        editorial: '### Approach\n\nAnalyze the constraints and partition parameters.'
      });
    }

    if (!hasError) {
      setParsedQuestions(parsed);
      setBulkSuccess(`Successfully parsed ${parsed.length} questions! Ready to upload.`);
    }
  };

  const handleBulkSubmit = async () => {
    if (parsedQuestions.length === 0) return;
    setBulkLoading(true);
    setBulkError('');

    try {
      const response = await fetch('http://localhost:5000/api/practice-questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: parsedQuestions })
      });

      if (response.ok) {
        setBulkSuccess(`Successfully uploaded ${parsedQuestions.length} practice questions!`);
        fetchQuestions();
        setTimeout(() => {
          setBulkModalOpen(false);
          setParsedQuestions([]);
          setCsvInput('');
          setBulkSuccess('');
        }, 1500);
      } else {
        setBulkError('Failed to import practice questions.');
      }
    } catch (err) {
      setBulkError('Connection error while communicating with database.');
    } finally {
      setBulkLoading(false);
    }
  };

  // Delete Action Trigger
  const confirmDelete = (idOrBulk) => {
    setQuestionToDelete(idOrBulk);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!questionToDelete) return;
    const idsToDelete = questionToDelete === 'bulk' ? selectedIds : [questionToDelete];

    try {
      const response = await fetch('http://localhost:5000/api/practice-questions/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete })
      });
      if (response.ok) {
        setQuestions(prev => prev.filter(q => !idsToDelete.includes(q.id) && !idsToDelete.includes(q.id.toString())));
        setSelectedIds([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteModalOpen(false);
      setQuestionToDelete(null);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredQuestions.map(q => q.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredQuestions = questions.filter(q => 
    (q.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'Easy') return '#10b981';
    if (difficulty === 'Medium') return '#f59e0b';
    return '#ef4444';
  };

  if (isLoading) return <LoadingSpinner message="Retrieving coding registry..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"Inter", sans-serif' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>Manage Practice Questions</h1>
          <p style={{ color: 'var(--text-muted)' }}>Publish manual coding questions, load bulk CSV registries, and configure coding test cases.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {selectedIds.length > 0 && (
            <button 
              className="btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f43f5e' }}
              onClick={() => confirmDelete('bulk')}
            >
              <Trash2 size={18} /> Delete Selected ({selectedIds.length})
            </button>
          )}
          <button 
            className="btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => setBulkModalOpen(true)}
          >
            <Upload size={18} /> Bulk CSV Import
          </button>
          <button 
            className="btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={handleExportCSV}
          >
            <Download size={18} /> Export Questions CSV
          </button>
          <button 
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => setManualModalOpen(true)}
          >
            <Plus size={18} /> Add Coding Question
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '12px', background: 'var(--glass-inner)', padding: '10px 16px', borderRadius: '10px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search questions by title or category..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '14px' }}
          />
        </div>
      </div>

      {/* Questions Directory Table */}
      {filteredQuestions.length === 0 ? (
        <div className="glass" style={{ padding: '64px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Code size={48} color="var(--text-muted)" style={{ opacity: 0.6 }} />
          <h3 style={{ fontSize: '20px', fontWeight: 600 }}>No Practice Questions Found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>Publish single questions or upload a CSV file to get started.</p>
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
                      checked={filteredQuestions.length > 0 && selectedIds.length === filteredQuestions.length} 
                      style={{ cursor: 'pointer' }} 
                    />
                  </th>
                  <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Question Info</th>
                  <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Category</th>
                  <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Acceptance Rate</th>
                  <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px' }}>Difficulty</th>
                  <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '18px 24px', letterSpacing: '0.5px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((q) => {
                  const isSelected = selectedIds.includes(q.id);

                  return (
                    <tr key={q.id} style={{ background: isSelected ? 'rgba(99, 102, 241, 0.02)' : 'transparent', borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '18px 24px' }}>
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => handleSelect(q.id)} 
                          style={{ cursor: 'pointer' }} 
                        />
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Code size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14.5px' }}>{q.title}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>ID: {q.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '18px 24px', fontSize: '14px', color: 'var(--text-main)' }}>{q.category}</td>
                      <td style={{ padding: '18px 24px', fontSize: '14px', color: 'var(--text-muted)' }}>{q.acceptance || '50.0%'}</td>
                      <td style={{ padding: '18px 24px' }}>
                        <span style={{ color: getDifficultyColor(q.difficulty), fontWeight: 700, fontSize: '13px' }}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                        <button 
                          onClick={() => confirmDelete(q.id)}
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

      {/* Delete Confirmation Modal */}
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
                Delete Coding Question?
              </h3>
              <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 28px 0' }}>
                Are you sure you want to permanently delete selected practice coding questions? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button type="button" className="btn-secondary" onClick={() => { setDeleteModalOpen(false); setQuestionToDelete(null); }} style={{ flex: 1, padding: '12px' }}>
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

      {/* Manual question additions modal */}
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
              style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', boxShadow: 'var(--shadow)', position: 'relative' }}
            >
              <button 
                onClick={() => setManualModalOpen(false)}
                style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Add Coding Question</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '2px 0 0 0' }}>Publish custom algorithm questions manually with auto-generated editor templates.</p>
                </div>
              </div>

              <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Question Title</label>
                    <input 
                      type="text" 
                      required
                      value={manualForm.title}
                      onChange={(e) => setManualForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Reverse a String"
                      style={{ width: '100%', padding: '12px 16px', background: 'var(--glass-inner)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Category</label>
                    <input 
                      type="text" 
                      required
                      value={manualForm.category}
                      onChange={(e) => setManualForm(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g. Algorithms"
                      style={{ width: '100%', padding: '12px 16px', background: 'var(--glass-inner)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Difficulty</label>
                    <select 
                      value={manualForm.difficulty}
                      onChange={(e) => setManualForm(prev => ({ ...prev, difficulty: e.target.value }))}
                      style={{ width: '100%', padding: '12px 16px', background: 'var(--glass-inner)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                    >
                      <option value="Easy" style={{ background: 'var(--bg-main)' }}>Easy</option>
                      <option value="Medium" style={{ background: 'var(--bg-main)' }}>Medium</option>
                      <option value="Hard" style={{ background: 'var(--bg-main)' }}>Hard</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Target Acceptance %</label>
                    <input 
                      type="text" 
                      value={manualForm.acceptance}
                      onChange={(e) => setManualForm(prev => ({ ...prev, acceptance: e.target.value }))}
                      placeholder="e.g. 52.4%"
                      style={{ width: '100%', padding: '12px 16px', background: 'var(--glass-inner)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Problem Description</label>
                  <textarea 
                    required
                    value={manualForm.description}
                    onChange={(e) => setManualForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the algorithm challenge requirements, params and returns..."
                    style={{ width: '100%', height: '100px', padding: '12px 16px', background: 'var(--glass-inner)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-main)', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <div style={{ background: 'var(--glass-inner-darker)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Example Case 1</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Input</label>
                      <input 
                        type="text" 
                        value={manualForm.input1}
                        onChange={(e) => setManualForm(prev => ({ ...prev, input1: e.target.value }))}
                        placeholder="s = 'hello'"
                        style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', fontSize: '13px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Output</label>
                      <input 
                        type="text" 
                        value={manualForm.output1}
                        onChange={(e) => setManualForm(prev => ({ ...prev, output1: e.target.value }))}
                        placeholder="'olleh'"
                        style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Explanation (Optional)</label>
                    <input 
                      type="text" 
                      value={manualForm.explanation1}
                      onChange={(e) => setManualForm(prev => ({ ...prev, explanation1: e.target.value }))}
                      placeholder="The letters are reversed."
                      style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Constraint 1</label>
                    <input 
                      type="text" 
                      value={manualForm.constraint1}
                      onChange={(e) => setManualForm(prev => ({ ...prev, constraint1: e.target.value }))}
                      placeholder="1 <= s.length <= 10^5"
                      style={{ width: '100%', padding: '12px 16px', background: 'var(--glass-inner)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Constraint 2</label>
                    <input 
                      type="text" 
                      value={manualForm.constraint2}
                      onChange={(e) => setManualForm(prev => ({ ...prev, constraint2: e.target.value }))}
                      placeholder="s contains printable ASCII characters."
                      style={{ width: '100%', padding: '12px 16px', background: 'var(--glass-inner)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setManualModalOpen(false)} style={{ flex: 1, padding: '12px' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={manualLoading} className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                    {manualLoading ? 'Saving...' : 'Add Question'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Import Modal */}
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
                onClick={() => { setBulkModalOpen(false); setParsedQuestions([]); setCsvInput(''); }}
                style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Bulk Import Questions</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '2px 0 0 0' }}>Publish multiple coding challenges simultaneously using CSV files or manual entry.</p>
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
                      id="bulk-csv-questions"
                    />
                    <label 
                      htmlFor="bulk-csv-questions" 
                      className="btn-secondary" 
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%', justifyContent: 'center', padding: '12px' }}
                    >
                      <FileText size={18} /> Select .CSV File
                    </label>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>Format: <code>Title, Difficulty, Category, Acceptance Rate, Description</code></span>
                    <span style={{ marginTop: '4px' }}>Example: <code>"Reverse String", "Easy", "Algorithms", "82.5%", "Reverse the list."</code></span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Option 2: Paste CSV Lines</label>
                  <textarea 
                    value={csvInput}
                    onChange={(e) => setCsvInput(e.target.value)}
                    placeholder="Reverse String, Easy, Algorithms, 82.5%, Reverse the list.&#10;Two Sum II, Medium, Algorithms, 54.1%, Return indices in 1-based array."
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
                  <button type="button" className="btn-secondary" onClick={handleParseBulk}>Preview Questions</button>
                  <button 
                    type="button" 
                    className="btn-primary"
                    disabled={bulkLoading || parsedQuestions.length === 0}
                    onClick={handleBulkSubmit}
                    style={{ opacity: (bulkLoading || parsedQuestions.length === 0) ? 0.6 : 1 }}
                  >
                    {bulkLoading ? 'Uploading...' : 'Import Questions'}
                  </button>
                </div>

                {parsedQuestions.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Questions Preview ({parsedQuestions.length} Items)</h4>
                    <div className="table-container" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: 'var(--glass-inner-darker)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '12px 16px' }}>Title</th>
                            <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '12px 16px' }}>Difficulty</th>
                            <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '12px 16px' }}>Category</th>
                            <th style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '12px 16px' }}>Acceptance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedQuestions.map((q, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{q.title}</td>
                              <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: getDifficultyColor(q.difficulty) }}>{q.difficulty}</td>
                              <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-main)' }}>{q.category}</td>
                              <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{q.acceptance}</td>
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
    </div>
  );
};

export default ManagePracticeQuestions;
