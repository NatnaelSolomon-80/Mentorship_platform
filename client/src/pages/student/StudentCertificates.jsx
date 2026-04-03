import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import { apiGetMyCertificates, apiGetCertRequests, apiGetEnrolledCourses, apiRequestCertificate } from '../../api';
import { Award, ExternalLink, Clock, CheckCircle, XCircle, Plus, BookOpen, X, PlayCircle, Star, Users, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentCertificates = () => {
  const [certs, setCerts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Request Modal State
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cRes, rRes, courseRes] = await Promise.all([
        apiGetMyCertificates(), 
        apiGetCertRequests(),
        apiGetEnrolledCourses()
      ]);
      setCerts(cRes.data.data || []);
      setRequests(rRes.data.data || []);
      setCourses(courseRes.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load certificates data");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return toast.error("Please select a course");
    
    const course = courses.find(c => c._id === selectedCourseId);
    if (!course || !course.mentorId) return toast.error("Invalid course or mentor missing");

    setRequesting(true);
    try {
      await apiRequestCertificate({ courseId: selectedCourseId, mentorId: course.mentorId._id || course.mentorId });
      toast.success("Certificate request submitted!");
      setShowModal(false);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request certificate. Make sure you have passed the final test.");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div></div></DashboardLayout>;

  // Filter out courses that already have certificates or pending requests
  const eligibleCourses = courses.filter(course => {
    const hasCert = certs.some(c => c.courseId?._id === course._id);
    const hasPending = requests.some(r => r.courseId?._id === course._id && r.status !== 'rejected');
    return !hasCert && !hasPending;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <PageHeader title="My Certificates" subtitle="View your official credentials and manage requests" />
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-[0_8px_20px_rgba(16,185,129,0.25)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          <Award size={20} /> Request Certificate
        </button>
      </div>

      <div className="space-y-10">
        {/* Issued Certificates */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle size={22} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-extrabold text-slate-800">Earned Certificates <span className="text-emerald-500 ml-1">({certs.length})</span></h2>
          </div>
          
          {certs.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-[2rem] p-16 shadow-xl shadow-slate-200/40 relative overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300"></div>
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex flex-col items-center justify-center text-center relative z-10">
                {/* Stacked illustration */}
                <div className="relative mb-8">
                  <div className="w-28 h-28 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/10 rotate-3">
                    <Award size={48} className="text-emerald-400/70" strokeWidth={1.5} />
                  </div>
                  <div className="absolute -bottom-2 -right-3 w-10 h-10 bg-white border-2 border-slate-100 rounded-xl flex items-center justify-center shadow-md">
                    <Clock size={18} className="text-slate-300" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-extrabold text-slate-800 mb-3">No Certificates Yet</h3>
                <p className="text-slate-500 text-[15px] leading-relaxed max-w-md mx-auto mb-10">
                  Complete all modules and pass the final test in any enrolled course to earn your official digital certificate.
                </p>
                
                <button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 flex items-center gap-2.5">
                  <Award size={18} /> Check Eligibility
                </button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certs.map((cert) => (
                <div key={cert._id} className="bg-white rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden group flex flex-col">
                  {/* Decorative Document Header */}
                  <div className="h-28 bg-gradient-to-br from-emerald-50 to-teal-50 relative p-6 border-b border-emerald-100/50">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                    <Award size={36} className="text-emerald-500 drop-shadow-sm mb-4" />
                    <div className="absolute bottom-[-16px] right-6 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center border border-slate-50 text-emerald-600">
                      <CheckCircle size={24} />
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-extrabold text-slate-800 text-lg mb-2 leading-tight">{cert.courseId?.title}</h3>
                    <p className="text-sm font-medium text-slate-500 mb-4 flex items-center gap-2">
                      <BookOpen size={16} className="text-slate-400" /> Signed by {cert.mentorId?.name}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <p className="text-[13px] font-bold text-slate-400 flex items-center gap-1.5">
                        <Clock size={14} /> {new Date(cert.issuedAt).toLocaleDateString()}
                      </p>
                      <a
                        href={`/api/certificates/${cert._id}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 font-bold text-sm flex items-center gap-1 hover:text-emerald-500 transition-colors group-hover:translate-x-1 duration-300"
                      >
                        View Official <ExternalLink size={16} className="ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pending Requests */}
        {requests.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                <Clock size={22} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800">Pending Requests</h2>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
              <div className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <div key={req._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                        <Award size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{req.courseId?.title}</h4>
                        <p className="text-sm text-slate-500 font-medium">Mentor: {req.mentorId?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-[13px] font-bold text-slate-400 mr-2">{new Date(req.createdAt).toLocaleDateString()}</p>
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border
                        ${req.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                          req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                          'bg-red-50 text-red-600 border-red-200'}
                      `}>
                        {req.status === 'pending' && <><Clock size={14} /> In Review</>}
                        {req.status === 'approved' && <><CheckCircle size={14} /> Approved</>}
                        {req.status === 'rejected' && <><XCircle size={14} /> Rejected</>}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-[fadeInUp_0.2s_ease-out]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/60 to-teal-50/60">
              <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                <Award size={20} className="text-emerald-500" /> Request Certificate
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 bg-white shadow-sm border border-slate-200 rounded-full p-1.5 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-slate-500 text-[15px] mb-6 leading-relaxed">
                Finished all modules and passed the final test? Request your official digital certificate here.
              </p>

              <form onSubmit={handleRequestSubmit}>
                <div className="mb-5">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Eligible Course</label>
                  {eligibleCourses.length === 0 ? (
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                      <BookOpen size={28} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm font-medium">No eligible courses found.</p>
                      <p className="text-slate-400 text-xs mt-1">You either haven't enrolled yet, or already requested them all.</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <select 
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3.5 text-slate-800 font-semibold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 appearance-none transition-all cursor-pointer"
                        required
                      >
                        <option value="" disabled>-- Select a Course --</option>
                        {eligibleCourses.map(course => (
                          <option key={course._id} value={course._id}>{course.title}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <PlayCircle size={18} className="rotate-90" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Mentor Details Card */}
                {selectedCourseId && (() => {
                  const course = courses.find(c => c._id === selectedCourseId);
                  const mentor = course?.mentorId;
                  if (!mentor) return null;
                  return (
                    <div className="mb-6 bg-gradient-to-br from-slate-50 to-emerald-50/30 border border-slate-200/80 rounded-2xl p-5 animate-[fadeInUp_0.2s_ease-out]">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Certificate Signed By</p>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-emerald-500/20 flex-shrink-0">
                          {mentor.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-extrabold text-slate-800 truncate">{mentor.name}</h4>
                          <p className="text-sm text-slate-500 truncate">{mentor.email}</p>
                          {mentor.rating > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              {[1,2,3,4,5].map(i => (
                                <Star key={i} size={12} fill={i <= Math.round(mentor.rating) ? '#f59e0b' : 'none'} color={i <= Math.round(mentor.rating) ? '#f59e0b' : '#d1d5db'} />
                              ))}
                              <span className="text-xs text-slate-400 ml-1">({mentor.reviewCount || 0})</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {mentor.yearsOfExperience > 0 && (
                          <div className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2.5 border border-slate-100">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                              <Briefcase size={14} className="text-blue-500" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{mentor.yearsOfExperience}+ Years</p>
                              <p className="text-[10px] text-slate-400">Experience</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2.5 border border-slate-100">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <Award size={14} className="text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">Verified</p>
                            <p className="text-[10px] text-slate-400">Mentor</p>
                          </div>
                        </div>
                      </div>

                      {/* Skills */}
                      {(mentor.skills || []).length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Skills</p>
                          <div className="flex flex-wrap gap-1.5">
                            {mentor.skills.slice(0, 6).map((skill, i) => (
                              <span key={i} className="px-2.5 py-1 bg-white text-emerald-700 text-[11px] font-semibold rounded-lg border border-emerald-100">
                                {skill}
                              </span>
                            ))}
                            {mentor.skills.length > 6 && (
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[11px] font-semibold rounded-lg">
                                +{mentor.skills.length - 6}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={requesting || eligibleCourses.length === 0}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {requesting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Plus size={18} /> Submit Request</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentCertificates;
