import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Globe, Mail, ShieldAlert, Database, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    siteName: 'SSLABS LMS',
    supportEmail: 'support@sslabs.com',
    maintenanceMode: false,
    requireEmailVerification: true,
    stripeApiKey: 'sk_test_••••••••••••••••',
    sendgridApiKey: 'SG.••••••••••••••••'
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFinalize = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('System settings have been successfully finalized and applied globally.');
      navigate('/admin');
    }, 1200);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}
    >
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>System Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage global configurations, API keys, and platform behavior.</p>
      </div>

      <div style={{ display: 'flex', gap: '32px' }}>
        {/* Sidebar Nav */}
        <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
          <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={<Globe size={18} />} label="General Settings" />
          <TabButton active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} icon={<Database size={18} />} label="Integrations & API" />
          <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<ShieldAlert size={18} />} label="Security & Access" />
          <TabButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={<Bell size={18} />} label="Notifications" />
        </div>

        {/* Form Content */}
        <form onSubmit={handleFinalize} className="glass" style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {activeTab === 'general' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>General Configuration</h2>
              
              <InputGroup label="Platform Name" name="siteName" value={formData.siteName} onChange={handleChange} />
              <InputGroup label="Global Support Email" name="supportEmail" value={formData.supportEmail} onChange={handleChange} />
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--glass-inner-darker)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>Maintenance Mode</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Disable access to the platform for all non-admin users.</p>
                </div>
                <Toggle name="maintenanceMode" checked={formData.maintenanceMode} onChange={handleChange} />
              </div>
            </motion.div>
          )}

          {activeTab === 'integrations' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>Third-Party Integrations</h2>
              
              <InputGroup label="Stripe Secret API Key" name="stripeApiKey" value={formData.stripeApiKey} onChange={handleChange} type="password" />
              <InputGroup label="SendGrid API Key" name="sendgridApiKey" value={formData.sendgridApiKey} onChange={handleChange} type="password" />
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>Security Configuration</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--glass-inner-darker)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>Require Email Verification</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>New users must verify their email before accessing courses.</p>
                </div>
                <Toggle name="requireEmailVerification" checked={formData.requireEmailVerification} onChange={handleChange} />
              </div>
            </motion.div>
          )}
          
          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>System Notifications</h2>
              <p style={{ color: 'var(--text-muted)' }}>Configure webhook endpoints and automated admin alerts here.</p>
              {/* Mock content */}
            </motion.div>
          )}

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 32px', background: '#10b981', border: '1px solid #10b981' }}>
              {saving ? 'Applying...' : <><Save size={18} /> Finalize Settings</>}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button 
    type="button"
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px',
      background: active ? 'var(--glass-inner-darker)' : 'transparent',
      border: active ? '1px solid var(--border)' : '1px solid transparent',
      borderRadius: '12px', color: active ? 'var(--primary)' : 'var(--text-muted)',
      fontWeight: active ? 600 : 500, cursor: 'pointer', transition: 'all 0.2s',
      textAlign: 'left'
    }}
  >
    {icon} {label}
  </button>
);

const InputGroup = ({ label, name, value, onChange, type = 'text' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>{label}</label>
    <input 
      type={type} 
      name={name} 
      value={value} 
      onChange={onChange} 
      style={{ background: 'var(--glass-inner)', border: '1px solid var(--border)', padding: '14px 16px', borderRadius: '12px', color: 'var(--text-main)', outline: 'none', fontSize: '14px' }} 
    />
  </div>
);

const Toggle = ({ name, checked, onChange }) => (
  <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
    <input type="checkbox" name={name} checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
    <span style={{
      position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: checked ? 'var(--primary)' : 'var(--border)',
      transition: '.4s', borderRadius: '24px'
    }}>
      <span style={{
        position: 'absolute', content: '""', height: '18px', width: '18px',
        left: checked ? '22px' : '3px', bottom: '3px', backgroundColor: 'white',
        transition: '.4s', borderRadius: '50%'
      }}></span>
    </span>
  </label>
);

export default Settings;
