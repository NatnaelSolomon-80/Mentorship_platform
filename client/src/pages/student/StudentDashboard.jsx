import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { apiGetEnrolledCourses, apiGetEnrollmentRequests, apiGetMyBadges, apiGetMyCertificates } from '../../api';
import { BookOpen, Award, Star, Clock, ArrowRight, TrendingUp, CheckCircle, Zap, MessageCircle, BarChart3, Target, Flame, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

/* ─── Mini Bar Chart ─── */
const BarChart = ({ data, height = 140, barColor = '#2d6a4f' }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height, paddingTop: 10 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{d.value}</span>
          <div style={{
            width: '100%', borderRadius: '6px 6px 0 0',
            background: `linear-gradient(180deg, ${barColor}, ${barColor}aa)`,
            height: `${Math.max((d.value / max) * (height - 40), 6)}px`,
            transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            minHeight: 6,
          }} />
          <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Circular Progress Ring ─── */
const ProgressRing = ({ value, max, size = 80, color = '#2d6a4f' }) => {
  const pct = max ? Math.round((value / max) * 100) : 0;
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: '#1a2e24' }}>{pct}%</span>
      </div>
    </div>
  );
};

/* ─── Enhanced Stat Card ─── */
const EnhancedStatCard = ({ icon: Icon, label, value, target, color, bg, desc, delay = 0 }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, [delay]);
  const pct = target ? Math.min(Math.round((value / target) * 100), 100) : null;
  return (
    <div style={{
      background: bg, borderRadius: 18, padding: '22px 20px',
      border: `1px solid ${color}18`, position: 'relative', overflow: 'hidden',
      transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(20px)',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${color}18`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={color} />
        </div>
        {target && (
          <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}12`, padding: '3px 8px', borderRadius: 20 }}>
            /{target} goal
          </span>
        )}
      </div>
      <p style={{ fontSize: 28, fontWeight: 900, color: '#1a2e24', marginBottom: 2, letterSpacing: '-1px' }}>{value}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: target ? 10 : 0 }}>{label}</p>
      {target && (
        <div>
          <div style={{ height: 6, borderRadius: 6, background: `${color}15`, overflow: 'hidden' }}>
            <div style={{
              width: show ? `${pct}%` : '0%', height: '100%', borderRadius: 6,
              background: `linear-gradient(90deg, ${color}, ${color}cc)`,
              transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s',
            }} />
          </div>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{pct}% of goal</p>
        </div>
      )}
      {desc && <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{desc}</p>}
    </div>
  );
};

/* ─── Skill Path Step ─── */
const PathStep = ({ label, icon: Icon, color, active, delay = 0 }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, opacity: show ? 1 : 0, transform: show ? 'scale(1)' : 'scale(0.7)', transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: active ? `linear-gradient(135deg, ${color}, ${color}cc)` : '#f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: active ? `0 6px 20px ${color}35` : 'none',
        transition: 'all 0.4s',
      }}>
        <Icon size={22} color={active ? '#fff' : '#9ca3af'} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: active ? color : '#9ca3af', textAlign: 'center' }}>{label}</span>
    </div>
  );
};
const PathConnector = ({ active }) => (
  <div style={{ flex: 1, height: 3, background: active ? 'linear-gradient(90deg, #2d6a4f, #52b788)' : '#eef1f4', marginBottom: 28, maxWidth: 60, borderRadius: 3 }} />
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ courses: 0, certificates: 0, badges: 0, pending: 0 });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, certsRes, badgesRes, reqsRes] = await Promise.all([
          apiGetEnrolledCourses(), apiGetMyCertificates(), apiGetMyBadges(), apiGetEnrollmentRequests(),
        ]);
        setEnrolledCourses(coursesRes.data.data || []);
        setStats({
          courses: coursesRes.data.data?.length || 0,
          certificates: certsRes.data.data?.length || 0,
          badges: badgesRes.data.data?.length || 0,
          pending: reqsRes.data.data?.filter(r => r.status === 'pending').length || 0,
        });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // Simulated weekly learning hours
  const weeklyData = useMemo(() => [
    { label: 'Mon', value: Math.floor(Math.random() * 4) + 1 },
    { label: 'Tue', value: Math.floor(Math.random() * 5) + 1 },
    { label: 'Wed', value: Math.floor(Math.random() * 3) + 1 },
    { label: 'Thu', value: Math.floor(Math.random() * 6) + 2 },
    { label: 'Fri', value: Math.floor(Math.random() * 5) + 1 },
    { label: 'Sat', value: Math.floor(Math.random() * 3) + 1 },
    { label: 'Sun', value: Math.floor(Math.random() * 2) + 1 },
  ], []);

  const totalHours = weeklyData.reduce((s, d) => s + d.value, 0);

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <div className="spinner" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      {/* ─── Welcome Banner ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #1a2e24 0%, #2d6a4f 50%, #1a4731 100%)',
        borderRadius: 20, padding: '28px 32px', marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(183,228,199,0.12), transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Good day 👋</p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>Track your learning progress and achievements</p>
        </div>
        <Link to="/student/browse" style={{
          background: 'linear-gradient(135deg, #b7e4c7, #95d5b2)', color: '#1a2e24', padding: '12px 24px',
          borderRadius: 50, fontSize: 13, fontWeight: 700, textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
          boxShadow: '0 4px 16px rgba(183,228,199,0.3)', transition: 'all 0.3s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(183,228,199,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(183,228,199,0.3)'; }}>
          Browse Courses <ArrowRight size={16} />
        </Link>
      </div>

      {/* ─── Stat Cards with Progress ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }} className="stats-row">
        <EnhancedStatCard icon={BookOpen} label="Enrolled Courses" value={stats.courses} target={5} color="#2d6a4f" bg="#f0faf3" delay={0} />
        <EnhancedStatCard icon={Award} label="Certificates" value={stats.certificates} target={3} color="#e65100" bg="#fff8f0" delay={100} />
        <EnhancedStatCard icon={Star} label="Badges Earned" value={stats.badges} target={10} color="#1565c0" bg="#eff6ff" delay={200} />
        <EnhancedStatCard icon={Clock} label="Pending Requests" value={stats.pending} color="#6a1b9a" bg="#faf5ff" delay={300} desc={stats.pending > 0 ? '⏳ Waiting for approval' : '✅ All approved'} />
      </div>

      {/* ─── Charts + Overview Row ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }} className="chart-grid">
        {/* Learning Activity Bar Chart */}
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #eef1f4', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e24', marginBottom: 2 }}>Learning Activity</h3>
              <p style={{ fontSize: 12, color: '#9ca3af' }}>Hours studied this week</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0faf3', padding: '6px 12px', borderRadius: 20 }}>
              <Flame size={14} color="#2d6a4f" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#2d6a4f' }}>{totalHours}h total</span>
            </div>
          </div>
          <BarChart data={weeklyData} barColor="#2d6a4f" />
        </div>

        {/* Progress Overview */}
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #eef1f4', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e24', marginBottom: 2 }}>Overall Progress</h3>
              <p style={{ fontSize: 12, color: '#9ca3af' }}>Your learning journey</p>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={18} color="#1565c0" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'center', marginBottom: 20 }}>
            <ProgressRing value={stats.courses} max={5} color="#2d6a4f" />
            <ProgressRing value={stats.certificates} max={3} color="#e65100" />
            <ProgressRing value={stats.badges} max={10} color="#1565c0" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
            {[{ label: 'Courses', color: '#2d6a4f' }, { label: 'Certs', color: '#e65100' }, { label: 'Badges', color: '#1565c0' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Courses + Quick Actions ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }} className="dash-main-grid">
        {/* My Courses */}
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #eef1f4', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e24' }}>My Active Courses</h2>
            </div>
            <Link to="/student/courses" style={{ fontSize: 13, color: '#2d6a4f', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {enrolledCourses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>You haven't enrolled in any courses yet.</p>
              <Link to="/student/browse" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #2d6a4f, #1a4731)', color: '#fff', padding: '12px 24px', borderRadius: 50,
                fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 16px rgba(45,106,79,0.3)',
              }}>
                <BookOpen size={15} /> Browse Courses
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {enrolledCourses.slice(0, 4).map((course, idx) => {
                const progress = Math.floor(Math.random() * 80) + 10; // In real app, use actual progress
                return (
                  <Link key={course._id} to={`/student/course/${course._id}`} style={{
                    display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none',
                    padding: '14px 16px', borderRadius: 14, border: '1px solid #eef1f4',
                    background: '#fafbfc', transition: 'all 0.25s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#d5e8da'; e.currentTarget.style.background = '#f0faf3'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#eef1f4'; e.currentTarget.style.background = '#fafbfc'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: ['#f0faf3', '#eff6ff', '#fff8f0', '#faf5ff'][idx % 4],
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <BookOpen size={18} color={['#2d6a4f', '#1565c0', '#e65100', '#6a1b9a'][idx % 4]} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#1a2e24', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.title}</p>
                      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Mentor: {course.mentorId?.name}</p>
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 5, background: '#eef1f4', borderRadius: 5, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #2d6a4f, #52b788)', borderRadius: 5, transition: 'width 1s ease' }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#2d6a4f' }}>{progress}%</span>
                      </div>
                    </div>
                    <ArrowRight size={16} color="#9ca3af" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick Actions */}
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #eef1f4', padding: 22 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a2e24', marginBottom: 14 }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { to: '/student/browse', icon: BookOpen, label: 'Find Courses', color: '#2d6a4f', bg: '#f0faf3' },
                { to: '/student/chat', icon: MessageCircle, label: 'Message Mentor', color: '#1565c0', bg: '#eff6ff' },
                { to: '/student/certificates', icon: Award, label: 'My Certificates', color: '#e65100', bg: '#fff8f0' },
                { to: '/student/badges', icon: Star, label: 'My Badges', color: '#6a1b9a', bg: '#faf5ff' },
              ].map(item => (
                <Link key={item.to} to={item.to} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderRadius: 12, border: '1px solid #eef1f4', textDecoration: 'none',
                  background: item.bg, transition: 'all 0.25s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${item.color}12`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <item.icon size={16} color={item.color} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1a2e24', flex: 1 }}>{item.label}</span>
                  <ArrowRight size={14} color="#9ca3af" />
                </Link>
              ))}
            </div>
          </div>

          {/* Streak Card */}
          <div style={{
            background: 'linear-gradient(135deg, #1a2e24, #2d6a4f)',
            borderRadius: 18, padding: 22, color: '#fff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Flame size={20} color="#f59e0b" />
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Learning Streak</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
              <span style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px' }}>{Math.min(stats.courses * 3 + 2, 15)}</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>days</span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Keep learning daily to maintain your streak! 🔥</p>
            <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} style={{
                  flex: 1, height: 6, borderRadius: 3,
                  background: i < 5 ? 'rgba(183,228,199,0.6)' : 'rgba(255,255,255,0.12)',
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Skill Path ─── */}
      <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #eef1f4', padding: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a2e24', marginBottom: 24 }}>Your Skill Path</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
          <PathStep label="Enroll" icon={BookOpen} color="#2d6a4f" active={stats.courses > 0} delay={100} />
          <PathConnector active={stats.courses > 0} />
          <PathStep label="Learn" icon={Zap} color="#1565c0" active={stats.courses > 0} delay={250} />
          <PathConnector active={stats.certificates > 0} />
          <PathStep label="Get Certified" icon={Award} color="#e65100" active={stats.certificates > 0} delay={400} />
          <PathConnector active={stats.certificates > 0} />
          <PathStep label="Get Hired" icon={TrendingUp} color="#6a1b9a" active={stats.certificates > 0} delay={550} />
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .dash-main-grid, .chart-grid { grid-template-columns: 1fr !important; }
          .stats-row { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .stats-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default StudentDashboard;
