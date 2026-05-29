import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Image as ImageIcon, Type, User, IndianRupee, Clock, BookOpen, ShieldCheck, X, Video, FileText, HelpCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const EditCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    instructor: '',
    category: 'Development',
    price: '',
    duration: '',
    lessons: '',
    image: '',
    facilities: ''
  });

  const [modules, setModules] = useState([{ title: '', videoUrl: '' }]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [assignment, setAssignment] = useState({ title: '', description: '' });

  React.useEffect(() => {
    if (id) {
      fetch(`http://localhost:5000/api/courses/${id}`)
        .then(res => res.json())
        .then(data => {
          setFormData({
            title: data.title || '',
            instructor: data.instructor || '',
            category: data.category || 'Development',
            price: data.price || '',
            duration: data.duration || '',
            lessons: data.lessons || '',
            image: data.image || '',
            facilities: Array.isArray(data.facilities) ? data.facilities.join(', ') : (data.facilities || '')
          });
          if (data.modules && data.modules.length > 0) setModules(data.modules);
          if (data.quiz && data.quiz.length > 0) setQuizQuestions(data.quiz);
          if (data.assignment) setAssignment(data.assignment);
        })
        .catch(err => console.error('Error fetching course:', err));
    }
  }, [id]);

  // Quiz Handlers
  const handleAddQuestion = () => setQuizQuestions([...quizQuestions, { question: '', options: ['', '', ''], correct: 0 }]);
  const handleRemoveQuestion = (index) => {
    const updated = [...quizQuestions];
    updated.splice(index, 1);
    setQuizQuestions(updated);
  };
  const handleQuestionChange = (index, field, value) => {
    const updated = [...quizQuestions];
    updated[index][field] = value;
    setQuizQuestions(updated);
  };
  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...quizQuestions];
    updated[qIndex].options[oIndex] = value;
    setQuizQuestions(updated);
  };

  // Module Handlers
  const handleAddModule = () => setModules([...modules, { title: '', videoUrl: '' }]);
  const handleModuleChange = (index, field, value) => {
    const updated = [...modules];
    updated[index][field] = value;
    setModules(updated);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    
    const validQuiz = quizQuestions.filter(q => q.question.trim() !== '' && q.options.every(opt => opt.trim() !== ''));

    const courseData = {
      ...formData,
      facilities: formData.facilities.split(',').map(f => f.trim()).filter(f => f !== ''),
      modules,
      quiz: validQuiz,
      assignment
    };

    try {
      const response = await fetch(`http://localhost:5000/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData)
      });

      if (response.ok) {
        alert('Course updated successfully!');
        navigate(-1);
      } else {
        alert('Failed to update course.');
      }
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Error connecting to server.');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Course Editor</h1>
          <p style={{ color: 'var(--text-muted)' }}>Modify your masterclass in 3 simple steps.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ 
              width: '40px', height: '40px', borderRadius: '50%', 
              background: step >= s ? 'var(--primary)' : 'var(--glass-inner-darker)',
              color: step >= s ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600,
              border: step >= s ? 'none' : '1px solid var(--border)'
            }}>
              {s}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>Step 1: Course Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <InputGroup label="Course Title" name="title" icon={<Type size={18} />} placeholder="e.g. Advanced AI Patterns" value={formData.title} onChange={handleChange} />
                <InputGroup label="Instructor Name" name="instructor" icon={<User size={18} />} placeholder="e.g. Jane Doe" value={formData.instructor} onChange={handleChange} />
                <InputGroup label="Price (₹)" name="price" icon={<IndianRupee size={18} />} placeholder="e.g. 3999" value={formData.price} onChange={handleChange} />
                <InputGroup label="Duration" name="duration" icon={<Clock size={18} />} placeholder="e.g. 15h 30m" value={formData.duration} onChange={handleChange} />
                <InputGroup label="Lessons Count" name="lessons" icon={<BookOpen size={18} />} placeholder="e.g. 24" value={formData.lessons} onChange={handleChange} />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Category</label>
                  <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', gap: '12px' }}>
                    <select name="category" value={formData.category} onChange={handleChange} style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '14px', cursor: 'pointer' }}>
                      <option value="Development">Development</option>
                      <option value="Design">Design</option>
                    </select>
                  </div>
                </div>
              </div>
              <InputGroup label="Cover Image URL" name="image" icon={<ImageIcon size={18} />} placeholder="https://unsplash.com/..." value={formData.image} onChange={handleChange} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Facilities (Comma separated)</label>
                <div className="glass" style={{ display: 'flex', alignItems: 'flex-start', padding: '16px', gap: '12px' }}>
                  <ShieldCheck size={18} color="var(--text-muted)" style={{ marginTop: '2px' }} />
                  <textarea name="facilities" placeholder="e.g. Lifetime Access, 24/7 Support" value={formData.facilities} onChange={handleChange} style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '14px', resize: 'none', height: '60px' }} />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Step 2: Upload Content</h2>
                <button type="button" onClick={handleAddModule} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '13px' }}>
                  <Plus size={16} /> Add Module
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {modules.map((mod, idx) => (
                  <div key={idx} style={{ background: 'var(--glass-inner-darker)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <h4 style={{ marginBottom: '16px', fontSize: '16px', color: 'var(--text-main)' }}>Module {idx + 1}</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Module Title</label>
                        <input type="text" value={mod.title} onChange={(e) => handleModuleChange(idx, 'title', e.target.value)} placeholder="e.g. Introduction" style={{ background: 'var(--glass-inner)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Video Content URL</label>
                        <div style={{ position: 'relative' }}>
                          <Video size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                          <input type="text" value={mod.videoUrl} onChange={(e) => handleModuleChange(idx, 'videoUrl', e.target.value)} placeholder="https://vimeo.com/..." style={{ background: 'var(--glass-inner)', border: '1px solid var(--border)', padding: '12px 12px 12px 36px', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', width: '100%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>Step 3: Assessments</h2>
              
              {/* Assignment Section */}
              <div style={{ background: 'var(--glass-inner-darker)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={20} color="var(--primary)" /> Add Assignment Prompt
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input type="text" placeholder="Assignment Title (e.g. Build a Portfolio)" value={assignment.title} onChange={(e) => setAssignment({...assignment, title: e.target.value})} style={{ background: 'var(--glass-inner)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', width: '100%' }} />
                  <textarea placeholder="Describe the assignment requirements..." value={assignment.description} onChange={(e) => setAssignment({...assignment, description: e.target.value})} style={{ background: 'var(--glass-inner)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', width: '100%', height: '100px', resize: 'none' }} />
                </div>
              </div>

              {/* Quiz Section */}
              <div style={{ background: 'var(--glass-inner-darker)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><HelpCircle size={20} color="var(--secondary)" /> Add Quiz</h3>
                  <button type="button" onClick={handleAddQuestion} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>+ Add Question</button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {quizQuestions.map((q, qIndex) => (
                    <div key={qIndex} style={{ padding: '16px', background: 'var(--glass-inner)', borderRadius: '8px', border: '1px solid var(--border)', position: 'relative' }}>
                      <button type="button" onClick={() => handleRemoveQuestion(qIndex)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}><X size={16} /></button>
                      <input type="text" placeholder={`Question ${qIndex + 1}`} value={q.question} onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)} style={{ background: 'var(--glass-inner-darker)', border: '1px solid var(--border)', padding: '10px', borderRadius: '6px', color: 'var(--text-main)', outline: 'none', width: '95%', marginBottom: '12px' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="radio" name={`correct-${qIndex}`} checked={q.correct === oIndex} onChange={() => handleQuestionChange(qIndex, 'correct', oIndex)} style={{ accentColor: 'var(--primary)' }} />
                            <input type="text" placeholder={`Option ${oIndex + 1}`} value={opt} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} style={{ background: 'transparent', border: '1px solid var(--border)', padding: '8px', borderRadius: '4px', color: 'var(--text-main)', outline: 'none', flex: 1 }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {quizQuestions.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>No quiz added. Optional.</p>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ChevronLeft size={18} /> Back
            </button>
          ) : (
            <div></div> // Spacer
          )}
          
          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 32px' }}>
            {step === 3 ? 'Publish Course' : 'Next Step'} {step < 3 && <ChevronRight size={18} />}
          </button>
        </div>
      </form>
    </div>
  );
};

const InputGroup = ({ label, name, icon, placeholder, value, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>{label}</label>
    <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '12px' }}>
      <div style={{ color: 'var(--text-muted)' }}>{icon}</div>
      <input type="text" name={name} placeholder={placeholder} value={value} onChange={onChange} style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '14px' }} />
    </div>
  </div>
);

export default EditCourse;
