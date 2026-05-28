const NEXT_API_BASE = "/api"

interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
}

class ApiClient {

  async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {

    try {

      const response = await fetch(`${NEXT_API_BASE}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
        },
        ...options,
      })

      const data = await response.json()

      return {
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data?.error,
        status: response.status,
      }

    } catch (error) {

      console.error("[API ERROR]", error)

      return {
        error: "Network error",
        status: 500,
      }

    }

  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "GET" })
  }

  post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    })
  }

}

export const api = new ApiClient()

/* ---------------- CHAT API ---------------- */

export const chatApi = {

  sendMessage: (sessionId: string, message: string) =>
    api.post("/chat", {
      session_id: sessionId,
      message,
    }),

  getHistory: () =>
    api.get("/chat"),

}