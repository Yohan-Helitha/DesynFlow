import React, { useEffect, useRef, useState } from 'react';

// Dynamically load model-viewer script
const loadModelViewer = () => {
  return new Promise((resolve, reject) => {
    // Check if model-viewer is already loaded
    if (window.customElements && window.customElements.get('model-viewer')) {
      resolve();
      return;
    }

    // Check if script is already in DOM
    if (document.querySelector('script[src*="model-viewer"]')) {
      // Script exists, wait for it to load
      const checkLoaded = setInterval(() => {
        if (window.customElements && window.customElements.get('model-viewer')) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);
      return;
    }

    // Load the script
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
    script.onload = () => {
      // Wait for the custom element to be defined
      const checkDefined = setInterval(() => {
        if (window.customElements && window.customElements.get('model-viewer')) {
          clearInterval(checkDefined);
          resolve();
        }
      }, 100);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export default function ProjectModelViewer({ src, restriction = false, width = '100%', height = '480px' }) {
  const containerRef = useRef();
  const [watermarkText, setWatermarkText] = useState('');
  const [modelError, setModelError] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  console.log('ProjectModelViewer props:', { src, restriction, width, height });

  // Load model-viewer script on component mount
  useEffect(() => {
    loadModelViewer()
      .then(() => {
        console.log('Model-viewer script loaded successfully');
        setScriptLoaded(true);
      })
      .catch((error) => {
        console.error('Failed to load model-viewer script:', error);
        setModelError('Failed to load 3D viewer library');
      });
  }, []);

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

  // Add error handling for model loading
  const handleModelLoad = () => {
    console.log('3D Model loaded successfully');
    setModelLoaded(true);
    setModelError(null);
  };

  const handleModelError = (error) => {
    console.error('3D Model loading error:', error);
    setModelError('Failed to load 3D model');
    setModelLoaded(false);
  };

  if (!src) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', borderRadius: '8px', border: '2px dashed #d1d5db' }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <div>No 3D model source provided</div>
        </div>
      </div>
    );
  }

  if (!scriptLoaded) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>🔄</div>
          <div>Loading 3D viewer...</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width, position: 'relative' }} className="project-model-viewer">
      {modelError ? (
        <div style={{ width: '100%', height, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2', borderRadius: '8px', border: '2px dashed #fca5a5' }}>
          <div style={{ textAlign: 'center', color: '#dc2626' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>Model Loading Error</div>
            <div style={{ fontSize: '14px' }}>{modelError}</div>
            <div style={{ fontSize: '12px', marginTop: '8px', color: '#6b7280' }}>Source: {src}</div>
          </div>
        </div>
      ) : (
        <>
          <model-viewer
            src={src}
            alt="3D model"
            camera-controls
            interaction-prompt="auto"
            style={{ width: '100%', height }}
            exposure="1"
            touch-action="none"
            onLoad={handleModelLoad}
            onError={handleModelError}
          />
          
          {!modelLoaded && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#6b7280', backgroundColor: 'rgba(255,255,255,0.9)', padding: '12px', borderRadius: '6px' }}>
              Loading 3D model...
            </div>
          )}
        </>
      )}

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
