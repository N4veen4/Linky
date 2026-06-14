import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Link2,
  Globe,
  Lock,
  Trash2,
  Copy,
  Check,
  BarChart3,
  Calendar,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  QrCode,
  Menu,
} from 'lucide-react';
import { api } from '../utils/api';
import QRCodeModal from './QRCodeModal';
import BulkUpload from './BulkUpload';
import SettingsSidebar from './SettingsSidebar';
import logoL from '../assets/Linky L.png';

export default function Dashboard({ user, onLogout, showToast, onViewAnalytics }) {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isPublicStats, setIsPublicStats] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  // QR Modal state — { url, label } or null
  const [qrTarget, setQrTarget] = useState(null);
  // Settings sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchUrls = async () => {
    try {
      const res = await api.getMyUrls();
      if (res.success) {
        setUrls(res.data || []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch URLs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!originalUrl) return;

    setSubmitting(true);
    try {
      const res = await api.shorten({
        originalUrl,
        customAlias: customAlias || undefined,
        expiresAt: expiresAt || undefined,
        isPublicStats
      });

      if (res.success) {
        showToast('Link shortened successfully!', 'success');
        setOriginalUrl('');
        setCustomAlias('');
        setExpiresAt('');
        setIsPublicStats(false);
        setShowAdvanced(false);
        fetchUrls(); // Refresh list
      }
    } catch (err) {
      showToast(err.message || 'Failed to shorten URL', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shortened link? All analytics data will be lost.')) {
      return;
    }

    try {
      const res = await api.deleteUrl(id);
      if (res.success) {
        showToast('Link deleted successfully', 'success');
        setUrls(urls.filter((url) => url._id !== id));
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete URL', 'error');
    }
  };

  const handleTogglePublic = async (id, currentVal) => {
    try {
      const res = await api.togglePublic(id, !currentVal);
      if (res.success) {
        showToast(`Analytics set to ${!currentVal ? 'Public' : 'Private'}`, 'success');
        setUrls(urls.map((url) => (url._id === id ? { ...url, isPublicStats: !currentVal } : url)));
      }
    } catch (err) {
      showToast(err.message || 'Failed to toggle public analytics', 'error');
    }
  };

  const copyToClipboard = (shortCode, id) => {
    const link = `http://localhost:5000/${shortCode}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(id);
      showToast('Copied to clipboard!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Filter URLs
  const filteredUrls = urls.filter((url) => {
    const query = searchQuery.toLowerCase();
    return (
      url.title?.toLowerCase().includes(query) ||
      url.originalUrl?.toLowerCase().includes(query) ||
      url.shortCode?.toLowerCase().includes(query) ||
      (url.customAlias && url.customAlias.toLowerCase().includes(query))
    );
  });

  // Calculate statistics
  const totalUrls = urls.length;
  const totalClicks = urls.reduce((sum, item) => sum + (item.clicks || 0), 0);
  const activeUrls = urls.filter((url) => !url.expiresAt || new Date(url.expiresAt) > new Date()).length;
  const expiredUrls = totalUrls - activeUrls;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] transition-colors duration-300 relative overflow-hidden">

      {/* Dynamic Background Glows & Design */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-violet-600/5 blur-[120px] rounded-full dark:bg-violet-600/10" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[300px] bg-blue-600/5 blur-[100px] rounded-full dark:bg-blue-600/8" />
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(var(--text-main) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      {/* Settings Sidebar */}
      <SettingsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={onLogout}
        showToast={showToast}
      />

      {/* Navigation Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[var(--bg-primary)]/90 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]"
              whileTap={{ scale: 0.92 }}
              title="Settings"
            >
              <Menu className="h-5 w-5" />
            </motion.button>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 w-8 h-8 overflow-hidden shrink-0">
                <img src={logoL} alt="Linky Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">𝓛𝓲𝓷𝓴𝔂</span>
            </div>
          </div>

          {/* Right: User avatar */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-[var(--text-main)]">{user.username}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{user.email}</span>
            </div>
            <motion.div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-black text-white cursor-pointer bg-gradient-to-r from-violet-600 to-blue-600 shadow-lg shadow-violet-500/20"
              onClick={() => setSidebarOpen(true)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              title="Settings"
            >
              {(user?.username || user?.email || 'U')[0].toUpperCase()}
            </motion.div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Welcome Section */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] flex items-center gap-2" style={{ fontFamily: 'cursive' }}>
              Welcome back, <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">{user.username}</span>
              <Sparkles className="h-6 w-6 text-[var(--accent-from)]" />
            </h1>
            <p className="text-[var(--text-muted)] mt-1 text-sm">Manage, shorten, and track metrics for your links.</p>
          </div>
        </motion.div>

        {/* Shortener Card Form */}
        <div className="rounded-3xl p-6 shadow-2xl backdrop-blur-xl bg-[var(--bg-surface)] border border-[var(--border-strong)]">
          <form onSubmit={handleShorten} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Link2 className="absolute left-4 top-3.5 h-5 w-5 text-[var(--text-muted)]" />
                <input
                  type="url" required
                  placeholder="Paste your long URL here..."
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  className="input-theme w-full rounded-2xl py-3.5 pl-12 pr-4 text-sm"
                />
              </div>
              <motion.button
                type="submit"
                disabled={submitting}
                className="px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2 shrink-0 text-sm disabled:opacity-75 disabled:cursor-not-allowed font-bold text-white shadow-lg shadow-violet-500/20 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
                whileTap={{ scale: 0.97 }}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Shorten Link ✦'}
              </motion.button>
            </div>

            {/* Advanced Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors select-none cursor-pointer"
              >
                Advanced Options
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 rounded-2xl animate-fadeIn bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                  {/* Custom Alias */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-muted)]">Custom Alias (Optional)</label>
                    <input
                      type="text" placeholder="my-cool-link"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value)}
                      className="input-theme w-full rounded-xl py-2 px-3 text-xs"
                    />
                  </div>

                  {/* Expiration */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-muted)]">Expiration Date (Optional)</label>
                    <input
                      type="datetime-local" value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="input-theme w-full rounded-xl py-2 px-3 text-xs"
                    />
                  </div>

                  {/* Public Stats */}
                  <div className="flex flex-col justify-center space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-muted)]">Analytics Access</label>
                    <label className="inline-flex items-center gap-2 cursor-pointer mt-1 select-none">
                      <input
                        type="checkbox" checked={isPublicStats}
                        onChange={(e) => setIsPublicStats(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-9 h-5 bg-[var(--border-strong)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent-from)]"></div>
                      <span className="text-xs font-medium text-[var(--text-muted)]">
                        {isPublicStats ? 'Anyone can view stats' : 'Only me'}
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Bulk Upload Panel */}
        <BulkUpload onSuccess={fetchUrls} showToast={showToast} />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Links', value: totalUrls, color: 'text-[var(--text-main)]' },
            { label: 'Total Clicks', value: totalClicks, color: 'text-[var(--accent-from)]' },
            { label: 'Active Links', value: activeUrls, color: 'text-emerald-500' },
            { label: 'Expired Links', value: expiredUrls, color: 'text-rose-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="rounded-3xl p-5 shadow-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
              whileHover={{ borderColor: 'var(--border-strong)', translateY: -2 }}
            >
              <span className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">{stat.label}</span>
              <p className={`text-3xl font-black mt-2 ${stat.color}`}>{loading ? '...' : stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Links List Panel */}
        <div className="rounded-3xl p-6 shadow-2xl backdrop-blur-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-black text-[var(--text-main)]">Your Links</h2>

            {/* Search */}
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-muted)]" />
              <input
                type="text" placeholder="Search links..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-theme w-full rounded-xl py-2 pl-9 pr-4 text-xs"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-[var(--accent-from)] animate-spin" />
            </div>
          ) : filteredUrls.length === 0 ? (
            <div className="text-center py-16 border border-dashed rounded-2xl border-[var(--border-subtle)]">
              <Link2 className="h-10 w-10 text-[var(--text-muted)] opacity-50 mx-auto mb-3" />
              <p className="text-[var(--text-muted)] font-medium">
                {searchQuery ? 'No links matching your query' : 'No shortened links created yet'}
              </p>
              <p className="text-xs text-[var(--text-muted)] opacity-70 mt-1">
                {searchQuery ? 'Try adjustments to your search' : 'Paste a URL above to get your first short link.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredUrls.map((url, idx) => {
                const isExpired = url.expiresAt && new Date(url.expiresAt) < new Date();
                const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
                const shortUrlString = `${baseUrl}/${url.shortCode}`;

                return (
                  <motion.div
                    key={url._id}
                    className="p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.3 }}
                    whileHover={{ borderColor: 'var(--border-strong)' }}
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-bold text-[var(--text-main)] text-base truncate max-w-xs md:max-w-md">
                          {url.title || 'Untitled Link'}
                        </h3>
                        {isExpired ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            Expired
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Active
                          </span>
                        )}

                        <button
                          onClick={() => handleTogglePublic(url._id, url.isPublicStats)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer select-none ${
                            url.isPublicStats
                              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20'
                              : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]'
                          }`}
                          title={url.isPublicStats ? 'Analytics are public' : 'Analytics are private'}
                        >
                          {url.isPublicStats ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                          <span>{url.isPublicStats ? 'Public Stats' : 'Private'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-[var(--accent-from)] font-semibold text-sm">
                        <a
                          href={shortUrlString} target="_blank" rel="noreferrer"
                          className="hover:underline flex items-center gap-1 hover:text-[var(--accent-to)] transition-colors"
                        >
                          {shortUrlString}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>

                      <div className="text-xs text-[var(--text-muted)] opacity-70 truncate max-w-sm md:max-w-xl">
                        Target: <span className="text-[var(--text-muted)] opacity-100">{url.originalUrl}</span>
                      </div>

                      <div className="flex gap-4 text-[11px] text-[var(--text-muted)] opacity-70">
                        <span>Created: {new Date(url.createdAt).toLocaleDateString()}</span>
                        {url.expiresAt && (
                          <span>Expires: {new Date(url.expiresAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto border-t md:border-t-0 pt-3 md:pt-0 border-[var(--border-subtle)]">
                      {/* Clicks */}
                      <div className="text-right mr-2 hidden sm:block">
                        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Clicks</span>
                        <span className="text-lg font-black text-[var(--accent-from)]">{url.clicks || 0}</span>
                      </div>

                      {/* Copy */}
                      <motion.button
                        onClick={() => copyToClipboard(url.shortCode, url._id)}
                        className="p-2.5 rounded-xl transition-colors cursor-pointer text-[var(--text-muted)] hover:text-[var(--accent-from)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]"
                        title="Copy short link"
                        whileTap={{ scale: 0.9 }}
                      >
                        {copiedId === url._id ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </motion.button>

                      {/* QR Code */}
                      <motion.button
                        onClick={() => setQrTarget({ url: shortUrlString, label: url.customAlias || url.shortCode })}
                        className="p-2.5 rounded-xl transition-colors cursor-pointer text-[var(--text-muted)] hover:text-[var(--accent-from)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]"
                        title="Show QR Code"
                        whileTap={{ scale: 0.9 }}
                      >
                        <QrCode className="h-4 w-4" />
                      </motion.button>

                      {/* Analytics */}
                      <motion.button
                        onClick={() => onViewAnalytics(url.shortCode)}
                        className="p-2.5 rounded-xl transition-colors cursor-pointer text-[var(--text-muted)] hover:text-[var(--accent-from)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]"
                        title="View analytics"
                        whileTap={{ scale: 0.9 }}
                      >
                        <BarChart3 className="h-4 w-4" />
                      </motion.button>

                      {/* Delete */}
                      <motion.button
                        onClick={() => handleDelete(url._id)}
                        className="p-2.5 rounded-xl transition-colors cursor-pointer text-[var(--text-muted)] hover:text-rose-500 border border-[var(--border-subtle)] hover:bg-rose-500/10 hover:border-rose-500/30"
                        title="Delete link"
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* QR Code Modal — self-contained overlay, safe to reposition during UI polish */}
      {qrTarget && (
        <QRCodeModal
          url={qrTarget.url}
          label={qrTarget.label}
          onClose={() => setQrTarget(null)}
          showToast={showToast}
        />
      )}
    </div>
  );
}
