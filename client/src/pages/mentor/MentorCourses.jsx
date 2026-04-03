import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { apiGetCourses, apiCreateCourse, apiUpdateCourse, apiDeleteCourse, apiGetModules, apiCreateModule, apiDeleteModule, apiGetLessons, apiCreateLesson, apiDeleteLesson, apiCreateTest, apiGetTests, apiUploadFile } from '../../api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, BookOpen, Play, FileText, Clock, Layers, Link as LinkIcon, HelpCircle, CheckCircle, Upload } from 'lucide-react';

const typeIcon = { video: Play, note: FileText, pdf: FileText, link: LinkIcon };
const typeColor = { video: '#3b82f6', note: '#10b981', pdf: '#f59e0b', link: '#8b5cf6' };

const MentorCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [modules, setModules] = useState({});
  const [lessons, setLessons] = useState({});
  const [tests, setTests] = useState({});
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(null);
  const [showLessonModal, setShowLessonModal] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(null); // { courseId, moduleId }
  const [courseForm, setCourseForm] = useState({ title: '', description: '', category: 'General', level: 'Beginner', thumbnail: '', durationWeeks: 4 });
  const [moduleForm, setModuleForm] = useState({ title: '', order: 0 });
  const [lessonForm, setLessonForm] = useState({ title: '', type: 'video', contentUrl: '', order: 0, duration: '' });
  const [quizForm, setQuizForm] = useState({
    title: '', questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0 }],
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = async () => {
    try {
      const res = await apiGetCourses();
      setCourses(res.data.data || []);
    } catch { toast.error('Failed to load courses'); }
    finally { setLoading(false); }
  };

  const loadModules = async (courseId) => {
    const res = await apiGetModules(courseId);
    const mods = res.data.data || [];
    setModules((prev) => ({ ...prev, [courseId]: mods }));
    for (const mod of mods) await loadLessons(mod._id);
    // Load tests
    try {
      const tRes = await apiGetTests(courseId);
      setTests((prev) => ({ ...prev, [courseId]: tRes.data.data || [] }));
    } catch {}
  };

  const loadLessons = async (moduleId) => {
    const res = await apiGetLessons(moduleId);
    setLessons((prev) => ({ ...prev, [moduleId]: res.data.data || [] }));
  };

  const toggleCourse = async (courseId) => {
    if (expandedCourse === courseId) { setExpandedCourse(null); return; }
    setExpandedCourse(courseId);
    if (!modules[courseId]) await loadModules(courseId);
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiCreateCourse(courseForm);
      toast.success('Course created! Pending admin approval.');
      setShowCourseModal(false);
      setCourseForm({ title: '', description: '', category: 'General', level: 'Beginner', thumbnail: '', durationWeeks: 4 });
      await loadCourses();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteCourse = async (id) => {
    if (!confirm('Delete this course?')) return;
    try { await apiDeleteCourse(id); toast.success('Course deleted'); await loadCourses(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiCreateModule({ ...moduleForm, courseId: showModuleModal });
      toast.success('Module added!');
      await loadModules(showModuleModal);
      setShowModuleModal(null);
      setModuleForm({ title: '', order: 0 });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteModule = async (moduleId, courseId) => {
    if (!confirm('Delete this module?')) return;
    try { await apiDeleteModule(moduleId); await loadModules(courseId); toast.success('Module deleted'); }
    catch { toast.error('Failed'); }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let contentUrl = lessonForm.contentUrl;

      // If a file is selected, upload it first
      if (uploadFile) {
        setUploading(true);
        const uploadRes = await apiUploadFile(uploadFile);
        contentUrl = uploadRes.data.data.url;
        setUploading(false);
      }

      if (!contentUrl) {
        toast.error('Please upload a file or enter a URL');
        setSubmitting(false);
        return;
      }

      await apiCreateLesson({ ...lessonForm, contentUrl, moduleId: showLessonModal });
      toast.success('Lesson added!');
      await loadLessons(showLessonModal);
      setShowLessonModal(null);
      setLessonForm({ title: '', type: 'video', contentUrl: '', order: 0, duration: '' });
      setUploadFile(null);
      setUploadProgress(0);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); setUploading(false); }
    finally { setSubmitting(false); }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (quizForm.questions.some(q => !q.questionText.trim() || q.options.some(o => !o.trim()))) {
      return toast.error('Fill in all question fields and options');
    }
    setSubmitting(true);
    try {
      await apiCreateTest({
        title: quizForm.title || `Module Quiz`,
        type: 'module',
        courseId: showQuizModal.courseId,
        moduleId: showQuizModal.moduleId,
        questions: quizForm.questions,
        passingScore: 70,
      });
      toast.success('Quiz created with 70% pass mark! 🎯');
      await loadModules(showQuizModal.courseId);
      setShowQuizModal(null);
      setQuizForm({ title: '', questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0 }] });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const addQuestion = () => {
    setQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }],
    }));
  };

  const updateQuestion = (qi, field, val) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === qi ? { ...q, [field]: val } : q),
    }));
  };

  const updateOption = (qi, oi, val) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === qi ? { ...q, options: q.options.map((o, j) => j === oi ? val : o) } : q),
    }));
  };

  const removeQuestion = (qi) => {
    if (quizForm.questions.length <= 1) return;
    setQuizForm(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== qi) }));
  };

  if (loading) return <DashboardLayout><div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader
        title="My Courses"
        subtitle="Create and manage your course content"
        action={<button onClick={() => setShowCourseModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #2d6a4f, #1a4731)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(45,106,79,0.3)' }}><Plus size={16} /> New Course</button>}
      />

      {courses.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 20, padding: 60, textAlign: 'center', border: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📚</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1a2e24', marginBottom: 8 }}>No courses yet</h3>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Create your first course to start teaching!</p>
          <button onClick={() => setShowCourseModal(true)} style={{ padding: '12px 28px', borderRadius: 12, background: 'linear-gradient(135deg, #2d6a4f, #1a4731)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>Create Course</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {courses.map((course) => {
            const courseModules = modules[course._id] || [];
            const courseTests = tests[course._id] || [];
            return (
              <div key={course._id} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #f3f4f6', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}>
                {/* Course Header */}
                <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <button onClick={() => toggleCourse(course._id)} style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #2d6a4f, #40916c)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BookOpen size={22} color="#fff" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2e24', margin: 0 }}>{course.title}</h3>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: course.isApproved ? '#ecfdf5' : '#fffbeb', color: course.isApproved ? '#15803d' : '#92400e' }}>
                          {course.isApproved ? '✅ Approved' : '⏳ Pending'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6b7280' }}>
                        <span>{course.category}</span>
                        <span>{course.level}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {course.durationWeeks || 4} weeks</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Layers size={12} /> {courseModules.length} modules</span>
                      </div>
                    </div>
                    {expandedCourse === course._id ? <ChevronDown size={18} color="#9ca3af" /> : <ChevronRight size={18} color="#9ca3af" />}
                  </button>
                  <button onClick={() => handleDeleteCourse(course._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: 8, borderRadius: 8, transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}>
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Expanded Modules */}
                {expandedCourse === course._id && (
                  <div style={{ borderTop: '1px solid #f3f4f6', background: '#fafbfc', padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#374151', margin: 0 }}>
                        Modules ({courseModules.length})
                      </p>
                      <button onClick={() => setShowModuleModal(course._id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#ecfdf5', color: '#15803d', fontWeight: 600, fontSize: 13, border: '1px solid #86efac', cursor: 'pointer' }}>
                        <Plus size={14} /> Add Module
                      </button>
                    </div>

                    {courseModules.length === 0 && (
                      <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', background: '#fff', borderRadius: 14, border: '1px dashed #e5e7eb' }}>
                        <Layers size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                        <p style={{ fontSize: 14, fontWeight: 600 }}>No modules yet</p>
                        <p style={{ fontSize: 12 }}>Add at least 4 modules for admin approval</p>
                      </div>
                    )}

                    {courseModules.map((mod, i) => {
                      const modLessons = lessons[mod._id] || [];
                      const modTest = courseTests.find(t => t.moduleId === mod._id);
                      return (
                        <div key={mod._id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', marginBottom: 12, overflow: 'hidden' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px' }}>
                            <span style={{ width: 28, height: 28, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#2d6a4f' }}>{i + 1}</span>
                            <p style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#1a2e24', margin: 0 }}>{mod.title}</p>
                            <button onClick={() => setShowLessonModal(mod._id)}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, background: '#eff6ff', color: '#1d4ed8', fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer' }}>
                              <Plus size={12} /> Lesson
                            </button>
                            {!modTest && (
                              <button onClick={() => setShowQuizModal({ courseId: course._id, moduleId: mod._id })}
                                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, background: '#fffbeb', color: '#92400e', fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer' }}>
                                <HelpCircle size={12} /> Quiz
                              </button>
                            )}
                            <button onClick={() => handleDeleteModule(mod._id, course._id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: 4 }}
                              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                              onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                          {/* Lessons */}
                          {modLessons.map(lesson => {
                            const Icon = typeIcon[lesson.type] || FileText;
                            return (
                              <div key={lesson._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px 10px 36px', borderTop: '1px solid #f3f4f6' }}>
                                <Icon size={14} color={typeColor[lesson.type]} />
                                <span style={{ fontSize: 13, color: '#374151', flex: 1 }}>{lesson.title}</span>
                                <span style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>{lesson.type}</span>
                                {lesson.duration && <span style={{ fontSize: 11, color: '#d1d5db' }}>{lesson.duration}</span>}
                              </div>
                            );
                          })}
                          {/* Quiz indicator */}
                          {modTest && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px 10px 36px', borderTop: '1px solid #f3f4f6', background: '#fffbeb' }}>
                              <HelpCircle size={14} color="#f59e0b" />
                              <span style={{ fontSize: 13, color: '#92400e', fontWeight: 600, flex: 1 }}>📝 {modTest.title} ({modTest.questions?.length || 0} questions • 70% pass)</span>
                              <CheckCircle size={14} color="#22c55e" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Create Course Modal ─── */}
      {showCourseModal && (
        <Modal title="Create New Course" onClose={() => setShowCourseModal(false)}>
          <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Title</label>
              <input style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', fontFamily: "'Inter', sans-serif" }}
                placeholder="Course title" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Description</label>
              <textarea style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, resize: 'none', outline: 'none', fontFamily: "'Inter', sans-serif" }}
                rows={3} placeholder="What will students learn?" value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Category</label>
                <input style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', fontFamily: "'Inter', sans-serif" }}
                  placeholder="e.g. Programming" value={courseForm.category} onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Level</label>
                <select style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', fontFamily: "'Inter', sans-serif" }}
                  value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}>
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Duration (weeks)</label>
                <input type="number" min={1} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', fontFamily: "'Inter', sans-serif" }}
                  value={courseForm.durationWeeks} onChange={(e) => setCourseForm({ ...courseForm, durationWeeks: parseInt(e.target.value) || 4 })} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Thumbnail URL (optional)</label>
              <input style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', fontFamily: "'Inter', sans-serif" }}
                placeholder="https://..." value={courseForm.thumbnail} onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => setShowCourseModal(false)} style={{ flex: 1, padding: '12px 20px', borderRadius: 12, background: '#f3f4f6', color: '#374151', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
              <button type="submit" disabled={submitting} style={{ flex: 1, padding: '12px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #2d6a4f, #1a4731)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 14 }}>{submitting ? 'Creating...' : 'Create Course'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── Add Module Modal ─── */}
      {showModuleModal && (
        <Modal title="Add Module" onClose={() => setShowModuleModal(null)}>
          <form onSubmit={handleCreateModule} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Module Title</label>
              <input style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', fontFamily: "'Inter', sans-serif" }}
                placeholder="e.g. Introduction to JavaScript" value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Order</label>
              <input type="number" style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', fontFamily: "'Inter', sans-serif" }}
                value={moduleForm.order} onChange={(e) => setModuleForm({ ...moduleForm, order: parseInt(e.target.value) })} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => setShowModuleModal(null)} style={{ flex: 1, padding: '12px 20px', borderRadius: 12, background: '#f3f4f6', color: '#374151', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
              <button type="submit" disabled={submitting} style={{ flex: 1, padding: '12px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #2d6a4f, #1a4731)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 14 }}>{submitting ? 'Adding...' : 'Add Module'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── Add Lesson Modal ─── */}
      {showLessonModal && (
        <Modal title="Add Lesson" onClose={() => setShowLessonModal(null)}>
          <form onSubmit={handleCreateLesson} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Lesson Title</label>
              <input style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', fontFamily: "'Inter', sans-serif" }}
                placeholder="Lesson name" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Type</label>
                <select style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', fontFamily: "'Inter', sans-serif" }}
                  value={lessonForm.type} onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value })}>
                  <option value="video">🎥 Video</option>
                  <option value="note">📝 Note</option>
                  <option value="pdf">📄 PDF</option>
                  <option value="link">🔗 External Link</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Duration</label>
                <input style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', fontFamily: "'Inter', sans-serif" }}
                  placeholder="e.g. 12 min" value={lessonForm.duration} onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                {lessonForm.type === 'link' ? 'External URL' : 'Upload File or Enter URL'}
              </label>

              {/* File Upload Area */}
              {lessonForm.type !== 'link' && (
                <div style={{ marginBottom: 10 }}>
                  <label style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '20px 16px', borderRadius: 12, cursor: 'pointer',
                    border: `2px dashed ${uploadFile ? '#2d6a4f' : '#d1d5db'}`,
                    background: uploadFile ? '#f0faf3' : '#fafbfc',
                    transition: 'all 0.2s',
                  }}>
                    <Upload size={24} color={uploadFile ? '#2d6a4f' : '#9ca3af'} />
                    <p style={{ fontSize: 13, color: uploadFile ? '#2d6a4f' : '#6b7280', marginTop: 8, fontWeight: 600, textAlign: 'center' }}>
                      {uploadFile ? uploadFile.name : 'Click to upload a file'}
                    </p>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                      {lessonForm.type === 'video' ? 'MP4, WebM, OGG (max 500MB)' : 'PDF, DOCX, PPT, Images'}
                    </p>
                    <input type="file" style={{ display: 'none' }}
                      accept={lessonForm.type === 'video' ? 'video/*' : lessonForm.type === 'pdf' ? '.pdf,.doc,.docx,.ppt,.pptx' : '*'}
                      onChange={(e) => { if (e.target.files[0]) { setUploadFile(e.target.files[0]); setLessonForm({ ...lessonForm, contentUrl: '' }); } }}
                    />
                  </label>
                  {uploadFile && (
                    <button type="button" onClick={() => setUploadFile(null)}
                      style={{ fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4, fontWeight: 600 }}>
                      ✕ Remove file
                    </button>
                  )}
                </div>
              )}

              {/* OR divider */}
              {lessonForm.type !== 'link' && !uploadFile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0' }}>
                  <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                  <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>OR paste URL</span>
                  <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                </div>
              )}

              {/* URL fallback input */}
              {(!uploadFile || lessonForm.type === 'link') && (
                <input style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', fontFamily: "'Inter', sans-serif" }}
                  placeholder={lessonForm.type === 'video' ? 'YouTube or video URL' : lessonForm.type === 'link' ? 'Any URL' : 'Google Drive / URL'}
                  value={lessonForm.contentUrl} onChange={(e) => setLessonForm({ ...lessonForm, contentUrl: e.target.value })}
                  required={!uploadFile} />
              )}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => setShowLessonModal(null)} style={{ flex: 1, padding: '12px 20px', borderRadius: 12, background: '#f3f4f6', color: '#374151', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
              <button type="submit" disabled={submitting || uploading} style={{ flex: 1, padding: '12px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #2d6a4f, #1a4731)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 14 }}>{uploading ? 'Uploading file...' : submitting ? 'Adding...' : 'Add Lesson'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── Quiz Builder Modal ─── */}
      {showQuizModal && (
        <Modal title="Create Module Quiz" onClose={() => setShowQuizModal(null)}>
          <form onSubmit={handleCreateQuiz} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ padding: '12px 16px', borderRadius: 12, background: '#fffbeb', border: '1px solid #fde68a' }}>
              <p style={{ fontSize: 13, color: '#92400e', fontWeight: 600, margin: 0 }}>
                📝 Students must score <strong>70%</strong> or higher to pass and unlock the next module. They can retry.
              </p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Quiz Title</label>
              <input style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', fontFamily: "'Inter', sans-serif" }}
                placeholder="e.g. Module 1 Quiz" value={quizForm.title} onChange={e => setQuizForm({ ...quizForm, title: e.target.value })} required />
            </div>

            {quizForm.questions.map((q, qi) => (
              <div key={qi} style={{ padding: 16, borderRadius: 14, background: '#f8faf9', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1a2e24', margin: 0 }}>Question {qi + 1}</p>
                  {quizForm.questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(qi)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Remove</button>
                  )}
                </div>
                <input style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, marginBottom: 10, outline: 'none', fontFamily: "'Inter', sans-serif" }}
                  placeholder="Enter question..." value={q.questionText} onChange={e => updateQuestion(qi, 'questionText', e.target.value)} required />
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <input type="radio" name={`correct-${qi}`} checked={q.correctAnswer === oi}
                      onChange={() => updateQuestion(qi, 'correctAnswer', oi)} style={{ accentColor: '#2d6a4f' }} />
                    <input style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: `1px solid ${q.correctAnswer === oi ? '#86efac' : '#e5e7eb'}`, fontSize: 13, outline: 'none', background: q.correctAnswer === oi ? '#f0fdf4' : '#fff', fontFamily: "'Inter', sans-serif" }}
                      placeholder={`Option ${oi + 1}`} value={opt} onChange={e => updateOption(qi, oi, e.target.value)} required />
                    {q.correctAnswer === oi && <span style={{ fontSize: 11, color: '#15803d', fontWeight: 700 }}>✓ Correct</span>}
                  </div>
                ))}
              </div>
            ))}

            <button type="button" onClick={addQuestion}
              style={{ padding: '10px 16px', borderRadius: 10, background: '#fff', color: '#2d6a4f', fontWeight: 600, fontSize: 13, border: '1px dashed #86efac', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Plus size={14} /> Add Another Question
            </button>

            <div style={{ display: 'flex', gap: 12, position: 'sticky', bottom: 0, background: '#fff', paddingTop: 10 }}>
              <button type="button" onClick={() => setShowQuizModal(null)} style={{ flex: 1, padding: '12px 20px', borderRadius: 12, background: '#f3f4f6', color: '#374151', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
              <button type="submit" disabled={submitting} style={{ flex: 1, padding: '12px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 14 }}>{submitting ? 'Creating...' : 'Create Quiz (70% pass)'}</button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default MentorCourses;
