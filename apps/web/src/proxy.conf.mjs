export default {
  '/api/**': {
    target: process.env.API_HTTPS || process.env.API_HTTP,
    secure: false,
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  }
};
