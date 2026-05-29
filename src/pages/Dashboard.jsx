import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, TrendingUp, Users, Award, LayoutDashboard, Compass, User, UserPlus, Key, BookOpen, HelpCircle, FileText } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import LoadingSpinner from '../components/LoadingSpinner';

const JourneyNode = ({ icon, label, status, color, onClick }) => {
  const isBlinking = status === 'Active';
  return (
    <motion.div 
      whileHover={{ scale: 1.04, y: -2 }}
      onClick={onClick}
      style={{
        width: '100%',
        maxWidth: '250px',
        padding: '14px 18px',
        background: 'var(--glass-bg)',
        border: `1px solid ${isBlinking ? '#2563eb' : 'var(--border)'}`,
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        boxShadow: isBlinking ? '0 8px 20px -4px rgba(37, 99, 235, 0.15)' : 'var(--shadow)',
        transition: 'all 0.2s',
        zIndex: 5
      }}
    >
      <div style={{ 
        width: '38px', 
        height: '38px', 
        borderRadius: '10px', 
        background: `${color}15`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: color,
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
        <span style={{ 
          fontSize: '10px', 
          fontWeight: 700, 
          color: color,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {isBlinking && (
            <motion.span 
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                background: '#2563eb', 
                display: 'inline-block'
              }} 
            />
          )}
          {status}
        </span>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    coursesInProgress: 0,
    learningHours: '0h',
    communityRank: '-',
    certificatesEarned: 0
  });

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/courses').then(res => res.json()),
      fetch('http://localhost:5000/api/enrollments').then(res => res.json())
    ])
      .then(([coursesData, enrollmentsData]) => {
        const storedUser = localStorage.getItem('lms_user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        const email = user?.email || 'prasad@example.com';
        
        let validCourses = Array.isArray(coursesData) ? coursesData.filter(c => c && c.id && c.title) : [];
        
        if (Array.isArray(enrollmentsData)) {
          const myEnrollments = enrollmentsData.filter(e => e.email === email);
          
          // Dynamically compute stats based on the user's real enrollments
          const inProgress = myEnrollments.length;
          const completed = myEnrollments.filter(e => e.progress === 100).length;
          const hours = inProgress * 3; // Estimated 3 hours spent per active course
          
          setStats({
            coursesInProgress: inProgress,
            learningHours: `${hours}h`,
            communityRank: inProgress > 0 ? 'Top 10%' : 'Top 25%',
            certificatesEarned: completed
          });

          // Filter "Continue Learning" to only show courses the user is actually enrolled in
          if (myEnrollments.length > 0) {
            const enrolledCourseIds = myEnrollments.map(e => String(e.courseId));
            validCourses = validCourses.filter(c => enrolledCourseIds.includes(String(c.id)));
          } else {
            // If they have no enrollments, don't show all courses in "Continue Learning"
            validCourses = [];
          }
        }
        
        setCourses(validCourses);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleViewContent = () => {
    if (courses && courses.length > 0) {
      navigate(`/learn/${courses[0].id}`);
    } else {
      navigate('/courses');
    }
  };

  if (isLoading) return <LoadingSpinner message="Setting up your learning environment..." />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <div className="glass" style={{ padding: '40px', marginBottom: '40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>
            Welcome back, <span className="gradient-text">{localStorage.getItem('userName') || 'Prasad'}!</span>
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', maxWidth: '500px', marginBottom: '24px' }}>
            You've completed 75% of your weekly goal. Keep pushing to unlock your next certification!
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn-primary" onClick={() => navigate('/profile')} title="View detailed learning progress">View Progress</button>
            <button className="btn-secondary" onClick={() => navigate('/courses')} title="Explore new courses">Explore New</button>
          </div>
        </div>
        
        {/* Abstract shapes for design */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.2, borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-50px', left: '40%', width: '200px', height: '200px', background: 'var(--secondary)', filter: 'blur(80px)', opacity: 0.2, borderRadius: '50%' }}></div>
      </div>

      {/* Stats Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <StatCard icon={<Play size={20} />} label="Courses in Progress" value={stats.coursesInProgress} color="#6366f1" />
        <StatCard icon={<TrendingUp size={20} />} label="Learning Hours" value={stats.learningHours} color="#a855f7" />
        <StatCard icon={<Users size={20} />} label="Community Rank" value={stats.communityRank} color="#f43f5e" />
        <StatCard icon={<Award size={20} />} label="Certificates Earned" value={stats.certificatesEarned} color="#10b981" />
      </div>

      {/* Visual Learning Journey Map */}
      <div className="glass" style={{ padding: '32px', marginBottom: '40px', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>My Interactive Journey Map</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Click any step on your path below to navigate instantly.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', position: 'relative' }}>
          
          {/* Level 1: Student Dashboard */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
            <JourneyNode 
              icon={<LayoutDashboard size={18} />} 
              label="Student Dashboard" 
              status="Completed" 
              color="#10b981" 
              onClick={() => navigate('/')} 
            />
            <div style={{ height: '24px', width: '2px', background: 'var(--border)', position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: '-4px', left: '-3px', borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '6px solid var(--border)' }}></div>
            </div>
          </div>

          {/* Connectors for Level 2 Split */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '600px', position: 'relative', marginBottom: '8px' }}>
            <div style={{ position: 'absolute', top: '-16px', left: '25%', right: '25%', height: '2px', background: 'var(--border)' }}></div>
            <div style={{ position: 'absolute', top: '-16px', left: '25%', height: '16px', width: '2px', background: 'var(--border)' }}></div>
            <div style={{ position: 'absolute', top: '-16px', right: '25%', height: '16px', width: '2px', background: 'var(--border)' }}></div>
          </div>

          {/* Level 2: Split Branch (Browse Courses & Profile Management) */}
          <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', maxWidth: '700px', gap: '40px', zIndex: 2 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <JourneyNode 
                icon={<Compass size={18} />} 
                label="Browse Courses" 
                status="Completed" 
                color="#10b981" 
                onClick={() => navigate('/courses')} 
              />
              <div style={{ height: '28px', width: '2px', background: 'var(--border)', position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: '-4px', left: '-3px', borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '6px solid var(--border)' }}></div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <JourneyNode 
                icon={<User size={18} />} 
                label="Profile Management" 
                status="Completed" 
                color="#10b981" 
                onClick={() => navigate('/profile')} 
              />
            </div>
          </div>

          {/* Level 3: Enroll in Course */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '700px', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <JourneyNode 
                  icon={<UserPlus size={18} />} 
                  label="Enroll in Course" 
                  status="Completed" 
                  color="#10b981" 
                  onClick={() => navigate('/courses')} 
                />
                <div style={{ height: '28px', width: '2px', background: 'var(--border)', position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: '-4px', left: '-3px', borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '6px solid var(--border)' }}></div>
                </div>
              </div>
              <div style={{ flex: 1 }}></div>
            </div>
          </div>

          {/* Level 4: Access Course */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '700px', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <JourneyNode 
                  icon={<Key size={18} />} 
                  label="Access Course" 
                  status="Active" 
                  color="#2563eb" 
                  onClick={() => navigate('/courses')} 
                />
                <div style={{ height: '28px', width: '2px', background: 'var(--border)', position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: '-4px', left: '-3px', borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '6px solid var(--border)' }}></div>
                </div>
              </div>
              <div style={{ flex: 1 }}></div>
            </div>
          </div>

          {/* Level 5: View Content */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '700px', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <JourneyNode 
                  icon={<BookOpen size={18} />} 
                  label="View Content" 
                  status="Active" 
                  color="#2563eb" 
                  onClick={handleViewContent} 
                />
                <div style={{ height: '24px', width: '2px', background: 'var(--border)', position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: '-4px', left: '-3px', borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '6px solid var(--border)' }}></div>
                </div>
              </div>
              <div style={{ flex: 1 }}></div>
            </div>
          </div>

          {/* Connectors for Level 6 Split */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '600px', position: 'relative', marginBottom: '8px' }}>
            <div style={{ position: 'absolute', top: '-16px', left: '25%', right: '25%', height: '2px', background: 'var(--border)' }}></div>
            <div style={{ position: 'absolute', top: '-16px', left: '25%', height: '16px', width: '2px', background: 'var(--border)' }}></div>
            <div style={{ position: 'absolute', top: '-16px', right: '25%', height: '16px', width: '2px', background: 'var(--border)' }}></div>
          </div>

          {/* Level 6: Split Branch (Attempt Quiz & Submit Assignment) */}
          <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', maxWidth: '700px', gap: '40px', zIndex: 2 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <JourneyNode 
                icon={<HelpCircle size={18} />} 
                label="Attempt Quiz" 
                status="Unlocked" 
                color="#64748b" 
                onClick={() => navigate('/quizzes')} 
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <JourneyNode 
                icon={<FileText size={18} />} 
                label="Submit Assignment" 
                status="Unlocked" 
                color="#64748b" 
                onClick={handleViewContent} 
              />
            </div>
          </div>

        </div>
      </div>

      {/* Course List Section */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Continue Learning</h2>
        <a href="/courses" style={{ color: 'var(--primary)', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>View all courses</a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
      <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{value}</h3>
    </div>
  </div>
);

export default Dashboard;
