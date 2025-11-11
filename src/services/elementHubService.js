const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ElementHubService {
  static async getHubItems() {
    const res = await fetch(`${API_BASE_URL}/element-hub`, {
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load hub items");
    return data;
  }

  static async sellElement(payload) {
    const res = await fetch(`${API_BASE_URL}/element-hub/sell`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to sell element");
    return data;
  }

  static async getHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString
      ? `${API_BASE_URL}/element-hub/history?${queryString}`
      : `${API_BASE_URL}/element-hub/history`;
    const res = await fetch(url, {
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load history");
    return data;
  }
}

export default ElementHubService;
