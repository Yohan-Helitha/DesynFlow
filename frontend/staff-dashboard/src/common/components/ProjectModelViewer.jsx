import React, { useEffect, useRef, useState } from 'react';

// Ensure model-viewer script is loaded in index.html or lazy-load here
export default function ProjectModelViewer({ src, restriction = false, width = '100%', height = '480px' }) {
  const containerRef = useRef();
  const [watermarkText, setWatermarkText] = useState('');

  useEffect(() => {
    // Disable context menu if restricted
    const el = containerRef.current;
    const onContext = (e) => {
      if (restriction) e.preventDefault();
    };
    el && el.addEventListener('contextmenu', onContext);

    // Block common keyboard shortcuts (best-effort)
    const onKeyDown = (e) => {
      // Ctrl+S, Ctrl+P, Ctrl+Shift+S
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) {
        if (restriction) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      // Ctrl/Cmd + Shift + S (Edge/Web capture shortcut) - best-effort
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 's' || e.key === 'S')) {
        if (restriction) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      // Try to catch PrintScreen key (may not be supported in all browsers)
      if (e.key === 'PrintScreen' || e.key === 'Print') {
        if (restriction) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);

    // Watermark updater — include user info to deter sharing
    const user = (() => {
      try { return JSON.parse(localStorage.getItem('user')) || {}; } catch { return {}; }
    })();
    const username = user?.email || user?.username || 'user';
    const updateWatermark = () => {
      const ts = new Date().toLocaleString();
      setWatermarkText(`${username} • ${ts}`);
    };
    updateWatermark();
    const wmInterval = setInterval(updateWatermark, 10 * 1000); // update every 10s

    return () => {
      el && el.removeEventListener('contextmenu', onContext);
      document.removeEventListener('keydown', onKeyDown);
      clearInterval(wmInterval);
    };
  }, [restriction]);

  return (
    <div ref={containerRef} style={{ width, position: 'relative' }} className="project-model-viewer">
      <model-viewer
        src={src}
        alt="3D model"
        camera-controls
        interaction-prompt="auto"
        style={{ width: '100%', height }}
        exposure="1"
        touch-action="none"
      />

      <div className="text-xs text-gray-500 mt-2">Use mouse or touch to rotate, pan and zoom.</div>

      {/* Watermark overlay when restriction is active */}
      {restriction && (
        <div style={{ pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', left: 10, top: 10, color: 'rgba(255,255,255,0.8)', fontSize: 12, textShadow: '0 0 4px rgba(0,0,0,0.6)' }}>{watermarkText}</div>
          <div style={{ position: 'absolute', right: 10, bottom: 10, color: 'rgba(255,255,255,0.6)', fontSize: 11, textShadow: '0 0 4px rgba(0,0,0,0.6)' }}>Screenshots restricted</div>
        </div>
      )}
    </div>
  );
}
