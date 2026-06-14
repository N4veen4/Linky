import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../utils/api';
import logoL from '../assets/Linky_L-removebg-preview.png';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Auth({ initialMode = 'login', onAuthSuccess, showToast }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [gsiReady, setGsiReady] = useState(false);
  const googleDivRef = useRef(null);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
  };

  const handleGoogleCredential = useCallback(
    async (response) => {
      setError('');
      setGoogleLoading(true);
      try {
        const result = await api.googleAuth(response.credential);
        if (result.token && result.user) {
          localStorage.setItem('token', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
          showToast('Signed in with Google!', 'success');
          onAuthSuccess(result.user);
        }
      } catch (err) {
        const msg = err.message || 'Google sign-in failed. Please try again.';
        setError(msg);
        showToast(msg, 'error');
      } finally {
        setGoogleLoading(false);
      }
    },
    [onAuthSuccess, showToast]
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const initAndRender = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      if (googleDivRef.current) {
        window.google.accounts.id.renderButton(googleDivRef.current, {
          type: 'standard', theme: 'filled_black', size: 'large',
          text: 'continue_with', shape: 'rectangular', width: 400,
        });
      }
      setGsiReady(true);
    };

    if (window.google?.accounts?.id) { initAndRender(); return; }
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) { existingScript.addEventListener('load', initAndRender); return; }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initAndRender;
    document.head.appendChild(script);
    return () => { window.google?.accounts?.id?.cancel?.(); };
  }, [handleGoogleCredential]);

  useEffect(() => {
    if (gsiReady && googleDivRef.current && window.google?.accounts?.id) {
      window.google.accounts.id.renderButton(googleDivRef.current, {
        type: 'standard', theme: 'filled_black', size: 'large',
        text: 'continue_with', shape: 'rectangular', width: 400,
      });
    }
  }, [gsiReady]);

  const handleGoogleClick = () => {
    if (googleLoading || loading) return;
    setError('');
    const googleBtn = googleDivRef.current?.querySelector('div[role="button"], button');
    if (googleBtn) {
      googleBtn.click();
      setGoogleLoading(true);
      setTimeout(() => setGoogleLoading(false), 15000);
    } else {
      setError('Google Sign-In is not ready yet. Please wait a moment.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let response;
      if (isLogin) {
        if (!email || !password) throw new Error('Please fill in all fields');
        response = await api.login(email, password);
        showToast('Welcome back!', 'success');
      } else {
        if (!username || !email || !password) throw new Error('Please fill in all fields');
        response = await api.signup(username, email, password);
        showToast('Account created!', 'success');
      }
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        onAuthSuccess(response.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[var(--bg-primary)]">

      {/* Hidden Google rendered div */}
      <div ref={googleDivRef} aria-hidden="true"
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '400px', height: '44px', overflow: 'hidden', zIndex: -1 }}
      />

      {/* Background glow & Floating Icons */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-40 right-0 w-[400px] h-[400px] bg-blue-600/8 blur-[100px] rounded-full" />
        {/* Floating icons grid */}
        <div className="absolute inset-0 overflow-hidden opacity-[0.06]">
          {[...Array(24)].map((_, i) => (
            <div key={i}
              className="absolute text-violet-400"
              style={{
                left: `${(i % 8) * 14 + Math.random() * 6}%`,
                top: `${Math.floor(i / 8) * 35 + Math.random() * 20}%`,
                fontSize: '20px',
                animation: `pulse ${2 + (i % 3)}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}>
              {['🔗', '📊', '🛡', '⚡', '📌', '🔒'][i % 6]}
            </div>
          ))}
        </div>
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 relative z-10">
          <motion.div
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl mb-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 w-6 h-6 overflow-hidden shrink-0">
              <img src={logoL} alt="Linky Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">𝓛𝓲𝓷𝓴𝔂</span>
          </motion.div>
          <p className="text-[var(--text-muted)] text-sm text-center">
            {isLogin ? 'Shorten URLs, track insights, and optimize clicks.' : 'Create an account to start managing your links.'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 shadow-2xl relative"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', backdropFilter: 'blur(20px)' }}>

          {/* Title */}
          <AnimatePresence mode="wait">
            <motion.h2
              key={isLogin ? 'login' : 'signup'}
              className="text-2xl font-black text-[var(--text-main)] mb-6"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {isLogin ? 'Welcome Back 👋' : 'Get Started ✨'}
            </motion.h2>
          </AnimatePresence>

          {/* Google Button */}
          <motion.button
            type="button"
            id="google-signin-btn"
            onClick={handleGoogleClick}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 font-semibold py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer select-none disabled:opacity-60 disabled:cursor-not-allowed mb-5"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
            whileHover={{ opacity: 0.9 }}
            whileTap={{ scale: 0.98 }}
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[var(--text-muted)]" />
            ) : (
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            <span className="text-sm text-[var(--text-main)]">Continue with Google</span>
          </motion.button>

          {/* Divider */}
          <div className="relative flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border-strong)' }} />
            <span className="text-xs text-[var(--text-muted)] font-medium tracking-widest uppercase">or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-strong)' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username — signup only */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-5 w-5 text-[var(--text-muted)]" />
                    <input
                      type="text" required placeholder="john_doe"
                      value={username} onChange={(e) => setUsername(e.target.value)}
                      className="input-theme w-full rounded-xl py-3 pl-11 pr-4 text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-[var(--text-muted)]" />
                <input
                  type="email" required placeholder="name@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input-theme w-full rounded-xl py-3 pl-11 pr-4 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-[var(--text-muted)] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'} required
                  placeholder="••••••••" value={password}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-theme w-full rounded-xl py-3 pl-11 pr-11 text-sm [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-3.5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Message underneath password */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl text-[var(--error)] text-sm"
                  style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-white shadow-lg cursor-pointer transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 shadow-violet-500/20 mt-6 flex items-center justify-center gap-2"
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : isLogin ? 'Sign In' : 'Create Account'}
            </motion.button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <button onClick={toggleMode} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] font-medium transition-colors cursor-pointer">
              {isLogin ? "Don't have an account? Sign Up →" : 'Already have an account? Sign In →'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
