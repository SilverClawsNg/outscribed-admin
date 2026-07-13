import type { AdminSecurityStatus, RoleType, AdminTaskType } from "@/utils/enumHelper";

export interface RegisterRequest { 
    username: string; 
    password: string; 
    captchaToken: string | null;
}

export interface RegisterResponse { 
    isSuccessful: boolean; 
    accountId: string; 
    status: AdminSecurityStatus; 
    qrCodeUri: string; 
}

export interface LoginRequest { 
    accountId: string; 
    token: string; 
    captchaToken: string | null;
}

// Requests
export interface SendTokenRequest { 
    emailAddress: string; 
    captchaToken: string; 
    type: number 
}

// Responses
export interface SendTokenResponse { 
    verificationId: string 
}

export interface FallbackRequest { 
    verificationId: string | null; 
    token: string; 
}

export interface AdminListDto {
  authenticationId: string;
  username: string;
  role: RoleType;
  assignedAt: string;
  isActive: boolean;
 }
 
 export interface GetAdminListResponse {
  admins: AdminListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | number; 
 }

 export interface AdminTaskBriefListDto{
    completedAt: string
    adminTaskType: AdminTaskType
 }
 
export interface AdminDetailDto {
   
authenticationId: string
accountId: string
assignedAt: string
assignedBy: string
username: string
role: RoleType
isActive: boolean
securityStatus: AdminSecurityStatus
tasks: AdminTaskBriefListDto[]
   }
     
 export interface ResetRequest{
          authenticationId: string | null;
          confirm: boolean
  }  

  export interface ConfirmRequest{
          authenticationId: string | null;
          type: RoleType | '-1'
          confirm: boolean
  }  
  
 export interface ResetRequest{
          authenticationId: string | null;
          confirm: boolean
  }  