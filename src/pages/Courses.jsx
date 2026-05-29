import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/courses')
      .then(res => res.json())
      .then(data => {
        const validCourses = Array.isArray(data) ? data.filter(c => c && c.id && c.title) : [];
        setCourses(validCourses);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredCourses = filter === 'All' 
    ? courses 
    : courses.filter(c => c.category === filter);

  if (isLoading) return <LoadingSpinner message="Loading course library..." />;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Course Library</h1>
        <p style={{ color: 'var(--text-muted)' }}>Expand your knowledge with our curated masterclasses.</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
        {['All', 'Design', 'Development', 'Business', 'Marketing'].map(cat => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            className="glass"
            style={{ 
              padding: '10px 24px', 
              borderRadius: '12px', 
              cursor: 'pointer',
              color: filter === cat ? 'white' : 'var(--text-muted)',
              background: filter === cat ? 'var(--primary)' : 'var(--glass-bg)',
              border: filter === cat ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
              fontWeight: 600,
              transition: 'all 0.3s',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {filteredCourses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </motion.div>
  );
};

export default Courses;
