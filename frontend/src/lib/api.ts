const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers = {}, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, String(value));
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Get token from localStorage if present
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("xplover_token");
  }

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    credentials: "include",
    headers: {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    },
    ...customConfig,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `HTTP error! Status: ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    login: (credentials: any) => request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
    register: (userData: any) => request("/auth/register", { method: "POST", body: JSON.stringify(userData) }),
    logout: () => request("/auth/logout", { method: "POST" }),
    me: () => request("/auth/me"),
    updateProfile: (profile: any) => request("/auth/me", { method: "PATCH", body: JSON.stringify(profile) }),
  },

  // Research
  research: {
    list: (params?: any) => request("/research", { params }),
    getById: (id: string) => request(`/research/${id}`),
    create: (data: any) => request("/research", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/research/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    rate: (id: string, score: number, comment?: string) =>
      request(`/research/${id}/ratings`, { method: "POST", body: JSON.stringify({ score, comment }) }),
    getRatings: (id: string) => request(`/research/${id}/ratings`),
  },

  // Content
  content: {
    list: (params?: any) => request("/content", { params }),
    getById: (id: string) => request(`/content/${id}`),
    create: (data: any) => request("/content", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/content/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    submit: (id: string) => request(`/content/${id}/submit`, { method: "POST" }),
    revise: (id: string, data: any) => request(`/content/${id}/revise`, { method: "POST", body: JSON.stringify(data) }),

    // Slides
    addSlide: (id: string, data: any) => request(`/content/${id}/slides`, { method: "POST", body: JSON.stringify(data) }),
    updateSlide: (id: string, slideId: string, data: any) =>
      request(`/content/${id}/slides/${slideId}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteSlide: (id: string, slideId: string) =>
      request(`/content/${id}/slides/${slideId}`, { method: "DELETE" }),
    reorderSlides: (id: string, orderedIds: string[]) =>
      request(`/content/${id}/slides/reorder`, { method: "POST", body: JSON.stringify({ orderedIds }) }),

    // Reviews
    getPendingReviews: () => request("/content/reviews/pending"),
    submitReview: (id: string, data: any) =>
      request(`/content/${id}/reviews`, { method: "POST", body: JSON.stringify(data) }),
    getReviews: (id: string) => request(`/content/${id}/reviews`),
    getReviewResult: (id: string) => request(`/content/${id}/result`),
  },

  // Visual Design
  visual: {
    getQueue: () => request("/visual/queue"),
    getContentVisual: (id: string) => request(`/visual/${id}`),
    start: (id: string) => request(`/visual/${id}/start`, { method: "POST" }),
    cancel: (id: string) => request(`/visual/${id}/cancel`, { method: "POST" }),
    complete: (id: string, remark?: string) =>
      request(`/visual/${id}/complete`, { method: "POST", body: JSON.stringify({ remark }) }),
    reopen: (id: string, remark?: string) =>
      request(`/visual/${id}/reopen`, { method: "POST", body: JSON.stringify({ remark }) }),
    publish: (id: string) => request(`/visual/${id}/publish`, { method: "POST" }),
    update: (id: string, remark?: string) =>
      request(`/visual/${id}`, { method: "PUT", body: JSON.stringify({ remark }) }),
  },

  // XCR Ledger
  xcr: {
    getMyXCR: () => request("/xcr/me"),
    getMyTransactions: (page = 1, limit = 20) => request("/xcr/me/transactions", { params: { page, limit } }),
    getUserXCR: (userId: string) => request(`/xcr/users/${userId}`),
    getUserTransactions: (userId: string, page = 1, limit = 20) =>
      request(`/xcr/users/${userId}/transactions`, { params: { page, limit } }),
  },

  // Activity & Attestations
  activity: {
    list: (page = 1, limit = 20, userId?: string) =>
      request("/activity", { params: { page, limit, userId } }),
    getUserActivity: (userId: string, page = 1, limit = 20) =>
      request(`/activity/users/${userId}`, { params: { page, limit } }),
    getAttestations: (entityType: string, entityId: string) =>
      request(`/activity/attestations/${entityType}/${entityId}`),
  },

  // Admin
  admin: {
    listUsers: (params?: any) => request("/admin/users", { params }),
    getUser: (id: string) => request(`/admin/users/${id}`),
    assignRole: (userId: string, role: string) =>
      request(`/admin/users/${userId}/roles`, { method: "POST", body: JSON.stringify({ role }) }),
    removeRole: (userId: string, role: string) =>
      request(`/admin/users/${userId}/roles/${role}`, { method: "DELETE" }),
    getXCRTransactions: (params?: any) => request("/admin/xcr/transactions", { params }),
    getBlockchainAttestations: (params?: any) => request("/admin/blockchain/attestations", { params }),
    getBlockchainInfo: () => request("/admin/blockchain/info"),
  },
};
