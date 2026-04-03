import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import { apiGetReports, apiUpdateReport } from '../../api';
import toast from 'react-hot-toast';
import { FileText, Check, Search } from 'lucide-react';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [adminNote, setAdminNote] = useState('');
  const [actioning, setActioning] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await apiGetReports();
      setReports(res.data.data || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleReview = async (id, note) => {
    setActioning(id);
    try {
      await apiUpdateReport(id, { status: 'reviewed', adminNote: note });
      toast.success('Report marked as reviewed');
      await load();
    } catch { toast.error('Failed'); }
    finally { setActioning(null); }
  };

  const filtered = reports.filter((r) => filter === 'all' || r.status === filter);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="spinner" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Reports" subtitle="Student-submitted content reports" />

      {/* Filter */}
      <div className="flex gap-1 p-1 rounded-lg bg-slate-800/50 mb-6 w-fit">
        {['all', 'pending', 'reviewed'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${filter === s ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {s} {s !== 'all' && <span className="ml-1 text-xs opacity-70">({reports.filter((r) => r.status === s).length})</span>}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((report) => (
          <div key={report._id} className="glass p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-white">{report.studentId?.name}</p>
                  <span className={`badge ${report.status === 'pending' ? 'badge-amber' : 'badge-green'}`}>{report.status}</span>
                  <span className="badge badge-slate">{report.contentType}</span>
                </div>
                <p className="text-xs text-slate-400">Course: {report.courseId?.title}</p>
                <p className="text-sm text-slate-300 mt-2 p-3 bg-slate-800/50 rounded-lg">"{report.message}"</p>
                {report.adminNote && (
                  <p className="text-xs text-emerald-400 mt-2">Note: {report.adminNote}</p>
                )}
                <p className="text-xs text-slate-600 mt-2">{new Date(report.createdAt).toLocaleString()}</p>
              </div>
              {report.status === 'pending' && (
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <input
                    className="input-field text-xs py-1.5 w-48"
                    placeholder="Admin note (optional)"
                    onBlur={(e) => setAdminNote(e.target.value)}
                    defaultValue=""
                  />
                  <button
                    onClick={() => handleReview(report._id, adminNote)}
                    disabled={actioning === report._id}
                    className="btn-primary text-xs flex items-center gap-1 justify-center"
                  >
                    <Check size={13} /> Mark Reviewed
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="glass p-10 text-center">
            <FileText size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No reports found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
