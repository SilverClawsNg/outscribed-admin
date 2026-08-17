import type {InquiryStatus } from "@/utils/enumHelper";

export interface FaqListDto {
  faqId: string;
  lastUpdatedAt: string;
  question: string;
 }
 
export interface FaqDetailDto {
  faqId: string;
  createdAt: string;
  lastUpdatedAt: string;
  question: string;
  answer: string;
  updater: UpdaterDto;
  upvotes: number;
  downvotes: number
 }
 
 export interface GetFaqListResponse {
  faqs: FaqListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | number; 
 }
 
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
 
   export interface CreateFaqRequest{
           question: string;
           answer: string;
   }  
      
   export interface UpdateFaqRequest{
     faqId: string;
           question: string | '';
           answer: string | '';
   }  

 export interface CreateFaqResponse{
          id: string;
          createdAt: string
  }  
  
   export interface AnswerInquiryRequest{
     inquiryId: string;
           answer: string | '';
   }  