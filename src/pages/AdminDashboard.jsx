import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, IndianRupee, BookOpen, Activity, AlertCircle, ArrowUpRight, ArrowDownRight, Server } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [platformHealth, setPlatformHealth] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/metrics/admin')
      .then(res => res.json())
      .then(data => {
        if (data.stats) {
          setStats([
            { title: 'Total Revenue', value: data.stats.revenue, trend: '+15%', isPositive: true, icon: <IndianRupee size={24} color="#10b981" /> },
            { title: 'Active Users', value: data.stats.activeUsers, trend: '+8%', isPositive: true, icon: <Users size={24} color="var(--primary)" /> },
            { title: 'Published Courses', value: data.stats.courses, trend: '+12%', isPositive: true, icon: <BookOpen size={24} color="var(--secondary)" /> },
            { title: 'System Load', value: data.stats.systemLoad, trend: '-2%', isPositive: true, icon: <Server size={24} color="#f59e0b" /> }
          ]);
        }
        if (data.activity) {
          setRecentActivity(data.activity);
        }
        if (data.platformHealth) {
          setPlatformHealth(data.platformHealth);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingSpinner message="Fetching dashboard metrics..." />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Platform overview, health metrics, and global activity.</p>
        </div>
        <Link to="/admin/students" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} /> Manage All Users
        </Link>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <Link to="/admin/students" className="glass" style={{ flex: 1, padding: '16px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', fontWeight: 600, borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ padding: '8px', background: 'var(--glass-inner-darker)', borderRadius: '8px' }}><Users size={20} color="var(--primary)" /></div>
          Manage Users
        </Link>
        <button onClick={() => document.getElementById('analytics').scrollIntoView({ behavior: 'smooth' })} className="glass" style={{ flex: 1, padding: '16px', border: 'none', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', fontWeight: 600, borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '16px' }}>
          <div style={{ padding: '8px', background: 'var(--glass-inner-darker)', borderRadius: '8px' }}><Activity size={20} color="var(--secondary)" /></div>
          View Analytics
        </button>
        <Link to="/settings" className="glass" style={{ flex: 1, padding: '16px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', fontWeight: 600, borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ padding: '8px', background: 'var(--glass-inner-darker)', borderRadius: '8px' }}><Server size={20} color="#10b981" /></div>
          System Settings
        </Link>
      </div>

      {/* Top Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {stats.map((stat, idx) => (
          <div key={idx} className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ padding: '12px', background: 'var(--glass-inner-darker)', borderRadius: '12px' }}>
                {stat.icon}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: stat.isPositive ? '#10b981' : '#f43f5e', fontSize: '13px', fontWeight: 600 }}>
                {stat.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {stat.trend}
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '4px' }}>{stat.value}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div id="analytics" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', scrollMarginTop: '24px' }}>
        {/* Activity Feed */}
        <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Live Activity Feed</h2>
            <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentActivity.map((activity, idx) => (
              <div key={activity.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', paddingBottom: idx !== recentActivity.length -1 ? '16px' : '0', borderBottom: idx !== recentActivity.length -1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--glass-inner-darker)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                   {activity.type === 'course' && <BookOpen size={18} color="var(--secondary)" />}
                   {activity.type === 'purchase' && <IndianRupee size={18} color="#10b981" />}
                   {activity.type === 'security' && <AlertCircle size={18} color="#f43f5e" />}
                   {activity.type === 'role' && <Users size={18} color="var(--primary)" />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{activity.user}</span>{' '}
                    <span style={{ color: 'var(--text-muted)' }}>{activity.action}</span>{' '}
                    <span style={{ fontWeight: 500, color: 'var(--primary)' }}>{activity.target}</span>
                  </p>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--primary)" /> System Health
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {platformHealth.map((health, idx) => (
              <div key={idx} style={{ background: 'var(--glass-inner-darker)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500, fontSize: '14px' }}>{health.service}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: health.status === 'Operational' ? '#10b981' : '#f59e0b' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: health.status === 'Operational' ? '#10b981' : '#f59e0b' }}></div>
                    {health.status}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Uptime: {health.uptime}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
