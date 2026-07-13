// src/types/api.types.ts

// 🎯 The Single, Global Source of Truth for your .NET Result Monad
export interface Result<T> {
  value: T | null        // Maps from C# 'Value'
  error: APIError | null // Maps from C# 'Error'
  isFailure: boolean     // Maps from C# 'IsFailure'
  isSuccess: boolean     // Maps from C# 'IsSuccess'
}

export class APIError {
  constructor(
    public status: number,        // HTTP status tracking (e.g., 400)
    public title: string,         // High level description (e.g., "Validation Error")
    public detail: string,        // Human friendly text description
    public definition?: string
  ) {}
}

// Extend Axios config definition layout to support custom meta parameters safely
declare module 'axios' {
  export interface AxiosRequestConfig {
    meta?: {
      requiresAuth?: boolean
    }
  }
}