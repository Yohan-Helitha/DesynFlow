import React, { useEffect, useRef } from 'react';

// Ensure model-viewer script is loaded in index.html or lazy-load here
export default function ProjectModelViewer({ src, restriction = false, width = '100%', height = '480px' }) {
  const containerRef = useRef();

  useEffect(() => {
    // Disable context menu if restricted
    const el = containerRef.current;
    const onContext = (e) => {
      if (restriction) e.preventDefault();
    };
    el && el.addEventListener('contextmenu', onContext);
    return () => el && el.removeEventListener('contextmenu', onContext);
  }, [restriction]);

  return (
    <div ref={containerRef} style={{ width }} className="project-model-viewer">
      <model-viewer
        src={src}
        alt="3D model"
        camera-controls
        interaction-prompt="auto"
        style={{ width: '100%', height }}
        exposure="1"
        touch-action="none"
      >
      </model-viewer>
      <div className="text-xs text-gray-500 mt-2">Use mouse or touch to rotate, pan and zoom.</div>
    </div>
  );
}
