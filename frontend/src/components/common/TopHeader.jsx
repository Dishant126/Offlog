import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, HelpCircle, Sun, User, LogOut, ChevronDown, Shield, Sparkles } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/teams': 'Teams',
  '/profile': 'Profile',
  '/admin': 'Admin Panel',
};

export default function TopHeader({ unreadCount = 0 }) {
  const { user, logout, isAdmin, isMentor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Derive page title
  let pageTitle = 'Dashboard';
  if (location.pathname.startsWith('/teams/')) {
    pageTitle = 'Team Details';
  } else {
    pageTitle = pageTitles[location.pathname] || 'Dashboard';
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';
  const roleLabel = isAdmin ? 'Admin' : isMentor ? 'Mentor' : 'Member';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center px-6 gap-4">
      {/* Left: Page title - push right on mobile to account for hamburger */}
      <h1 className="text-lg font-bold text-slate-900 flex-shrink-0 lg:ml-0 ml-10">{pageTitle}</h1>

      {/* Center: Search bar */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search teams, members..."
            className="w-full pl-10 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-slate-400">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-sm">⌘</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-sm">K</kbd>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Theme toggle (visual only) */}
        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" title="Toggle theme">
          <Sun className="h-[18px] w-[18px]" />
        </button>

        {/* Notifications Dropdown */}
        <NotificationDropdown initialUnreadCount={unreadCount} />


        {/* Help */}
        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" title="Help">
          <HelpCircle className="h-[18px] w-[18px]" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* User dropdown */}
        <div className="relative hidden sm:block" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(s => !s)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl text-sm text-slate-700 hover:bg-slate-100 transition-all duration-200"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
            )}
            <div className="hidden lg:block text-left">
              <p className="text-sm font-semibold text-slate-800 truncate max-w-[120px]">{user?.name}</p>
              <p className="text-[11px] text-slate-400">{roleLabel}</p>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-card-lg border border-slate-200 py-1 animate-scale-in z-50">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <Link
                to="/profile"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="h-4 w-4 text-slate-400" />
                My Profile
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <Shield className="h-4 w-4 text-primary-500" />
                  Admin Panel
                </Link>
              )}
              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
