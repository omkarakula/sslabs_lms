import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = "Loading data..." }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '80px 20px',
        width: '100%',
        minHeight: '400px',
        position: 'relative'
      }}
    >
      {/* Background Soft Ambient Glow */}
      <div style={{
        position: 'absolute',
        width: '260px',
        height: '260px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.09) 0%, rgba(99, 102, 241, 0) 70%)',
        filter: 'blur(35px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Gyroscopic Concentric Orbit Spinner */}
      <div style={{ 
        position: 'relative', 
        width: '100px', 
        height: '100px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: '32px',
        zIndex: 1
      }}>
        {/* Outer Ring - Indigo Orbit */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          style={{
            position: 'absolute',
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            border: '3.5px solid transparent',
            borderTopColor: 'var(--primary)',
            borderBottomColor: 'var(--primary)',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.25)'
          }}
        />

        {/* Middle Ring - Emerald Orbit (Counter Rotation) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          style={{
            position: 'absolute',
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            border: '3px solid transparent',
            borderLeftColor: '#10b981',
            borderRightColor: '#10b981',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)'
          }}
        />

        {/* Inner Ring - Amber Orbit */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={{
            position: 'absolute',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: '2.5px solid transparent',
            borderTopColor: '#f59e0b',
            borderBottomColor: '#f59e0b',
            boxShadow: '0 0 12px rgba(245, 158, 11, 0.25)'
          }}
        />

        {/* Central Pulse core */}
        <motion.div
          animate={{ 
            scale: [1, 1.25, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.4, 
            ease: "easeInOut" 
          }}
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: 'var(--primary)',
            boxShadow: '0 0 14px var(--primary)'
          }}
        />
      </div>

      {/* Loading Messages */}
      <div style={{ zIndex: 1, textAlign: 'center' }}>
        <motion.h3 
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          style={{ 
            fontSize: '18px', 
            fontWeight: 700, 
            color: 'var(--text-main)', 
            marginBottom: '8px',
            letterSpacing: '0.75px'
          }}
        >
          Please Wait
        </motion.h3>
        
        <p style={{ 
          color: 'var(--text-muted)', 
          fontSize: '14px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          {message}
          {/* Animated loading dots */}
          <span style={{ display: 'inline-flex', gap: '3.5px', marginLeft: '2px' }}>
            <motion.span 
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
              style={{ width: '4.5px', height: '4.5px', borderRadius: '50%', background: 'var(--text-muted)' }}
            />
            <motion.span 
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
              style={{ width: '4.5px', height: '4.5px', borderRadius: '50%', background: 'var(--text-muted)' }}
            />
            <motion.span 
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
              style={{ width: '4.5px', height: '4.5px', borderRadius: '50%', background: 'var(--text-muted)' }}
            />
          </span>
        </p>
      </div>
    </motion.div>
  );
};

export default LoadingSpinner;
