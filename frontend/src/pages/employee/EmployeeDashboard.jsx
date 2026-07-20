import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
export default function EmployeeDashboard() {
  const {
    user
  } = useAuth();
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: {
      errors
    }
  } = useForm();
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
        visit_date: dateFilter || undefined
      };
      const res = await api.get('/visitor-requests', {
        params
      });
      setRequests(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch visitor requests.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, dateFilter]);
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);
  const handleOpenCreateModal = () => {
    setEditingRequest(null);
    reset({
      visitor_name: '',
      visitor_email: '',
      visitor_phone: '',
      company: '',
      purpose: '',
      visit_date: new Date().toISOString().split('T')[0],
      remarks: ''
    });
    setIsModalOpen(true);
  };
  const handleOpenEditModal = req => {
    setEditingRequest(req);
    setValue('visitor_name', req.visitor_name);
    setValue('visitor_email', req.visitor_email);
    setValue('visitor_phone', req.visitor_phone);
    setValue('company', req.company || '');
    setValue('purpose', req.purpose);
    setValue('visit_date', req.visit_date);
    setValue('remarks', req.remarks || '');
    setIsModalOpen(true);
  };
  const handleModalSubmit = async data => {
    try {
      if (editingRequest) {
        const updated = await api.put(`/visitor-requests/${editingRequest.id}`, data);
        toast.success(`Request for ${updated.data.visitor_name} modified successfully!`);
      } else {
        const created = await api.post('/visitor-requests', data);
        toast.success(`Visitor request for ${created.data.visitor_name} submitted successfully!`);
      }
      setIsModalOpen(false);
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to process request. Please try again.');
    }
  };
  const handleCancel = async (id, name) => {
    if (window.confirm(`Are you sure you want to cancel the request for ${name}?`)) {
      try {
        await api.post(`/visitor-requests/${id}/cancel`);
        toast.success('Visitor request cancelled successfully.');
        fetchRequests();
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.detail || 'Failed to cancel request.');
      }
    }
  };
  return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {}
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:text-3xl sm:truncate">
                            Welcome back, {user?.name}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Submit and manage your visitor pre-registration requests.
                        </p>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4">
                        <button onClick={handleOpenCreateModal} className="inline-flex items-center px-4.5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-violet-605 bg-violet-605 group bg-violet-600 hover:bg-violet-755 hover:bg-violet-700 transition duration-150 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            New Visitor Request
                        </button>
                    </div>
                </div>

                {}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 mb-6 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {}
                        <div className="md:col-span-2">
                            <label htmlFor="search" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                Search Visitors
                            </label>
                            <div className="relative">
                                <input type="text" id="search" value={search} onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }} placeholder="Search by name, email, phone..." className="block w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {}
                        <div>
                            <label htmlFor="status" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                Status
                            </label>
                            <select id="status" value={statusFilter} onChange={e => {
              setStatusFilter(e.target.value);
              setPage(1);
            }} className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer">
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        {}
                        <div>
                            <label htmlFor="date" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                Visit Date
                            </label>
                            <input type="date" id="date" value={dateFilter} onChange={e => {
              setDateFilter(e.target.value);
              setPage(1);
            }} className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-955 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                        </div>
                    </div>
                </div>

                {}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visitor Info</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Company</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Purpose</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visit Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Logs</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {loading ? <tr>
                                        <td colSpan="7" className="text-center py-10 text-slate-500 dark:text-slate-400">
                                            <div className="flex justify-center items-center space-x-2">
                                                <svg className="animate-spin h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                <span>Loading requests...</span>
                                            </div>
                                        </td>
                                    </tr> : requests.length === 0 ? <tr>
                                        <td colSpan="7" className="text-center py-12 text-slate-500 dark:text-slate-400">
                                            No visitor requests found. Click <span className="font-semibold text-violet-600 dark:text-violet-400 cursor-pointer hover:underline" onClick={handleOpenCreateModal}>New Visitor Request</span> to create one.
                                        </td>
                                    </tr> : requests.map(req => <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/25 transition duration-150">
                                            <td className="px-6 py-4.5 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-slate-900 dark:text-white">{req.visitor_name}</div>
                                                <div className="text-xs text-slate-400 dark:text-slate-400">{req.visitor_email} • {req.visitor_phone}</div>
                                            </td>
                                            <td className="px-6 py-4.5 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                                                {req.company || <span className="text-slate-400 italic">None</span>}
                                            </td>
                                            <td className="px-6 py-4.5 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate" title={req.purpose}>
                                                {req.purpose}
                                            </td>
                                            <td className="px-6 py-4.5 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-medium">
                                                {new Date(req.visit_date).toLocaleDateString(undefined, {
                    dateStyle: 'medium'
                  })}
                                            </td>
                                            <td className="px-6 py-4.5 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${req.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : req.status === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : req.status === 'rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400' : req.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-400'}`}>
                                                    {req.status}
                                                </span>
                                                {req.status === 'rejected' && req.remarks && <div className="text-xs text-rose-500 mt-1 max-w-xs truncate" title={req.remarks}>
                                                        Reason: {req.remarks}
                                                    </div>}
                                            </td>
                                            <td className="px-6 py-4.5 whitespace-nowrap text-xs text-slate-450 dark:text-slate-400">
                                                {req.visitor_log ? <div className="space-y-0.5">
                                                        {req.visitor_log.check_in_time && <div>In: {new Date(req.visitor_log.check_in_time).toLocaleTimeString(undefined, {
                        timeStyle: 'short'
                      })}</div>}
                                                        {req.visitor_log.check_out_time && <div>Out: {new Date(req.visitor_log.check_out_time).toLocaleTimeString(undefined, {
                        timeStyle: 'short'
                      })}</div>}
                                                    </div> : <span className="text-slate-400 italic">No log</span>}
                                            </td>
                                            <td className="px-6 py-4.5 whitespace-nowrap text-sm font-medium">
                                                {req.status === 'pending' ? <div className="flex space-x-2">
                                                        <button onClick={() => handleOpenEditModal(req)} className="text-violet-600 dark:text-violet-400 hover:text-violet-900 dark:hover:text-violet-300 font-semibold cursor-pointer">
                                                            Edit
                                                        </button>
                                                        <span className="text-slate-350 dark:text-slate-600">|</span>
                                                        <button onClick={() => handleCancel(req.id, req.visitor_name)} className="text-rose-600 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 font-semibold cursor-pointer">
                                                            Cancel
                                                        </button>
                                                    </div> : <span className="text-slate-400 italic text-xs">Locked</span>}
                                            </td>
                                        </tr>)}
                            </tbody>
                        </table>
                    </div>

                    {}
                    {total > limit && <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 cursor-pointer disabled:opacity-50">
                                    Previous
                                </button>
                                <button disabled={page * limit >= total} onClick={() => setPage(page + 1)} className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 cursor-pointer disabled:opacity-50">
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        Showing <span className="font-semibold">{Math.min(total, (page - 1) * limit + 1)}</span> to{' '}
                                        <span className="font-semibold">{Math.min(total, page * limit)}</span> of{' '}
                                        <span className="font-semibold">{total}</span> requests
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="relative inline-flex items-center px-2.5 py-1.5 rounded-l-lg border border-slate-300 dark:border-slate-650 bg-white dark:bg-slate-805 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                                            <span className="sr-only">Previous</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <button disabled={page * limit >= total} onClick={() => setPage(page + 1)} className="relative inline-flex items-center px-2.5 py-1.5 rounded-r-lg border border-slate-300 dark:border-slate-650 bg-white dark:bg-slate-805 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                                            <span className="sr-only">Next</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>}
                </div>
            </main>

            {}
            {isModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                    {}
                    <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    {}
                    <div className="relative z-10 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 pt-6 pb-4 sm:p-8 sm:pb-4">
                            <h3 className="text-xl leading-6 font-bold text-slate-900 dark:text-white mb-2" id="modal-title">
                                {editingRequest ? 'Modify Visitor Request' : 'New Visitor Request'}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                {editingRequest ? 'Change the visitor registration parameters.' : 'Pre-register a visitor by entering their details below.'}
                            </p>

                            <form onSubmit={handleSubmit(handleModalSubmit)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Visitor Name *</label>
                                    <input type="text" className={`mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border ${errors.visitor_name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} text-slate-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500`} placeholder="Visitor's Full Name" {...register('visitor_name', {
                required: 'Visitor name is required'
              })} />
                                    {errors.visitor_name && <p className="mt-1 text-xs text-red-500">{errors.visitor_name.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Visitor Email *</label>
                                        <input type="email" className={`mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border ${errors.visitor_email ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} text-slate-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500`} placeholder="visitor@example.com" {...register('visitor_email', {
                  required: 'Visitor email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                })} />
                                        {errors.visitor_email && <p className="mt-1 text-xs text-red-500">{errors.visitor_email.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Visitor Phone *</label>
                                        <input type="text" className={`mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border ${errors.visitor_phone ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} text-slate-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500`} placeholder="e.g. 9876543210" {...register('visitor_phone', {
                  required: 'Visitor phone is required',
                  pattern: {
                    value: /^[0-9+() -]+$/,
                    message: 'Invalid phone format'
                  }
                })} />
                                        {errors.visitor_phone && <p className="mt-1 text-xs text-red-500">{errors.visitor_phone.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Company Name</label>
                                        <input type="text" className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Optional" {...register('company')} />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Visit Date *</label>
                                        <input type="date" className={`mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border ${errors.visit_date ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} text-slate-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500`} {...register('visit_date', {
                  required: 'Visit date is required'
                })} />
                                        {errors.visit_date && <p className="mt-1 text-xs text-red-500">{errors.visit_date.message}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Purpose of Visit *</label>
                                    <textarea rows="2" className={`mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border ${errors.purpose ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} text-slate-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500`} placeholder="e.g. Project presentation, interview..." {...register('purpose', {
                required: 'Purpose of visit is required'
              })}></textarea>
                                    {errors.purpose && <p className="mt-1 text-xs text-red-500">{errors.purpose.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Remarks / Notes</label>
                                    <textarea rows="2" className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Optional notes for security/recipients" {...register('remarks')}></textarea>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-6">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition cursor-pointer">
                                        {editingRequest ? 'Modify' : 'Submit Request'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>}
        </div>;
}