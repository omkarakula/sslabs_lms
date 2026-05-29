import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, PlayCircle, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/courses')
      .then(res => res.json())
      .then(data => {
        const validData = Array.isArray(data) ? data.filter(c => c && c.id && c.title) : [];
        const availableQuizzes = [];
        validData.forEach(course => {
          if (course.quizzes) {
            Object.keys(course.quizzes).forEach(moduleId => {
              const quizArray = course.quizzes[moduleId];
              if (quizArray && quizArray.length > 0) {
                availableQuizzes.push({
                  course,
                  moduleId,
                  questions: quizArray
                });
              }
            });
          } else if (course.quiz && course.quiz.length > 0) {
            availableQuizzes.push({
              course,
              moduleId: '1', // Default legacy
              questions: course.quiz
            });
          }
        });
        setQuizzes(availableQuizzes);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>My Quizzes</h1>
        <p style={{ color: 'var(--text-muted)' }}>Test your knowledge and earn certificates by completing course module assessments.</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="glass" style={{ padding: '60px', textAlign: 'center', borderRadius: '16px' }}>
          <HelpCircle size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>No Quizzes Available</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
            None of your currently enrolled courses have active module quizzes. Keep learning, and quizzes will appear here when ready!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {quizzes.map((quizObj, index) => (
            <motion.div
              key={`${quizObj.course.id}-${quizObj.moduleId}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="glass"
              style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ height: '190px', position: 'relative' }}>
                <img src={quizObj.course.image} alt={quizObj.course.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(15,23,42,1), transparent)' }}></div>
                <div style={{ position: 'absolute', bottom: '16px', left: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: 'var(--primary)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {quizObj.course.category}
                  </span>
                </div>
              </div>

              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', lineHeight: 1.4 }}>{quizObj.course.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Module {quizObj.moduleId} Assessment</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', padding: '16px', background: 'var(--glass-inner-darker)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><HelpCircle size={14} /> Questions</span>
                    <span style={{ fontWeight: 600, fontSize: '15px' }}>{quizObj.questions.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> Est. Time</span>
                    <span style={{ fontWeight: 600, fontSize: '15px' }}>{quizObj.questions.length * 2} mins</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={14} /> Status</span>
                    <span style={{ fontWeight: 600, fontSize: '15px', color: '#10b981' }}>Not Started</span>
                  </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <button
                    className="btn-primary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    onClick={() => navigate(`/learn/${quizObj.course.id}`)}
                  >
                    <PlayCircle size={18} /> Start Quiz
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default StudentQuizzes;
