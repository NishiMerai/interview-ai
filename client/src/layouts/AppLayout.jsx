import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Brain, FileText, Gauge, GraduationCap, LogOut, MessageCircle, 
  Moon, Shield, Sparkles, Sun, User, Settings, Bell, Search, Menu, X, Clock, Video, History, HelpCircle
} from 'lucide-react';
import { logout } from '../features/auth/authSlice.js';
import { toggleTheme } from '../store/themeSlice.js';

export default function AppLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);

  // Layout states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const signOut = () => {
    dispatch(logout());
    navigate('/');
  };

  const menuItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: Gauge },
    { label: 'Resume Analyzer', path: '/app/resume', icon: FileText },
    { label: 'Resume History', path: '/app/resume', hash: '#history', icon: History },
    { label: 'AI Mock Interview', path: '/app/interview', icon: Brain },
    { label: 'HR Interview', path: '/app/interview', hash: '#hr-interview', icon: Video },
    { label: 'Roadmaps', path: '/app/roadmap', icon: GraduationCap },
    { label: 'Chatbot', path: '/app/chatbot', icon: MessageCircle },
  ];

  const adminItems = [
    { label: 'Admin Panel', path: '/app/admin', icon: Shield },
    { label: 'Interview Requests', path: '/app/admin-interviews', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-[#0B0F19] text-bodyText dark:text-slate-350 transition-colors duration-300 flex flex-col font-sans">
      
      {/* Top Header Navigation */}
      <header className="h-16 border-b border-border bg-white dark:bg-slate-900 sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm transition-colors duration-300">
        
        {/* Logo and Mobile Menu toggle */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-blue-500/10">
              <Brain size={18} />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white text-base leading-none block">Interview AI</span>
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-0.5 block">SaaS cockpit</span>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center w-96 relative group">
          <Search size={16} className="absolute left-3 text-slate-400 group-focus-within:text-primary transition" />
          <input 
            type="text" 
            placeholder="Search roadmaps, questions, skills..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8FAFC] dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* Theme toggle */}
          <button 
            onClick={() => dispatch(toggleTheme())} 
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-400 transition"
          >
            {mode === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-400 transition relative"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            </button>
            
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-3 z-50 animate-fade-in">
                <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Notifications</span>
                  <span className="text-[10px] font-bold text-primary cursor-pointer hover:underline">Mark read</span>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Welcome to your SaaS prep platform!</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Just now</p>
                  </div>
                  <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Your AI skill report is complete.</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">2 hours ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu Trigger */}
          <div className="relative">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 text-left hover:opacity-90 transition focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-primary dark:text-blue-300 font-extrabold text-sm border border-blue-200 dark:border-blue-800">
                {user?.name?.[0]?.toUpperCase() || 'S'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-800 dark:text-white leading-none">{user?.name || 'Student'}</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5 leading-none">{user?.role || 'candidate'}</p>
              </div>
            </button>
            
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50 animate-fade-in">
                <button 
                  onClick={() => { setProfileOpen(false); setProfileOpen(true); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 transition"
                >
                  My Profile
                </button>
                <button 
                  onClick={() => { setProfileOpen(false); setSettingsOpen(true); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 transition"
                >
                  Settings
                </button>
                <hr className="border-slate-100 dark:border-slate-800 my-1" />
                <button 
                  onClick={signOut}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        
        {/* Left Dark Sidebar */}
        <aside className={`
          bg-sidebar text-sidebarText w-64 shrink-0 transition-all duration-300 border-r border-slate-800/20
          fixed inset-y-0 left-0 z-30 transform lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full justify-between p-4 space-y-6">
            
            <div className="space-y-6">
              {/* Profile Card Summary */}
              <div className="bg-slate-800/40 rounded-xl p-4 border border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white uppercase">
                  {user?.name?.[0] || 'C'}
                </div>
                <div className="overflow-hidden">
                  <p className="font-extrabold text-sm text-white leading-none truncate">{user?.name || 'Candidate'}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1 truncate">{user?.email}</p>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const toPath = item.hash ? `${item.path}${item.hash}` : item.path;
                  return (
                    <NavLink
                      key={item.label}
                      to={item.path}
                      onClick={() => {
                        setSidebarOpen(false);
                        if (item.hash) {
                          setTimeout(() => {
                            const el = document.querySelector(item.hash);
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }
                      }}
                      end={item.path === '/app/dashboard'}
                      className={({ isActive }) => `
                        flex items-center gap-3 rounded-lg px-4 py-2.5 text-xs font-semibold tracking-wide transition-all
                        ${isActive && !item.hash
                          ? 'bg-primary text-white shadow-md shadow-blue-500/20' 
                          : 'text-slate-400 hover:text-white hover:bg-primary'
                        }
                      `}
                    >
                      <item.icon size={16} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}

                {/* Profile & Settings Mock Sidebar Links */}
                <button
                  onClick={() => { setSidebarOpen(false); setProfileOpen(true); }}
                  className="w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-xs font-semibold tracking-wide text-slate-400 hover:text-white hover:bg-primary transition-all text-left"
                >
                  <User size={16} />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => { setSidebarOpen(false); setSettingsOpen(true); }}
                  className="w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-xs font-semibold tracking-wide text-slate-400 hover:text-white hover:bg-primary transition-all text-left"
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
              </nav>

              {/* Admin Panel sections */}
              {['admin', 'super_admin'].includes(user?.role) && (
                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest px-4">Administration</p>
                  <nav className="space-y-2">
                    {adminItems.map((item) => (
                      <NavLink
                        key={item.label}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) => `
                          flex items-center gap-3 rounded-lg px-4 py-2.5 text-xs font-semibold tracking-wide transition-all
                          ${isActive 
                            ? 'bg-primary text-white shadow-md' 
                            : 'text-slate-400 hover:text-white hover:bg-primary'
                          }
                        `}
                      >
                        <item.icon size={16} />
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </nav>
                </div>
              )}
            </div>

            {/* Logout button */}
            <div>
              <button 
                onClick={signOut}
                className="w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-500/10 transition"
              >
                <LogOut size={16} />
                <span>Logout Session</span>
              </button>
            </div>

          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-6 lg:p-8 bg-background dark:bg-[#0B0F19] transition-colors duration-300 relative overflow-y-auto h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>

      {/* Profile Modal overlay */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 relative animate-slide-up">
            <button onClick={() => setProfileOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition">
              <X size={18} />
            </button>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-primary font-black text-2xl border border-blue-200">
                {user?.name?.[0] || 'C'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name || 'Candidate'}</h3>
                <span className="badge bg-blue-50 border border-blue-100 text-primary dark:bg-blue-900/20 dark:text-blue-300 mt-2 font-bold uppercase">{user?.role}</span>
              </div>
              <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3 text-left text-sm font-semibold">
                <div>
                  <span className="text-slate-400 uppercase tracking-widest text-[10px] block">Email Address</span>
                  <span className="text-slate-800 dark:text-slate-200">{user?.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-widest text-[10px] block">Role Permissions</span>
                  <span className="text-slate-800 dark:text-slate-200">{user?.role === 'admin' ? 'System Administrator' : 'Placement Candidate'}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-widest text-[10px] block">Account Status</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Active Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal overlay */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 relative animate-slide-up">
            <button onClick={() => setSettingsOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition">
              <X size={18} />
            </button>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Settings className="text-primary" size={22} />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Account Settings</h3>
              </div>
              <hr className="border-slate-100 dark:border-slate-800" />
              <div className="space-y-4 text-sm font-semibold">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-800 dark:text-slate-200">Email Notifications</p>
                    <p className="text-[10px] text-slate-400">Receive weekly roadmap status alerts</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary focus:ring-primary focus:ring-offset-0" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-800 dark:text-slate-200">AI Assistance Auto-save</p>
                    <p className="text-[10px] text-slate-400">Save chatbot chats locally in background</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary focus:ring-primary focus:ring-offset-0" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-800 dark:text-slate-200">High Contrast Mode</p>
                    <p className="text-[10px] text-slate-400">Enhance typography readability</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary focus:ring-offset-0" />
                </div>
              </div>
              <hr className="border-slate-100 dark:border-slate-800" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setSettingsOpen(false)} className="btn-secondary py-2 px-4 !rounded-lg text-xs">Cancel</button>
                <button onClick={() => setSettingsOpen(false)} className="btn-primary py-2 px-4 !rounded-lg text-xs">Save Configuration</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
