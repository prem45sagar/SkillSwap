const BASE_URL = "/api";

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return data;
}

const getHeaders = (options = {}, isFormData = false) => {
  const headers = { ...options.headers };
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  
  const token = localStorage.getItem("skillswap_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  get: async (path, options = {}) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      credentials: "include",
      headers: getHeaders(options),
    });
    return handleResponse(res);
  },

  post: async (path, body, options = {}) => {
    const isFormData = body instanceof FormData;
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      credentials: "include",
      headers: getHeaders(options, isFormData),
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });
    return handleResponse(res);
  },

  put: async (path, body, options = {}) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      credentials: "include",
      headers: getHeaders(options),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(res);
  },

  patch: async (path, body, options = {}) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PATCH",
      credentials: "include",
      headers: getHeaders(options),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(res);
  },

  delete: async (path, options = {}) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      credentials: "include",
      headers: getHeaders(options),
    });
    return handleResponse(res);
  },
};
