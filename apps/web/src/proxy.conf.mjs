export default {
  '/api/**': {
    target: process.env.API_HTTPS || process.env.API_HTTP,
    secure: false,
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },

  "/v1/traces": {
    target: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    secure: false,
    changeOrigin: true,
    headers: parseHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS)
  }
};

function parseHeaders(delimitedHeaders) {
  return delimitedHeaders.split(',')
    .reduce((parsedHeaders, delimitedHeader) => {
        const [key, value] = delimitedHeader.split('=');
        return {...parsedHeaders, [key.trim()]: value.trim()}
      }, {});
}
