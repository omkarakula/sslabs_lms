import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, BookOpen, Star, CheckCircle, ArrowLeft, Lock } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch(`http://localhost:5000/api/courses/${id}`).then(res => res.json()),
      fetch('http://localhost:5000/api/enrollments').then(res => res.json())
    ])
      .then(([courseData, enrollmentsData]) => {
        setCourse(courseData);
        
        const storedUser = localStorage.getItem('lms_user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        const email = user?.email || 'prasad@example.com';
        
        if (Array.isArray(enrollmentsData)) {
          // Check if this specific user has an enrollment object for this exact course ID
          const alreadyEnrolled = enrollmentsData.some(e => String(e.courseId) === String(id) && e.email === email);
          if (alreadyEnrolled) {
            setIsEnrolled(true);
          }
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    
    const storedUser = localStorage.getItem('lms_user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    
    try {
      const response = await fetch('http://localhost:5000/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: id,
          course: course.title,
          name: user?.name || 'Prasad R.',
          email: user?.email || 'prasad@example.com',
          progress: 0
        })
      });
      
      if (response.ok) {
        setIsEnrolled(true);
      } else {
        console.error('Failed to enroll');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Fetching course details..." />;
  if (!course) return <div style={{ padding: '40px', textAlign: 'center' }}>Course not found.</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link to="/courses" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '24px', fontSize: '14px' }}>
        <ArrowLeft size={16} /> Back to Courses
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>{course.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={18} color="#fbbf24" fill="#fbbf24" />
              <span style={{ fontWeight: 600 }}>{course.rating || 0}</span>
              <span style={{ color: 'var(--text-muted)' }}>({course.students || 0} enrolled)</span>
            </div>
            <div style={{ color: 'var(--text-muted)' }}>Created by <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{course.instructor}</span></div>
          </div>

          <div className="glass" style={{ padding: '32px', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Course Description</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '24px' }}>
              Master the art of {course.title.toLowerCase()} with this comprehensive masterclass. We'll take you from the very basics to advanced professional techniques used by industry leaders. This course is designed to be practical, hands-on, and extremely thorough.
            </p>
            
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>What you'll learn</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ display: 'flex', gap: '12px' }}>
                  <CheckCircle size={18} color="var(--primary)" />
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Comprehensive industry standard {i === 1 ? 'foundations' : i === 2 ? 'workflow' : i === 3 ? 'best practices' : 'advanced techniques'}.</span>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Premium Facilities</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {course.facilities?.map((facility, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--glass-inner-darker)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ color: 'var(--secondary)' }}>
                    <CheckCircle size={16} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{facility}</span>
                </div>
              ))}
              {(!course.facilities || course.facilities.length === 0) && (
                <span style={{ color: 'var(--text-muted)' }}>Standard Access</span>
              )}
            </div>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '20px' }}>Curriculum</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(course.modules && course.modules.length > 0 ? course.modules : Array.from({ length: parseInt(course.lessons) || 5 }, (_, i) => ({ title: `Introduction to the Core Concepts` }))).map((module, index) => (
              <div key={index} className="glass" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--glass-inner)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>{index + 1}</div>
                  <span style={{ fontWeight: 500 }}>Module {index + 1}: {module.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <Clock size={14} /> 12:45
                  {isEnrolled ? (
                    <Play size={16} style={{ cursor: 'pointer', marginLeft: '12px', color: 'var(--primary)' }} onClick={() => navigate(`/learn/${course.id}`)} />
                  ) : (
                    <Lock size={16} style={{ marginLeft: '12px', opacity: 0.5 }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'sticky', top: '24px', height: 'fit-content' }}>
          <div className="glass" style={{ padding: '24px', overflow: 'hidden' }}>
            <img 
              src={course.image} 
              alt="Course preview" 
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '24px' }}
            />
            <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '20px' }}>
              {isEnrolled ? 'Enrolled' : course.price ? `₹${course.price}` : 'Free'}
            </div>
            
            {isEnrolled ? (
              <Link to={`/learn/${course.id}`} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textDecoration: 'none', marginBottom: '12px', padding: '14px' }}>
                Access Course Content
              </Link>
            ) : (
              <button 
                className="btn-primary" 
                onClick={handleEnroll}
                disabled={isEnrolling}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textDecoration: 'none', marginBottom: '12px', padding: '14px', opacity: isEnrolling ? 0.7 : 1 }}
              >
                {isEnrolling ? 'Processing...' : 'Enroll Now'}
              </button>
            )}

            {!isEnrolled && (
              <button className="btn-secondary" style={{ width: '100%', padding: '14px' }}>Add to Wishlist</button>
            )}
            
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <Clock size={14} /> {course.duration} on-demand video
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <BookOpen size={14} /> {course.lessons} lessons
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <Award size={14} /> Certificate of completion
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Award = ({ size, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
);

export default CourseDetails;
