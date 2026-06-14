import { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  AlertCircle,
} from 'lucide-react';
import { api } from '../utils/api';

/**
 * BulkUpload — Self-contained CSV bulk URL shortener panel.
 *
 * Props:
 *   onSuccess  {function} — Called after successful upload (refreshes parent URL list)
 *   showToast  {function} — Toast notification handler
 *
 * Position: Drop this anywhere — it's a standalone card.
 * CSV format: originalUrl, customAlias (opt), expiresAt (opt), isPublicStats (opt)
 */
export default function BulkUpload({ onSuccess, showToast }) {
  const [isOpen, setIsOpen]       = useState(false);
  const [file, setFile]           = useState(null);
  const [dragging, setDragging]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [results, setResults]     = useState(null); // null | { summary, results[] }
  const fileInputRef              = useRef(null);

  // ── Template CSV download ────────────────────────────────────────────────
  const downloadTemplate = () => {
    const csv = [
      'originalUrl,customAlias,expiresAt,isPublicStats',
      'https://example.com/very-long-url,my-alias,,false',
      'https://github.com/,,2025-12-31T00:00,false',
      'https://google.com,,,true',
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Linky_bulk_template.csv';
    a.click();
  };

  // ── Download results CSV ─────────────────────────────────────────────────
  const downloadResults = () => {
    if (!results) return;
    const header = 'row,originalUrl,shortUrl,shortCode,success,error';
    const rows = results.results.map((r) =>
      [r.row, r.originalUrl, r.shortUrl || '', r.shortCode || '', r.success, r.error || ''].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Linky_bulk_results.csv';
    a.click();
  };

  // ── File selection ────────────────────────────────────────────────────────
  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.endsWith('.csv')) {
      showToast('Please upload a .csv file', 'error');
      return;
    }
    setFile(f);
    setResults(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await api.bulkShorten(file);
      setResults(res);
      if (res.summary.succeeded > 0) {
        showToast(`${res.summary.succeeded} URL(s) shortened successfully!`, 'success');
        onSuccess?.();
      }
      if (res.summary.failed > 0) {
        showToast(`${res.summary.failed} row(s) had errors. Check results below.`, 'error');
      }
    } catch (err) {
      showToast(err.message || 'Bulk upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResults(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">

      {/* ── Header / Toggle ────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--accent-from)]/10 border border-[var(--accent-from)]/20 rounded-xl">
            <FileSpreadsheet className="h-5 w-5 text-[var(--accent-from)]" />
          </div>
          <div className="text-left">
            <p className="font-bold text-[var(--text-main)] text-sm">Bulk URL Shortener</p>
            <p className="text-xs text-[var(--text-muted)]">Upload a CSV to shorten up to 50 URLs at once</p>
          </div>
        </div>
        <span className={`text-[var(--text-muted)] text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* ── Collapsible Body ────────────────────────────────────────────── */}
      {isOpen && (
        <div className="px-6 pb-6 space-y-5 border-t border-[var(--border-subtle)] pt-5 animate-fadeIn">

          {/* Template + instructions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-md">
              CSV must have an <code className="text-[var(--accent-from)] bg-[var(--accent-from)]/10 px-1 rounded">originalUrl</code> column.
              Optional: <code className="text-[var(--accent-from)] bg-[var(--accent-from)]/10 px-1 rounded">customAlias</code>,{' '}
              <code className="text-[var(--accent-from)] bg-[var(--accent-from)]/10 px-1 rounded">expiresAt</code>,{' '}
              <code className="text-[var(--accent-from)] bg-[var(--accent-from)]/10 px-1 rounded">isPublicStats</code>.
              Max <strong className="text-[var(--text-main)]">50 rows</strong>.
            </p>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all text-xs font-semibold shrink-0 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Download Template
            </button>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
              dragging
                ? 'border-[var(--accent-from)]/60 bg-[var(--accent-from)]/5'
                : file
                ? 'border-[var(--accent-from)]/40 bg-[var(--accent-from)]/5'
                : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--bg-elevated)]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <Upload className={`h-8 w-8 ${file ? 'text-[var(--accent-from)]' : 'text-[var(--text-muted)]'}`} />
            {file ? (
              <div className="text-center">
                <p className="text-sm font-semibold text-[var(--text-main)]">{file.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{(file.size / 1024).toFixed(1)} KB — Click to change</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-semibold text-[var(--text-main)] opacity-80">Drop your CSV here or click to browse</p>
                <p className="text-xs text-[var(--text-muted)]">Only .csv files accepted • max 1 MB</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {file && !results && (
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all text-sm cursor-pointer"
              >
                <X className="h-4 w-4" /> Clear
              </button>
              <button
                onClick={handleUpload}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)] hover:opacity-90 text-white font-semibold text-sm transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[var(--accent-from)]/20"
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                  : <><Upload className="h-4 w-4" /> Upload & Shorten</>
                }
              </button>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-4 animate-fadeIn">
              {/* Summary banner */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  {results.summary.succeeded} succeeded
                </div>
                {results.summary.failed > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                    <XCircle className="h-4 w-4" />
                    {results.summary.failed} failed
                  </div>
                )}
                <button
                  onClick={downloadResults}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface)] text-[var(--text-main)] text-xs font-semibold transition-all cursor-pointer ml-auto"
                >
                  <Download className="h-3.5 w-3.5" /> Export Results
                </button>
              </div>

              {/* Results table */}
              <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                      <th className="text-left px-4 py-3 text-[var(--text-muted)] font-semibold uppercase tracking-wider">Row</th>
                      <th className="text-left px-4 py-3 text-[var(--text-muted)] font-semibold uppercase tracking-wider">Original URL</th>
                      <th className="text-left px-4 py-3 text-[var(--text-muted)] font-semibold uppercase tracking-wider">Short URL</th>
                      <th className="text-left px-4 py-3 text-[var(--text-muted)] font-semibold uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.map((r) => (
                      <tr key={r.row} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] transition-colors">
                        <td className="px-4 py-3 text-[var(--text-muted)] font-mono opacity-80">{r.row}</td>
                        <td className="px-4 py-3 text-[var(--text-main)] max-w-[200px] truncate" title={r.originalUrl}>
                          {r.originalUrl || '—'}
                        </td>
                        <td className="px-4 py-3">
                          {r.shortUrl ? (
                            <a
                              href={r.shortUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[var(--accent-from)] hover:underline font-semibold"
                            >
                              {r.shortUrl}
                            </a>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {r.success ? (
                            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                              <CheckCircle2 className="h-3.5 w-3.5" /> OK
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-rose-500 font-semibold" title={r.error}>
                              <XCircle className="h-3.5 w-3.5" />
                              <span className="max-w-[180px] truncate">{r.error}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Upload another */}
              <button
                onClick={handleReset}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer underline-offset-2 hover:underline"
              >
                Upload another CSV
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
