import type {InquiryStatus } from "@/utils/enumHelper";

export interface InquiryListDto {
  inquiryId: string;
  askedAt: string;
  question: string;
  status: InquiryStatus;
 }

 
export interface InquiryDetailDto {
  inquiryId: string;
  askedAt: string;
  answeredAt: string;
  question: string;
  emailAddress: string;
  answer: string;
  status: InquiryStatus;
  updater: UpdaterDto;
 }

 export interface UpdaterDto {
  adminId: string;
  username: string;
 
 }
 
 export interface GetInquiryListResponse {
  inquiries: InquiryListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | number; 
 }
 
   export interface AnswerInquiryRequest{
     inquiryId: string;
           answer: string | '';
   }  