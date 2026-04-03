const express = require('express');
const router = express.Router();
const { requestCertificate, respondToCertificateRequest, getCertificateRequests, getMyCertificates, viewCertificate, getCertifiedStudents } = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { checkApproval } = require('../middleware/approvalMiddleware');
const { checkBlock } = require('../middleware/blockMiddleware');

const guard = [protect, checkBlock, checkApproval];

router.get('/students', ...guard, authorizeRoles('employer', 'admin'), getCertifiedStudents);
router.get('/mine', ...guard, authorizeRoles('student'), getMyCertificates);
router.get('/requests', ...guard, authorizeRoles('student', 'mentor'), getCertificateRequests);
router.post('/request', ...guard, authorizeRoles('student'), requestCertificate);
router.patch('/request/:id', ...guard, authorizeRoles('mentor'), respondToCertificateRequest);
router.get('/:id/view', protect, viewCertificate);

module.exports = router;
