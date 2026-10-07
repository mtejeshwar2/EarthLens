const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');

async function getApiError(response) {
  try {
    const body = await response.json();
    const detail = body?.detail;
    if (typeof detail === 'string') return detail;
    if (detail?.message) return detail.message;
    return `Request failed (${response.status}).`;
  } catch {
    return `Request failed (${response.status}).`;
  }
}

export { API_BASE_URL, getApiError };
