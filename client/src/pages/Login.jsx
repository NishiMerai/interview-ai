import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { api } from '../services/api.js';
import { setCredentials } from '../features/auth/authSlice.js';

export default function Login() {
  const { register, handleSubmit, formState: { isSubmitting, errors }, setError } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post('/auth/login', values);
      dispatch(setCredentials(data));
      navigate(['admin', 'super_admin'].includes(data.user?.role) ? '/app/admin' : '/app');
    } catch (error) {
      setError('root', { message: error.response?.data?.message || 'Login failed' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="glass w-full max-w-md rounded-[2rem] p-6">
        <h1 className="text-3xl font-black">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">Login to continue your placement prep.</p>
        <div className="mt-6 space-y-4">
          <input className="input" placeholder="Email" type="email" {...register('email', { required: 'Email required' })} />
          <input className="input" placeholder="Password" type="password" {...register('password', { required: 'Password required' })} />
          {errors.root && <p className="text-sm font-semibold text-red-500">{errors.root.message}</p>}
          <button disabled={isSubmitting} className="btn-primary w-full">{isSubmitting ? 'Logging in...' : 'Login'}</button>
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
