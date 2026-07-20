import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
export default function Register() {
  const {
    register,
    handleSubmit,
    formState: {
      errors
    },
    watch
  } = useForm();
  const {
    register: registerUser
  } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const onSubmit = async data => {
    setSubmitting(true);
    try {
      await registerUser(data.name, data.email, data.password, data.phone, data.role);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Registration failed. Use a different email.');
    } finally {
      setSubmitting(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12 transition-colors duration-300">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 transition-all duration-300">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Create Account</h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Register to join the Visitor Management System
                    </p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Full Name
                            </label>
                            <input id="name" type="text" className={`mt-1 block w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border ${errors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} text-slate-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none`} placeholder="John Doe" {...register('name', {
              required: 'Name is required'
            })} />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Email Address
                            </label>
                            <input id="email" type="email" className={`mt-1 block w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border ${errors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} text-slate-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none`} placeholder="john@company.com" {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Invalid email address'
              }
            })} />
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Phone Number
                            </label>
                            <input id="phone" type="text" className={`mt-1 block w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border ${errors.phone ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} text-slate-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none`} placeholder="1234567890" {...register('phone', {
              required: 'Phone number is required',
              pattern: {
                value: /^[0-9+() -]+$/,
                message: 'Invalid phone number format'
              }
            })} />
                            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                System Role
                            </label>
                            <select id="role" className="mt-1 block w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none cursor-pointer" {...register('role', {
              required: 'Role is required'
            })}>
                                <option value="employee">Employee</option>
                                <option value="admin">Admin</option>
                            </select>
                            {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Password
                            </label>
                            <input id="password" type="password" className={`mt-1 block w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border ${errors.password ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} text-slate-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none`} placeholder="••••••••" {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })} />
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                        </div>
                    </div>

                    <div className="pt-2">
                        <button type="submit" disabled={submitting} className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-violet-600 hover:bg-violet-750 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                            {submitting ? <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg> : 'Register'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-violet-600 dark:text-violet-400 hover:underline hover:text-violet-500 transition duration-150">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>;
}