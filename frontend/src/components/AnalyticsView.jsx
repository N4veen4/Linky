import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Globe,
  Lock,
  Copy,
  Check,
  ExternalLink,
  Users,
  MousePointerClick,
  Loader2,
  AlertTriangle,
  Link as LinkIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { api } from '../utils/api';

// New navy/violet/blue palette
const COLORS = ['#7c3aed', '#2563eb', '#0ea5e9', '#059669', '#d97706', '#db2777'];

export default function AnalyticsView({ shortCode, isLoggedIn, onBack, showToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (isLoggedIn) {
        try {
          res = await api.getAnalytics(shortCode);
        } catch (err) {
          res = await api.getPublicAnalytics(shortCode);
        }
      } else {
        res = await api.getPublicAnalytics(shortCode);
      }

      if (res && res.success) {
        setData(res);
      } else {
        throw new Error('Could not fetch analytics data.');
      }
    } catch (err) {
      setError(err.message || 'Access Denied or Link Not Found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [shortCode]);

  const copyShortLink = () => {
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
    const link = `${baseUrl}/${shortCode}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      showToast('Shortened link copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/#/analytics/${shortCode}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedShare(true);
      showToast('Public analytics link copied!', 'success');
      setTimeout(() => setCopiedShare(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-main)] transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-[var(--accent-from)] animate-spin" />
          <p className="text-[var(--text-muted)] text-sm">Loading analytics statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-main)] p-4 transition-colors duration-300">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[var(--bg-surface)] border border-[var(--border-strong)] backdrop-blur-xl rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[var(--text-main)] mb-2">Analytics Unavailable</h2>
          <p className="text-[var(--text-muted)] text-sm mb-6">{error}</p>
          <button
            onClick={onBack}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-main)] font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-sm"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  const { url, analytics } = data;
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
  const shortUrlString = `${baseUrl}/${url.shortCode}`;
  const totalClicks = analytics.summary.totalClicks || 0;
  const uniqueClicks = analytics.summary.uniqueClicks || 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 backdrop-blur-md p-3 rounded-xl shadow-xl">
          <p className="text-xs text-slate-500 font-semibold">{label}</p>
          <p className="text-sm text-blue-600 font-bold mt-1">Clicks: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden">
      
      {/* Dynamic Background Glows & Design */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-violet-600/5 blur-[120px] rounded-full dark:bg-violet-600/10" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[300px] bg-blue-600/5 blur-[100px] rounded-full dark:bg-blue-600/8" />
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(var(--text-main) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header and Back navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors self-start cursor-pointer"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            <span>{isLoggedIn ? 'Back to Dashboard' : 'Back to Home'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-medium">Link Access:</span>
            {url.isPublicStats ? (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Globe className="h-3 w-3" /> Public Analytics
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Lock className="h-3 w-3" /> Private
              </span>
            )}
          </div>
        </div>

        {/* URL Meta details card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] backdrop-blur-xl rounded-3xl p-6 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        >
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[var(--accent-glow)] border border-[var(--border-subtle)] rounded-xl shrink-0">
                <LinkIcon className="h-4.5 w-4.5 text-[var(--accent-from)]" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--text-main)] truncate">{url.title || 'URL Analytics'}</h1>
            </div>

            <div className="flex items-center gap-1.5 text-[var(--accent-to)] font-bold text-lg">
              <a href={shortUrlString} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                {shortUrlString}
                <ExternalLink className="h-4.5 w-4.5" />
              </a>
            </div>

            <p className="text-xs text-[var(--text-muted)] truncate max-w-2xl">
              Original: <a href={url.originalUrl} target="_blank" rel="noreferrer" className="hover:underline opacity-80">{url.originalUrl}</a>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={copyShortLink}
              className="flex items-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-main)] font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-xs"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              <span>Copy Short Link</span>
            </button>

            {url.isPublicStats && (
              <button
                onClick={copyShareLink}
                className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-violet-500/20 transition-all cursor-pointer text-xs"
              >
                {copiedShare ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                <span>Share Analytics Link</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Counter cards */}
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div variants={itemAnim} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-lg flex items-center gap-4">
            <div className="p-4 bg-[var(--accent-glow)] border border-[var(--border-subtle)] rounded-2xl">
              <MousePointerClick className="h-6 w-6 text-[var(--accent-from)]" />
            </div>
            <div>
              <span className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider block">Total Clicks</span>
              <p className="text-3xl font-extrabold text-[var(--text-main)] mt-1">{totalClicks}</p>
            </div>
          </motion.div>

          <motion.div variants={itemAnim} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-lg flex items-center gap-4">
            <div className="p-4 bg-[var(--accent-glow)] border border-[var(--border-subtle)] rounded-2xl">
              <Users className="h-6 w-6 text-[var(--accent-from)]" />
            </div>
            <div>
              <span className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider block">Unique Visitors</span>
              <p className="text-3xl font-extrabold text-[var(--text-main)] mt-1">{uniqueClicks}</p>
            </div>
          </motion.div>
        </motion.div>

        {totalClicks === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 border border-dashed border-[var(--border-strong)] rounded-3xl bg-[var(--bg-elevated)]"
          >
            <MousePointerClick className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[var(--text-muted)]">No Clicks Recorded Yet</h3>
            <p className="text-sm text-[var(--text-muted)] opacity-80 mt-1 max-w-sm mx-auto">
              Once users click on your shortened link, click traffic statistics will display here automatically.
            </p>
          </motion.div>
        ) : (
          /* Charts Grid */
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Click Timeline */}
            <motion.div variants={itemAnim} className="lg:col-span-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-lg">
              <h3 className="text-base font-bold text-[var(--text-main)] mb-4">Clicks Timeline</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.timeline || []} margin={{ left: -20, top: 10, right: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" style={{ fontSize: 10 }} />
                    <YAxis stroke="var(--text-muted)" style={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="clicks" stroke="var(--accent-from)" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" isAnimationActive={true} animationDuration={1500} animationEasing="ease-in-out" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Referrers */}
            <motion.div variants={itemAnim} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-lg">
              <h3 className="text-base font-bold text-[var(--text-main)] mb-4">Referrers</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.referrers} layout="vertical" margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis type="number" stroke="var(--text-muted)" style={{ fontSize: 10 }} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" stroke="var(--text-muted)" style={{ fontSize: 10 }} width={75} />
                    <Tooltip cursor={{ fill: 'var(--border-subtle)' }} content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="var(--accent-from)" radius={[0, 6, 6, 0]} isAnimationActive={true} animationDuration={1500} animationEasing="ease-in-out">
                      {(analytics.referrers || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Operating Systems */}
            <motion.div variants={itemAnim} className="lg:col-span-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-lg">
              <h3 className="text-base font-bold text-[var(--text-main)] mb-4">Operating Systems</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.os} margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" style={{ fontSize: 10 }} />
                    <YAxis stroke="var(--text-muted)" style={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip cursor={{ fill: 'var(--border-subtle)' }} content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="var(--accent-from)" radius={[6, 6, 0, 0]} maxBarSize={60} isAnimationActive={true} animationDuration={1500} animationEasing="ease-in-out">
                      {(analytics.os || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Browsers */}
            <motion.div variants={itemAnim} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-lg">
              <h3 className="text-base font-bold text-[var(--text-main)] mb-4">Browsers</h3>
              <div className="h-64 flex flex-col justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.browsers}
                      cx="50%" cy="45%" innerRadius={50} outerRadius={80}
                      paddingAngle={5} dataKey="value" stroke="var(--bg-surface)" strokeWidth={2}
                      isAnimationActive={true} animationDuration={1500} animationEasing="ease-in-out"
                    >
                      {(analytics.browsers || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Devices */}
            <motion.div variants={itemAnim} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-lg">
              <h3 className="text-base font-bold text-[var(--text-main)] mb-4">Devices</h3>
              <div className="h-64 flex flex-col justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.devices}
                      cx="50%" cy="45%" innerRadius={50} outerRadius={80}
                      paddingAngle={5} dataKey="value" stroke="var(--bg-surface)" strokeWidth={2}
                      isAnimationActive={true} animationDuration={1500} animationEasing="ease-in-out"
                    >
                      {(analytics.devices || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Countries List */}
            <motion.div variants={itemAnim} className="lg:col-span-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-lg">
              <h3 className="text-base font-bold text-[var(--text-main)] mb-4">Click Demographics (Countries)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-[var(--text-muted)]">
                  <thead className="text-xs uppercase font-bold text-[var(--text-muted)] opacity-80 border-b border-[var(--border-subtle)]">
                    <tr>
                      <th scope="col" className="px-6 py-3">Country</th>
                      <th scope="col" className="px-6 py-3 text-right">Clicks Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {analytics.countries.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="px-6 py-4 text-center text-[var(--text-muted)] opacity-50">No demographics recorded</td>
                      </tr>
                    ) : (
                      analytics.countries.map((country, idx) => (
                        <tr key={idx} className="hover:bg-[var(--bg-elevated)] transition-colors">
                          <td className="px-6 py-4 font-semibold text-[var(--text-main)] flex items-center gap-2">
                            <span className="text-[var(--text-muted)]">{country.name || 'Unknown Location'}</span>
                          </td>
                          <td className="px-6 py-4 text-right font-extrabold text-[var(--accent-from)]">{country.value}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
