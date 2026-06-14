import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, Copy, QrCode } from 'lucide-react';

/**
 * QRCodeModal — Fully self-contained, reusable QR code modal.
 *
 * Props:
 *   url        {string}   — The URL to encode as QR code
 *   label      {string}   — Display label (short code or alias)
 *   onClose    {function} — Called when user closes the modal
 *   showToast  {function} — Toast notification handler (optional)
 *
 * Usage:
 *   <QRCodeModal url="https://snap.ly/abc123" label="abc123" onClose={() => setQrUrl(null)} showToast={showToast} />
 *
 * Position: Rendered as a centered overlay — safe to move/reposition during UI polish.
 */
export default function QRCodeModal({ url, label, onClose, showToast }) {
  const canvasRef = useRef(null);

  if (!url) return null;

  // Download QR as PNG
  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `qr-${label || 'Linky'}.png`;
    link.click();
  };

  // Copy URL to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      showToast?.('Link copied to clipboard!', 'success');
    });
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-[#0f0c29]/90 border border-white/10 rounded-3xl shadow-2xl shadow-black/50 p-6 flex flex-col items-center gap-5 animate-slideUp">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-1">
            <QrCode className="h-6 w-6 text-indigo-400" />
          </div>
          <h2 className="text-lg font-bold text-white">QR Code</h2>
          <p className="text-xs text-gray-400 break-all max-w-[260px]">{url}</p>
        </div>

        {/* QR Code Canvas */}
        <div
          ref={canvasRef}
          className="p-4 bg-white rounded-2xl shadow-lg shadow-indigo-500/10"
        >
          <QRCodeCanvas
            value={url}
            size={200}
            bgColor="#ffffff"
            fgColor="#1e1b4b"
            level="H"
            includeMargin={false}
          />
        </div>

        {/* Short Code Label */}
        <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide">
          /{label}
        </span>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-gray-300 hover:text-white transition-all text-sm font-semibold cursor-pointer"
          >
            <Copy className="h-4 w-4" />
            Copy Link
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white transition-all text-sm font-semibold cursor-pointer shadow-lg shadow-indigo-500/20"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
