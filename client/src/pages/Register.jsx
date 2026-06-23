import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { api } from '../services/api.js';
import { setCredentials } from '../features/auth/authSlice.js';

export default function Register() {
  const { register, handleSubmit, formState: { isSubmitting, errors }, setError } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post('/auth/register', values);
      dispatch(setCredentials(data));
      navigate('/app');
    } catch (error) {
      setError('root', { message: error.response?.data?.message || 'Registration failed' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="glass w-full max-w-md rounded-[2rem] p-6">
        <h1 className="text-3xl font-black">Create account</h1>
        <p className="mt-2 text-sm text-slate-500">Start your AI placement journey.</p>
        <div className="mt-6 space-y-4">
          <div>
            <input className="input" placeholder="Full name" {...register('name', { required: 'Full name is required' })} />
            {errors.name && <p className="mt-2 text-sm font-semibold text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <input className="input" placeholder="Email" type="email" {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' }
            })} />
            {errors.email && <p className="mt-2 text-sm font-semibold text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <input className="input" placeholder="Password" type="password" {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })} />
            {errors.password && <p className="mt-2 text-sm font-semibold text-red-500">{errors.password.message}</p>}
          </div>
          {errors.root && <p className="text-sm font-semibold text-red-500">{errors.root.message}</p>}
          <button disabled={isSubmitting} className="btn-primary w-full">{isSubmitting ? 'Creating...' : 'Create account'}</button>
        </div>
        <p className="mt-5 text-center text-sm text-slate-500">
          Already registered? <Link className="font-bold text-brand-600" to="/login">Login</Link>
        </p>
        <p className="mt-2 text-center text-sm text-slate-500">
          Admin? <Link className="font-bold text-brand-600" to="/admin-login">Admin login</Link>
        </p>
      </form>
    </div>
  );
}
