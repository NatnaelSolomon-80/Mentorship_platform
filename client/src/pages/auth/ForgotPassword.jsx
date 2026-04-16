import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiForgotPassword } from '../../api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await apiForgotPassword({ email });
      toast.success(data?.message || 'If the email exists, reset instructions were sent.');
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process reset request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8faf9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: 28, boxShadow: '0 12px 28px rgba(15,23,42,0.08)' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#2d6a4f', textDecoration: 'none', fontWeight: 700, marginBottom: 18 }}>
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e24', marginBottom: 8 }}>Forgot Password</h1>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 20 }}>
          Enter your account email. If it exists, we will send a reset link.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155' }}>
            Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} color="#94a3b8" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 12 }} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: 12, padding: '11px 12px 11px 36px', outline: 'none', fontSize: 14 }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: 6, background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2d6a4f, #1a4731)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 14px', fontSize: 14, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? 'Sending...' : <>Send Reset Link <Send size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
