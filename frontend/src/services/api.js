// File: src/services/api.js

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// --- AUTHENTICATION ---

export const signupUser = async (fullName, email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name: fullName, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Signup failed.");
  }

  return response.json();
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Login failed.");
  }

  const data = await response.json();
  if (data.access_token) {
    localStorage.setItem("token", data.access_token);
  }
  return data;
};

export const googleOAuthLogin = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/oauth-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, provider: "google" }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "OAuth failed.");
  }

  const accessToken = data.access_token || data.token;
  if (accessToken) {
    localStorage.setItem("token", accessToken);
  }

  return data;
};

export const microsoftOAuthLogin = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/oauth-microsoft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, provider: "microsoft" }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Microsoft OAuth failed.");
  }

  const accessToken = data.access_token || data.token;
  if (accessToken) {
    localStorage.setItem("token", accessToken);
  }

  return data;
};

export const verifyEmail = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Verification failed.");
  return data;
};

export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Request failed.");
  return data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Reset failed.");
  return data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
};

export const getProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
};

export const updateProfile = async (data) => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update profile");
  return response.json();
};

export const deleteAccount = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to delete account");
  }
  return response.json();
};

export const getSessions = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/sessions`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch sessions");
  return response.json();
};

export const revokeSession = async (sessionId) => {
  const response = await fetch(`${API_BASE_URL}/auth/sessions/${sessionId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to revoke session");
  return response.json();
};

export const revokeAllSessions = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/sessions`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to revoke all sessions");
  return response.json();
};

export const exportAccountData = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/export`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to export data");
  return response.json();
};

export const regenerateApiKey = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/api-key/regenerate`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to regenerate API key");
  return response.json();
};

export const resendVerification = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to send verification email");
  return response.json();
};

export const setup2FA = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/2fa/setup`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to setup 2FA");
  return response.json();
};

export const verify2FA = async (code, secret) => {
  const response = await fetch(`${API_BASE_URL}/auth/2fa/verify`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ code, secret }),
  });
  if (!response.ok) throw new Error("Failed to verify 2FA code");
  return response.json();
};

export const disable2FA = async (code) => {
  const response = await fetch(`${API_BASE_URL}/auth/2fa/disable`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ code }),
  });
  if (!response.ok) throw new Error("Failed to disable 2FA");
  return response.json();
};

export const loginVerify2FA = async (code, tempToken) => {
  const response = await fetch(`${API_BASE_URL}/auth/2fa/login-verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tempToken}`,
    },
    body: JSON.stringify({ code }),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Invalid 2FA code");
  
  localStorage.setItem("token", data.access_token);
  return data;
};

export const subscribeToPush = async (subscription) => {
  const response = await fetch(`${API_BASE_URL}/push/subscribe`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.toJSON().keys.p256dh,
        auth: subscription.toJSON().keys.auth
      }
    }),
  });
  if (!response.ok) throw new Error("Failed to save push subscription.");
  return response.json();
};

export const sendTestPush = async () => {
  const response = await fetch(`${API_BASE_URL}/push/test`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to trigger test push.");
  return response.json();
};

// --- SCANS ---

export const runScan = async (scanType, payloadData, options = {}) => {
  let endpoint = '';
  let bodyData = { options };

  if (scanType === 'url') {
    endpoint = '/scan/url';
    bodyData.url = payloadData;
  } else if (scanType === 'email') {
    endpoint = '/scan/email';
    // Very simple split for subject/body if separated by newline, else all body
    const parts = payloadData.split('\n');
    bodyData.subject = parts.length > 1 ? parts[0] : '';
    bodyData.body = parts.length > 1 ? parts.slice(1).join('\n') : payloadData;
  } else {
    endpoint = '/scan/message';
    bodyData.message = payloadData;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bodyData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Scan failed.");
  }
  return data;
};

export const runBulkScan = async (items) => {
  const response = await fetch(`${API_BASE_URL}/scan/bulk`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ items }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Bulk scan failed.");
  }
  return data;
};

// --- HISTORY ---

export const getScanHistory = async () => {
  const response = await fetch(`${API_BASE_URL}/scan/history`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to fetch history.");
  }

  return response.json();
};

export const runFusionScan = async ({ url, message, email }) => {
  const response = await fetch(`${API_BASE_URL}/scan/fusion`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      url: url || null,
      message: message || null,
      email: email || null,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Fusion scan failed.");
  }
  return data;
};