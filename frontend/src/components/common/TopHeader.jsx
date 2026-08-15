import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { Search, HelpCircle, Sun, User, LogOut, ChevronDown, Shield, Users, Globe, X, Loader2 } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/teams': 'Teams',
  '/profile': 'Profile',
  '/admin': 'Admin Panel',
};

export default function TopHeader({ unreadCount = 0 }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Live search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Derive page title
  let pageTitle = 'Dashboard';
  if (location.pathname.startsWith('/teams/')) {
    pageTitle = 'Team Details';
  } else {
    pageTitle = pageTitles[location.pathname] || 'Dashboard';
  }

  // Handle outside clicks to close user dropdown & search dropdown
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced Search API call
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults(null);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await userService.search(searchQuery.trim());
        const data = res.data?.data || res.data;
        setSearchResults(data);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';
  const roleLabel = isAdmin ? 'Admin' : user?.role === 'MENTOR' ? 'Mentor' : 'Member';

  const userList = searchResults?.users || (Array.isArray(searchResults) ? searchResults : []);
  const teamList = searchResults?.teams || [];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center px-6 gap-4">
      {/* Left: Page title */}
      <h1 className="text-lg font-bold text-slate-900 flex-shrink-0 lg:ml-0 ml-10">{pageTitle}</h1>

      {/* Center: Interactive Live Search Bar */}
      <div className="flex-1 flex justify-center" ref={searchRef}>
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => {
              if (searchQuery.trim().length >= 2) setShowSearchDropdown(true);
            }}
            placeholder="Search members, public teams..."
            className="w-full pl-10 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all"
          />
          {searching ? (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-500 animate-spin" />
          ) : searchQuery ? (
            <button
              onClick={() => { setSearchQuery(''); setSearchResults(null); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-slate-400 pointer-events-none">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-sm">⌘</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-sm">K</kbd>
            </div>
          )}

          {/* Search Dropdown Results */}
          {showSearchDropdown && searchQuery.trim().length >= 2 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 max-h-96 overflow-y-auto animate-scale-in">
              {searching ? (
                <div className="p-4 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary-600" /> Searching...
                </div>
              ) : (
                <>
                  {/* Joined Teams Section */}
                  {searchResults?.joinedTeams?.length > 0 && (
                    <>
                      <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-blue-600" /> Joined Teams ({searchResults.joinedTeams.length})
                      </div>
                      {searchResults.joinedTeams.map((t) => (
                        <div
                          key={t._id}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            setSearchQuery('');
                            navigate(`/teams/${t._id}`);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/60 cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                            {t.logo ? <img src={t.logo} alt="" className="w-full h-full rounded-lg object-cover" /> : t.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-800 truncate">{t.name}</p>
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-600 rounded">
                                Joined
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 truncate">
                              Code: <span className="font-mono font-semibold">{t.joinCode}</span> • {t.memberCount || 0} members
                            </p>
                          </div>
                        </div>
                      ))}
                      <div className="my-1 border-t border-slate-100" />
                    </>
                  )}

                  {/* Public Teams Section */}
                  <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                    <Globe className="h-3 w-3 text-blue-500" /> Public Teams ({(searchResults?.publicTeams || teamList).length})
                  </div>
                  {(searchResults?.publicTeams || teamList).length === 0 ? (
                    <p className="px-4 py-2 text-xs text-slate-400 italic">No matching public teams</p>
                  ) : (
                    (searchResults?.publicTeams || teamList).map((t) => (
                      <div
                        key={t._id}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                          navigate(`/teams/${t._id}`);
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/60 cursor-pointer transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                          {t.logo ? <img src={t.logo} alt="" className="w-full h-full rounded-lg object-cover" /> : t.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800 truncate">{t.name}</p>
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-600 rounded">
                              Public
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate">
                            Code: <span className="font-mono font-semibold">{t.joinCode}</span> • {t.memberCount || 0} members
                          </p>
                        </div>
                      </div>
                    ))
                  )}

                  <div className="my-1 border-t border-slate-100" />

                  {/* Members Section */}
                  <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                    <Users className="h-3 w-3 text-emerald-500" /> Team Members & Users ({userList.length})
                  </div>
                  {userList.length === 0 ? (
                    <p className="px-4 py-2 text-xs text-slate-400 italic">No matching members</p>
                  ) : (
                    userList.map((u) => (
                      <div
                        key={u._id}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center flex-shrink-0 text-xs overflow-hidden">
                          {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                            <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                              u.role === 'ADMIN' ? 'bg-purple-50 text-purple-600' :
                              u.role === 'MENTOR' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {u.role}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    ))
                  )}

                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" title="Toggle theme">
          <Sun className="h-[18px] w-[18px]" />
        </button>

        <NotificationDropdown initialUnreadCount={unreadCount} />

        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" title="Help">
          <HelpCircle className="h-[18px] w-[18px]" />
        </button>

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
