import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { api } from '../services/api.js';
import { setCredentials } from '../features/auth/authSlice.js';
import { BrainCircuit } from 'lucide-react';

export default function Login() {
  const { register, handleSubmit, formState: { errors }, setError } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [showWakingMessage, setShowWakingMessage] = useState(false);

  const successMessage = location.state?.message;

  const onSubmit = async (values) => {
    setLoading(true);
    setShowWakingMessage(false);
    const timer = setTimeout(() => {
      setShowWakingMessage(true);
    }, 2000);

    try {
      const { data } = await api.post('/auth/login', values);
      dispatch(setCredentials(data));
      navigate(['admin', 'super_admin'].includes(data.user?.role) ? '/app/admin' : '/app/dashboard');
    } catch (error) {
      setError('root', { message: error.response?.data?.message || 'Login failed' });
    } finally {
      clearTimeout(timer);
      setLoading(false);
      setShowWakingMessage(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0F19] px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft p-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="rounded-xl bg-primary p-3 text-white shadow-md shadow-blue-500/20">
            <BrainCircuit size={24} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-3">Welcome Back</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Login to continue your placement preparation dashboard.</p>
        </div>

        {successMessage && (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <input 
              className="input" 
              placeholder="Enter your email" 
              type="email" 
              {...register('email', { required: 'Email is required' })} 
            />
            {errors?.email && <p className="text-xs font-bold text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <input 
              className="input" 
              placeholder="Enter your password" 
              type="password" 
              {...register('password', { required: 'Password is required' })} 
            />
            {errors?.password && <p className="text-xs font-bold text-red-500">{errors.password.message}</p>}
          </div>

          {errors?.root && (
            <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 p-3 rounded-lg">
              {errors.root.message}
            </p>
          )}

          <button disabled={loading} className="btn-primary w-full py-3.5">
            {loading ? (showWakingMessage ? 'Server is waking up, please wait...' : 'Logging in...') : 'Sign In'}
          </button>
        </form>

        <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-4 text-center space-y-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            New here? <Link className="font-bold text-primary hover:underline" to="/register">Create an account</Link>
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Are you an administrator? <Link className="font-bold text-slate-600 dark:text-slate-350 hover:underline" to="/admin-login">Admin login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
