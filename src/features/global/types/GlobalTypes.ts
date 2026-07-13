import type { AdminTaskType, ContentType } from '@/utils/enumHelper' // 🎯 Import your clean semantics

export interface AdminTaskListDto {
  adminTaskId: string;
  completedAt: string;
  adminUsername: string;
  adminTaskType: AdminTaskType;
  contentType: ContentType;
 }
 
 export interface GetAdminTaskListResponse {
  tasks: AdminTaskListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | number; 
 }
 
 export interface ReadsStatsDto{
    writersCount: number | 0;
    usersCount: number | 0;
    adminTasksCount: number | 0;
    talesCount: number | 0;
    insightsCount: number | 0;
    commentsCount: number | 0;
    votesCount: number | 0;
    favoritesCount: number | 0;
    flagsCount: number | 0;
    sharesCount: number | 0;
    adminsCount: number | 0;
    faqsCount: number | 0;
    tagsCount: number | 0;
    inquiriesCount: number | 0;
    verificationsCount: number | 0;
    snapshotsCount: number | 0;
   
 }

 export interface GetStatsResponse {
  readStats: ReadsStatsDto;
  logsCount: number | 0;
  analyticsCount: number | 0;
  lastUpdatedAt: string; 
 }