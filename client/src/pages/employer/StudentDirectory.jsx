import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import { apiGetCertifiedStudents } from '../../api';
import { Award, Search, ExternalLink } from 'lucide-react';

const StudentDirectory = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiGetCertifiedStudents()
      .then((res) => setCerts(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Group by student
  const studentsMap = {};
  certs.forEach((cert) => {
    const sid = cert.studentId?._id;
    if (!sid) return;
    if (!studentsMap[sid]) {
      studentsMap[sid] = { student: cert.studentId, certs: [] };
    }
    studentsMap[sid].certs.push(cert);
  });

  const studentList = Object.values(studentsMap).filter((s) =>
    s.student?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="spinner" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Talent Pool" subtitle={`${studentList.length} certified students available`} />

      <div className="relative mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input-field pl-9" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {studentList.length === 0 ? (
        <div className="glass p-12 text-center">
          <Award size={36} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No certified students yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studentList.map(({ student, certs: studentCerts }) => (
            <div key={student._id} className="glass p-5 hover:border-emerald-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="avatar text-lg">{student.name?.[0]}</div>
                <div>
                  <h3 className="font-bold text-white">{student.name}</h3>
                  <p className="text-xs text-slate-400">{student.email}</p>
                </div>
              </div>

              {student.bio && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{student.bio}</p>}

              {student.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {student.skills.map((skill) => (
                    <span key={skill} className="badge badge-slate text-xs">{skill}</span>
                  ))}
                </div>
              )}

              <div className="border-t border-white/5 pt-3">
                <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Certificates ({studentCerts.length})</p>
                <div className="space-y-1">
                  {studentCerts.map((cert) => (
                    <div key={cert._id} className="flex items-center justify-between">
                      <span className="text-xs text-emerald-300">🏆 {cert.courseId?.title}</span>
                      <a href={`/api/certificates/${cert._id}/view`} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-emerald-400 transition-colors">
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentDirectory;
