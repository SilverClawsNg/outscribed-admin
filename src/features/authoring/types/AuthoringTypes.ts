import type { WriterStatus, AccountStatus, Country, ContactType } from "@/utils/enumHelper";

export interface WriterListDto {
  writerId: string;
  onboardedAt: string;
  status: WriterStatus;
  username: string;
  country: Country;
 }
 
 export interface GetWriterListResponse {
  writers: WriterListDto[];
  hasNext: boolean;
  anchor: | null;
  pointer: | number; 
 }

 export interface WriterDetailDto {
  writerId: string;
  onboardedAt: string;
  status: WriterStatus;
  username: string;
  country: Country;
}

export interface ConfirmRequest{
    writerId: string;
    notes: string
    confirm: boolean
}