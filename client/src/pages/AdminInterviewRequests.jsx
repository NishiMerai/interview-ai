import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { Calendar, Search, Check, X, Info, Trash2, Video, Filter, SlidersHorizontal } from 'lucide-react';

async function apiRequest(url, options = {}) {
  try {
    const response = await api({
      url,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body) : undefined,
      ...options
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Request failed");
  }
}

export default function AdminInterviewRequests() {
  const [message, setMessage] = useState('');
  const [interviews, setInterviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState('desc');

  // Loading States
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Modals
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [acceptForm, setAcceptForm] = useState({ id: '', date: '', time: '09:00 AM', remark: '' });
  const [rejectForm, setRejectForm] = useState({ id: '', remark: '' });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  async function loadInterviews() {
    try {
      let url = `/admin/interviews?q=${encodeURIComponent(searchQuery)}&status=${statusFilter}&interviewType=${typeFilter}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      const data = await apiRequest(url);
      setInterviews(data.requests || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadInterviews();
    const interval = setInterval(loadInterviews, 15000);
    return () => clearInterval(interval);
  }, [searchQuery, statusFilter, typeFilter, sortBy, sortOrder]);

  async function handleAccept(e) {
    e.preventDefault();
    if (!acceptForm.date || !acceptForm.time) {
      setMessage('Scheduled date and time are required.');
      return;
    }
    
    setIsAccepting(true);
    setMessage('');
    try {
      await apiRequest(`/admin/interviews/accept/${acceptForm.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          adminScheduledDate: acceptForm.date,
          adminScheduledTime: acceptForm.time,
          adminRemark: acceptForm.remark
        })
      });
      setMessage('Interview scheduled successfully. Google Meet generated automatically.');
      setShowAcceptModal(false);
      loadInterviews();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsAccepting(false);
    }
  }

  async function handleReject(e) {
    e.preventDefault();
    if (!rejectForm.remark) {
      setMessage('Rejection reason (admin remark) is required.');
      return;
    }
    
    setIsRejecting(true);
    setMessage('');
    try {
      await apiRequest(`/admin/interviews/reject/${rejectForm.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          adminRemark: rejectForm.remark
        })
      });
      setMessage('Interview request rejected successfully.');
      setShowRejectModal(false);
      loadInterviews();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsRejecting(false);
    }
  }

  async function deleteRequest(id) {
    if (!window.confirm('Are you sure you want to delete this interview request?')) return;
    try {
      await apiRequest(`/admin/interviews/${id}`, { method: 'DELETE' });
      setMessage('Request deleted successfully.');
      loadInterviews();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="animate-fade-in p-2 md:p-4 space-y-8 max-w-[1600px] mx-auto pb-20 relative">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Live Interview Requests</h1>
        <p className="text-slate-500 mt-2 font-medium">Review and schedule incoming candidate mock request slots with Google Calendar integration.</p>
      </div>

      {message && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/80 p-4 px-6 rounded-xl flex items-center justify-between animate-fade-in">
          <p className="text-primary dark:text-blue-400 font-bold text-xs">{message}</p>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-slate-600 font-bold text-xs uppercase">Dismiss</button>
        </div>
      )}

      {/* Main Scheduling Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-soft space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Calendar className="text-primary" size={16} />
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Scheduling Pipeline</h2>
        </div>

        {/* Filters and Search controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
          <div className="relative lg:col-span-4 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-primary" size={16} />
            <input 
              type="text"
              placeholder="Search by candidate name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-10 text-xs"
            />
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input lg:col-span-2 text-xs"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
          </select>

          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input lg:col-span-2 text-xs"
          >
            <option value="">All Types</option>
            <option value="HR Interview">HR Interview</option>
            <option value="Technical Interview">Technical Interview</option>
            <option value="Final Interview">Final Interview</option>
          </select>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input lg:col-span-2 text-xs"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="Date">Scheduled Date</option>
            <option value="Status">Status</option>
            <option value="User Name">User Name</option>
          </select>

          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="input lg:col-span-2 text-xs"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        {/* Requests Table representation */}
        {interviews.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-dashed border-slate-250 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-950/20">
            <p className="text-slate-500 font-bold text-sm">No scheduling requests match parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full text-left border-collapse min-w-[1100px] text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#F8FAFC]/50 dark:bg-slate-950/40 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Preferred Date</th>
                  <th className="p-4">Preferred Slot</th>
                  <th className="p-4">Scheduled Slot</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Calendar Meet</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-semibold text-slate-650 dark:text-slate-300">
                {interviews.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition duration-300">
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{req.userName}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{req.userEmail}</td>
                    <td className="p-4 text-slate-800 dark:text-slate-200">{req.interviewType}</td>
                    <td className="p-4">{new Date(req.preferredDate).toLocaleDateString()}</td>
                    <td className="p-4 text-primary dark:text-blue-400">{req.preferredTime}</td>
                    <td className="p-4">
                      {req.adminScheduledDate ? (
                        <div>
                          <div className="text-slate-800 dark:text-slate-200 font-bold">{new Date(req.adminScheduledDate).toLocaleDateString()}</div>
                          <div className="text-[10px] text-primary dark:text-blue-450 font-black">{req.adminScheduledTime}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic font-medium">Unscheduled</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`badge ${
                        req.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-900/20' :
                        req.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/20' :
                        req.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-900/10 dark:text-rose-450 dark:border-rose-900/20' :
                        'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/20'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {req.googleMeetLink ? (
                        <div className="space-y-1 text-[11px]">
                          <a 
                            href={req.googleMeetLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline font-bold flex items-center gap-1"
                          >
                            <Video size={12} />
                            Google Meet
                          </a>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(req.googleMeetLink);
                              setMessage('Google Meet link copied to clipboard.');
                            }}
                            className="text-[9px] text-slate-400 hover:text-slate-600 font-bold block"
                          >
                            Copy Link
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic font-medium">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-1.5 justify-end">
                        <button 
                          onClick={() => {
                            setSelectedRequest(req);
                            setShowDetailsModal(true);
                          }}
                          className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 transition"
                          title="View Details"
                        >
                          <Info size={12} />
                        </button>
                        {req.status !== 'Accepted' && req.status !== 'Completed' && (
                          <button 
                            onClick={() => {
                              setAcceptForm({ id: req._id, date: req.preferredDate ? req.preferredDate.split('T')[0] : '', time: req.preferredTime || '09:00 AM', remark: '' });
                              setShowAcceptModal(true);
                            }}
                            className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:bg-emerald-900/25 dark:text-emerald-400 flex items-center justify-center transition"
                            title="Accept & Schedule"
                          >
                            <Check size={12} />
                          </button>
                        )}
                        {req.status !== 'Rejected' && req.status !== 'Completed' && (
                          <button 
                            onClick={() => {
                              setRejectForm({ id: req._id, remark: '' });
                              setShowRejectModal(true);
                            }}
                            className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white dark:bg-rose-900/25 dark:text-rose-400 flex items-center justify-center transition"
                            title="Reject Request"
                          >
                            <X size={12} />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteRequest(req._id)}
                          className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-rose-600 hover:text-white dark:border-slate-800 flex items-center justify-center text-slate-400 transition"
                          title="Delete Request"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-6 relative">
            <button onClick={() => setShowDetailsModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition">
              <X size={18} />
            </button>
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <Info className="text-primary" size={20} />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Request Details</h3>
              </div>
              <hr className="border-slate-100 dark:border-slate-800" />
              <div className="space-y-3 text-xs font-semibold text-slate-650 dark:text-slate-350">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-lg">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 block mb-0.5">Candidate</span>
                    <span className="text-slate-850 dark:text-slate-200 font-bold block truncate">{selectedRequest.userName}</span>
                    <span className="text-[10px] text-slate-400 truncate block mt-0.5">{selectedRequest.userEmail}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 block mb-0.5">Type</span>
                    <span className="text-slate-850 dark:text-slate-200 font-bold block">{selectedRequest.interviewType}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase tracking-widest text-slate-400 block mb-0.5">Preferred Date/Time Slot</span>
                  <span className="text-slate-850 dark:text-slate-200 font-bold block">
                    {new Date(selectedRequest.preferredDate).toLocaleDateString()} at {selectedRequest.preferredTime}
                  </span>
                </div>

                {selectedRequest.adminRemark && (
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 block mb-0.5">Admin Remark / Notes</span>
                    <p className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-lg text-slate-600 dark:text-slate-400 italic leading-relaxed border border-slate-150 dark:border-slate-800/80">
                      {selectedRequest.adminRemark}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 block mb-1">Status</span>
                    <span className={`badge ${
                      selectedRequest.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      selectedRequest.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 block mb-1">Google Meet</span>
                    {selectedRequest.googleMeetLink ? (
                      <a 
                        href={selectedRequest.googleMeetLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline font-bold flex items-center gap-1 mt-1"
                      >
                        <Video size={12} />
                        Join Room
                      </a>
                    ) : (
                      <span className="text-slate-400 italic text-[10px] block mt-1">Pending setup</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accept scheduling Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-6 relative">
            <button onClick={() => setShowAcceptModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition">
              <X size={18} />
            </button>
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <Check className="text-emerald-500" size={20} />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Schedule Mock Interview</h3>
              </div>
              
              <form onSubmit={handleAccept} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Scheduled Date</label>
                  <input 
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={acceptForm.date}
                    onChange={(e) => setAcceptForm({ ...acceptForm, date: e.target.value })}
                    className="input text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Time Slot</label>
                  <select 
                    value={acceptForm.time}
                    onChange={(e) => setAcceptForm({ ...acceptForm, time: e.target.value })}
                    className="input text-xs"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Instruction Remarks</label>
                  <textarea 
                    value={acceptForm.remark}
                    onChange={(e) => setAcceptForm({ ...acceptForm, remark: e.target.value })}
                    placeholder="Specific guidelines for candidate..."
                    className="input min-h-[80px] text-xs"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setShowAcceptModal(false)} className="btn-secondary py-2.5 px-4 text-xs !rounded-lg">Cancel</button>
                  <button type="submit" disabled={isAccepting} className="btn-primary py-2.5 px-5 text-xs !rounded-lg flex items-center gap-1.5">
                    {isAccepting ? 'Scheduling Event...' : 'Accept request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reject request Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-6 relative">
            <button onClick={() => setShowRejectModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition">
              <X size={18} />
            </button>
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <X className="text-rose-500" size={20} />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Reject Request</h3>
              </div>
              
              <form onSubmit={handleReject} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Reason for rejection</label>
                  <textarea 
                    value={rejectForm.remark}
                    onChange={(e) => setRejectForm({ ...rejectForm, remark: e.target.value })}
                    placeholder="Please specify a feedback reason..."
                    className="input min-h-[100px] text-xs"
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setShowRejectModal(false)} className="btn-secondary py-2.5 px-4 text-xs !rounded-lg">Cancel</button>
                  <button type="submit" disabled={isRejecting} className="btn-primary py-2.5 px-5 text-xs !rounded-lg bg-rose-600 hover:bg-rose-700 border-none">
                    {isRejecting ? 'Rejecting...' : 'Reject Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
