import Sidebar from './Sidebar';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8faf9' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Navbar */}
        <header style={{
          height: 64, background: '#fff', borderBottom: '1px solid #eef1f4',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', position: 'sticky', top: 0, zIndex: 40,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#f8faf9', border: '1px solid #eef1f4',
            borderRadius: 50, padding: '8px 16px', maxWidth: 320, flex: 1,
          }}>
            <Search size={16} color="#9ca3af" />
            <input
              placeholder="Search courses, mentors..."
              style={{
                background: 'none', border: 'none', outline: 'none',
                fontSize: 13, color: '#374151', width: '100%',
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{
              width: 38, height: 38, borderRadius: '50%', background: '#f8faf9',
              border: '1px solid #eef1f4', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#e8f5e9'}
              onMouseLeave={e => e.currentTarget.style.background = '#f8faf9'}
            >
              <Bell size={17} color="#6b7280" />
              <span style={{
                position: 'absolute', top: 6, right: 6, width: 8, height: 8,
                borderRadius: '50%', background: '#2d6a4f', border: '2px solid #fff',
              }} />
            </button>

            {/* Avatar */}
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2d6a4f, #40916c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14, color: '#fff', cursor: 'pointer',
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
