import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { apiGetMyBadges, apiGetMyCertificates, apiGetEnrolledCourses } from '../api';
import { User, Mail, Award, BookOpen, Star, Loader2, Link as LinkIcon, CheckCircle, Code, Globe, Activity, ArrowRight, Edit3, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [certs, setCerts] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Completion Engine
  const calculateCompletion = () => {
    let score = 40; // Base: Name & Email are enforced
    let missingInfo = [];
    
    if (user?.bio) {
      score += 20;
    } else {
      missingInfo.push('Add a professional bio');
    }

    if (user?.skills && user.skills.length > 0) {
      score += 20;
    } else {
      missingInfo.push('List your technical skills');
    }

    if (user?.githubUrl || user?.portfolioUrl) {
      score += 20;
    } else {
      missingInfo.push('Add project portfolio links');
    }

    return { score, missingInfo };
  };

  const { score: completionScore, missingInfo } = calculateCompletion();

  useEffect(() => {
    if (user?.role === 'student') {
      Promise.all([
        apiGetMyBadges(),
        apiGetMyCertificates(),
        apiGetEnrolledCourses().catch(() => ({ data: { data: [] } }))
      ])
        .then(([bRes, cRes, eRes]) => {
          setBadges(bRes.data.data || []);
          setCerts(cRes.data.data || []);
          setEnrolledCourses(eRes.data.data || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setTimeout(() => setLoading(false), 0);
    }
  }, [user]);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-600" size={40} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="My Profile" subtitle="Manage your account details and view achievements" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* ======================= LEFT COLUMN ======================= */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Identity Card */}
          <div className="glass p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 -z-10" />
            
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-emerald-900/20 mb-4 border-4 border-white">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            
            <h2 className="text-xl font-extrabold text-slate-900 mb-1 flex items-center gap-1.5 justify-center">
              {user?.name}
              {user?.role === 'student' && <ShieldCheck size={18} className="text-blue-500" />}
            </h2>
            <p className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">{user?.role}</p>

            <div className="w-full h-px bg-slate-100 my-5" />

            <div className="w-full space-y-3 text-left">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <Mail size={16} className="text-slate-400" />
                </div>
                <p className="text-sm font-medium truncate">{user?.email}</p>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-slate-400" />
                </div>
                <p className="text-sm font-medium truncate">Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : 'Recently'}</p>
              </div>
            </div>
          </div>

          {/* Completion Indicator */}
          {completionScore < 100 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-slate-800 text-sm">Profile Completion</h3>
                <span className="font-extrabold text-emerald-600 text-sm">{completionScore}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full mb-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000"
                  style={{ width: `${completionScore}%` }}
                />
              </div>
              
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-2">Boost your visibility</p>
                <ul className="space-y-1.5">
                  {missingInfo.map((info, idx) => (
                    <li key={idx} className="text-xs font-medium text-amber-700 flex items-center gap-1.5">
                      <div className="w-1 h-1 bg-amber-500 rounded-full" /> {info}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* About Me */}
          <div className="glass p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Edit3 size={14} /> Professional Bio
            </h3>
            {user?.bio ? (
              <p className="text-sm text-slate-600 leading-relaxed font-medium pb-2">{user.bio}</p>
            ) : (
              <p className="text-sm text-slate-400 italic pb-2">No bio added yet.</p>
            )}
          </div>

          {/* Skills */}
          <div className="glass p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity size={14} /> Technical Skills
            </h3>
            {user?.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 border border-slate-200 py-1.5 px-3 rounded-xl text-xs font-bold">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No skills listed.</p>
            )}
          </div>

          {/* Links */}
          <div className="glass p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Globe size={14} /> Connect
            </h3>
            <div className="space-y-3">
              {user?.githubUrl ? (
                <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 text-slate-700 font-medium text-sm">
                  <Code size={18} className="text-slate-900" /> GitHub Profile
                </a>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 font-medium text-sm opacity-50">
                  <Code size={18} /> GitHub not linked
                </div>
              )}

              {user?.portfolioUrl ? (
                <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 text-slate-700 font-medium text-sm">
                  <LinkIcon size={18} className="text-slate-900" /> Portfolio Website
                </a>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 font-medium text-sm opacity-50">
                  <LinkIcon size={18} /> Portfolio not linked
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ======================= RIGHT COLUMN ======================= */}
        <div className="md:col-span-8 space-y-6">
          
          {user?.role === 'student' ? (
            <>
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass p-5 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
                    <BookOpen size={20} className="text-emerald-600" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-800">{enrolledCourses.length}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Courses</p>
                </div>
                <div className="glass p-5 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-2">
                    <Star size={20} className="text-amber-500" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-800">{badges.length}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Badges</p>
                </div>
                <div className="glass p-5 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                    <Award size={20} className="text-blue-600" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-800">{certs.length}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Certs</p>
                </div>
              </div>

              {/* Badges Box */}
              <div className="glass p-6 md:p-8">
                <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                  <Star className="text-amber-500" /> Earned Badges
                </h3>
                {badges.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 border border-slate-100 rounded-2xl">
                    <Star size={32} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium text-sm">No badges earned yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {badges.map((b, i) => (
                      <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 text-center shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${b.badgeId?.level === 'gold' ? 'from-amber-400 to-amber-500' : b.badgeId?.level === 'silver' ? 'from-slate-300 to-slate-400' : 'from-orange-400 to-orange-500'}`} />
                        <div className="text-4xl mb-3 flex justify-center">{b.badgeId?.icon}</div>
                        <h4 className="text-sm font-bold text-slate-800 mb-1 leading-tight">{b.badgeId?.name}</h4>
                        <p className="text-[11px] font-medium text-slate-400 mb-2">{new Date(b.awardedAt).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-500 line-clamp-2">{b.badgeId?.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Certificates Box */}
              <div className="glass p-6 md:p-8">
                <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                  <Award className="text-blue-500" /> Platform Certificates
                </h3>
                {certs.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 border border-slate-100 rounded-2xl">
                    <Award size={32} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium text-sm">Keep learning to earn your first certificate.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {certs.map((cert) => (
                      <div key={cert._id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm group hover:border-emerald-200 transition-colors flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={20} className="text-emerald-500" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 leading-tight">{cert.courseId?.title}</h4>
                            <p className="text-xs font-semibold text-emerald-600 mt-0.5">SkillBridge Certified</p>
                          </div>
                        </div>
                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{new Date(cert.issuedAt).toLocaleDateString()}</span>
                          <a href={`/api/certificates/${cert._id}/view`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:text-emerald-700">
                            Verify <LinkIcon size={12} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enrolled Courses / Activity */}
              <div className="glass p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                    <Activity className="text-emerald-500" /> Active Learning Path
                  </h3>
                  <Link to="/student/courses" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                    View All <ArrowRight size={12} />
                  </Link>
                </div>
                
                {enrolledCourses.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 border border-slate-100 rounded-2xl">
                    <BookOpen size={32} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium text-sm">You have not enrolled in any courses yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enrolledCourses.slice(0, 3).map((enrollment, i) => (
                      <Link key={i} to={`/student/course/${enrollment.courseId?._id}`} className="block bg-white border border-slate-100 rounded-xl p-4 hover:border-emerald-300 hover:shadow-md transition-all">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-slate-800">{enrollment.courseId?.title || 'Unknown Course'}</h4>
                            <p className="text-xs text-slate-500 font-medium mt-1">Started: {new Date(enrollment.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                            <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-500" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="glass p-12 text-center flex flex-col items-center justify-center">
              <ShieldCheck size={48} className="text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">Staff Portal Configuration</h3>
              <p className="text-slate-500 max-w-sm mx-auto">This account oversees administrative operations. Achievements and Badges are configured natively for Student profiles.</p>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
