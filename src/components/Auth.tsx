import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, Droplets, Mail, Lock } from 'lucide-react';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = mode === 'login' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="glass-panel fade-in" style={{ maxWidth: '450px', width: '100%', padding: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '1rem', 
            background: 'var(--accent-color)', 
            borderRadius: '1.25rem',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 16px rgba(79, 70, 229, 0.4)'
          }}>
            <Droplets size={40} color="white" />
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Fuel <span style={{ color: 'var(--accent-color)' }}>Log</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Please {mode === 'login' ? 'login' : 'sign up'} to continue
          </p>
        </div>

        <form onSubmit={handleAuth}>
          <div className="input-group">
            <label className="label">
              <Mail size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} /> Email
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>
          <div className="input-group">
            <label className="label">
              <Lock size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} /> Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>

          {error && (
            <div style={{ color: 'var(--danger-color)', fontSize: '0.875rem', marginBottom: '1.25rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? (
              'Processing...'
            ) : mode === 'login' ? (
              <><LogIn size={18} /> Sign In</>
            ) : (
              <><UserPlus size={18} /> Create Account</>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--accent-color)', 
                fontWeight: 600, 
                marginLeft: '0.5rem', 
                cursor: 'pointer' 
              }}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
