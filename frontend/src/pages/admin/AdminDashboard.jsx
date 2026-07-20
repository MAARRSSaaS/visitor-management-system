import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { toast } from 'react-toastify';
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [reqTotal, setReqTotal] = useState(0);
  const [reqPage, setReqPage] = useState(1);
  const [reqLimit] = useState(10);
  const [reqSearch, setReqSearch] = useState('');
  const [reqStatus, setReqStatus] = useState('');
  const [reqDate, setReqDate] = useState('');
  const [logs, setLogs] = useState([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [logsLimit] = useState(10);
  const [logsSearch, setLogsSearch] = useState('');
  const [logsActive, setLogsActive] = useState('');
  const [employees, setEmployees] = useState([]);
  const [reqLoading, setReqLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingRequestId, setRejectingRequestId] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
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
    setReqLoading(true);
    try {
      const params = {
        page: reqPage,
        limit: reqLimit,
        search: reqSearch || undefined,
        status: reqStatus || undefined,
        visit_date: reqDate || undefined
      };
      const res = await api.get('/visitor-requests', {
        params
      });
      setRequests(res.data.items);
      setReqTotal(res.data.total);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load requests.');
    } finally {
      setReqLoading(false);
    }
  }, [reqPage, reqLimit, reqSearch, reqStatus, reqDate]);
  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const params = {
        page: logsPage,
        limit: logsLimit,
        search: logsSearch || undefined,
        is_active: logsActive !== '' ? logsActive === 'true' : undefined
      };
      const res = await api.get('/visitor-logs', {
        params
      });
      setLogs(res.data.items);
      setLogsTotal(res.data.total);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load activity logs.');
    } finally {
      setLogsLoading(false);
    }
  }, [logsPage, logsLimit, logsSearch, logsActive]);
  const fetchEmployees = useCallback(async () => {
    try {
      const res = await api.get('/users');
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to get host employees', err);
    }
  }, []);
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);
  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests();
    } else {
      fetchLogs();
    }
  }, [activeTab, fetchRequests, fetchLogs]);
  const handleOpenCreateModal = () => {
    setEditingRequest(null);
    reset({
      visitor_name: '',
      visitor_email: '',
      visitor_phone: '',
      company: '',
      purpose: '',
      visit_date: new Date().toISOString().split('T')[0],
      remarks: '',
      host_employee_id: employees[0]?.id || ''
    });
    setIsFormModalOpen(true);
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
    setValue('host_employee_id', req.host_employee_id);
    setIsFormModalOpen(true);
  };
  const handleFormSubmit = async data => {
    try {
      if (editingRequest) {
        await api.put(`/visitor-requests/${editingRequest.id}`, data);
        toast.success('Visitor record updated successfully!');
      } else {
        await api.post('/visitor-requests', data);
        toast.success('Visitor record created successfully!');
      }
      setIsFormModalOpen(false);
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to save visitor record.');
    }
  };
  const handleDeleteRequest = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete the visitor record for ${name}?`)) {
      try {
        await api.delete(`/visitor-requests/${id}`);
        toast.success('Visitor record deleted successfully.');
        fetchRequests();
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.detail || 'Failed to delete record.');
      }
    }
  };
  const handleApprove = async id => {
    try {
      await api.post(`/visitor-requests/${id}/approve`);
      toast.success('Visitor request approved!');
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to approve request.');
    }
  };
  const handleOpenRejectModal = id => {
    setRejectingRequestId(id);
    setRejectRemarks('');
    setIsRejectModalOpen(true);
  };
  const handleRejectSubmit = async e => {
    e.preventDefault();
    try {
      await api.post(`/visitor-requests/${rejectingRequestId}/reject`, {
        remarks: rejectRemarks
      });
      toast.success('Visitor request rejected.');
      setIsRejectModalOpen(false);
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to reject request.');
    }
  };
  const handleCheckIn = async id => {
    try {
      await api.post(`/visitor-requests/${id}/check-in`);
      toast.success('Visitor checked in successfully! Session is now active.');
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to check in visitor.');
    }
  };
  const handleCheckOut = async id => {
    try {
      await api.post(`/visitor-requests/${id}/check-out`);
      toast.success('Visitor checked out successfully. Session completed.');
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to check out visitor.');
    }
  };
  return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">



                {}
                <div className="sm:flex sm:items-center sm:justify-between mb-6 pb-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex space-x-4">
                        <button onClick={() => setActiveTab('requests')} className={`pb-3 text-sm font-bold border-b-2 px-1 transition duration-150 cursor-pointer ${activeTab === 'requests' ? 'border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400 font-extrabold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'}`}>
                            Requests & Check-In
                        </button>
                        <button onClick={() => setActiveTab('logs')} className={`pb-3 text-sm font-bold border-b-2 px-1 transition duration-150 cursor-pointer ${activeTab === 'logs' ? 'border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400 font-extrabold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'}`}>
                            Historical Logs Audit
                        </button>
                    </div>
                    <div className="mt-3 sm:mt-0">
                        <button onClick={handleOpenCreateModal} className="inline-flex items-center px-4.5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition duration-150 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add Visitor Record
                        </button>
                    </div>
                </div>

                {}
                {activeTab === 'requests' && <div>
                        {}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 mb-6 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                {}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Search Visitors/Hosts</label>
                                    <div className="relative">
                                        <input type="text" value={reqSearch} onChange={e => {
                  setReqSearch(e.target.value);
                  setReqPage(1);
                }} placeholder="Search visitor or host employee name..." className="block w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Status</label>
                                    <select value={reqStatus} onChange={e => {
                setReqStatus(e.target.value);
                setReqPage(1);
              }} className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-955 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer">
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
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Visit Date</label>
                                    <div className="flex space-x-2">
                                        <input type="date" value={reqDate} onChange={e => {
                  setReqDate(e.target.value);
                  setReqPage(1);
                }} className="block flex-grow px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-955 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                                        {(reqSearch || reqStatus || reqDate) && <button onClick={() => {
                  setReqSearch('');
                  setReqStatus('');
                  setReqDate('');
                  setReqPage(1);
                }} className="px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-lg transition cursor-pointer" title="Clear filters">
                                                Clear
                                            </button>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition duration-300">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visitor</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Host Employee</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Purpose & Co</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visit Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Times</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Workflow Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {reqLoading ? <tr>
                                                <td colSpan="7" className="text-center py-10">
                                                    <svg className="animate-spin h-5 w-5 mx-auto text-violet-600" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                </td>
                                            </tr> : requests.length === 0 ? <tr>
                                                <td colSpan="7" className="text-center py-10 text-slate-500">
                                                    No visitor requests matching parameters found.
                                                </td>
                                            </tr> : requests.map(req => <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/25 transition">
                                                    <td className="px-6 py-4.5 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{req.visitor_name}</div>
                                                        <div className="text-xs text-slate-400 dark:text-slate-400">{req.visitor_email} • {req.visitor_phone}</div>
                                                    </td>
                                                    <td className="px-6 py-4.5 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{req.host_employee?.name || 'VMS Admin'}</div>
                                                        <div className="text-xs text-slate-400 dark:text-slate-400">{req.host_employee?.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4.5 text-sm text-slate-650 dark:text-slate-300 max-w-xs truncate">
                                                        <div className="font-semibold text-slate-800 dark:text-slate-200">{req.company || <span className="italic text-slate-400 text-xs">Self-Represented</span>}</div>
                                                        <div className="text-xs text-slate-450 italic truncate" title={req.purpose}>{req.purpose}</div>
                                                    </td>
                                                    <td className="px-6 py-4.5 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-medium">
                                                        {new Date(req.visit_date).toLocaleDateString(undefined, {
                      dateStyle: 'medium'
                    })}
                                                    </td>
                                                    <td className="px-6 py-4.5 whitespace-nowrap text-sm">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${req.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : req.status === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : req.status === 'rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400' : req.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-105 text-slate-800 dark:bg-slate-900 dark:text-slate-400'}`}>
                                                            {req.status}
                                                        </span>
                                                        {req.remarks && req.status === 'rejected' && <div className="text-xs text-rose-500 mt-1 max-w-xxs truncate" title={req.remarks}>
                                                                {req.remarks}
                                                            </div>}
                                                    </td>
                                                    <td className="px-6 py-4.5 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                                                        {req.visitor_log ? <div className="space-y-0.5">
                                                                {req.visitor_log.check_in_time && <div className="font-semibold text-emerald-600 dark:text-emerald-400">Checked In: {new Date(req.visitor_log.check_in_time).toLocaleTimeString(undefined, {
                          timeStyle: 'short'
                        })}</div>}
                                                                {req.visitor_log.check_out_time && <div className="text-slate-400">Checked Out: {new Date(req.visitor_log.check_out_time).toLocaleTimeString(undefined, {
                          timeStyle: 'short'
                        })}</div>}
                                                            </div> : <span className="italic text-slate-405">Not checked in</span>}
                                                    </td>
                                                    <td className="px-6 py-4.5 whitespace-nowrap text-sm font-semibold">
                                                        <div className="flex flex-col space-y-1.5 align-start justify-center">

                                                            {}
                                                            {req.status === 'pending' && <div className="flex items-center space-x-2">
                                                                    <button onClick={() => handleApprove(req.id)} className="text-xs px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer">
                                                                        Approve
                                                                    </button>
                                                                    <button onClick={() => handleOpenRejectModal(req.id)} className="text-xs px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded cursor-pointer">
                                                                        Reject
                                                                    </button>
                                                                </div>}

                                                            {}
                                                            {req.status === 'approved' && (!req.visitor_log || !req.visitor_log.is_active) && <button onClick={() => handleCheckIn(req.id)} className="text-xs px-2.5 py-1.5 bg-violet-605 bg-violet-600 hover:bg-violet-755 hover:bg-violet-700 text-white rounded shadow-sm cursor-pointer self-start">
                                                                    Record Check-In
                                                                </button>}

                                                            {}
                                                            {req.visitor_log?.is_active && <button onClick={() => handleCheckOut(req.id)} className="text-xs px-2.5 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded shadow-sm cursor-pointer self-start">
                                                                    Record Check-Out
                                                                </button>}

                                                            {}
                                                            <div className="flex items-center space-x-2 pt-1 font-semibold text-xs">
                                                                <button onClick={() => handleOpenEditModal(req)} className="text-violet-600 dark:text-violet-400 hover:text-violet-850 hover:underline cursor-pointer">
                                                                    Edit Record
                                                                </button>
                                                                <span className="text-slate-300 dark:text-slate-600">|</span>
                                                                <button onClick={() => handleDeleteRequest(req.id, req.visitor_name)} className="text-rose-600 dark:text-rose-400 hover:text-rose-850 hover:underline cursor-pointer">
                                                                    Delete
                                                                </button>
                                                            </div>

                                                        </div>
                                                    </td>
                                                </tr>)}
                                    </tbody>
                                </table>
                            </div>

                            {}
                            {reqTotal > reqLimit && <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <p className="text-sm text-slate-700 dark:text-slate-350">
                                            Showing <span className="font-semibold">{Math.min(reqTotal, (reqPage - 1) * reqLimit + 1)}</span> to{' '}
                                            <span className="font-semibold">{Math.min(reqTotal, reqPage * reqLimit)}</span> of{' '}
                                            <span className="font-semibold">{reqTotal}</span> requests
                                        </p>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            <button disabled={reqPage === 1} onClick={() => setReqPage(reqPage - 1)} className="relative inline-flex items-center px-2.5 py-1.5 rounded-l-lg border border-slate-300 dark:border-slate-650 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                                                Prev
                                            </button>
                                            <button disabled={reqPage * reqLimit >= reqTotal} onClick={() => setReqPage(reqPage + 1)} className="relative inline-flex items-center px-2.5 py-1.5 rounded-r-lg border border-slate-300 dark:border-slate-650 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                                                Next
                                            </button>
                                        </nav>
                                    </div>
                                </div>}
                        </div>
                    </div>}

                {}
                {activeTab === 'logs' && <div>
                        {}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 mb-6 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                {}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Search logs</label>
                                    <div className="relative">
                                        <input type="text" value={logsSearch} onChange={e => {
                  setLogsSearch(e.target.value);
                  setLogsPage(1);
                }} placeholder="Visitor name or host name..." className="block w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Visitor Session Mode</label>
                                    <select value={logsActive} onChange={e => {
                setLogsActive(e.target.value);
                setLogsPage(1);
              }} className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-955 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer">
                                        <option value="">All Logs</option>
                                        <option value="true">Currently Checked-In (Active)</option>
                                        <option value="false">Completed Checked-Out (Past)</option>
                                    </select>
                                </div>

                                <div>
                                    {(logsSearch || logsActive) && <button onClick={() => {
                setLogsSearch('');
                setLogsActive('');
                setLogsPage(1);
              }} className="px-4 py-2 text-xs font-semibold text-rose-650 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 border border-rose-250 dark:border-rose-800 rounded-lg transition cursor-pointer">
                                            Clear Audit Filters
                                        </button>}
                                </div>
                            </div>
                        </div>

                        {}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition duration-300">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visitor</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Host Employee</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Check-In Time</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Check-Out Time</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visit Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {logsLoading ? <tr>
                                                <td colSpan="5" className="text-center py-10">
                                                    <svg className="animate-spin h-5 w-5 mx-auto text-violet-605 text-violet-600" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                </td>
                                            </tr> : logs.length === 0 ? <tr>
                                                <td colSpan="5" className="text-center py-10 text-slate-550 dark:text-slate-400">
                                                    No historical visitor logs found matching criteria.
                                                </td>
                                            </tr> : logs.map(log => <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/25 transition">
                                                    <td className="px-6 py-4.5 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{log.visitor_request?.visitor_name}</div>
                                                        <div className="text-xs text-slate-400 dark:text-slate-400">{log.visitor_request?.visitor_email} • {log.visitor_request?.visitor_phone}</div>
                                                    </td>
                                                    <td className="px-6 py-4.5 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{log.visitor_request?.host_employee?.name || 'VMS Admin'}</div>
                                                        <div className="text-xs text-slate-400 dark:text-slate-400">{log.visitor_request?.host_employee?.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4.5 whitespace-nowrap text-sm text-slate-600 dark:text-slate-350">
                                                        {log.check_in_time ? <div className="font-semibold text-slate-820 dark:text-slate-200">
                                                                {new Date(log.check_in_time).toLocaleDateString()} {new Date(log.check_in_time).toLocaleTimeString()}
                                                            </div> : <span className="text-slate-400 italic">None</span>}
                                                    </td>
                                                    <td className="px-6 py-4.5 whitespace-nowrap text-sm text-slate-600 dark:text-slate-350">
                                                        {log.check_out_time ? <div>
                                                                {new Date(log.check_out_time).toLocaleDateString()} {new Date(log.check_out_time).toLocaleTimeString()}
                                                            </div> : log.is_active ? <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 rounded text-xs font-semibold uppercase animate-pulse">
                                                                Active In
                                                            </span> : <span className="text-slate-400 italic">Expired / Empty</span>}
                                                    </td>
                                                    <td className="px-6 py-4.5 whitespace-nowrap">
                                                        <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase ${log.is_active ? 'bg-emerald-100 text-emerald-805 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-450 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400'}`}>
                                                            {log.is_active ? 'Active' : 'Completed'}
                                                        </span>
                                                    </td>
                                                </tr>)}
                                    </tbody>
                                </table>
                            </div>

                            {}
                            {logsTotal > logsLimit && <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <p className="text-sm text-slate-700 dark:text-slate-350">
                                            Showing <span className="font-semibold">{Math.min(logsTotal, (logsPage - 1) * logsLimit + 1)}</span> to{' '}
                                            <span className="font-semibold">{Math.min(logsTotal, logsPage * logsLimit)}</span> of{' '}
                                            <span className="font-semibold">{logsTotal}</span> logs
                                        </p>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            <button disabled={logsPage === 1} onClick={() => setLogsPage(logsPage - 1)} className="relative inline-flex items-center px-3 py-1.5 rounded-l-lg border border-slate-300 dark:border-slate-650 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                                                Prev
                                            </button>
                                            <button disabled={logsPage * logsLimit >= logsTotal} onClick={() => setLogsPage(logsPage + 1)} className="relative inline-flex items-center px-3 py-1.5 rounded-r-lg border border-slate-300 dark:border-slate-655 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                                                Next
                                            </button>
                                        </nav>
                                    </div>
                                </div>}
                        </div>
                    </div>}

            </main>

            {}
            {isFormModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {}
                    <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsFormModalOpen(false)} />
                    {}
                    <div className="relative z-10 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 pt-6 pb-4 sm:p-8 sm:pb-4">
                            <h3 className="text-xl leading-6 font-bold text-slate-900 dark:text-white mb-2">
                                {editingRequest ? 'Edit Visitor Record' : 'Add Visitor Record'}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                Add details below. Note: Records created by Admin are pre-approved automatically.
                            </p>

                            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">

                                {}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Meeting Host (Employee)</label>
                                    <select className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-650 text-slate-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer" {...register('host_employee_id', {
                required: 'Please specify host employee'
              })}>
                                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>)}
                                    </select>
                                    {errors.host_employee_id && <p className="mt-1 text-xs text-red-500">{errors.host_employee_id.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Visitor Name *</label>
                                    <input type="text" className={`mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border ${errors.visitor_name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} text-slate-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500`} placeholder="Visitor's full name" {...register('visitor_name', {
                required: 'Visitor name is required'
              })} />
                                    {errors.visitor_name && <p className="mt-1 text-xs text-red-500">{errors.visitor_name.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Visitor Email *</label>
                                        <input type="email" className={`mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border ${errors.visitor_email ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} text-slate-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500`} placeholder="visitor@email.com" {...register('visitor_email', {
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
                                        <input type="text" className={`mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border ${errors.visitor_phone ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} text-slate-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500`} placeholder="Visitor phone number" {...register('visitor_phone', {
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
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Company</label>
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
                                    <textarea rows="2" className={`mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border ${errors.purpose ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} text-slate-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500`} placeholder="Reason for the meeting" {...register('purpose', {
                required: 'Purpose is required'
              })}></textarea>
                                    {errors.purpose && <p className="mt-1 text-xs text-red-500">{errors.purpose.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Remarks / Admin Notes</label>
                                    <textarea rows="2" className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Optional notes" {...register('remarks')}></textarea>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-6">
                                    <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition cursor-pointer">
                                        {editingRequest ? 'Save Changes' : 'Create Record'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>}

            {}
            {isRejectModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {}
                    <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsRejectModalOpen(false)} />
                    {}
                    <div className="relative z-10 bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 dark:border-slate-700">
                        <form onSubmit={handleRejectSubmit} className="p-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Reject Visitor Request</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Please provide a reason or remarks for rejection so the host employee can be notified.</p>

                            <textarea required rows="3" value={rejectRemarks} onChange={e => setRejectRemarks(e.target.value)} placeholder="e.g. Schedule clash on this date. Please reschedule." className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-950 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"></textarea>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setIsRejectModalOpen(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition cursor-pointer shadow-sm">
                                    Confirm Rejection
                                </button>
                            </div>
                        </form>
                    </div>
                </div>}
        </div>;
}