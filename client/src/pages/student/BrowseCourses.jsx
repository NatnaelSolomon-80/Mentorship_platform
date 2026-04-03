import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { apiGetCourses, apiGetMentors, apiRequestEnrollment, apiGetEnrollmentRequests } from '../../api';
import toast from 'react-hot-toast';
import { BookOpen, Search, Users, Clock, Star, Filter, ChevronRight, Layers, Award, X, Send, GraduationCap } from 'lucide-react';

const levelColor = { Beginner: '#10b981', Intermediate: '#f59e0b', Advanced: '#ef4444' };
const levelBg = { Beginner: '#ecfdf5', Intermediate: '#fffbeb', Advanced: '#fef2f2' };

const StarRating = ({ rating, size = 14 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={size} fill={i <= Math.round(rating) ? '#f59e0b' : 'none'} color={i <= Math.round(rating) ? '#f59e0b' : '#d1d5db'} />
    ))}
  </div>
);

const BrowseCourses = () => {
  const [courses, setCourses] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Course detail view
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Mentor selection flow
  const [showMentorSelect, setShowMentorSelect] = useState(false);
  const [mentorSearch, setMentorSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestMsg, setRequestMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cRes, mRes, rRes] = await Promise.all([
          apiGetCourses(),
          apiGetMentors(),
          apiGetEnrollmentRequests(),
        ]);
        setCourses(cRes.data.data || []);
        setMentors(mRes.data.data || []);
        setRequests(rRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const getRequestStatus = (courseId) => requests.find((r) => r.courseId?._id === courseId);

  const handleSendRequest = async () => {
    if (!selectedMentor) return toast.error('Please select a mentor');
    setSubmitting(true);
    try {
      await apiRequestEnrollment({
        courseId: selectedCourse._id,
        mentorId: selectedMentor._id,
        message: requestMsg,
      });
      toast.success('Enrollment request sent! Waiting for mentor approval.');
      const rRes = await apiGetEnrollmentRequests();
      setRequests(rRes.data.data || []);
      setShowMentorSelect(false);
      setSelectedMentor(null);
      setRequestMsg('');
      setSelectedCourse(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Get unique categories
  const categories = [...new Set(courses.map(c => c.category).filter(Boolean))];
  const allSkills = [...new Set(mentors.flatMap(m => m.skills || []))];

  const filtered = courses.filter((c) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.description?.toLowerCase().includes(search.toLowerCase())) return false;
    if (levelFilter && c.level !== levelFilter) return false;
    if (categoryFilter && c.category !== categoryFilter) return false;
    return true;
  });

  const filteredMentors = mentors.filter(m => {
    if (mentorSearch && !m.name.toLowerCase().includes(mentorSearch.toLowerCase())) return false;
    if (skillFilter && !(m.skills || []).some(s => s.toLowerCase().includes(skillFilter.toLowerCase()))) return false;
    return true;
  });

  if (loading) return <DashboardLayout><div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div></DashboardLayout>;

  // ─── MENTOR SELECTION MODAL ────────────────────────────
  if (showMentorSelect && selectedCourse) {
    return (
      <DashboardLayout>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <button onClick={() => { setShowMentorSelect(false); setSelectedMentor(null); }}
              style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={18} color="#6b7280" />
            </button>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a2e24', margin: 0 }}>Choose Your Mentor</h1>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
                To access <strong style={{ color: '#2d6a4f' }}>"{selectedCourse.title}"</strong>, you need a mentor to guide you.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '10px 14px' }}>
              <Search size={16} color="#9ca3af" />
              <input placeholder="Search mentors..." value={mentorSearch} onChange={e => setMentorSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: 14, color: '#374151', width: '100%', background: 'none', fontFamily: "'Inter', sans-serif" }} />
            </div>
            <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', fontSize: 14, color: '#374151', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
              <option value="">All Skills</option>
              {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Mentor Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280, 1fr))', gap: 20 }}>
            {filteredMentors.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60, color: '#9ca3af' }}>
                <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontSize: 16, fontWeight: 600 }}>No mentors available</p>
                <p style={{ fontSize: 13 }}>Try adjusting your filters</p>
              </div>
            ) : filteredMentors.map(mentor => {
              const isSelected = selectedMentor?._id === mentor._id;
              return (
                <div key={mentor._id}
                  onClick={() => setSelectedMentor(mentor)}
                  style={{
                    background: isSelected ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)' : '#fff',
                    border: isSelected ? '2px solid #2d6a4f' : '2px solid #f3f4f6',
                    borderRadius: 20, padding: 24, cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isSelected ? '0 8px 32px rgba(45,106,79,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)'; }}}
                  onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}}
                >
                  {/* Avatar & Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 16,
                      background: mentor.avatar ? `url(${mentor.avatar}) center/cover` : 'linear-gradient(135deg, #2d6a4f, #40916c)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 22, color: '#fff', flexShrink: 0,
                    }}>
                      {!mentor.avatar && mentor.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e24', margin: 0 }}>{mentor.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <StarRating rating={mentor.rating || 0} size={13} />
                        <span style={{ fontSize: 12, color: '#6b7280' }}>({mentor.reviewCount || 0})</span>
                      </div>
                    </div>
                    {isSelected && (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2d6a4f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>✓</span>
                      </div>
                    )}
                  </div>

                  {/* Experience */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <Award size={14} color="#6b7280" />
                    <span style={{ fontSize: 13, color: '#6b7280' }}>
                      {mentor.yearsOfExperience || 0}+ years experience
                    </span>
                  </div>

                  {/* Skills Tags */}
                  {(mentor.skills || []).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {mentor.skills.slice(0, 5).map((skill, i) => (
                        <span key={i} style={{
                          padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                          background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0',
                        }}>
                          {skill}
                        </span>
                      ))}
                      {mentor.skills.length > 5 && (
                        <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#f3f4f6', color: '#6b7280' }}>
                          +{mentor.skills.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom action bar */}
          {selectedMentor && (
            <div style={{
              position: 'sticky', bottom: 0, left: 0, right: 0,
              background: '#fff', borderTop: '1px solid #e5e7eb',
              padding: '20px 0', marginTop: 32, display: 'flex', alignItems: 'center', gap: 16,
              borderRadius: '20px 20px 0 0', boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: selectedMentor.avatar ? `url(${selectedMentor.avatar}) center/cover` : 'linear-gradient(135deg, #2d6a4f, #40916c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 18, color: '#fff', flexShrink: 0,
              }}>
                {!selectedMentor.avatar && selectedMentor.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1a2e24', margin: 0 }}>
                  Selected: {selectedMentor.name}
                </p>
                <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
                  ⭐ {(selectedMentor.rating || 0).toFixed(1)} • {selectedMentor.yearsOfExperience || 0}+ yrs
                </p>
              </div>
              <textarea
                value={requestMsg}
                onChange={e => setRequestMsg(e.target.value)}
                placeholder="Add a message to your mentor (optional)..."
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 12, border: '1px solid #e5e7eb',
                  fontSize: 13, resize: 'none', height: 44, fontFamily: "'Inter', sans-serif",
                  outline: 'none', color: '#374151',
                }}
              />
              <button
                onClick={handleSendRequest}
                disabled={submitting}
                style={{
                  padding: '12px 28px', borderRadius: 14,
                  background: 'linear-gradient(135deg, #2d6a4f, #1a4731)',
                  color: '#fff', fontWeight: 700, fontSize: 14, border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  opacity: submitting ? 0.7 : 1, transition: 'all 0.2s',
                  boxShadow: '0 4px 16px rgba(45,106,79,0.3)',
                }}
              >
                <Send size={16} /> {submitting ? 'Sending...' : 'Request Mentor'}
              </button>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // ─── COURSE DETAIL VIEW ────────────────────────────────
  if (selectedCourse) {
    const req = getRequestStatus(selectedCourse._id);
    const moduleCount = selectedCourse.modules?.length || 0;
    return (
      <DashboardLayout>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Back */}
          <button onClick={() => setSelectedCourse(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#6b7280', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 24, padding: 0 }}>
            ← Back to courses
          </button>

          {/* Hero Card */}
          <div style={{
            borderRadius: 24, overflow: 'hidden', background: '#fff',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
          }}>
            {/* Thumbnail */}
            <div style={{
              height: 220, background: selectedCourse.thumbnail
                ? `url(${selectedCourse.thumbnail}) center/cover`
                : 'linear-gradient(135deg, #1a4731 0%, #2d6a4f 50%, #40916c 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
            }}>
              {!selectedCourse.thumbnail && <BookOpen size={64} color="rgba(255,255,255,0.15)" />}
              <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', gap: 8 }}>
                <span style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                  background: levelBg[selectedCourse.level] || '#f3f4f6',
                  color: levelColor[selectedCourse.level] || '#374151',
                }}>
                  {selectedCourse.level}
                </span>
                <span style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: 'rgba(255,255,255,0.9)', color: '#374151',
                }}>
                  {selectedCourse.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: 32 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e24', margin: '0 0 12px 0', lineHeight: 1.2 }}>
                {selectedCourse.title}
              </h1>
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, margin: '0 0 24px 0' }}>
                {selectedCourse.description}
              </p>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                <div style={{ background: '#f8faf9', borderRadius: 16, padding: '16px 20px', textAlign: 'center' }}>
                  <Layers size={22} color="#2d6a4f" style={{ margin: '0 auto 6px' }} />
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#1a2e24', margin: 0 }}>{moduleCount}</p>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Modules</p>
                </div>
                <div style={{ background: '#f8faf9', borderRadius: 16, padding: '16px 20px', textAlign: 'center' }}>
                  <Clock size={22} color="#2d6a4f" style={{ margin: '0 auto 6px' }} />
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#1a2e24', margin: 0 }}>{selectedCourse.durationWeeks || 4}</p>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Weeks</p>
                </div>
                <div style={{ background: '#f8faf9', borderRadius: 16, padding: '16px 20px', textAlign: 'center' }}>
                  <GraduationCap size={22} color="#2d6a4f" style={{ margin: '0 auto 6px' }} />
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#1a2e24', margin: 0 }}>{selectedCourse.level?.[0]}</p>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{selectedCourse.level}</p>
                </div>
              </div>

              {/* Mentor info */}
              {selectedCourse.mentorId && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                  background: '#f0fdf4', borderRadius: 16, marginBottom: 28, border: '1px solid #bbf7d0',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: 'linear-gradient(135deg, #2d6a4f, #40916c)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 18, color: '#fff', flexShrink: 0,
                  }}>
                    {selectedCourse.mentorId.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1a2e24', margin: 0 }}>Created by {selectedCourse.mentorId.name}</p>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{selectedCourse.mentorId.email}</p>
                  </div>
                </div>
              )}

              {/* Action */}
              {req ? (
                <div style={{
                  padding: '16px 24px', borderRadius: 16, textAlign: 'center',
                  background: req.status === 'pending' ? '#fffbeb' : req.status === 'accepted' ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${req.status === 'pending' ? '#fde68a' : req.status === 'accepted' ? '#86efac' : '#fecaca'}`,
                }}>
                  <p style={{ fontSize: 16, fontWeight: 700, margin: 0, color: req.status === 'pending' ? '#92400e' : req.status === 'accepted' ? '#15803d' : '#dc2626' }}>
                    {req.status === 'pending' ? '⏳ Request Pending — Waiting for mentor approval' :
                     req.status === 'accepted' ? '✅ Enrolled — You have full access!' :
                     '❌ Request Declined — Try a different mentor'}
                  </p>
                  {req.status === 'rejected' && req.rejectionReason && (
                    <div style={{ marginTop: 12, padding: '12px 16px', background: '#fff', borderRadius: 12, border: '1px solid #fecaca', textAlign: 'left' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>Mentor's Reason</p>
                      <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>"{req.rejectionReason}"</p>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowMentorSelect(true)}
                  style={{
                    width: '100%', padding: '16px 24px', borderRadius: 16,
                    background: 'linear-gradient(135deg, #2d6a4f, #1a4731)',
                    color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: '0 6px 24px rgba(45,106,79,0.3)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Users size={20} /> Enroll — Choose Your Mentor
                </button>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── MAIN COURSE GRID ──────────────────────────────────
  return (
    <DashboardLayout>
      <PageHeader title="Browse Courses" subtitle="Find courses and request a mentor to begin your learning journey" />

      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{
          flex: 1, minWidth: 240, display: 'flex', alignItems: 'center', gap: 10,
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '10px 16px',
        }}>
          <Search size={16} color="#9ca3af" />
          <input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 14, color: '#374151', width: '100%', background: 'none', fontFamily: "'Inter', sans-serif" }} />
        </div>
        <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: 14, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
          <option value="">All Levels</option>
          <option value="Beginner">🟢 Beginner</option>
          <option value="Intermediate">🟡 Intermediate</option>
          <option value="Advanced">🔴 Advanced</option>
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: 14, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses found" description="No approved courses available yet. Check back later." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {filtered.map((course) => {
            const req = getRequestStatus(course._id);
            return (
              <div key={course._id}
                onClick={() => setSelectedCourse(course)}
                style={{
                  background: '#fff', borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
                  border: '1px solid #f3f4f6', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = '#2d6a4f';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                  e.currentTarget.style.borderColor = '#f3f4f6';
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  height: 160, position: 'relative',
                  background: course.thumbnail
                    ? `url(${course.thumbnail}) center/cover`
                    : 'linear-gradient(135deg, #1a4731 0%, #2d6a4f 40%, #52b788 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {!course.thumbnail && <BookOpen size={40} color="rgba(255,255,255,0.12)" />}

                  {/* Level badge */}
                  <div style={{ position: 'absolute', top: 14, right: 14 }}>
                    <span style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: levelBg[course.level] || '#f3f4f6',
                      color: levelColor[course.level] || '#374151',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}>
                      {course.level}
                    </span>
                  </div>

                  {/* Status overlay */}
                  {req && (
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 16px',
                      background: req.status === 'pending' ? 'rgba(245,158,11,0.9)' : req.status === 'accepted' ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
                      color: '#fff', fontSize: 12, fontWeight: 700, textAlign: 'center',
                    }}>
                      {req.status === 'pending' ? '⏳ Pending Approval' : req.status === 'accepted' ? '✅ Enrolled' : '❌ Rejected'}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '20px 22px' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 6px 0' }}>
                    {course.category}
                  </p>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1a2e24', margin: '0 0 8px 0', lineHeight: 1.3 }}>
                    {course.title}
                  </h3>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5, margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description}
                  </p>

                  {/* Meta */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {course.mentorId && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: 'linear-gradient(135deg, #2d6a4f, #40916c)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 12, color: '#fff',
                        }}>
                          {course.mentorId.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{course.mentorId.name}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Layers size={13} color="#9ca3af" />
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>{course.modules?.length || 0} modules</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default BrowseCourses;
