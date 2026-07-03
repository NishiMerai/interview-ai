import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { Calendar, Search, Check, X, Info, Trash2, Video } from 'lucide-react';

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
    <div className="animate-fade-in p-4 space-y-8 pb-20 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black gradient-text">Interview Requests</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage and schedule incoming candidate placement reviews.</p>
        </div>
      </div>

      {message && (
        <div className="glass-card !bg-indigo-600/5 !border-indigo-600/10 p-4 px-6 flex items-center justify-between animate-fade-in">
          <p className="text-indigo-600 font-bold italic tracking-tight">{message}</p>
          <button onClick={() => setMessage('')} className="text-indigo-400 hover:text-indigo-600 font-black">CLOSE</button>
        </div>
      )}

      <div className="glass-card !p-8">
        <h2 className="text-2xl font-black italic mb-6 flex items-center gap-3">
          <div className="w-2 h-8 bg-indigo-600 rounded-full" />
          Scheduling Pipeline
        </h2>

        {/* Controls: Search, Filter, Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 mb-6">
          <div className="relative lg:col-span-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by candidate name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-10"
            />
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input lg:col-span-2"
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
            className="input lg:col-span-2"
          >
            <option value="">All Types</option>
            <option value="HR Interview">HR Interview</option>
            <option value="Technical Interview">Technical Interview</option>
            <option value="Final Interview">Final Interview</option>
          </select>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input lg:col-span-2"
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
            className="input lg:col-span-2"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        {interviews.length === 0 ? (
          <div className="text-center py-10 rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10 p-6 bg-slate-50/50 dark:bg-white/5">
            <p className="text-slate-500 font-bold">No scheduling requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[2rem] border border-slate-100 dark:border-white/5 bg-white/30 dark:bg-white/5">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="p-5">User</th>
                  <th className="p-5">Email</th>
                  <th className="p-5">Type</th>
                  <th className="p-5">Preferred Date</th>
                  <th className="p-5">Preferred Time</th>
                  <th className="p-5">Scheduled Slot</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Meeting Created</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm font-semibold">
                {interviews.map((req) => (
                  <tr key={req._id} className="hover:bg-white/40 dark:hover:bg-white/10 transition-colors">
                    <td className="p-5 text-slate-800 dark:text-slate-200 font-bold">{req.userName}</td>
                    <td className="p-5 text-slate-600 dark:text-slate-400">{req.userEmail}</td>
                    <td className="p-5 text-slate-800 dark:text-slate-200">{req.interviewType}</td>
                    <td className="p-5 text-slate-700 dark:text-slate-300">
                      {new Date(req.preferredDate).toLocaleDateString()}
                    </td>
                    <td className="p-5 text-slate-700 dark:text-slate-300">{req.preferredTime}</td>
                    <td className="p-5">
                      {req.adminScheduledDate ? (
                        <div>
                          <div className="text-slate-800 dark:text-slate-200 font-bold">{new Date(req.adminScheduledDate).toLocaleDateString()}</div>
                          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-black">{req.adminScheduledTime}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Unscheduled</span>
                      )}
                    </td>
                    <td className="p-5">
                      <span className={`badge ${
                        req.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-900/50' :
                        req.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-900/50' :
                        req.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-900/50' :
                        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/50'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-5">
                      {req.googleMeetLink ? (
                        <div className="space-y-1">
                          <span className="text-emerald-600 font-extrabold text-xs block">Yes</span>
                          <a 
                            href={req.googleMeetLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 underline font-bold block"
                          >
                            Open Meeting
                          </a>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(req.googleMeetLink);
                              setMessage('Google Meet link copied to clipboard.');
                            }}
                            className="text-[10px] text-slate-500 hover:text-slate-700 underline font-bold block"
                          >
                            Copy Link
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">No</span>
                      )}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => {
                            setSelectedRequest(req);
                            setShowDetailsModal(true);
                          }}
                          className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 hover:bg-indigo-600 hover:text-white dark:bg-white/5 dark:text-slate-300 flex items-center justify-center transition-all"
                          title="View Details"
                        >
                          <Info size={14} />
                        </button>
                        {req.status !== 'Accepted' && req.status !== 'Completed' && (
                          <button 
                            onClick={() => {
                              setAcceptForm({ id: req._id, date: req.preferredDate ? req.preferredDate.split('T')[0] : '', time: req.preferredTime || '09:00 AM', remark: '' });
                              setShowAcceptModal(true);
                            }}
                            className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:bg-emerald-900/20 dark:text-emerald-400 flex items-center justify-center transition-all"
                            title="Accept & Schedule"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        {req.status !== 'Rejected' && req.status !== 'Completed' && (
                          <button 
                            onClick={() => {
                              setRejectForm({ id: req._id, remark: '' });
                              setShowRejectModal(true);
                            }}
                            className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white dark:bg-rose-900/20 dark:text-rose-400 flex items-center justify-center transition-all"
                            title="Reject"
                          >
                            <X size={14} />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteRequest(req._id)}
                          className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-600 hover:text-white dark:bg-white/5 flex items-center justify-center transition-all"
                          title="Delete"
                        >
                          <Trash2 size={14} />
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
          <div className="w-full max-w-lg glass-card !p-8 relative">
            <button onClick={() => setShowDetailsModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black italic flex items-center gap-2 mb-4">
              <Info className="text-indigo-600" size={24} />
              Request Details
            </h2>
            <div className="space-y-4 text-sm font-semibold">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Candidate</div>
                  <div className="text-slate-800 dark:text-slate-200 text-base font-bold">{selectedRequest.userName}</div>
                  <div className="text-xs text-slate-400 font-medium">{selectedRequest.userEmail}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Interview Type</div>
                  <div className="text-slate-800 dark:text-slate-200 text-base font-bold">{selectedRequest.interviewType}</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Preferred Slot</div>
                <div className="text-slate-700 dark:text-slate-300 font-bold">
                  {new Date(selectedRequest.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at <span className="text-indigo-600">{selectedRequest.preferredTime}</span>
                </div>
              </div>

              {selectedRequest.adminRemark && (
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Notes / Remarks</div>
                  <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl text-xs text-slate-600 dark:text-slate-300 italic whitespace-pre-wrap">
                    {selectedRequest.adminRemark}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-white/5 pt-4">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Current Status</div>
                  <span className={`badge mt-1 ${
                    selectedRequest.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    selectedRequest.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                    selectedRequest.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                    'bg-blue-100 text-blue-800 border-blue-200'
                  }`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Google Meet Link</div>
                  <div className="text-sm mt-1">
                    {selectedRequest.googleMeetLink ? (
                      <a 
                        href={selectedRequest.googleMeetLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 underline font-bold"
                      >
                        Join Google Meet
                      </a>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 italic text-xs font-bold">Meeting link will be available soon.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accept Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-card !p-8 relative animate-fade-in">
            <button onClick={() => setShowAcceptModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black italic flex items-center gap-2 mb-4">
              <Check className="text-emerald-600" size={24} />
              Accept &amp; Schedule
            </h2>

            <form onSubmit={handleAccept} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scheduled Date</label>
                <input 
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={acceptForm.date}
                  onChange={(e) => setAcceptForm({ ...acceptForm, date: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scheduled Time</label>
                <select 
                  value={acceptForm.time}
                  onChange={(e) => setAcceptForm({ ...acceptForm, time: e.target.value })}
                  className="input w-full"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Remark</label>
                <textarea 
                  value={acceptForm.remark}
                  onChange={(e) => setAcceptForm({ ...acceptForm, remark: e.target.value })}
                  placeholder="Additional remarks or notes for the candidate..."
                  className="input w-full min-h-[100px] !rounded-[1.5rem]"
                />
              </div>

              <button 
                type="submit" 
                disabled={isAccepting}
                className="btn-primary w-full !rounded-[1.5rem] !py-4 font-black italic mt-4 flex items-center justify-center gap-2"
              >
                {isAccepting ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Creating Google Meet event...
                  </>
                ) : (
                  'Save Schedule'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-card !p-8 relative">
            <button onClick={() => setShowRejectModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black italic flex items-center gap-2 mb-4">
              <X className="text-rose-600" size={24} />
              Reject Request
            </h2>

            <form onSubmit={handleReject} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reason</label>
                <textarea 
                  value={rejectForm.remark}
                  onChange={(e) => setRejectForm({ ...rejectForm, remark: e.target.value })}
                  placeholder="Specify the reason for rejection..."
                  className="input w-full min-h-[120px] !rounded-[1.5rem]"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isRejecting}
                className="btn-primary w-full !rounded-[1.5rem] !py-4 font-black italic mt-4 flex items-center justify-center gap-2"
              >
                {isRejecting ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Save Reject'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
