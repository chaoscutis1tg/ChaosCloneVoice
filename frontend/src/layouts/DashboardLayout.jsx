import { Link, useLocation } from 'react-router-dom';
import { Mic2, Image as ImageIcon, Video, Settings, UserCircle } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Voice Studio', icon: <Mic2 size={20} /> },
    { path: '/image-gen', label: 'Image Gen', icon: <ImageIcon size={20} /> },
    { path: '/video-gen', label: 'Video Gen', icon: <Video size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <h2>Chaos Studio</h2>
          <p>Version 1.1</p>
        </div>
        
        <div className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
          <UserCircle size={32} color="var(--primary-hover)" />
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Chaos</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
}
