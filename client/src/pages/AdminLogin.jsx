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
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="glass w-full max-w-md rounded-[2rem] p-6">
        <div className="mb-4 inline-flex rounded-2xl bg-brand-600 p-3 text-white">
          <ShieldCheck />
        </div>
        <h1 className="text-3xl font-black">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-500">Login as admin to manage users, skills, questions and analytics.</p>

        <div className="mt-6 space-y-4">
          <div>
            <input className="input" placeholder="Admin email" type="email" {...register('email', { required: 'Admin email is required' })} />
            {errors.email && <p className="mt-2 text-sm font-semibold text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <input className="input" placeholder="Admin password" type="password" {...register('password', { required: 'Admin password is required' })} />
            {errors.password && <p className="mt-2 text-sm font-semibold text-red-500">{errors.password.message}</p>}
          </div>

          {errors.root && (
            <p className={`text-sm font-semibold ${errors.root.message.includes('ready') ? 'text-emerald-600' : 'text-red-500'}`}>
              {errors.root.message}
            </p>
          )}

          <button disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Logging in...' : 'Login as admin'}
          </button>

          <button type="button" onClick={createDemoAdmin} className="btn-secondary w-full">
            Create/repair demo admin
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm dark:bg-white/10">
          <p className="font-bold">Demo admin</p>
          <p>Email: admin@interviewai.local</p>
          <p>Password: Admin@123</p>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          Normal user? <Link className="font-bold text-brand-600" to="/login">User login</Link>
        </p>
      </form>
    </div>
  );
}
