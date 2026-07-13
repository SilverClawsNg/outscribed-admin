import type { TaleStatus, Country, Category } from "@/utils/enumHelper";
import type { TagDto } from "@/features/tagging/types/TagTypes";

export interface TaleListDto {
  taleId: string;
  createdAt: string;
  title: string;
  status: TaleStatus;
  username: string;
  flagsCount: number;
 }
 
 export interface GetTaleListResponse {
  tales: TaleListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | number; 
 }

 export interface TaleDetailDto {

    taleId: string
    title: string
    creatorId: string
    createdAt: string
    
    addendum: string
    summary: string
    detail: string
    photo: string
    photoCaption: string
    status: TaleStatus
    country: Country
    category: Category
  
    watchlistTitle: string
    watchlistSummary: string
    watchlistSource: string
    watchlistUrl: string

    username: string
    insightsCount: number
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
      taleId: string;
      notes: string
      confirm: boolean
  }