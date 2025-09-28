// CRA dev server proxy to backend
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:4000',
      changeOrigin: true,
      // Optional: preserve path
      logLevel: 'debug'
    })
  );
  // Proxy uploaded static files to backend in dev
  app.use(
    '/uploads',
    createProxyMiddleware({
      target: 'http://localhost:4000',
      changeOrigin: true,
      logLevel: 'debug'
    })
  );
};
