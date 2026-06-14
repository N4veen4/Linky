import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Palette,
  KeyRound,
  UserCog,
  ShieldCheck,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import logoL from '../assets/Linky L.png';

/**
 * SettingsSidebar — Left sliding settings panel.
 *
 * Props:
 *   isOpen   {boolean}  — Whether sidebar is visible
 *   onClose  {function} — Called to close sidebar
 *   user     {object}   — Current user
 *   onLogout {function} — Logout handler
 *   showToast {function} — Toast notifications
 */
export default function SettingsSidebar({ isOpen, onClose, user, onLogout, showToast }) {
  const menuItems = [
    {
      id: 'theme',
      icon: <Palette className="h-5 w-5" />,
      label: 'Appearance',
      desc: 'Customize theme & colors',
      badge: 'Soon',
    },
    {
      id: 'password',
      icon: <KeyRound className="h-5 w-5" />,
      label: 'Change Password',
      desc: 'Update your credentials',
      badge: 'Soon',
    },
    {
      id: 'account',
      icon: <UserCog className="h-5 w-5" />,
      label: 'Account Management',
      desc: 'Manage your profile & data',
      badge: 'Soon',
    },
    {
      id: 'privacy',
      icon: <ShieldCheck className="h-5 w-5" />,
      label: 'Privacy & Security',
      desc: 'Control your data & sessions',
      badge: 'Soon',
    },
    {
      id: 'help',
      icon: <HelpCircle className="h-5 w-5" />,
      label: 'Help & Support',
      desc: 'Docs, FAQ, and contact',
      badge: null,
    },
    {
      id: 'about',
      icon: <Info className="h-5 w-5" />,
      label: 'About Linky',
      desc: 'Version & acknowledgements',
      badge: null,
    },
  ];

  const handleItemClick = (id) => {
    if (['theme', 'password', 'account', 'privacy'].includes(id)) {
      showToast('This feature is coming soon!', 'success');
    } else if (id === 'help') {
      showToast('Visit our documentation for help.', 'success');
    } else if (id === 'about') {
      showToast('Linky v1.0 · Hackathon Project by Katomaran', 'success');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Sidebar Panel */}
          <motion.aside
            key="sidebar"
            className="fixed top-0 left-0 h-full z-50 w-80 flex flex-col bg-[var(--bg-primary)]/95 border-r border-[var(--border-subtle)] backdrop-blur-3xl shadow-2xl"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 w-8 h-8 overflow-hidden shrink-0">
                  <img src={logoL} alt="Linky Logo" className="w-full h-full object-cover" />
                </div>
                <span className="font-black text-xl tracking-tight bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">𝓛𝓲𝓷𝓴𝔂</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)] transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Info */}
            <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-base font-black text-white shrink-0 bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg">
                  {(user?.username || user?.email || 'U')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--text-main)] truncate">{user?.username || 'User'}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Settings Menu */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--text-muted)] px-3 mb-3">Settings</p>
              {menuItems.map((item, i) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all cursor-pointer group text-[var(--text-muted)]"
                  whileHover={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-main)' }}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                >
                  <span className="text-[var(--text-muted)] group-hover:text-[var(--accent-from)] transition-colors">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-tight">{item.label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{item.desc}</p>
                  </div>
                  {item.badge ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 bg-[var(--accent-from)]/10 text-[var(--accent-from)] border border-[var(--accent-from)]/20">
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight className="h-4 w-4 opacity-30 group-hover:opacity-70 shrink-0 transition-opacity" />
                  )}
                </motion.button>
              ))}
            </nav>

            {/* Logout */}
            <div className="px-3 pb-6 pt-2 border-t border-[var(--border-subtle)]">
              <motion.button
                onClick={() => { onClose(); onLogout(); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer border border-transparent hover:border-rose-500/20"
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-semibold">Sign Out</span>
              </motion.button>

              {/* Footer */}
              <p className="text-center text-[10px] text-[var(--text-muted)] mt-4 opacity-70">
                Linky v1.0 · Hackathon by <a href="https://katomaran.com" target="_blank" rel="noreferrer"
                  className="hover:text-[var(--accent-from)] transition-colors">katomaran.com</a>
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
