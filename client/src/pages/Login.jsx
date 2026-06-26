import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { api } from '../services/api.js';
import { setCredentials } from '../features/auth/authSlice.js';

export default function Login() {
  const { register, handleSubmit, errors, setError } = useForm();
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="glass w-full max-w-md rounded-[2rem] p-6">
        <h1 className="text-3xl font-black">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">Login to continue your placement prep.</p>
        
        {successMessage && (
          <div className="mt-4 rounded-2xl bg-emerald-500/10 p-3 text-sm font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            {successMessage}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <input className="input" placeholder="Email" type="email" {...register('email', { required: 'Email required' })} />
          <input className="input" placeholder="Password" type="password" {...register('password', { required: 'Password required' })} />
          {errors?.root && <p className="text-sm font-semibold text-red-500">{errors.root.message}</p>}
          <button disabled={loading} className="btn-primary w-full">
            {loading ? (showWakingMessage ? 'Server is waking up, please wait...' : 'Logging in...') : 'Login'}
          </button>
        </div>
        <p className="mt-5 text-center text-sm text-slate-500">
          New here? <Link className="font-bold text-brand-600" to="/register">Create account</Link>
        </p>
        <p className="mt-2 text-center text-sm text-slate-500">
          Admin? <Link className="font-bold text-brand-600" to="/admin-login">Admin login</Link>
        </p>
      </form>
    </div>
  );
}
