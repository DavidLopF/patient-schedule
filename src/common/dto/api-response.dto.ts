export class ApiResponseDto<T> {
  statusCode: number;
  message: string;
  data?: T;
  timestamp: string;

  constructor(statusCode: number, message: string, data?: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data: T, message = 'Success', statusCode = 200): ApiResponseDto<T> {
    return new ApiResponseDto(statusCode, message, data);
  }

  static created<T>(data: T, message = 'Created'): ApiResponseDto<T> {
    return new ApiResponseDto(201, message, data);
  }
}
