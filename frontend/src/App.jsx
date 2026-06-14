import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Moon,
  Sun,
  Link as LinkIcon,
  ArrowRight,
  X,
  Loader2,
  Shield,
  Zap,
  BarChart3,
  Cloud,
  QrCode,
  Clock,
  Lock,
  Globe,
  ChevronRight,
  Check,
  Star,
  Users,
  MousePointerClick,
} from 'lucide-react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AnalyticsView from './components/AnalyticsView';
import { api } from './utils/api';
import logoL from './assets/Linky_L-removebg-preview.png';

export default function App() {
  const [user, setUser]                 = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentHash, setCurrentHash]   = useState(window.location.hash);
  const [toasts, setToasts]             = useState([]);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('user', JSON.stringify(res.user));
          } else {
            throw new Error('Invalid token');
          }
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setCheckingAuth(false);
    };
    verifyToken();

    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    window.location.hash = '#/dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.hash = '#/';
    showToast('Logged out successfully', 'success');
  };

  const parseRoute = () => {
    const hash = currentHash || '#/';
    if (hash.startsWith('#/analytics/')) {
      const parts = hash.split('/');
      return { route: 'analytics', shortCode: parts[2] };
    }
    if (hash === '#/login')     return { route: 'login' };
    if (hash === '#/signup')    return { route: 'signup' };
    if (hash === '#/dashboard') return { route: 'dashboard' };
    return { route: 'landing' };
  };

  const { route, shortCode } = parseRoute();

  useEffect(() => {
    if (checkingAuth) return;
    if (!user) {
      if (route === 'dashboard') window.location.hash = '#/login';
    } else {
      if (route === 'login' || route === 'signup' || route === 'landing') {
        window.location.hash = '#/dashboard';
      }
    }
  }, [user, route, checkingAuth]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
          <p className="text-slate-400 text-sm font-medium tracking-wide">Synchronizing session...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (route) {
      case 'login':
        return <Auth initialMode="login"  onAuthSuccess={handleAuthSuccess} showToast={showToast} />;
      case 'signup':
        return <Auth initialMode="signup" onAuthSuccess={handleAuthSuccess} showToast={showToast} />;
      case 'dashboard':
        return user ? (
          <Dashboard
            user={user} onLogout={handleLogout} showToast={showToast}
            onViewAnalytics={(code) => { window.location.hash = `#/analytics/${code}`; }}
          />
        ) : null;
      case 'analytics':
        return (
          <AnalyticsView
            shortCode={shortCode} isLoggedIn={!!user}
            onBack={() => { window.location.hash = user ? '#/dashboard' : '#/'; }}
            showToast={showToast}
          />
        );
      case 'landing':
      default:
        return (
          <LandingPage
            onGetStarted={() => { window.location.hash = '#/signup'; }}
            onLogin={() => { window.location.hash = '#/login'; }}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        );
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={route}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full min-h-screen"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>

      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3 border pointer-events-auto ${
                toast.type === 'error'
                  ? 'bg-[#1a0808]/95 border-rose-500/25 text-rose-200'
                  : 'bg-[#0d1a1f]/95 border-violet-500/25 text-violet-200'
              } backdrop-blur-md`}
            >
              <span className="text-xs font-semibold">{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   LANDING PAGE — Multi-section, inspired by reference screenshots
───────────────────────────────────────────────────────────────── */
function LandingPage({ onGetStarted, onLogin, theme, toggleTheme }) {
  const [urlInput, setUrlInput] = useState('');

  const navLinks = ['Platform', 'Features', 'Terms'];

  const featureChips = [
    { icon: <LinkIcon className="h-5 w-5" />,  label: 'Custom Link',       color: '#7c3aed' },
    { icon: <Shield className="h-5 w-5" />,    label: 'Link Protection',   color: '#059669' },
    { icon: <Clock className="h-5 w-5" />,     label: 'Set Expiration',    color: '#7c3aed' },
    { icon: <QrCode className="h-5 w-5" />,    label: 'Generate QR Code',  color: '#d97706' },
  ];

  const platformCards = [
    {
      icon: <Cloud className="h-6 w-6 text-white" />,
      bg: '#2563eb',
      title: 'Auto-Scalable Infrastructure',
      desc: '100% auto-scalable cloud architecture. Guarantees 99.99% availability and scales automatically with your needs.',
      badge: '✦ 99.99% guaranteed uptime',
      badgeColor: '#60a5fa',
    },
    {
      icon: <Zap className="h-6 w-6 text-white" />,
      bg: '#16a34a',
      title: 'High Performance',
      desc: 'Extreme speed with average response time under 50ms. Optimized to offer the best experience to your users.',
      badge: '⏱ <50ms response time',
      badgeColor: '#4ade80',
    },
    {
      icon: <Shield className="h-6 w-6 text-white" />,
      bg: '#7c3aed',
      title: 'Maximum Security',
      desc: 'Complete protection for your data. Your links and information are always secure with JWT authentication.',
      badge: '⊕ Security Best Practices',
      badgeColor: '#a78bfa',
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-white" />,
      bg: '#ea580c',
      title: 'Advanced Analytics',
      desc: 'Detailed metrics for each link — powerful insights on clicks, browsers, devices, countries, and referrers.',
      badge: '▲ Real-time reports',
      badgeColor: '#fb923c',
    },
  ];

  const featuresList = [
    { icon: <LinkIcon className="h-5 w-5" />,         label: 'Link Shortener',       desc: 'Create short URLs instantly with custom aliases.' },
    { icon: <QrCode className="h-5 w-5" />,            label: 'QR Code Generator',    desc: 'Auto-generate scannable QR codes for every link.' },
    { icon: <BarChart3 className="h-5 w-5" />,         label: 'Advanced Analytics',   desc: 'Clicks, devices, geo, referrers tracked in real time.' },
    { icon: <Clock className="h-5 w-5" />,             label: 'Link Expiration',      desc: 'Set time-based expiry for temporary campaigns.' },
    { icon: <Lock className="h-5 w-5" />,              label: 'Privacy Controls',     desc: 'Toggle public/private analytics per link.' },
    { icon: <Users className="h-5 w-5" />,             label: 'Bulk Shortening',      desc: 'Upload CSV and shorten up to 50 URLs at once.' },
    { icon: <Globe className="h-5 w-5" />,             label: 'Geo Intelligence',     desc: 'Track which countries your visitors come from.' },
    { icon: <MousePointerClick className="h-5 w-5" />, label: 'Click Tracking',       desc: 'See every click with unique visitor deduplication.' },
  ];

  const stats = [
    { value: '99.99%', label: 'Uptime' },
    { value: '<50ms',  label: 'Response' },
    { value: '50+',    label: 'URLs/Bulk' },
    { value: '100%',   label: 'Secure' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden transition-colors duration-300">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border-subtle)] backdrop-blur-md bg-[var(--bg-primary)]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 w-8 h-8 overflow-hidden">
              <img src={logoL} alt="Linky Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                𝓛𝓲𝓷𝓴𝔂
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Smart Links</span>
            </div>
          </div>

          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a key={l} href={`#section-${l.toLowerCase()}`}
                className="text-sm text-slate-400 hover:text-white transition-colors font-medium cursor-pointer">
                {l}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button onClick={onLogin}
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer hidden sm:block">
              Sign In
            </button>
            <button onClick={onGetStarted}
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-bold text-sm py-2 px-5 rounded-xl transition-all shadow-lg shadow-violet-500/20 cursor-pointer">
              Start Free
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section id="section-hero" className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/10 blur-[120px] rounded-full" />
          <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-blue-600/8 blur-[100px] rounded-full" />
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

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 pb-32 text-center relative z-10">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.05]">
              Links should be{' '}
              <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">Short, Fast,</span>
              <br />
              <span className="text-white">and Smart.</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Create powerful short URLs with custom aliases, expiry dates, and real-time analytics. Track every click with device, browser, and geo intelligence.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
          >
            <button
              onClick={onGetStarted}
              className="flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-bold text-base text-white cursor-pointer transition-all hover:scale-105 w-full sm:w-auto"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 8px 32px rgba(124,58,237,0.35)' }}
            >
              Start for Free <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={onLogin}
              className="flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-bold text-base text-slate-300 hover:text-white cursor-pointer transition-all w-full sm:w-auto"
              style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)' }}
            >
              I already have an account
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── PLATFORM SECTION ── */}
      <section id="section-platform" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-black mb-4">Powerful Platform</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Cutting-edge technology to ensure your links work perfectly, with unmatched speed, security and reliability.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {platformCards.map((card, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-2xl cursor-default group"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ borderColor: 'rgba(255,255,255,0.14)', backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl shrink-0" style={{ background: card.bg }}>
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white mb-2">{card.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-3">{card.desc}</p>
                    <span className="text-xs font-semibold" style={{ color: card.badgeColor }}>{card.badge}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="section-features" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-black mb-4">Everything You Need</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              A complete toolkit for link management, tracking, and sharing — all in one place.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuresList.map((f, i) => (
              <motion.div
                key={i}
                className="p-5 rounded-2xl space-y-3 cursor-default"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.45 }}
                viewport={{ once: true }}
                whileHover={{ backgroundColor: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.2)' }}
              >
                <div className="p-2.5 rounded-xl w-fit" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <span className="text-violet-400">{f.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{f.label}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-slate-400 mb-6 text-sm">Not sure? Start free and upgrade when you need it.</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button
                onClick={onGetStarted}
                className="px-8 py-3.5 rounded-2xl font-bold text-white cursor-pointer transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 8px 32px rgba(124,58,237,0.3)' }}
              >
                Start Free Now
              </button>
              <button
                onClick={onLogin}
                className="text-sm font-semibold text-slate-400 hover:text-white border border-white/10 px-6 py-3.5 rounded-2xl transition-all cursor-pointer hover:border-white/20"
              >
                Sign In
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TERMS / TRUST SECTION ── */}
      <section id="section-terms" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="text-3xl font-black mb-4">Built for Trust & Security</h2>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Every link you create is protected with JWT authentication, rate limiting, and CORS safeguards. Your data stays yours.
              </p>
              {[
                'JWT-based authentication',
                'Rate limiting & CORS protection',
                'Public / private analytics toggle',
                'Link expiry controls',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 mb-3">
                  <div className="p-0.5 rounded-full bg-gradient-to-r from-violet-500 to-blue-500">
                    <Check className="h-3.5 w-3.5 text-white m-0.5" />
                  </div>
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Shield className="h-8 w-8" />, label: 'URL Validation',   sub: 'All URLs verified before shortening' },
                { icon: <Lock className="h-8 w-8" />,   label: 'Private Links',    sub: 'Control who sees your analytics' },
                { icon: <Globe className="h-8 w-8" />,  label: 'Geo Tracking',     sub: 'Country-level click intelligence' },
                { icon: <Star className="h-8 w-8" />,   label: 'Katomaran Hackathon', sub: 'hackathon project 2026' },
              ].map((card, i) => (
                <div key={i} className="p-4 rounded-2xl text-center"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-violet-400 flex justify-center mb-2">{card.icon}</div>
                  <p className="text-xs font-bold text-white mb-1">{card.label}</p>
                  <p className="text-[10px] text-slate-500">{card.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 w-8 h-8 overflow-hidden">
                  <img src={logoL} alt="Linky Logo" className="w-full h-full object-cover" />
                </div>
                <span className="font-black text-xl bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">𝓛𝓲𝓷𝓴𝔂</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Efficient, secure and accessible URL shortening. Transform long links into short and powerful experiences.
              </p>
            </div>

            {/* Features */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Features</h4>
              {['Link Shortener', 'QR Code Generator', 'Advanced Analytics', 'Custom Aliases', 'Bulk Shortening', 'Link Expiration'].map((f) => (
                <p key={f} onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setTimeout(() => onLogin(), 600);
                }} className="text-xs text-slate-500 mb-2.5 cursor-pointer hover:text-slate-300 transition-colors">{f}</p>
              ))}
            </div>

            {/* Security */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Security</h4>
              {['JWT Authentication', 'Rate Limiting', 'CORS Protection', 'URL Validation', 'Private Analytics'].map((f) => (
                <div key={f} className="flex items-center gap-1.5 mb-2.5">
                  <Check className="h-3 w-3 text-violet-400 shrink-0" />
                  <span className="text-xs text-slate-500">{f}</span>
                </div>
              ))}
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Contact & Legal</h4>
              <p className="text-xs text-slate-500 mb-2.5">
                Built for the Katomaran Hackathon 2026
              </p>
              <a href="https://katomaran.com" target="_blank" rel="noreferrer"
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 mb-4">
                katomaran.com <ChevronRight className="h-3 w-3" />
              </a>
              {['Terms of Use', 'Privacy Policy'].map((l) => (
                <p key={l} className="text-xs text-slate-500 mb-2 cursor-pointer hover:text-slate-300 transition-colors">{l}</p>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} Linky. This project is a part of a hackathon run by{' '}
              <a href="https://katomaran.com" target="_blank" rel="noreferrer" className="text-violet-500 hover:text-violet-400 transition-colors">
                https://katomaran.com
              </a>
            </p>
            <div className="flex items-center gap-6 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                System Operational
              </span>
              <span>⏱ &lt;50ms response</span>
              <span>✦ 99.99% uptime</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
