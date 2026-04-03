/**
 * Generates a printable HTML certificate string.
 * This can be returned as a URL-safe string or rendered server-side.
 */
const generateCertificateHTML = ({ studentName, courseName, mentorName, issuedAt }) => {
  const date = new Date(issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap');
    body { margin: 0; padding: 40px; background: #f8fafc; font-family: 'Inter', sans-serif; }
    .cert {
      max-width: 800px; margin: 0 auto; background: white;
      border: 8px solid #059669; border-radius: 12px; padding: 60px;
      text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }
    .logo { font-size: 28px; font-weight: 700; color: #059669; margin-bottom: 8px; }
    .subtitle { color: #64748b; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 40px; }
    h1 { font-family: 'Playfair Display', serif; font-size: 48px; color: #0f172a; margin: 0 0 8px; }
    .presents { color: #64748b; font-size: 16px; margin-bottom: 24px; }
    .student-name { font-family: 'Playfair Display', serif; font-size: 40px; color: #059669; border-bottom: 2px solid #059669; display: inline-block; padding-bottom: 8px; margin-bottom: 24px; }
    .desc { color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 32px; }
    .course-name { font-weight: 700; color: #0f172a; font-size: 20px; }
    .footer { display: flex; justify-content: space-between; margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
    .sig { text-align: center; }
    .sig-line { width: 160px; height: 2px; background: #0f172a; margin: 8px auto; }
    .sig-name { font-weight: 600; color: #0f172a; font-size: 14px; }
    .sig-title { color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="cert">
    <div class="logo">🌉 Skill Bridge Ethiopia</div>
    <div class="subtitle">Certificate of Completion</div>
    <h1>Certificate</h1>
    <p class="presents">This is to certify that</p>
    <div class="student-name">${studentName}</div>
    <p class="desc">has successfully completed the course<br/>
      <span class="course-name">${courseName}</span><br/>
      with dedication and excellence.
    </p>
    <div class="footer">
      <div class="sig">
        <div class="sig-line"></div>
        <div class="sig-name">${mentorName}</div>
        <div class="sig-title">Course Mentor</div>
      </div>
      <div class="sig">
        <div class="sig-line"></div>
        <div class="sig-name">${date}</div>
        <div class="sig-title">Date of Issue</div>
      </div>
      <div class="sig">
        <div class="sig-line"></div>
        <div class="sig-name">Skill Bridge Ethiopia</div>
        <div class="sig-title">Platform Director</div>
      </div>
    </div>
  </div>
</body>
</html>`;
};

module.exports = { generateCertificateHTML };
