import type { ContentType, CommentStatus, FlagType, ContactType, VoteType } from "@/utils/enumHelper";

export interface CommentListDto {
  commentId: string;
  contentType: ContentType;
  commentedAt: string;
  status: CommentStatus;
  username: string;
  flagsCount: number;
  detail: string;
 }
 
 export interface GetCommentListResponse {
  comments: CommentListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | number; 
 }
 
export interface FavoriteListDto {
  favoriteId: string;
  contentType: ContentType;
  favoritedAt: string;
   username: string;
  isActive: boolean;
 }
 
 export interface GetFavoriteListResponse {
  favorites: FavoriteListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | number; 
 }
 
export interface FlagListDto {
  flagId: string;
  contentType: ContentType;
  flaggedAt: string;
  username: string;
  flagType: FlagType;
 }
 
 export interface GetFlagListResponse {
  flags: FlagListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | number; 
 }
 
export interface ShareListDto {
  shareId: string;
  contentType: ContentType;
  sharedAt: string;
  contactType: ContactType;
  username: string;
 }
 
 export interface GetShareListResponse {
  shares: ShareListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | number; 
 }
 
export interface VoteListDto {
  voteId: string;
  contentType: ContentType;
  votedAt: string;
  voteType: VoteType;
  username: string;
 }
 
 export interface GetVoteListResponse {
  votes: VoteListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | number; 
 }
 
   export interface CommentDetailDto {
  
      commentId: string
      commentatorId: string
      parentId: string | null
      commentedAt: string
      
      addendum: string
      detail: string
      status: CommentStatus
    
      username: string

      contentType: ContentType
      contentId: string

      repliesCount: number
      upvotesCount: number
      downvotesCount: number
      favoritesCount: number
      flagsCount: number
    
      engagementScore: number
       
   }
   
   export interface FlagDetailDto {
  
      flagId: string
      flaggerId: string
      flaggedAt: string
      
      flagType: FlagType
      username: string

      contentType: ContentType
      contentId: string

      notes: string
   
   }
  
   export interface FlagDetailDto {
  
      flagId: string
      flaggerId: string
      flaggedAt: string
      
      flagType: FlagType
      username: string

      contentType: ContentType
      contentId: string

      notes: string
   
   }
  
   export interface ShareDetailDto {
  
      shareId: string
      sharerId: string | null
      sharedAt: string
      
      contactType: ContactType
      username: string | null

      contentType: ContentType
      contentId: string

      handle: string
   
   }
  
   export interface VoteDetailDto {
  
      voteId: string
      voterId: string
      votedAt: string
      
      voteType: VoteType
      username: string

      contentType: ContentType
      contentId: string

   }
  
   export interface FavoriteDetailDto {
  
      favoriteId: string
      favoriterId: string
      favoritedAt: string
      
      isActive: boolean
      username: string

      contentType: ContentType
      contentId: string

   }
  
    export interface ConfirmRequest{
      commentId: string;
      notes: string
      confirm: boolean
  }

  export interface SnapshotListDto{
    id: string
    contentId: string, 
    contentType: ContentType
    date: string
    totalCount: number
  }

  export interface GetSnapshotListResponse {
  snapshots: SnapshotListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | number; 
 }
 
export interface SnapshotDetailDto {
   id: string
    contentId: string, 
    contentType: ContentType
    date: string
    viewsCount: number
    authViewsCount: number
    sharesCount: number
    commentsCount: number
    upvotesCount: number
    downvotesCount: number
    flagsCount: number
    favoritesCount: number
    talesCount: number
    insightsCount: number
    totalCounts: number
}