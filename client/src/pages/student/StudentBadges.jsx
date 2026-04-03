import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import { apiGetMyBadges } from '../../api';
import { Award, Star, Trophy, Target, Zap, BookOpen } from 'lucide-react';

const StudentBadges = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetMyBadges()
      .then((res) => setBadges(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><div className="flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div></div></DashboardLayout>;

  // Simple icon parser to map DB emojis/strings to beautiful Lucide icons or rich UI elements
  const getBadgeIcon = (iconStr, title, color) => {
    // If it's a known string or emoji we could parse it, but for a premium look, let's use massive glowing SVG
    const iconColor = color || '#f59e0b'; // default amber
    
    // Choose an icon based on title keywords
    let IconComponent = Trophy;
    const lowerTitle = (title || '').toLowerCase();
    if (lowerTitle.includes('complete')) IconComponent = Award;
    if (lowerTitle.includes('star') || lowerTitle.includes('top')) IconComponent = Star;
    if (lowerTitle.includes('fast') || lowerTitle.includes('speed')) IconComponent = Zap;
    if (lowerTitle.includes('goal') || lowerTitle.includes('target')) IconComponent = Target;

    return (
      <div className="relative w-32 h-32 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 z-10">
        {/* Glow behind the badge */}
        <div className="absolute inset-0 rounded-full blur-2xl opacity-40 scale-110" style={{ backgroundColor: iconColor }}></div>
        
        {/* The 3D Hexagon/Shield Base - SVG */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-[0_10px_15px_rgba(0,0,0,0.1)]">
          <defs>
            <linearGradient id={`grad-${title?.replace(/\s/g, '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor={iconColor} stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id={`border-${title?.replace(/\s/g, '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={iconColor} />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
          <polygon 
            points="50 5, 90 25, 90 75, 50 95, 10 75, 10 25" 
            fill={`url(#grad-${title?.replace(/\s/g, '')})`} 
            stroke={`url(#border-${title?.replace(/\s/g, '')})`}
            strokeWidth="4"
          />
          {/* Inner metallic ring */}
          <polygon 
            points="50 12, 84 29, 84 71, 50 88, 16 71, 16 29" 
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeOpacity="0.8"
          />
        </svg>

        {/* Center Icon */}
        <div className="relative z-10 text-white drop-shadow-md p-4 rounded-full" style={{ background: `linear-gradient(135deg, ${iconColor}, #0f172a)` }}>
          <IconComponent size={32} strokeWidth={2.5} />
        </div>

        {/* Original Emoji floating badge if it exists */}
        {iconStr && iconStr.length < 5 && iconStr !== '🏅' && (
           <div className="absolute -bottom-2 -right-2 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg border border-slate-100 text-xl animate-bounce">
             {iconStr}
           </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <PageHeader title="My Badges" subtitle="Level up and collect achievements through your learning journey" />

      {/* Decorative summary bar */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-2xl p-6 md:p-8 mb-10 text-white shadow-[0_20px_40px_-5px_rgba(245,158,11,0.4)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-5 relative z-10 w-full md:w-1/2">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shrink-0">
            <Trophy size={32} className="text-white drop-shadow-sm" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black mb-1">Your Trophy Cabinet</h2>
            <p className="text-amber-50 font-medium mb-3">You have collected {badges.length} badges so far!</p>
            {/* Progress Bar Add-on */}
            <div className="w-full bg-black/10 rounded-full h-2 mb-1 overflow-hidden">
               <div className="bg-white h-2 rounded-full" style={{ width: `${Math.min(100, (badges.length / (badges.length > 5 ? 10 : 5)) * 100)}%` }}></div>
            </div>
            <p className="text-[10px] font-bold text-amber-100 uppercase tracking-wider text-right">
              {badges.length >= 10 ? 'MAX LEVEL REACHED' : `${badges.length > 5 ? 10 - badges.length : 5 - badges.length} MORE TO NEXT RANK`}
            </p>
          </div>
        </div>
        <div className="relative z-10 bg-white/20 backdrop-blur-md border border-white/30 px-8 py-4 rounded-xl font-black tracking-widest text-center shadow-inner">
          <p className="text-[10px] uppercase text-amber-100 tracking-[0.2em] mb-1">Current Rank</p>
          <div className="text-xl">
             {badges.length >= 10 ? 'GRAND MASTER 👑' : badges.length > 5 ? 'ELITE SCHOLAR ✨' : badges.length > 0 ? 'RISING STAR 🌟' : 'NOVICE 💡'}
          </div>
        </div>
      </div>

      {badges.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-[2rem] p-16 shadow-xl shadow-slate-200/40 relative overflow-hidden">
          {/* Decorative background blobs */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-orange-400/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col items-center justify-center text-center relative z-10">
            {/* Layered stacked illustration */}
            <div className="relative mb-10">
              {/* Background floating shapes */}
              <div className="absolute -top-3 -left-4 w-8 h-8 bg-amber-100 rounded-lg rotate-12 opacity-60"></div>
              <div className="absolute -bottom-2 -right-5 w-6 h-6 bg-orange-100 rounded-full opacity-60"></div>
              <div className="absolute top-1/2 -right-8 w-4 h-4 bg-yellow-200 rounded rotate-45 opacity-50"></div>
              
              <div className="w-32 h-32 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/60 rounded-3xl flex items-center justify-center shadow-xl shadow-amber-500/10 rotate-2">
                <Trophy size={56} className="text-amber-400/60" strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white border-2 border-amber-200 rounded-2xl flex items-center justify-center shadow-lg">
                <Star size={20} className="text-amber-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-md text-white">
                <Zap size={14} />
              </div>
            </div>
            
            <h3 className="text-2xl font-extrabold text-slate-800 mb-3">No Badges Unlocked</h3>
            <p className="text-slate-500 text-[15px] leading-relaxed max-w-md mx-auto mb-4">
              Complete courses, ace tests, and maintain perfect attendance to unlock special achievement badges.
            </p>
            <p className="text-amber-600/70 text-sm font-semibold mb-10">
              🏆 Your first badge is just one course away!
            </p>
            
            <a href="/student/browse" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 flex items-center gap-2.5 no-underline">
              <BookOpen size={18} /> Browse Courses
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {badges.map((ub) => (
            <div key={ub._id} className="bg-white border border-slate-100 rounded-[2rem] p-8 text-center shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden flex flex-col items-center">
              {/* Top ambient glow */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-all duration-500 pointer-events-none"></div>
              
              <div className="mb-6 relative">
                 {getBadgeIcon(ub.badgeId?.icon, ub.badgeId?.title, ub.badgeId?.color)}
              </div>
              
              <h3 className="font-extrabold text-slate-800 text-lg mb-2 relative z-10">{ub.badgeId?.title}</h3>
              <p className="text-sm text-slate-500 font-medium mb-4 relative z-10 leading-relaxed min-h-[40px]">{ub.badgeId?.description}</p>
              
              <div className="w-full h-px bg-slate-100 my-4 relative z-10"></div>
              
              <div className="w-full flex flex-col gap-1 items-center relative z-10">
                {ub.courseId && <span className="px-3 py-1 bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider rounded-lg border border-slate-200 mb-2 w-full truncate" title={ub.courseId.title}>{ub.courseId.title}</span>}
                <p className="text-[12px] font-bold text-amber-500 tracking-wider">Earned {new Date(ub.earnedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentBadges;
