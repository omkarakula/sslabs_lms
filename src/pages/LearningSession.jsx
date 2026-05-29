import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, FileText, MessageSquare, ChevronDown, AlertCircle, Star } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const LearningSession = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(1);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`http://localhost:5000/api/courses/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Course session could not be retrieved.');
        }
        return res.json();
      })
      .then(data => {
        setCourse(data);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Failed to load course session.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner message="Setting up your active course session..." />;
  }

  if (error || !course) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '80px 20px',
          textAlign: 'center',
          maxWidth: '500px',
          margin: '40px auto'
        }}
        className="glass"
      >
        <div style={{ 
          width: '56px', 
          height: '56px', 
          borderRadius: '50%', 
          background: 'rgba(244, 63, 94, 0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#f43f5e',
          marginBottom: '20px'
        }}>
          <AlertCircle size={28} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
          Course Session Not Found
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
          We could not load this learning session. This can happen if the database was refreshed or the course is no longer available.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/" className="btn-secondary" style={{ textDecoration: 'none', padding: '10px 20px' }}>
            Go to Dashboard
          </Link>
          <Link to="/courses" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 20px' }}>
            Browse Courses
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', gap: '24px', overflow: 'hidden' }}>
      {/* Video Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
              Module {activeLesson}: {course.modules && course.modules[activeLesson - 1] ? course.modules[activeLesson - 1].title : 'Introduction'}
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>{course.title} • Lesson {activeLesson} of {course.lessons || 1}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: activeLesson === 1 ? 0.5 : 1, cursor: activeLesson === 1 ? 'not-allowed' : 'pointer' }}
              onClick={() => setActiveLesson(prev => Math.max(prev - 1, 1))}
              disabled={activeLesson === 1}
            >
              <ChevronLeft size={18} /> Previous
            </button>
            <button 
              className="btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: activeLesson >= (parseInt(course.lessons) || 8) ? 0.5 : 1, cursor: activeLesson >= (parseInt(course.lessons) || 8) ? 'not-allowed' : 'pointer' }}
              onClick={() => setActiveLesson(prev => Math.min(prev + 1, parseInt(course.lessons) || 8))}
              disabled={activeLesson >= (parseInt(course.lessons) || 8)}
            >
              Next Lesson <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
            <Tab active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} label="Overview" />
            <Tab active={activeTab === 'Quiz'} onClick={() => setActiveTab('Quiz')} label="Quiz" />
            <Tab active={activeTab === 'Feedback'} onClick={() => setActiveTab('Feedback')} label="Give Feedback" />
          </div>

          {activeTab === 'Overview' && (
            <div style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
              In this module, you will focus on <strong>{course.modules && course.modules[activeLesson - 1] ? course.modules[activeLesson - 1].title : 'core concepts'}</strong>. By the end of this lesson, you will have a comprehensive understanding of the topic.
            </div>
          )}

          {activeTab === 'Quiz' && (
            <QuizComponent questions={course.quizzes ? course.quizzes[activeLesson] : []} courseId={course.id} />
          )}

          {activeTab === 'Feedback' && (
            <FeedbackComponent courseId={course.id} courseName={course.title} />
          )}
        </div>
      </div>

      {/* Sidebar - Course Content */}
      <div className="glass" style={{ width: '350px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Course Content</h3>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {Array.from({ length: parseInt(course.lessons) || 8 }, (_, i) => i + 1).map(i => (
            <div
              key={i}
              onClick={() => setActiveLesson(i)}
              style={{
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '8px',
                cursor: 'pointer',
                background: activeLesson === i ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                border: activeLesson === i ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: activeLesson === i ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600 }}>LESSON {i}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>12:45</span>
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 500, color: activeLesson === i ? 'var(--primary)' : 'var(--text-muted)' }}>
                {course.modules && course.modules[i - 1] ? course.modules[i - 1].title : `Module ${i}`}
              </h4>
              {activeLesson === i && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <FileText size={12} /> Resource
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <MessageSquare size={12} /> 12 Comments
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FeedbackComponent = ({ courseId, courseName }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [studentName, setStudentName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide a short comment or review of the course.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          courseName,
          studentName: isAnonymous ? 'Anonymous' : studentName || 'Prasad R.',
          rating,
          comment
        })
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError('Failed to submit feedback. Please try again.');
      }
    } catch (err) {
      setError('A connection error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center', padding: '40px 20px' }}
      >
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          background: 'rgba(16, 185, 129, 0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#10b981',
          margin: '0 auto 24px auto',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.15)'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Thank You for Your Feedback!</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
          Your feedback helps us refine our course curriculum and deliver the ultimate learning experience.
        </p>
        <button 
          onClick={() => {
            setSubmitted(false);
            setComment('');
            setRating(5);
            setIsAnonymous(false);
          }}
          className="btn-secondary"
        >
          Submit Another Review
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>Course Feedback</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Share your thoughts and rating about this learning experience.</p>
      </div>

      {/* Interactive Stars Rating */}
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px' }}>
          Course Rating
        </label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, outline: 'none' }}
            >
              <Star 
                size={32} 
                fill={(hoverRating || rating) >= star ? '#fb923c' : 'none'} 
                color={(hoverRating || rating) >= star ? '#fb923c' : 'var(--text-muted)'} 
                style={{ transition: 'transform 0.2s ease, fill 0.2s ease', transform: (hoverRating || rating) >= star ? 'scale(1.1)' : 'scale(1)' }}
              />
            </button>
          ))}
          <span style={{ marginLeft: '12px', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>
            {rating === 5 ? 'Excellent' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Poor' : 'Terrible'}
          </span>
        </div>
      </div>

      {/* Name Input */}
      {!isAnonymous && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>Your Name</label>
          <input 
            type="text" 
            placeholder="e.g. Prasad Radhika" 
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            style={{ 
              width: '100%', 
              maxWidth: '400px',
              padding: '12px 16px', 
              background: 'var(--glass-inner-darker)', 
              border: '1px solid var(--border)', 
              borderRadius: '10px', 
              color: 'var(--text-main)', 
              outline: 'none',
              fontSize: '13.5px'
            }}
          />
        </div>
      )}

      {/* Anonymous Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input 
          type="checkbox" 
          id="anonymous-checkbox" 
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
        />
        <label htmlFor="anonymous-checkbox" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer' }}>
          Submit review anonymously
        </label>
      </div>

      {/* Comment Input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>Write a Comment</label>
        <textarea
          placeholder="What did you like or dislike about this course? Are there areas for improvement?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{
            width: '100%',
            height: '120px',
            background: 'var(--glass-inner-darker)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px',
            color: 'var(--text-main)',
            outline: 'none',
            resize: 'none',
            fontSize: '13.5px',
            fontFamily: 'inherit',
            lineHeight: 1.6
          }}
        />
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(244, 63, 94, 0.08)', color: '#f43f5e', borderRadius: '8px', fontSize: '13px', fontWeight: 500, maxWidth: '400px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <button
        type="submit"
        className="btn-primary"
        disabled={submitting || !comment.trim()}
        style={{ alignSelf: 'flex-start', opacity: (submitting || !comment.trim()) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        {submitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  );
};

const QuizComponent = ({ questions, courseId }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  if (!questions || questions.length === 0) {
    return <div style={{ color: 'var(--text-muted)' }}>No quiz available for this course yet.</div>;
  }

  const handleOptionSelect = (index) => {
    setSelectedOption(index);
  };

  const handleNext = () => {
    if (selectedOption === questions[currentQuestion].correct) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  useEffect(() => {
    if (showResult) {
      const passed = score >= questions.length * 0.5;
      if (passed) {
        const storedUser = localStorage.getItem('lms_user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        const email = user?.email || 'prasad@example.com';

        fetch('http://localhost:5000/api/enrollments/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, courseId: courseId || 'demo' })
        }).catch(err => console.error('Failed to update progress', err));
      }
    }
  }, [showResult, score, questions.length, courseId]);

  if (showResult) {
    const passed = score >= questions.length * 0.5;

    return (
      <div style={{ textAlign: 'center', padding: '32px' }}>
        <h3 style={{ fontSize: '28px', marginBottom: '16px', color: 'var(--text-main)' }}>Quiz Auto-Graded!</h3>
        <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Your final score: <span style={{ color: passed ? '#10b981' : '#f43f5e', fontWeight: 700 }}>{score}</span> / {questions.length}
        </p>

        {passed ? (
          <div style={{ background: 'var(--glass-inner)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.3)' }}>
            <p style={{ color: '#10b981', marginBottom: '8px', fontWeight: 600, fontSize: '18px' }}>🎉 Congratulations, you passed!</p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>Your progress has been successfully tracked in your profile.</p>
            <Link to={`/certificate/${courseId || 'demo'}`} className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Generate Certificate
            </Link>
          </div>
        ) : (
          <div>
            <p style={{ color: '#f43f5e', marginBottom: '20px' }}>You didn't pass this time. Review the material and try again.</p>
            <button className="btn-primary" onClick={() => { setCurrentQuestion(0); setShowResult(false); setScore(0); setSelectedOption(null); }}>
              Retry Quiz
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>QUESTION {currentQuestion + 1} OF {questions.length}</span>
        <h3 style={{ fontSize: '18px', marginTop: '8px' }}>{questions[currentQuestion].question}</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {questions[currentQuestion].options.map((option, index) => (
          <div
            key={index}
            onClick={() => handleOptionSelect(index)}
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              cursor: 'pointer',
              background: selectedOption === index ? 'rgba(99, 102, 241, 0.15)' : 'var(--glass-inner-darker)',
              border: selectedOption === index ? '1px solid var(--primary)' : '1px solid var(--border)',
              transition: 'all 0.2s',
              color: selectedOption === index ? 'var(--primary)' : 'var(--text-muted)'
            }}
          >
            {option}
          </div>
        ))}
      </div>

      <button
        className="btn-primary"
        onClick={handleNext}
        disabled={selectedOption === null}
        style={{ width: '100%', opacity: selectedOption === null ? 0.5 : 1 }}
      >
        {currentQuestion + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}
      </button>
    </div>
  );
};

const Tab = ({ label, active, onClick }) => (
  <div
    onClick={onClick}
    style={{
      paddingBottom: '16px',
      color: active ? 'var(--primary)' : 'var(--text-muted)',
      fontWeight: active ? 600 : 500,
      borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
      cursor: 'pointer',
      fontSize: '14px'
    }}
  >
    {label}
  </div>
);

export default LearningSession;
