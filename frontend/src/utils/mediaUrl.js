const stripApiSuffix = (url) => {
  if (!url || typeof url !== 'string') return '';
  return url.replace(/\/api\/?$/i, '').replace(/\/+$/, '');
};

export const resolveMediaUrl = (mediaPath) => {
  if (!mediaPath || typeof mediaPath !== 'string') return '';
  if (/^(https?:|data:|blob:)/i.test(mediaPath)) return mediaPath;

  const normalizedPath = mediaPath.startsWith('/') ? mediaPath : `/${mediaPath}`;
  const savedBaseUrl = localStorage.getItem('apiBaseUrl');
  const configuredBaseUrl = import.meta.env.VITE_API_URL;
  const candidateBaseUrl = stripApiSuffix(savedBaseUrl || configuredBaseUrl || '');

  if (candidateBaseUrl) {
    return `${candidateBaseUrl}${normalizedPath}`;
  }

  return normalizedPath;
};
