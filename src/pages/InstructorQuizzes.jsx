import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, Trash2, CheckCircle, HelpCircle, Upload, Download, AlertCircle, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const InstructorQuizzes = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [quizData, setQuizData] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]); // For bulk deleting specific questions
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const fileInputRef = useRef(null);

  // Fetch all courses
  useEffect(() => {
    fetch('http://localhost:5000/api/courses')
      .then(res => res.json())
      .then(data => {
        const validCourses = Array.isArray(data) ? data.filter(c => c && c.id && c.title) : [];
        setCourses(validCourses);
      })
      .catch(err => console.error(err))
      .finally(() => setIsInitialLoading(false));
  }, []);

  // When course or module is selected, populate quiz data
  useEffect(() => {
    setSelectedQuestions([]); // reset selection
    if (selectedCourseId && selectedModuleId) {
      const course = courses.find(c => c.id && c.id.toString() === selectedCourseId.toString());
      if (course && course.quizzes && course.quizzes[selectedModuleId]) {
        setQuizData([...course.quizzes[selectedModuleId]]);
      } else {
        setQuizData([]);
      }
      setSuccess('');
      setError('');
    } else {
      setQuizData([]);
    }
  }, [selectedCourseId, selectedModuleId, courses]);

  // When course changes, reset module
  useEffect(() => {
    setSelectedModuleId('');
    setSelectedQuestions([]);
  }, [selectedCourseId]);

  const handleAddQuestion = () => {
    setQuizData([
      ...quizData,
      { question: '', options: ['', '', '', ''], correct: 0 }
    ]);
  };

  const handleQuestionChange = (index, value) => {
    const newData = [...quizData];
    newData[index].question = value;
    setQuizData(newData);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newData = [...quizData];
    newData[qIndex].options[oIndex] = value;
    setQuizData(newData);
  };

  const handleCorrectOptionChange = (qIndex, value) => {
    const newData = [...quizData];
    newData[qIndex].correct = parseInt(value);
    setQuizData(newData);
  };

  const handleDeleteQuestion = (index) => {
    const newData = quizData.filter((_, i) => i !== index);
    setQuizData(newData);
    setSelectedQuestions(selectedQuestions.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  };

  // Bulk Delete specific selected questions
  const handleBulkDeleteSelected = () => {
    if (selectedQuestions.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedQuestions.length} selected questions?`)) return;
    
    const newData = quizData.filter((_, i) => !selectedQuestions.includes(i));
    setQuizData(newData);
    setSelectedQuestions([]);
  };

  // Toggle question selection
  const toggleQuestionSelection = (index) => {
    if (selectedQuestions.includes(index)) {
      setSelectedQuestions(selectedQuestions.filter(i => i !== index));
    } else {
      setSelectedQuestions([...selectedQuestions, index]);
    }
  };

  // Select All questions
  const handleSelectAll = () => {
    if (selectedQuestions.length === quizData.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(quizData.map((_, i) => i));
    }
  };

  // Clear ALL Quizzes for the ENTIRE Course
  const handleClearAllCourseModules = async () => {
    if (!selectedCourseId) return;
    if (!window.confirm("WARNING: This will permanently delete ALL quizzes across EVERY module in this course. This cannot be undone. Proceed?")) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${selectedCourseId}/quizzes/clear`, {
        method: 'POST'
      });
      if (response.ok) {
        setSuccess('All modules for this course have been cleared.');
        setQuizData([]);
        const updatedCourses = courses.map(c => {
          if (c.id && c.id.toString() === selectedCourseId.toString()) {
            return { ...c, quizzes: {} };
          }
          return c;
        });
        setCourses(updatedCourses);
      } else {
        setError('Failed to clear course modules.');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid .csv file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target.result;
      const lines = csvData.split('\n');
      const newQuizzes = [];
      let hasError = false;

      const startIndex = lines[0].toLowerCase().startsWith('question') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        let parts = [];
        let current = '';
        let inQuotes = false;
        for (let char of line) {
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            parts.push(current);
            current = '';
          } else {
            current += char;
          }
        }
        parts.push(current);
        
        if (parts.length < 6) {
          setError(`Error on line ${i + 1}: CSV must contain Question, 4 Options, and Correct Index (0-3).`);
          hasError = true;
          break;
        }

        newQuizzes.push({
          question: parts[0].trim().replace(/^"|"$/g, ''),
          options: [
            parts[1].trim().replace(/^"|"$/g, ''),
            parts[2].trim().replace(/^"|"$/g, ''),
            parts[3].trim().replace(/^"|"$/g, ''),
            parts[4].trim().replace(/^"|"$/g, '')
          ],
          correct: parseInt(parts[5].trim().replace(/^"|"$/g, '')) || 0
        });
      }

      if (!hasError) {
        setQuizData([...quizData, ...newQuizzes]);
        setSuccess('CSV imported successfully! Review questions below and hit Save.');
        setError('');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    if (quizData.length === 0) return;
    const headers = ['Question', 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Correct Option Index (0-3)'];
    const csvRows = [
      headers.join(','),
      ...quizData.map(q => `"${q.question.replace(/"/g, '""')}","${q.options[0].replace(/"/g, '""')}","${q.options[1].replace(/"/g, '""')}","${q.options[2].replace(/"/g, '""')}","${q.options[3].replace(/"/g, '""')}","${q.correct}"`)
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `course_${selectedCourseId}_module_${selectedModuleId}_quiz.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    if (!selectedCourseId || !selectedModuleId) return;
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/courses/${selectedCourseId}/quiz/${selectedModuleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz: quizData })
      });

      if (response.ok) {
        setSuccess('Module quiz updated successfully!');
        const updatedCourses = courses.map(c => {
          if (c.id && c.id.toString() === selectedCourseId.toString()) {
            const currentQuizzes = c.quizzes || {};
            return { ...c, quizzes: { ...currentQuizzes, [selectedModuleId]: quizData } };
          }
          return c;
        });
        setCourses(updatedCourses);
      } else {
        setError('Failed to update quiz on the server.');
      }
    } catch (err) {
      setError('An error occurred while connecting to the server.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
      setSelectedQuestions([]);
    }
  };

  const selectedCourse = courses.find(c => c.id && c.id.toString() === selectedCourseId.toString());
  const modulesCount = selectedCourse ? parseInt(selectedCourse.lessons) || 0 : 0;
  const moduleOptions = Array.from({ length: modulesCount }, (_, i) => i + 1);

  if (isInitialLoading) return <LoadingSpinner message="Loading your quizzes..." />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '900px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Content-Wise Quizzes</h1>
          <p style={{ color: 'var(--text-muted)' }}>Create, import, and export quizzes for specific modules within your courses.</p>
        </div>
        {selectedCourseId && (
          <button 
            onClick={handleClearAllCourseModules}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
          >
            <AlertTriangle size={16} /> Bulk Delete All Modules
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass" style={{ padding: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Select Course</label>
          <select 
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', background: 'var(--glass-inner)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
          >
            <option value="" style={{ background: 'var(--bg-main)' }}>-- Choose a course --</option>
            {courses.map(course => (
              <option key={course.id} value={course.id} style={{ background: 'var(--bg-main)' }}>{course.title}</option>
            ))}
          </select>
        </div>

        <div className="glass" style={{ padding: '24px', opacity: selectedCourseId ? 1 : 0.5, pointerEvents: selectedCourseId ? 'auto' : 'none' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Select Content / Module</label>
          <select 
            value={selectedModuleId}
            onChange={(e) => setSelectedModuleId(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', background: 'var(--glass-inner)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
          >
            <option value="" style={{ background: 'var(--bg-main)' }}>-- Choose a module --</option>
            {moduleOptions.map(modNum => (
              <option key={modNum} value={modNum} style={{ background: 'var(--bg-main)' }}>Module {modNum}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', borderRadius: '8px', fontSize: '14px', fontWeight: 500 }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {selectedCourseId && selectedModuleId && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Module {selectedModuleId} Questions ({quizData.length})</h2>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="file" 
                accept=".csv" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="quiz-csv-upload"
              />
              <label 
                htmlFor="quiz-csv-upload" 
                className="btn-secondary" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <Upload size={18} /> Import CSV
              </label>

              <button 
                className="btn-secondary" 
                onClick={handleExportCSV} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: quizData.length === 0 ? 0.5 : 1 }}
                disabled={quizData.length === 0}
              >
                <Download size={18} /> Export CSV
              </button>

              <button className="btn-primary" onClick={handleAddQuestion} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} /> Add Question
              </button>
            </div>
          </div>

          {quizData.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--glass-inner-darker)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                <input 
                  type="checkbox" 
                  checked={selectedQuestions.length === quizData.length && quizData.length > 0} 
                  onChange={handleSelectAll} 
                  style={{ width: '16px', height: '16px' }}
                />
                Select All Questions
              </label>
              
              {selectedQuestions.length > 0 && (
                <button 
                  onClick={handleBulkDeleteSelected}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                >
                  <Trash2 size={16} /> Bulk Delete Selected ({selectedQuestions.length})
                </button>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {quizData.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', background: 'var(--glass-inner)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                <HelpCircle size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p style={{ color: 'var(--text-muted)' }}>No questions added for this module yet. Click "Add Question" or "Import CSV" to start.</p>
              </div>
            ) : (
              quizData.map((q, qIndex) => (
                <div key={qIndex} className="glass" style={{ padding: '24px', position: 'relative', border: selectedQuestions.includes(qIndex) ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent' }}>
                  
                  <div style={{ position: 'absolute', top: '24px', left: '20px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedQuestions.includes(qIndex)}
                      onChange={() => toggleQuestionSelection(qIndex)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>

                  <button 
                    onClick={() => handleDeleteQuestion(qIndex)}
                    style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Trash2 size={16} />
                  </button>

                  <div style={{ marginBottom: '20px', paddingRight: '48px', paddingLeft: '32px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Question {qIndex + 1}</label>
                    <input 
                      type="text" 
                      value={q.question}
                      onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                      placeholder="e.g. What does UI stand for?"
                      style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', paddingLeft: '32px' }}>
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex}>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Option {oIndex + 1}</label>
                        <input 
                          type="text" 
                          value={opt}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                        />
                      </div>
                    ))}
                  </div>

                  <div style={{ paddingLeft: '32px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Correct Answer</label>
                    <select 
                      value={q.correct}
                      onChange={(e) => handleCorrectOptionChange(qIndex, e.target.value)}
                      style={{ padding: '10px 14px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }}
                    >
                      {q.options.map((_, idx) => (
                        <option key={idx} value={idx} style={{ background: 'var(--bg-main)' }}>Option {idx + 1}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
            {success && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '14px', fontWeight: 500 }}>
                <CheckCircle size={18} /> {success}
              </div>
            )}
            <button 
              className="btn-primary" 
              onClick={handleSave}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
            >
              <Save size={18} /> {loading ? 'Saving...' : 'Save Quiz'}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default InstructorQuizzes;
