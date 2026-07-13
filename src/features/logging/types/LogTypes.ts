export interface LogListDto {
  logId: string;
  date: string;
  level: string;
  message: string;
 }
 
 export interface GetLogListResponse {
  logs: LogListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | number; 
 }

 export interface LogDetailDto {
  logId: string
  date: string
  level: string
  message: string
  properties: Record<string, any> | null;
 }
