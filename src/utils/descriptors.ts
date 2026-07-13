import type{ ContentType, AdminTaskType, SortType, GeneralSortType, Country, DateScope,
  RoleType, VoteType, FaqCategory, TaleStatus, InsightStatus, Category, ContactType, CommentStatus,
  AccountStatus, ActivityType, LimitedContentType, FlagType, InquiryStatus, WriterStatus, AdminSecurityStatus
} from './enumHelper'

export const ContentTypeDescriptions: Record<ContentType, string> = {
  Account: 'Account',
  Tale: 'Tales',
  Insight: 'Insights',
  Comment: 'Comments',
  Authoring : 'Authoring',
  Role : 'Roles'
} as const;

export const WriterStatusDescriptions: Record<WriterStatus, string> = {
  None: 'None',
  Active: 'Active',
  Suspended: 'Suspended'
} as const;

export const AdminSecurityStatusDescriptions: Record<AdminSecurityStatus, string> = {
  None: 'None',
  NoTwoFactorEnabled: 'Twofactor Not Enabled',
  TwoFactorWindowExpired: 'Twofactor window expired',
  Active: 'Active'
} as const;

export const FlagTypeDescriptions: Record<FlagType, string> = {
  Other: 'Other',
  Misinformation: 'Deliberate Misinformation',
  GraphicContent: 'Contains Graphic Content',
  AdvocatesViolence: 'Advocates or Incites Violence',
  HateSpeech : 'Promotes Racism, Sexism, etc.',
  SexualExploitation : 'Promotes Sexual Exploitation',
  ChildAbuse: 'Promotes Abuse of Children'
} as const;

export const LimitedContentTypeDescriptions: Record<LimitedContentType, string> = {
  Tale: 'Tales',
  Insight: 'Insights',
  Comment: 'Comments'
} as const;


export const InquiryStatusDescriptions: Record<InquiryStatus, string> = {
  Open: 'Open',
  Resolved: 'Resolved'
} as const;

export const AdminTaskTypeDescriptions: Record<AdminTaskType, string> = {
  CertifiedContent: 'Certified Content',
  ArchivedContent: 'Archived Content',
  HideContent: 'Hide Content',
  CreatedFaq: 'Created FAQ',
  UpdatedFaq : 'Updated FAQ',
  AnsweredFaq : 'Answered FAQ',
  SuspendedWriterPrivilege: 'Suspended Writer Privilege',
  ReinstatedWriterPrivilege: 'Reinstated Writer Privilege',
  AssignedRole: 'Assigned Role',
  ReassignedRole : 'Reassigned Role',
  DeactivatedRole : 'Deactivated Role',
  ActivatedRole : 'Activated Role',
  BannedAccount: 'Banned Account',
  SuspendedAccount: 'Suspended Account',
  ReinstatedAccount: 'Reinstated Account'
} as const;

  export const SortTypeDescriptions: Record<SortType, string> = {
  MostRecent: 'Newest',
  LeastRecent: 'Oldest',
  MostViewed: 'By Views',
  MostCommented: 'By Comemnts',
  MostFlagged: 'By Flags',
  MostUpvoted: 'By Votes',
  MostFavorited: 'By Saves',
  MostShared: 'By Shares'
} as const;

  export const GeneralSortTypeDescriptions: Record<GeneralSortType, string> = {
  MostRecent: 'Newest',
  LeastRecent: 'Oldest'
} as const;

  export const LevelTypeDescriptions: Record<string, string> = {
  Information: 'info',
  Warning: 'warning',
  Error: 'error',
  Fatal: 'fatal'
} as const;


// Mapping from code → description
export const CountryDescriptions: Record<Country, string> = {
  AF: 'Afghanistan',
  AL: 'Albania',
  DZ: 'Algeria',
  AD: 'Andorra',
  AO: 'Angola',
  AG: 'Antigua and Barbuda',
  AR: 'Argentina',
  AM: 'Armenia',
  AU: 'Australia',
  AT: 'Austria',
  AZ: 'Azerbaijan',
  BS: 'Bahamas',
  BH: 'Bahrain',
  BD: 'Bangladesh',
  BB: 'Barbados',
  BY: 'Belarus',
  BE: 'Belgium',
  BZ: 'Belize',
  BJ: 'Benin',
  BT: 'Bhutan',
  BO: 'Bolivia',
  BA: 'Bosnia and Herzegovina',
  BW: 'Botswana',
  BR: 'Brazil',
  BN: 'Brunei',
  BG: 'Bulgaria',
  BF: 'Burkina Faso',
  BI: 'Burundi',
  CV: 'Cabo Verde',
  KH: 'Cambodia',
  CM: 'Cameroon',
  CA: 'Canada',
  CF: 'Central African Republic',
  TD: 'Chad',
  CL: 'Chile',
  CN: 'China',
  CO: 'Colombia',
  KM: 'Comoros',
  CD: 'Congo (Democratic Republic)',
  CG: 'Congo (Republic)',
  CR: 'Costa Rica',
  HR: 'Croatia',
  CU: 'Cuba',
  CY: 'Cyprus',
  CZ: 'Czech Republic',
  DK: 'Denmark',
  DJ: 'Djibouti',
  DM: 'Dominica',
  DO: 'Dominican Republic',
  EC: 'Ecuador',
  EG: 'Egypt',
  SV: 'El Salvador',
  GQ: 'Equatorial Guinea',
  ER: 'Eritrea',
  EE: 'Estonia',
  SZ: 'Eswatini',
  ET: 'Ethiopia',
  FJ: 'Fiji',
  FI: 'Finland',
  FR: 'France',
  GA: 'Gabon',
  GM: 'Gambia',
  GE: 'Georgia',
  DE: 'Germany',
  GH: 'Ghana',
  GR: 'Greece',
  GD: 'Grenada',
  GT: 'Guatemala',
  GN: 'Guinea',
  GW: 'Guinea-Bissau',
  GY: 'Guyana',
  HT: 'Haiti',
  HN: 'Honduras',
  HU: 'Hungary',
  IS: 'Iceland',
  IN: 'India',
  ID: 'Indonesia',
  IR: 'Iran',
  IQ: 'Iraq',
  IE: 'Ireland',
  IL: 'Israel',
  IT: 'Italy',
  CI: 'Ivory Coast',
  JM: 'Jamaica',
  JP: 'Japan',
  JO: 'Jordan',
  KZ: 'Kazakhstan',
  KE: 'Kenya',
  KI: 'Kiribati',
  KP: 'Korea (North)',
  KR: 'Korea (South)',
  XK: 'Kosovo',
  KW: 'Kuwait',
  KG: 'Kyrgyzstan',
  LA: 'Laos',
  LV: 'Latvia',
  LB: 'Lebanon',
  LS: 'Lesotho',
  LR: 'Liberia',
  LY: 'Libya',
  LI: 'Liechtenstein',
  LT: 'Lithuania',
  LU: 'Luxembourg',
  MG: 'Madagascar',
  MW: 'Malawi',
  MY: 'Malaysia',
  MV: 'Maldives',
  ML: 'Mali',
  MT: 'Malta',
  MH: 'Marshall Islands',
  MR: 'Mauritania',
  MU: 'Mauritius',
  MX: 'Mexico',
  FM: 'Micronesia',
  MD: 'Moldova',
  MC: 'Monaco',
  MN: 'Mongolia',
  ME: 'Montenegro',
  MA: 'Morocco',
  MZ: 'Mozambique',
  MM: 'Myanmar',
  NA: 'Namibia',
  NR: 'Nauru',
  NP: 'Nepal',
  NL: 'Netherlands',
  NZ: 'New Zealand',
  NI: 'Nicaragua',
  NE: 'Niger',
  NG: 'Nigeria',
  MK: 'North Macedonia',
  NO: 'Norway',
  OM: 'Oman',
  PK: 'Pakistan',
  PW: 'Palau',
  PS: 'Palestine',
  PA: 'Panama',
  PG: 'Papua New Guinea',
  PY: 'Paraguay',
  PE: 'Peru',
  PH: 'Philippines',
  PL: 'Poland',
  PT: 'Portugal',
  QA: 'Qatar',
  RO: 'Romania',
  RU: 'Russia',
  RW: 'Rwanda',
  KN: 'Saint Kitts and Nevis',
  LC: 'Saint Lucia',
  VC: 'Saint Vincent and the Grenadines',
  WS: 'Samoa',
  SM: 'San Marino',
  ST: 'Sao Tome and Principe',
  SA: 'Saudi Arabia',
  SN: 'Senegal',
  RS: 'Serbia',
  SC: 'Seychelles',
  SL: 'Sierra Leone',
  SG: 'Singapore',
  SK: 'Slovakia',
  SI: 'Slovenia',
  SB: 'Solomon Islands',
  SO: 'Somalia',
  ZA: 'South Africa',
  SS: 'South Sudan',
  ES: 'Spain',
  LK: 'Sri Lanka',
  SD: 'Sudan',
  SR: 'Suriname',
  SE: 'Sweden',
  CH: 'Switzerland',
  SY: 'Syria',
  TW: 'Taiwan',
  TJ: 'Tajikistan',
  TZ: 'Tanzania',
  TH: 'Thailand',
  TL: 'Timor-Leste',
  TG: 'Togo',
  TO: 'Tonga',
  TT: 'Trinidad and Tobago',
  TN: 'Tunisia',
  TR: 'Turkey',
  TM: 'Turkmenistan',
  TV: 'Tuvalu',
  UG: 'Uganda',
  UA: 'Ukraine',
  AE: 'United Arab Emirates',
  GB: 'United Kingdom',
  US: 'United States of America',
  UY: 'Uruguay',
  UZ: 'Uzbekistan',
  VU: 'Vanuatu',
  VA: 'Vatican City',
  VE: 'Venezuela',
  VN: 'Vietnam',
  YE: 'Yemen',
  ZM: 'Zambia',
  ZW: 'Zimbabwe'
} as const


export function getStatusCodeClass(code: number): string {
  if (code > 499) return 'error'   // 500+ server errors
  if (code > 399) return 'warning' // 400–499 client errors
  return 'info'                    // 1–399 success/info
}


// utils/processingAnalytics.ts
export function getProcessingClass(ms: number): string {
  if (ms > 250) return 'error'     // 🐌 Server bottleneck / Severe database latency (> 250ms)
  if (ms > 50) return 'warning'   // ⚠️ Heavy operation or room for query optimization (51ms - 250ms)
  return 'info'                     // ⚡ Ideal, snappy in-memory execution (< 50ms)
}


export const DateScopeDescriptions: Record<DateScope, string> = {
  On: 'On',
  From: 'From',
  Until: 'Until',
  Between: 'Between'
} as const;

export const RoleTypeDescriptions: Record<RoleType, string> = {
  None: 'None',
  SuperAdmin: 'Super Admin',
  RoleManager: 'Role Manager',
  ContentModerator: 'Content Moderator',
  Publisher: 'Publisher',
  Editor: 'Editor',
  CustomerSupport: 'Customer Support'
} as const;

  export const VoteTypeDescriptions: Record<VoteType, string> = {
  Upvote: 'Upvote',
  Downvote: 'Downvote',
  None: 'None'
 
} as const;


  export const FaqCategoryDescriptions: Record<FaqCategory, string> = {
  General: 'General',
  Account: 'Account',
  Tale: 'Tale',
  Insight: 'Insight',
  Engagement: 'Engagement',
  Moderation: 'Moderation'
 
} as const;

  export const TaleStatusDescriptions: Record<TaleStatus, string> = {
  Created: 'Created',
  LaunchedByCreator: 'Published',
  HiddenByModeration: 'Hidden',
  HiddenByAdmin: 'Suspended',
  CertifiedByAdmin: 'Certified',
  ArchivedByAdmin: 'Archived',
  LaunchedToArchivedByCreator: 'Archived',
  CertifiedToArchivedByCreator: 'Archived'
} as const;

  export const InsightStatusDescriptions: Record<InsightStatus, string> = {
  Created: 'Created',
  LaunchedByCreator: 'Published',
  HiddenByModeration: 'Hidden',
  HiddenByAdmin: 'Suspended',
  CertifiedByAdmin: 'Certified',
  ArchivedByAdmin: 'Archived',
  LaunchedToArchivedByCreator: 'Archived',
  CertifiedToArchivedByCreator: 'Archived'
} as const;

  export const ContactTypeDescriptions: Record<ContactType, string> = {
  Email: 'Email',
  Facebook: 'Facebook',
  Twitter: 'Twitter',
  LinkedIn: 'LinkedIn'
} as const;


  export const AccountStatusDescriptions: Record<AccountStatus, string> = {
  Active: 'Active',
  HiddenByModeration: 'Hidden',
  SuspendedByAdmin: 'Suspended',
  BannedByAdmin: 'Banned'
} as const;

  export const CategoryDescriptions: Record<Category, string> = {
  PoliticsGovernance: 'Politics & Government',
  Sports: 'Sports',
  FashionEntertainment: 'Fashion & Entertainment',
  Education: 'Education',
  ScienceTechnology : 'Science & Technology',
  BusinessEconomy : 'Business & Ecconomy',
  MedicineHealthcare: 'Medicine & Healthcare',
  LawOrder: 'Law & Order',
  HumanInterestLifestyle: 'Human Interest & Lifestyle',
  HistoryCulture: 'History & Culture',
  TheEnvironment : 'The Environment',
  Miscellaneous : 'Miscellaneous'
} as const;

  export const CommentStatusDescriptions: Record<CommentStatus, string> = {
  Active: 'Active',
  HiddenByModeration: 'Hidden',
  HiddenByAdmin: 'Suspended',
  CertifiedByAdmin: 'Certified',
  ArchivedByAdmin: 'Archived By Admin',
  ActiveToArchivedByCreator: 'Archived By Creator (Active)',
  CertifiedToArchivedByCreator: 'Archived By Creator (Certified)'
} as const;

export const ActivityTypeDescriptions: Record<ActivityType, string> = {
 // Account
   CreatedAccount_Account : 'Created Account',
   LoggedIn_Account : 'Logged In',
   LoggedOut_Account : 'Logged Out',
   ChangedPassword_Account : 'Changed password',
   ResetPassword_Account : 'Reset Password',
   UpdatedProfile_Account : 'Updated Profile',
   UpdatedProfilePhoto_Account : 'Updated Profile Photo',
   AddedContact_Account : 'Added Contact',
   UpdatedContact_Account : 'Updated Contact',
   AccountBanned_Account : 'Account Banned',
   AccountReinstated_Account : 'Account Reinstated',
   AccountSuspended_Account : 'Account Suspended',
   AccountModerated_Account : 'Account Community Suspended',
   ModerationApplied_Account : 'Modeartion Applied',
   AccountMilestoned_Account : 'Milestone Reached',

  // Role
   RoleAssigned_Role : 'Role Assigned',
   RoleReassigned_Role : 'Role Reassigned',
   RoleDeactivated_Role : 'Role Deactivated',
   RoleActivated_Role : 'Role Activated',

  // Writer
   WriterOnboarded_Authoring : 'Writing Onboarded',
   WritingPrivilegeSuspended_Authoring : 'Writing Privilege Suspended',
   WritingPrivilegeReinstated_Authoring : 'Writing Privilege Reinstated',

  // Tale
   TaleCreated_Tale : 'Tale Created',
   TaleLaunched_Tale : 'Tale Published',
   TaleLaunched : 'Tale Published',
   TaleUpdated_Tale : 'Tale Updated',
   TaleSelfDeleted_Tale : 'Tale Deleted',
   TaleSelfArchived_Tale : 'Tale Self Archived',
   TaleSelfUnarchived_Tale : 'Tale Self Unarchived',
   TaleSummaryUpdated_Tale : 'Tale Sumamry Updated',
   TaleDetailUpdated_Tale : 'Tale Details Updated',
   TaleCountryUpdated_Tale : 'Tale Country Updated',
   TaleWatchlistUpdated_Tale : 'Tale Watchlist Updated',
   TalePhotoUpdated_Tale : 'Tale Photo Updated',
   TaleSuspended_Tale : 'Tale Admin Suspended',
   TaleModerated_Tale : 'Tale Community Suspended',
   TaleHasEngagement_Tale : 'Tale Engaged',
   TaleArchived_Tale : 'Tale Admin Archived',
   TaleAddendumUpdated_Tale : 'Tale Addendum Updated',
   TaleTagged_Tale : 'Tale Tagged',
   TaleUntagged_Tale : 'Tale Untagged',
   TaleCertified_Tale : 'Tale Certified',
   TaleMilestoned_Tale : 'Tale Milestoned',

  // Insight
   InsightCreated_Insight : 'Insight Created',
   InsightLaunched_Insight : 'Insight Published',
   InsightLaunched : 'Insight Published',
   InsightUpdated_Insight : 'Insight Updated',
   InsightSelfArchived_Insight : 'Insight Self Archived',
   InsightSelfUnarchived_Insight : 'Insight Self Unarchived',
   InsightSummaryUpdated_Insight : 'Insight Summary Updated',
   InsightDetailUpdated_Insight : 'Insight Details Updated',
   InsightCountryUpdated_Insight : 'Insight Country Updated',
   InsightPhotoUpdated_Insight : 'Insight Photo Updated',
   InsightArchived_Insight : 'Insight Admin Archived',
   InsightAddendumUpdated_Insight : 'Insight Addendum Updated',
   InsightTagged_Insight : 'Insight Tagged',
   InsightUntagged_Insight : 'Insight Untagged',
   InsightSelfDeleted_Insight : 'Insight Deleted',
   InsightCertified_Insight : 'Insight Certfiied',
   InsightSuspended_Insight : 'Insight Admin Suspended',
   InsightModerated_Insight : 'Insight Community Suspended',
   InsightMilestoned_Insight : 'Insight Milestoned',

  // Comment
   Commented_Comment : 'Commented',
   Replied_Comment : 'Replied',
   CommentReplied_Comment : 'Comment Replied',
   CommentSelfDeleted_Comment : 'Comment Deleted',
   CommentSelfArchived_Comment : 'Comment Self Archived',
   CommentSuspended_Comment : 'Comment Admin Suspended',
   CommentModerated_Comment : 'Comment Community Suspended',
   CommentArchived_Comment : 'Comment Admin Archived',
   CommentCertified_Comment : 'Comment Certified',
   CommentAddendumUpdated_Comment : 'Comment Addendum Updated',
   CommentUpdated_Comment : 'Comment Updated',
   ReplySelfDeleted_Comment : 'Response Deleted',
   CommentMilestoned_Comment : 'Comment Milestoned',

  // Engagement
   ContentSavedToFavorites_Engagement : 'Content Saved To Favorites',
   ContentRemovedFromFavorites_Engagement : 'Content Removed From Favorites',
   ContentRestoredToFavorites_Engagement : 'Content Restored To Favorites',
   ContentFlagged_Engagement : 'Content Flagged',
   ContentShared_Engagement : 'Content Shared',
   ContentUpvoted_Engagement : 'Content Upvoted',
   ContentDownvoted_Engagement : 'Content Downvoted',

} as const;
