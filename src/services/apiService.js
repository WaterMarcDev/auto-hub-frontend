// API service for car intake operations
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class CarIntakeService {
  // Create a new car intake
  static async createCarIntake(formData) {
    const response = await fetch(`${API_BASE_URL}/car-intake`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create car intake");
    }

    return data;
  }

  // Get all car intakes with pagination and filtering
  static async getCarIntakes(params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || "",
      sortBy: params.sortBy || "createdAt",
      sortOrder: params.sortOrder || "desc",
      ...params,
    });

    const response = await fetch(`${API_BASE_URL}/car-intake?${queryParams}`, {
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch car intakes");
    }

    return data;
  }

  // Get a single car intake by ID
  static async getCarIntakeById(id) {
    const response = await fetch(`${API_BASE_URL}/car-intake/${id}`, {
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch car intake");
    }

    return data;
  }

  // Update a car intake
  static async updateCarIntake(id, formData) {
    const response = await fetch(`${API_BASE_URL}/car-intake/${id}`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update car intake");
    }

    return data;
  }

  // Delete a car intake
  static async deleteCarIntake(id) {
    const response = await fetch(`${API_BASE_URL}/car-intake/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to delete car intake");
    }

    return data;
  }

  // Get car intake statistics
  static async getCarIntakeStats() {
    const response = await fetch(`${API_BASE_URL}/car-intake/stats`, {
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch car intake statistics");
    }

    return data;
  }
}

// Seller service
class SellerService {
  // Get all sellers
  static async getSellers(params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || "",
      sortBy: params.sortBy || "createdAt",
      sortOrder: params.sortOrder || "desc",
    });

    const response = await fetch(`${API_BASE_URL}/sellers?${queryParams}`, {
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch sellers");
    }

    return data;
  }

  // Get a single seller by ID
  static async getSellerById(id) {
    const response = await fetch(`${API_BASE_URL}/sellers/${id}`, {
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch seller");
    }

    return data;
  }
}

// Transaction service
class TransactionService {
  // Get all transactions
  static async getTransactions(params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || "",
      sortBy: params.sortBy || "createdAt",
      sortOrder: params.sortOrder || "desc",
      type: params.type || "",
    });

    const response = await fetch(
      `${API_BASE_URL}/transactions?${queryParams}`,
      {
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch transactions");
    }

    return data;
  }

  // Get a single transaction by ID
  static async getTransactionById(id) {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch transaction");
    }

    return data;
  }

  // Get transaction statistics
  static async getTransactionStats() {
    const response = await fetch(`${API_BASE_URL}/transactions/stats`, {
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch transaction statistics");
    }

    return data;
  }
}

// Upload service
class UploadService {
  // Upload a single image
  static async uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to upload image");
    }

    return data;
  }

  // Upload multiple images
  static async uploadMultipleImages(files) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to upload images");
    }

    return data;
  }

  // Delete an uploaded image
  static async deleteImage(filename) {
    const response = await fetch(`${API_BASE_URL}/upload/${filename}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to delete image");
    }

    return data;
  }

  // Get image URL
  static getImageUrl(filename) {
    return `${API_BASE_URL.replace("/api", "")}/uploads/${filename}`;
  }
}

export { CarIntakeService, SellerService, TransactionService, UploadService };
