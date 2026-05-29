import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Download, Share2, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Certificate = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [studentName, setStudentName] = useState(() => localStorage.getItem('userName') || 'Prasad R.');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    fetch(`http://localhost:5000/api/courses/${courseId}`)
      .then(res => {
        if (!res.ok) throw new Error('Course not found');
        return res.json();
      })
      .then(data => {
        setCourse(data);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [courseId]);

  if (isLoading) {
    return <LoadingSpinner message="Generating your certificate..." />;
  }

  const instructorName = course?.instructor || 'Alex Rivers';
  const courseTitle = course?.title || 'Modern UI/UX Design Fundamentals';

  return (
    <>
      <style>
        {`
          @page {
            size: portrait;
            margin: 0; /* This removes the browser's default headers and footers (URL, page numbers, date) */
          }
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-certificate, #printable-certificate * {
              visibility: visible;
            }
            #printable-certificate {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              transform: none !important;
              width: 100% !important;
              height: 50vh !important; /* Exactly half the height of the portrait page */
              max-width: none !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
            }
            /* Hide the back link and buttons inside the certificate component during print */
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' }}
      >
        <div className="no-print" style={{ width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <Link to={`/learn/${courseId}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to Course
          </Link>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              className="btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Certificate link copied to clipboard!');
              }}
            >
              <Share2 size={16} /> Share
            </button>
            <button 
              className="btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => window.print()}
            >
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>

        <div 
          id="printable-certificate"
          className="glass" 
          style={{ 
          width: '100%', 
          maxWidth: '900px', 
          aspectRatio: '1.414', // A4 Landscape ratio
          padding: '48px', 
          background: 'var(--bg-main)', 
          border: '12px solid var(--glass-inner-darker)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative corner elements */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '150px', height: '150px', borderRight: '2px solid var(--primary)', borderBottom: '2px solid var(--secondary)', borderBottomRightRadius: '100%' }}></div>
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '150px', height: '150px', borderLeft: '2px solid var(--secondary)', borderTop: '2px solid var(--primary)', borderTopLeftRadius: '100%' }}></div>

        <Award size={64} color="var(--primary)" style={{ marginBottom: '24px' }} />
        
        <h1 style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px', letterSpacing: '4px', textTransform: 'uppercase' }}>
          Certificate of Completion
        </h1>
        
        <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '32px' }}>
          This is to certify that
        </p>
        
        <h2 className="gradient-text" style={{ fontSize: '42px', fontWeight: 700, marginBottom: '32px', borderBottom: '2px solid var(--border)', paddingBottom: '8px', minWidth: '400px' }}>
          {studentName}
        </h2>
        
        <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          has successfully completed the masterclass
        </p>
        
        <h3 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-main)', marginBottom: course?.modules ? '12px' : '48px' }}>
          {courseTitle}
        </h3>
        
        {course?.modules && course.modules.length > 0 && (
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '700px', lineHeight: '1.6', fontStyle: 'italic' }}>
            Completed Modules: {course.modules.map(m => m.title).join(' • ')}
          </p>
        )}
        
        <div style={{ padding: '8px 24px', background: 'var(--glass-inner)', borderRadius: '20px', border: '1px solid var(--border)', marginBottom: '48px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
           <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Final Score:</span>
           <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>100%</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 48px', marginTop: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '4px', marginBottom: '8px', width: '150px' }}>
              {new Date().toLocaleDateString()}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Date Issued</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '4px', marginBottom: '8px', width: '150px', fontFamily: 'cursive', color: 'var(--primary)' }}>
              {instructorName}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Lead Instructor</span>
          </div>
        </div>
      </div>
    </motion.div>
    </>
  );
};

export default Certificate;
