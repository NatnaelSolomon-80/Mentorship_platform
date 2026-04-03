import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import { apiGetCourses, apiApproveCourse, apiRejectCourse, apiDeleteCourse } from '../../api';
import toast from 'react-hot-toast';
import { BookOpen, Check, X, Trash2, Search, Layers, Clock, User } from 'lucide-react';

const levelColor = { Beginner: '#10b981', Intermediate: '#f59e0b', Advanced: '#ef4444' };
const levelBg = { Beginner: '#ecfdf5', Intermediate: '#fffbeb', Advanced: '#fef2f2' };

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actioning, setActioning] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await apiGetCourses();
      setCourses(res.data.data || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    setActioning(id + 'approve');
    try { await apiApproveCourse(id); toast.success('Course approved!'); await load(); }
    catch { toast.error('Failed'); }
    finally { setActioning(null); }
  };

  const handleReject = async (id) => {
    setActioning(id + 'reject');
    try { await apiRejectCourse(id); toast.success('Course rejected'); await load(); }
    catch { toast.error('Failed'); }
    finally { setActioning(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course permanently?')) return;
    try { await apiDeleteCourse(id); toast.success('Course deleted'); await load(); }
    catch { toast.error('Failed'); }
  };

  const filtered = courses.filter((c) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === 'approved' && !c.isApproved) return false;
    if (statusFilter === 'pending' && c.isApproved) return false;
    return true;
  });

  const pendingCount = courses.filter(c => !c.isApproved).length;
  const approvedCount = courses.filter(c => c.isApproved).length;

  if (loading) return <DashboardLayout><div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Course Management" subtitle={`${courses.length} total courses`} />

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '18px 22px', border: '1px solid #f3f4f6', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px 0' }}>Total Courses</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#1a2e24', margin: 0 }}>{courses.length}</p>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, padding: '18px 22px', border: '1px solid #f3f4f6', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px 0' }}>Approved</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#15803d', margin: 0 }}>{approvedCount}</p>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, padding: '18px 22px', border: '1px solid #f3f4f6', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px 0' }}>Pending</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b', margin: 0 }}>{pendingCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '10px 16px' }}>
          <Search size={16} color="#9ca3af" />
          <input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 14, color: '#374151', width: '100%', background: 'none', fontFamily: "'Inter', sans-serif" }} />
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 14, background: '#f3f4f6' }}>
          {[{ value: '', label: 'All' }, { value: 'pending', label: '⏳ Pending' }, { value: 'approved', label: '✅ Approved' }].map(opt => (
            <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
              style={{
                padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                background: statusFilter === opt.value ? '#fff' : 'transparent',
                color: statusFilter === opt.value ? '#1a2e24' : '#6b7280',
                boxShadow: statusFilter === opt.value ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s',
              }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map((course) => (
          <div key={course._id} style={{
            background: '#fff', borderRadius: 18, padding: '20px 24px',
            border: `1px solid ${course.isApproved ? '#f3f4f6' : '#fde68a'}`,
            boxShadow: course.isApproved ? '0 2px 8px rgba(0,0,0,0.04)' : '0 2px 12px rgba(245,158,11,0.08)',
            display: 'flex', alignItems: 'center', gap: 18, transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = course.isApproved ? '0 2px 8px rgba(0,0,0,0.04)' : '0 2px 12px rgba(245,158,11,0.08)'}
          >
            {/* Course Thumbnail/Icon */}
            <div style={{
              width: 64, height: 64, borderRadius: 16, flexShrink: 0,
              background: course.thumbnail
                ? `url(${course.thumbnail}) center/cover`
                : 'linear-gradient(135deg, #2d6a4f, #40916c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {!course.thumbnail && <BookOpen size={26} color="rgba(255,255,255,0.7)" />}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e24', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</h3>
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0,
                  background: course.isApproved ? '#ecfdf5' : '#fffbeb',
                  color: course.isApproved ? '#15803d' : '#92400e',
                }}>
                  {course.isApproved ? '✅ Approved' : '⏳ Pending'}
                </span>
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0,
                  background: levelBg[course.level] || '#f3f4f6',
                  color: levelColor[course.level] || '#374151',
                }}>
                  {course.level}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#6b7280' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><User size={12} /> {course.mentorId?.name || 'Unknown'}</span>
                <span>{course.category}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Layers size={12} /> {course.modules?.length || 0} modules</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {course.durationWeeks || 4} weeks</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {!course.isApproved && (
                <button onClick={() => handleApprove(course._id)} disabled={!!actioning}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#ecfdf5', color: '#15803d', fontWeight: 600, fontSize: 13, border: '1px solid #86efac', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <Check size={14} /> Approve
                </button>
              )}
              {course.isApproved && (
                <button onClick={() => handleReject(course._id)} disabled={!!actioning}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#fffbeb', color: '#92400e', fontWeight: 600, fontSize: 13, border: '1px solid #fde68a', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <X size={14} /> Revoke
                </button>
              )}
              <button onClick={() => handleDelete(course._id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: 8, borderRadius: 8, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 48, textAlign: 'center', border: '1px solid #f3f4f6' }}>
            <BookOpen size={40} style={{ margin: '0 auto 12px', color: '#d1d5db' }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#6b7280' }}>No courses found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminCourses;
