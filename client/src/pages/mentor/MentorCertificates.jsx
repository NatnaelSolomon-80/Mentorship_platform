import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import { apiGetCertRequests, apiRespondCertificate } from '../../api';
import toast from 'react-hot-toast';
import { Award, Check, X, ExternalLink, User, BookOpen, Fingerprint } from 'lucide-react';

const MentorCertificates = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await apiGetCertRequests();
      setRequests(res.data.data || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleRespond = async (id, status) => {
    setResponding(id + status);
    try {
      await apiRespondCertificate(id, { status });
      toast.success(`Certificate ${status}!`);
      await load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setResponding(null); }
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Certificate Requests" subtitle="Review student achievements and finalize official credentials" />

      {/* Overview Stat Strip */}
      <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-8 w-fit pr-10">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
           <Award size={24} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Total Pending</h4>
          <p className="text-2xl font-black text-slate-800">{requests.filter(r => r.status === 'pending').length}</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-[2rem] p-12 text-center shadow-xl shadow-slate-200/40">
          <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
             <Award size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Review Queue</h3>
          <p className="text-slate-500 max-w-sm mx-auto">You do not have any pending certificate requests to review at this moment.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {requests.map((req) => (
            <div key={req._id} className="bg-white border border-slate-100 shadow-xl shadow-slate-200/40 rounded-[1.5rem] overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
              
              <div className="p-6 relative overflow-hidden bg-slate-50/50 flex-1">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mt-10 -mr-10"></div>
                 
                 <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center overflow-hidden">
                          {req.studentId?.avatar ? (
                            <img src={req.studentId.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User size={18} className="text-slate-400" />
                          )}
                       </div>
                       <div>
                         <h3 className="font-extrabold text-slate-800 leading-tight">{req.studentId?.name}</h3>
                         <p className="text-xs font-bold text-slate-400">STUDENT</p>
                       </div>
                    </div>
                    {req.status !== 'pending' && (
                       <div className="flex items-center justify-center w-8 h-8 rounded-full shadow-sm bg-white border border-slate-100 text-slate-400">
                         {req.status === 'approved' ? <Check size={16} className="text-emerald-500" /> : <X size={16} className="text-red-500" />}
                       </div>
                    )}
                 </div>

                 <div className="space-y-3 relative z-10">
                   <div className="flex items-start gap-2">
                      <BookOpen size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                      <p className="font-semibold text-slate-700 text-[15px] leading-snug">{req.courseId?.title}</p>
                   </div>
                   <div className="flex items-center gap-2">
                      <Fingerprint size={16} className="text-slate-400 shrink-0" />
                      <p className="text-xs font-medium text-slate-500">Requested: {new Date(req.createdAt).toLocaleDateString()}</p>
                   </div>
                 </div>
              </div>

              <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3 min-h-[70px]">
                {req.status === 'pending' ? (
                  <>
                    <button 
                      onClick={() => handleRespond(req._id, 'rejected')} 
                      disabled={!!responding} 
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {responding === req._id + 'rejected' ? <span className="w-4 h-4 rounded-full border-2 border-red-500 border-t-transparent animate-spin"></span> : <><X size={16} /> Decline</>}
                    </button>
                    <button 
                      onClick={() => handleRespond(req._id, 'approved')} 
                      disabled={!!responding} 
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {responding === req._id + 'approved' ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span> : <><Check size={16} /> Approve & Issue</>}
                    </button>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between px-2">
                    <span className="text-sm font-bold text-slate-500">Official Status</span>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {req.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MentorCertificates;
