import type { InsightStatus, Country, Category } from "@/utils/enumHelper";
import type { TagDto } from "@/features/tagging/types/TagTypes";

export interface InsightListDto {
  insightId: string;
  createdAt: string;
  title: string;
  status: InsightStatus;
  username: string;
  flagsCount: number;
 }
 
 export interface GetInsightListResponse {
  insights: InsightListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | number; 
 }
 
  export interface InsightDetailDto {
 
     insightId: string
     title: string
     creatorId: string
     createdAt: string
     
     addendum: string
     summary: string
     detail: string
     photo: string
     photoCaption: string
     status: InsightStatus
     country: Country
     category: Category
   
     username: string
     commentsCount: number
     repliesCount: number
     viewsCount: number
     authViewsCount: number
     upvotesCount: number
     downvotesCount: number
     favoritesCount: number
     flagsCount: number
    
     sharesCount: number
     readingTime: number
     engagementScore: number
      
     tags: TagDto[]
  }
 
    export interface ConfirmRequest{
      insightId: string;
      notes: string
      confirm: boolean
  }