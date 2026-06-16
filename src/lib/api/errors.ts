export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public data: unknown,
    message?: string
  ) {
    super(message || `API Error: ${statusCode}`);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(message = "Network request failed") {
    super(message);
    this.name = "NetworkError";
  }
}
