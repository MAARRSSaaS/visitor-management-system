import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
export default function Login() {
  const {
    register,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm();
  const {
    login
  } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const onSubmit = async data => {
    setSubmitting(true);
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 transition-colors duration-300">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 transition-all duration-300">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 12.25v-.32a4.488 4.488 0 00-1.847-3.612m5.707 9.871A11.963 11.963 0 0112 18c-.896 0-1.766-.098-2.6-.285m12.01 1.74l-.094-.312a14.242 14.242 0 00-6.14-8.192M13 5.082V3.5a1.5 1.5 0 00-3 0v1.582M18.667 9.88A12.062 12.062 0 0119 12c0 .847-.087 1.675-.252 2.472M16 16v-1.5a1.5 1.5 0 00-3 0V16" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Sign In</h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Access the Visitor Management System
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Email Address
                            </label>
                            <input id="email" type="email" className={`mt-1 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-violet-500 focus:border-violet-500'} text-slate-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2`} placeholder="you@company.com" {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Invalid email address'
              }
            })} />
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Password
                            </label>
                            <input id="password" type="password" className={`mt-1 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-violet-500 focus:border-violet-500'} text-slate-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2`} placeholder="••••••••" {...register('password', {
              required: 'Password is required'
            })} />
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                        </div>
                    </div>

                    <div>
                        <button type="submit" disabled={submitting} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-violet-600 hover:bg-violet-750 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                            {submitting ? <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg> : 'Sign In'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-violet-600 dark:text-violet-400 hover:underline hover:text-violet-500 transition duration-150">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>;
}