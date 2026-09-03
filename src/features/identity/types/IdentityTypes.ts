import type { RoleType, AccountStatus, Country, ContactType } from "@/utils/enumHelper";

export interface UserListDto {
  accountId: string;
  registeredAt: string;
  role: RoleType;
  status: AccountStatus;
  username: string;
  country: Country;
  moderationScore: number;
 }

 export interface UserSuspensionListDto{
    id: string;
    suspendedAt: string;
    hasAppealed: boolean;
    isResolved: boolean;
    username: string;
 }
 
 export interface GetUserListResponse {
  users: UserListDto[];
  hasNext: boolean;
  anchor: | null;
  pointer: | number; 
 }

 export interface GetUserSuspensionListResponse {
  suspensions: UserSuspensionListDto[];
  hasNext: boolean;
  anchor: | null;
  pointer: | number; 
 }

 export interface ContactDto {
  title: string
  type: ContactType
}
 
 export interface UserDetailDto {
 accountId: string
 registeredAt: string
 username: string
 bio: string 
 title: string
 photo: string | null
 role: RoleType
 status: AccountStatus
 moderationScore: number
 contacts : ContactDto[]
 country: Country
 viewsCount: number
 commentsCount: number
 repliesCount: number
 talesCount: number
 insightsCount: number
 taleUpvotesCount: number
 insightUpvotesCount: number
 commentUpvotesCount: number
 taleDownvotesCount: number
 insightDownvotesCount: number
 commentDownvotesCount: number
 taleFavoritesCount: number
 insightFavoritesCount: number
 commentFavoritesCount: number
 taleFlagsCount: number
 insightFlagsCount: number
 commentFlagsCount: number
 taleSharesCount: number
 insightSharesCount: number
 followersCount: number
 followingsCount: number
  }

  export interface UserSuspensionDetailDto{
    id: string;
    accountId: string;
    suspendedAt: string;
    appealedAt: string;
    resolvedAt: string;
    reason: AccountStatus;
    appeal: string;
    username: string
 }
    
  export interface AssignRoleRequest{
          accountId: string;
          type: RoleType | '-1'
          confirm: boolean
  }  
  
  export interface ConfirmRequest{
      accountId: string;
      notes: string
      confirm: boolean
  }