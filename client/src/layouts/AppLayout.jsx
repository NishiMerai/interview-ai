import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Brain, FileText, Gauge, GraduationCap, LogOut, MessageCircle, Moon, Shield, Sparkles, Sun, UserRoundCheck } from 'lucide-react';
import { logout } from '../features/auth/authSlice.js';
import { toggleTheme } from '../store/themeSlice.js';


const navItems = [
  { label: 'Dashboard', path: '/app/dashboard' },
  { label: 'Resume', path: '/app/resume' },
  { label: 'Skill Gap', path: '/app/skill-gap' },
  { label: 'Roadmap', path: '/app/roadmap' },
  { label: 'Interview', path: '/app/interview' },
  { label: 'Chatbot', path: '/app/chatbot' },
  { label: 'Admin', path: '/app/admin' },
];
export default function AppLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);

  const signOut = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen px-4 py-4 dark:text-slate-100 lg:px-6">
      <div className="mx-auto flex max-w-7xl gap-4">
        <aside className="glass fixed inset-x-4 bottom-4 z-30 rounded-3xl p-2 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-72 lg:shrink-0 lg:p-4">
          <div className="hidden items-center gap-3 px-3 pb-6 lg:flex">
            <div className="rounded-2xl bg-brand-600 p-3 text-white">
              <Sparkles size={22} />
            </div>
            <div>
              <h1 className="font-black">Interview AI</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Placement cockpit</p>
            </div>
          </div>
          <nav className="flex justify-between gap-1 overflow-x-auto lg:block lg:space-y-2">
            {navItems.filter((item) => !item.adminOnly || ['admin', 'super_admin'].includes(user?.role)).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/app/dashboard'}
                className={({ isActive }) =>
                  `flex min-w-fit items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-white/10'
                  }`
                }
              >
             
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 pb-28 lg:pb-0">
          <header className="glass mb-5 flex items-center justify-between rounded-3xl p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand-600">Welcome back</p>
              <h2 className="text-xl font-black text-slate-950 dark:text-white">{user?.name || 'Student'}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => dispatch(toggleTheme())} className="btn-secondary px-3">
                {mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <button onClick={signOut} className="btn-secondary px-3">
                <LogOut size={18} />
              </button>
            </div>
          </header>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
