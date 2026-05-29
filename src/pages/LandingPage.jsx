import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, Users, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      {/* Simple Header */}
      <header style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen color="white" size={24} />
          </div>
          <h2 className="gradient-text" style={{ fontSize: '24px', fontWeight: 'bold' }}>SSLABS LMS</h2>
        </div>
        <button 
          className="btn-secondary" 
          onClick={() => navigate('/auth')}
          style={{ padding: '10px 24px' }}
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '800px' }}
        >
          <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px' }}>
            THE FUTURE OF LEARNING
          </span>
          <h1 style={{ fontSize: '64px', fontWeight: 800, margin: '24px 0', lineHeight: 1.1, color: 'var(--text-main)' }}>
            Elevate Your Skills With <br />
            <span className="gradient-text">Premium Masterclasses</span>
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--text-muted)', marginBottom: '40px', lineHeight: 1.6 }}>
            Join thousands of students and instructors on the most advanced, visually stunning learning management system designed for the modern web.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/auth')}
              style={{ fontSize: '18px', padding: '16px 40px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              Get Started <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', width: '100%', maxWidth: '1000px', marginTop: '80px' }}
        >
          {[
            { icon: <BookOpen size={24} color="var(--primary)" />, title: 'Rich Course Library', desc: 'Access hundreds of high-quality courses with interactive video players and modular layouts.' },
            { icon: <Award size={24} color="var(--secondary)" />, title: 'Dynamic Quizzes', desc: 'Test your knowledge instantly with embedded quizzes and earn certificates.' },
            { icon: <Users size={24} color="#f43f5e" />, title: 'Role-Based Access', desc: 'Distinct dashboards tailored perfectly for Students, Instructors, and Administrators.' },
          ].map((feature, idx) => (
            <div key={idx} className="glass" style={{ padding: '32px', textAlign: 'left', background: 'var(--glass-inner)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--glass-inner-darker)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-main)' }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Simple Footer */}
      <footer style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', borderTop: '1px solid var(--border)', marginTop: '60px' }}>
        © 2024 SSLABS LMS. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
