import { ContentTypeDescriptions, CountryDescriptions, TaleStatusDescriptions, InsightStatusDescriptions,
  GeneralSortTypeDescriptions, SortTypeDescriptions, RoleTypeDescriptions, CommentStatusDescriptions,
  AccountStatusDescriptions, LimitedContentTypeDescriptions, FlagTypeDescriptions, ContactTypeDescriptions,
  VoteTypeDescriptions, CategoryDescriptions, InquiryStatusDescriptions,
  WriterStatusDescriptions
 } from '../utils/descriptors' // 🎯 Import your clean semantics
import type { ContentType, Country, SortType, GeneralSortType, RoleType, TaleStatus, InsightStatus, AccountStatus,
  CommentStatus, LimitedContentType, FlagType, ContactType, VoteType, Category, InquiryStatus,
  WriterStatus
 } from '../utils/enumHelper' // 🎯 Import your clean semantics

interface SelectItem<T = string> {
  value: T
  label: string
}

// Transform the record into an array of SelectItem<ContentType> objects
export const ContentTypeSelectItems = (
  Object.keys(ContentTypeDescriptions) as ContentType[]
).map((key): SelectItem<ContentType> => ({
  value: key,
  label: ContentTypeDescriptions[key]
}))

// Transform the record into an array of SelectItem<ContentType> objects
export const WriterStatusSelectItems = (
  Object.keys(WriterStatusDescriptions) as WriterStatus[]
).map((key): SelectItem<WriterStatus> => ({
  value: key,
  label: WriterStatusDescriptions[key]
}))

// Transform the record into an array of SelectItem<ContentType> objects
export const VoteTypeSelectItems = (
  Object.keys(VoteTypeDescriptions) as VoteType[]
).map((key): SelectItem<VoteType> => ({
  value: key,
  label: VoteTypeDescriptions[key]
}))

// Transform the record into an array of SelectItem<ContentType> objects
export const InquiryStatusSelectItems = (
  Object.keys(InquiryStatusDescriptions) as InquiryStatus[]
).map((key): SelectItem<InquiryStatus> => ({
  value: key,
  label: InquiryStatusDescriptions[key]
}))

// Transform the record into an array of SelectItem<ContentType> objects
export const LimitedContentTypeSelectItems = (
  Object.keys(LimitedContentTypeDescriptions) as LimitedContentType[]
).map((key): SelectItem<LimitedContentType> => ({
  value: key,
  label: LimitedContentTypeDescriptions[key]
}))

export const CountrySelectItems = (
  Object.keys(CountryDescriptions) as Country[]
).map((key): SelectItem<Country> => ({
  value: key,
  label: CountryDescriptions[key]
}))

// Transform the record into an array of SelectItem<ContentType> objects
export const CategorySelectItems = (
  Object.keys(CategoryDescriptions) as Category[]
).map((key): SelectItem<Category> => ({
  value: key,
  label: CategoryDescriptions[key]
}))

export const SortTypeSelectItems = (
  Object.keys(SortTypeDescriptions) as SortType[]
).map((key): SelectItem<SortType> => ({
  value: key,
  label: SortTypeDescriptions[key]
}))

export const GeneralSortTypeSelectItems = (
  Object.keys(GeneralSortTypeDescriptions) as GeneralSortType[]
).map((key): SelectItem<GeneralSortType> => ({
  value: key,
  label: GeneralSortTypeDescriptions[key]
}))

export const RoleTypeSelectItems = (
  Object.keys(RoleTypeDescriptions) as RoleType[]
).map((key): SelectItem<RoleType> => ({
  value: key,
  label: RoleTypeDescriptions[key]
}))

export const TaleStatusSelectItems = (
  Object.keys(TaleStatusDescriptions) as TaleStatus[]
).map((key): SelectItem<TaleStatus> => ({
  value: key,
  label: TaleStatusDescriptions[key]
}))

export const InsightStatusSelectItems = (
  Object.keys(InsightStatusDescriptions) as InsightStatus[]
).map((key): SelectItem<InsightStatus> => ({
  value: key,
  label: InsightStatusDescriptions[key]
}))

export const CommentStatusSelectItems = (
  Object.keys(CommentStatusDescriptions) as CommentStatus[]
).map((key): SelectItem<CommentStatus> => ({
  value: key,
  label: CommentStatusDescriptions[key]
}))

export const AccountStatusSelectItems = (
  Object.keys(AccountStatusDescriptions) as AccountStatus[]
).map((key): SelectItem<AccountStatus> => ({
  value: key,
  label: AccountStatusDescriptions[key]
}))

export const FlagTypeSelectItems = (
  Object.keys(FlagTypeDescriptions) as FlagType[]
).map((key): SelectItem<FlagType> => ({
  value: key,
  label: FlagTypeDescriptions[key]
}))

export const ContactTypeSelectItems = (
  Object.keys(ContactTypeDescriptions) as ContactType[]
).map((key): SelectItem<ContactType> => ({
  value: key,
  label: ContactTypeDescriptions[key]
}))
