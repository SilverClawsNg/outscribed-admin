
export interface TagListDto {
  tagId: string;
  createdAt: string;
  name: string;
  totalCounts: number;
 }
 
 export interface GetTagListResponse {
  tags: TagListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | number; 
 }
 
 export interface TagDto {
  tagId: string;
  name: string;
  slug: string;
 }
 
export interface TagDetailDto {
  tagId: string;
  createdAt: string;
  lastUpdatedAt: string;
  name: string;
  slug: string;
  insightsCounter: number;
  talesCounter: number;
 }