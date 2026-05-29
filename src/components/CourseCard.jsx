import React from 'react';
import { Play, Clock, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  return (
    <div className="course-card glass" style={{ overflow: 'hidden', transition: 'all 0.3s' }}>
      <div style={{ position: 'relative', height: '180px' }}>
        <img 
          src={course.image} 
          alt={course.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <span style={{ padding: '4px 10px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
            {course.category}
          </span>
        </div>
      </div>
      
      <div style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', lineHeight: '1.4' }}>{course.title}</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>by {course.instructor}</p>
        
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <Clock size={14} /> {course.duration}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <BookOpen size={14} /> {course.lessons} Lessons
          </div>
        </div>

        {course.progress > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span>Progress</span>
              <span>{course.progress}%</span>
            </div>
            <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px' }}>
              <div style={{ width: `${course.progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', borderRadius: '3px' }}></div>
            </div>
          </div>
        )}

        <Link to={`/course/${course.id}`} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', fontSize: '14px' }}>
          <Play size={16} fill="white" /> {course.progress > 0 ? 'Continue' : 'Start Course'}
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
