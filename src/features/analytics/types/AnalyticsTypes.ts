import type { Country } from "@/utils/enumHelper";

export interface AnalyticsListDto {
  analyticsId: string;
  date: string;
  requestPath: string;
  elapsedMs: number;
  statusCode: number;
  country: Country;
 }
 
 export interface GetAnalyticsListResponse {
  analytics: AnalyticsListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | number; 
 }
 
export interface AnalyticsDetailDto {
  analyticsId: string;
  ipAddress: string;
  userAgent: string;
  requestPath: string;
  httpMethod: string;
  elapsedMs: number;
  date: string;
  username: string | null;
  userId: string | null;
  statusCode: number;
  sessionId: string;
  continent: string;
  country: string;
  region: string;
  city: string;
 }