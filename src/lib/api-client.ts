import {
  LightDataParams,
  TBIADataParams,
  LightDataResponse,
  TBIADataResponse,
  ApiError,
} from "./types/api";

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "APIError";
  }
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = "/api") {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<T> {
    // Handle both relative and absolute URLs
    const fullPath = `${this.baseURL}${endpoint}`;
    const url = fullPath.startsWith('http') 
      ? new URL(fullPath)
      : new URL(fullPath, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, String(value));
        }
      });
    }

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new APIError(response.status, errorData.error);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        500,
        `Network error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getLightData(params: LightDataParams): Promise<LightDataResponse> {
    if (!params.start_time || !params.end_time) {
      throw new APIError(
        400,
        "start_time and end_time are required parameters"
      );
    }

    const startDate = new Date(params.start_time);
    const endDate = new Date(params.end_time);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new APIError(
        400,
        "Invalid date format. Use ISO 8601 format (e.g., 2024-01-01T00:00:00Z)"
      );
    }

    if (startDate >= endDate) {
      throw new APIError(400, "start_time must be before end_time");
    }

    if (
      params.limit !== undefined &&
      (params.limit <= 0 || !Number.isInteger(params.limit))
    ) {
      throw new APIError(400, "limit must be a positive integer");
    }

    if (
      params.offset !== undefined &&
      (params.offset < 0 || !Number.isInteger(params.offset))
    ) {
      throw new APIError(400, "offset must be a non-negative integer");
    }

    return this.request<LightDataResponse>("/light-data", params);
  }

  async getTBIAData(params: TBIADataParams = {}): Promise<TBIADataResponse> {
    if (params.start_time || params.end_time) {
      const startDate = params.start_time ? new Date(params.start_time) : null;
      const endDate = params.end_time ? new Date(params.end_time) : null;

      if (
        (startDate && isNaN(startDate.getTime())) ||
        (endDate && isNaN(endDate.getTime()))
      ) {
        throw new APIError(
          400,
          "Invalid date format. Use ISO 8601 format (e.g., 2024-01-01T00:00:00Z)"
        );
      }

      if (startDate && endDate && startDate >= endDate) {
        throw new APIError(400, "start_time must be before end_time");
      }
    }

    if (
      params.limit !== undefined &&
      (params.limit <= 0 || !Number.isInteger(params.limit))
    ) {
      throw new APIError(400, "limit must be a positive integer");
    }

    if (
      params.offset !== undefined &&
      (params.offset < 0 || !Number.isInteger(params.offset))
    ) {
      throw new APIError(400, "offset must be a non-negative integer");
    }

    return this.request<TBIADataResponse>("/tbia-data", params);
  }
}

export const apiClient = new APIClient();

export { APIError };

export type { APIClient };
