import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Clock, Bell, Settings, Shield, LogOut, Award } from 'lucide-react';

export default function Sidebar({ unreadNotifications = 0, pendingRequests = 0 }) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavClick = (path, hash) => {
    setCollapsed(false);
    if (hash) {
      if (location.pathname === '/dashboard') {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(`/dashboard#${hash}`);
      }
    }
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Teams',
      path: '/teams',
      icon: Users,
    },
    {
      label: 'My Requests',
      path: '/dashboard',
      hash: 'pending-requests',
      badge: pendingRequests > 0 ? pendingRequests : null,
      icon: Clock,
    },
    {
      label: 'Notifications',
      path: '/dashboard',
      hash: 'recent-activity',
      badge: unreadNotifications > 0 ? unreadNotifications : null,
      icon: Bell,
    },
    {
      label: 'Settings',
      path: '/profile',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {collapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setCollapsed(false)}
        />
      )}

      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-sidebar-bg text-white shadow-lg"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-[260px] bg-sidebar-bg flex flex-col
                     transition-transform duration-300 lg:translate-x-0
                     ${collapsed ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 flex-shrink-0 border-b border-gray-800/60">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            Off<span className="text-primary-400">Log</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCurrentPage = item.path === '/dashboard' && !item.hash
              ? location.pathname === '/dashboard' && !location.hash
              : item.path === '/teams'
                ? location.pathname.startsWith('/teams')
                : item.path === '/profile'
                  ? location.pathname === '/profile'
                  : false;

            return (
              <Link
                key={item.label}
                to={item.hash ? `/dashboard#${item.hash}` : item.path}
                onClick={() => handleNavClick(item.path, item.hash)}
                className={`sidebar-link ${isCurrentPage ? 'sidebar-link-active' : ''}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="min-w-[20px] h-5 px-1.5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {user?.role === 'MENTOR' && !isAdmin && (
            <Link
              to="/mentor"
              onClick={() => setCollapsed(false)}
              className={`sidebar-link ${location.pathname.startsWith('/mentor') ? 'sidebar-link-active' : ''}`}
            >
              <Award className="w-5 h-5 flex-shrink-0 text-amber-400" />
              <span className="flex-1">Mentor Panel</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setCollapsed(false)}
              className={`sidebar-link ${location.pathname === '/admin' ? 'sidebar-link-active' : ''}`}
            >
              <Shield className="w-5 h-5 flex-shrink-0 text-primary-400" />
              <span className="flex-1">Admin Panel</span>
            </Link>
          )}

        </nav>

        {/* Bottom sign out button (no redundant user name/role card) */}
        <div className="flex-shrink-0 border-t border-gray-800/60 p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-sidebar-hover transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
