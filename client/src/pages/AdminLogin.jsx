import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { ShieldCheck } from 'lucide-react';
import { api } from '../services/api.js';
import { setCredentials } from '../features/auth/authSlice.js';

export default function AdminLogin() {
  const { register, handleSubmit, setValue, formState: { isSubmitting, errors }, setError } = useForm({
    defaultValues: {
      email: 'admin@interviewai.local',
      password: 'Admin@123'
    }
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post('/auth/login', values);

      if (!['admin', 'super_admin'].includes(data.user?.role)) {
        setError('root', { message: 'This account is not an admin account' });
        return;
      }

      dispatch(setCredentials(data));
      navigate('/app/admin');
    } catch (error) {
      setError('root', { message: error.response?.data?.message || 'Admin login failed' });
    }
  };

  const createDemoAdmin = async () => {
    try {
      const { data } = await api.post('/auth/bootstrap-admin');
      setValue('email', data.credentials.email);
      setValue('password', data.credentials.password);
      setError('root', { message: 'Demo admin ready. Now click Login as admin.' });
    } catch (error) {
      setError('root', { message: error.response?.data?.message || 'Could not create demo admin' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0F19] px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft p-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="rounded-xl bg-slate-900 text-white p-3 shadow-md">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-3">Admin Portal</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Login to manage system intelligence, roadmaps, and candidates.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <input 
              className="input" 
              placeholder="Admin email" 
              type="email" 
              {...register('email', { required: 'Admin email is required' })} 
            />
            {errors.email && <p className="text-xs font-bold text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <input 
              className="input" 
              placeholder="Admin password" 
              type="password" 
              {...register('password', { required: 'Admin password is required' })} 
            />
            {errors.password && <p className="text-xs font-bold text-red-500">{errors.password.message}</p>}
          </div>

          {errors.root && (
            <p className={`text-xs font-bold p-3 rounded-lg border ${
              errors.root.message.includes('ready') 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/25 text-emerald-600 dark:text-emerald-400' 
                : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/25 text-red-500'
            }`}>
              {errors.root.message}
            </p>
          )}

          <button disabled={isSubmitting} className="btn-primary w-full py-3.5 bg-slate-900 hover:bg-slate-800 border-none">
            {isSubmitting ? 'Logging in...' : 'Sign In as Admin'}
          </button>

          <button type="button" onClick={createDemoAdmin} className="btn-secondary w-full py-3.5">
            Auto-generate Demo Admin
          </button>
        </form>

        <div className="bg-slate-55 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs dark:bg-slate-950/40">
          <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">Demo Admin Credentials:</p>
          <p className="text-slate-500 dark:text-slate-400">Email: <span className="font-semibold select-all">admin@interviewai.local</span></p>
          <p className="text-slate-500 dark:text-slate-400">Password: <span className="font-semibold select-all">Admin@123</span></p>
        </div>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Candidate? <Link className="font-bold text-primary hover:underline" to="/login">Candidate login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
