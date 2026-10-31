export type Grade =
  | 'الصف الرابع الابتدائي'
  | 'الصف الخامس الابتدائي'
  | 'الصف السادس الابتدائي'
  | 'الصف الأول الإعدادي'
  | 'الصف الثاني الإعدادي'
  | 'الصف الثالث الإعدادي'
  | 'الصف الأول الثانوي'
  | 'الصف الثاني الثانوي – عام'
  | 'الصف الثاني الثانوي – بكالوريا'
  | 'الصف الثالث الثانوي'
  | 'كل الصفوف';

export const GRADES: Grade[] = [
  'الصف الرابع الابتدائي',
  'الصف الخامس الابتدائي',
  'الصف السادس الابتدائي',
  'الصف الأول الإعدادي',
  'الصف الثاني الإعدادي',
  'الصف الثالث الإعدادي',
  'الصف الأول الثانوي',
  'الصف الثاني الثانوي – عام',
  'الصف الثاني الثانوي – بكالوريا',
  'الصف الثالث الثانوي',
];

export interface Course {
  id: string;
  title: string;
  description?: string;
  grade: string;
  price: number;
  days: number;
  status?: 'published' | 'archived';
  isFree?: boolean;
  active?: boolean;
  expiresAt?: string;
  imageUrl?: string;
  imageFileId?: string;
  content?: CourseContentItem[];
  created?: string;
}

export interface CourseContentItem {
  id: string;
  type: 'video' | 'image' | 'note' | 'homework';
  title: string;
  grade?: string;
  courseId?: string;
  link?: string;
  fileId?: string;
  fileName?: string;
  mime?: string;
  url?: string;
  isFree?: boolean;
  blocked?: string[];
  lecture?: string;
  created?: string;
}

export interface ExamQuestion {
  id?: string;
  text: string;
  kind: 'mcq' | 'essay' | 'true_false';
  options?: string[];
  correctKey?: string;
  modelAnswer?: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'pdf';
  points?: number;
}

export interface Exam {
  id: string;
  title: string;
  grade: string;
  courseId?: string;
  type: 'اختياري' | 'مقالي' | 'مختلط';
  questions: (string | { text: string; points?: number })[];
  kinds?: ('mcq' | 'essay' | 'true_false')[] | null;
  options?: string[][];
  key?: (string | null)[] | string | null;
  models?: string[];
  modelAnswer?: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'pdf';
  attachmentFileId?: string;
  taken?: boolean;
  totalScore?: number;
  created?: string;
}

export interface QuestionFeedbackItem {
  questionIndex: number;
  questionText?: string;
  studentAnswer: string;
  modelAnswer?: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  answers: string[];
  total: number;
  score: number | null;
  label?: string;
  status: 'pending' | 'graded';
  aiGraded?: boolean;
  aiFeedback?: string;
  questionFeedback?: QuestionFeedbackItem[];
  created: string;
  appeal?: {
    id: string;
    resultId: string;
    studentName: string;
    examTitle: string;
    reason: string;
    status: 'pending' | 'reviewed';
    score?: string;
  } | null;
}

export interface Notice {
  id: string;
  kind: 'announcement' | 'schedule';
  text: string;
  grade: string;
  imageUrl?: string;
  created: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'new_content' | 'new_exam' | 'result_ready';
  title: string;
  message: string;
  read: boolean;
  created: string;
}

export interface AiChatMessage {
  role: 'user' | 'model';
  parts: { text: string; inlineData?: any }[];
  timestamp: string;
}

export interface AiChatSession {
  id: string;
  studentId: string;
  messages: AiChatMessage[];
  updatedAt: string;
}


export interface Note {
  id: string;
  studentId: string;
  text: string;
  created: string;
}

export interface Message {
  id: string;
  studentId: string;
  name: string;
  text: string;
  reply: string;
  created: string;
}

export interface LiveSession {
  id: string;
  title: string;
  grade: string;
  courseId?: string;
  courseTitle?: string;
  meetUrl: string;
  meetCode?: string;
  status: 'active' | 'scheduled' | 'ended' | 'live' | 'upcoming';
  scheduledAt: string;
  notes?: string;
  created: string;
}

export interface ManualGateway {
  id: string;
  title: string;
  provider: 'vodafone' | 'instapay' | 'fawry' | 'bank' | 'orange' | 'etisalat' | 'we' | 'custom' | string;
  accountNumber: string;
  accountHolder: string;
  instructions: string;
  active: boolean;
  created?: string;
}

export interface WalletTransaction {
  id: string;
  studentId: string;
  studentName?: string;
  studentPhone?: string;
  studentCode?: string;
  type: 'deposit' | 'purchase' | 'adjustment';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  gatewayId?: string;
  gatewayTitle?: string;
  accountNumber?: string;
  senderPhone?: string;
  referenceNumber?: string;
  receiptFile?: string;
  receiptUrl?: string;
  courseId?: string;
  courseTitle?: string;
  notes?: string;
  rejectionReason?: string;
  created: string;
  reviewedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed' | 'free_course';
  discountValue: number;
  courseId?: string;
  maxUses?: number;
  usedCount: number;
  expiresAt: string;
  created: string;
}

export interface StudentProfile {
  id?: string;
  name: string;
  grade: string;
  code: string;
  subEnd?: string;
  sub: boolean;
  phone: string;
  governorate?: string;
  parentName?: string;
  parentPhone?: string;
  walletBalance?: number;
}

export interface StudentData {
  profile: StudentProfile;
  courses: Course[];
  notices: Notice[];
  content: CourseContentItem[];
  exams: Exam[];
  results: ExamResult[];
  messages: Message[];
  notes: Note[];
  notifications: AppNotification[];
  gateways?: ManualGateway[];
  walletTransactions?: WalletTransaction[];
  onlinePay?: boolean;
  liveSessions?: LiveSession[];
  coupons?: Coupon[];
}

export interface ParentProgress {
  videosWatched: number;
  videosTotal: number;
  filesOpened: number;
  filesTotal: number;
  examsDone: number;
  examsTotal: number;
  notes: number;
  average: number | null;
  label: string;
  lastActive: string;
}

export interface ParentData {
  name: string;
  grade: string;
  status: string;
  sub: boolean;
  subEnd?: string;
  results: ExamResult[];
  progress: ParentProgress;
  liveSessions?: LiveSession[];
  code?: string;
}

export interface PaymentMethod {
  title: string;
  details?: string;
}

export interface SocialLink {
  id: string;
  platform: 'linkedin' | 'x' | 'tiktok' | 'youtube' | 'telegram' | 'instagram' | 'facebook' | 'whatsapp' | 'custom' | string;
  title: string;
  url: string;
  active?: boolean;
}

export interface PlatformFeature {
  id: string;
  icon: string;
  title: string;
  desc: string;
  color?: string;
  bg?: string;
  border?: string;
}

export interface AboutUsData {
  title: string;
  subtitle: string;
  subject?: string;
  bio: string;
  vision: string;
  mission: string;
  experienceYears?: string | number;
  studentsCount?: string | number;
  lecturesCount?: string | number;
  satisfactionRate?: string | number;
  teacherImage?: string;
  features?: PlatformFeature[];
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  author?: string;
  category?: string;
  readTime?: string;
  imageUrl?: string;
  tags?: string[];
  published: boolean;
  created: string;
}

export interface StoreBook {
  id: string;
  title: string;
  author?: string;
  grade: string;
  price: number;
  description?: string;
  coverImage?: string;
  pdfUrl?: string;
  pagesCount?: number;
  isFree?: boolean;
  published: boolean;
  downloadsCount?: number;
  created: string;
}

export interface StoreOrder {
  id: string;
  itemType: 'course' | 'book';
  itemId: string;
  itemTitle: string;
  amount: number;
  paymentMethod: 'wallet' | 'manual' | 'free';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  buyerName: string;
  buyerPhone?: string;
  studentId?: string;
  studentCode?: string;
  gatewayId?: string;
  receiptUrl?: string;
  referenceNumber?: string;
  downloadUrl?: string;
  rejectionReason?: string;
  created: string;
  reviewedAt?: string;
}

export interface TeacherProfile {
  id: string;
  name: string;
  subjectName: string;
  subjectCategory: string;
  bio?: string;
  phone: string;
  password?: string;
  avatarUrl?: string;
  active: boolean;
  allowedGrades?: string[];
  toolsConfig?: {
    arabicLexicon?: boolean;
    translator?: boolean;
    geoHistoryMap?: boolean;
    socratesPhilosophy?: boolean;
    codeSandbox?: boolean;
    scienceLab?: boolean;
    mathCalculator?: boolean;
    virtualLabChemistry?: boolean;
    physicsCircuitsLab?: boolean;
    biologyMicroscopeLab?: boolean;
  };
  created: string;
}

export interface PublicData {
  name: string;
  subtitle?: string;
  logoFile?: string;
  logoSize?: number;
  bgPattern?: string;
  primaryColor?: string;
  headingColor?: string;
  textColor?: string;
  fontFamily?: string;
  panelBg?: string;
  cardBg?: string;
  accentGold?: string;
  pageThemes?: Record<string, any>;
  academicColors?: Record<string, any>;
  studentTabsVisibility?: Record<string, boolean>;
  registrationFieldsConfig?: Record<string, any>;
  allowedGrades?: string[];
  gradeInteractiveToolsConfig?: Record<string, Record<string, boolean>>;
  reviewsConfig?: Record<string, any>;
  showAiAssistant?: boolean;
  uiTemplate?: string;
  payments: PaymentMethod[];
  onlinePay: boolean;
  hero: string;
  courses: Course[];
  socialLinks?: SocialLink[];
  gateways?: ManualGateway[];
  liveSessions?: LiveSession[];
  articles?: Article[];
  books?: StoreBook[];
  topStudents?: TopStudent[];
  aboutUs?: AboutUsData;
  teachers?: TeacherProfile[];
  activeTeacher?: TeacherProfile;
  platformLanguages?: string[];
  studentVisibleTools?: Record<string, boolean>;
  showInteractiveToolsInRegister?: boolean;
  registrationTools?: Record<string, boolean>;
}

export interface TopStudent {
  id: string;
  name: string;
  grade: string;
  score: string;
  rank?: string;
  year?: string;
  school?: string;
  photoUrl?: string;
  quote?: string;
  badge?: string;
  featured?: boolean;
  created: string;
}

export interface ActivationCode {
  id: string;
  code?: string;
  hint: string;
  days: number;
  courseId: string;
  courseTitle?: string;
  status: 'unused' | 'used' | 'cancelled';
  usedBy?: string;
  usedByName?: string;
  usedAt?: string;
  created: string;
}

export interface Order {
  id: string;
  status: 'pending' | 'paid' | 'review' | 'confirmed' | 'cancelled' | 'shipped' | 'delivered';
  amount: number;
  created: string;
  paidAt?: string;
  student?: string;
  studentId?: string;
  courseId?: string;
  course?: string;
}

export interface TeacherData {
  name: string;
  subtitle?: string;
  logoFile?: string;
  logoSize?: number;
  bgPattern?: string;
  primaryColor?: string;
  headingColor?: string;
  textColor?: string;
  fontFamily?: string;
  panelBg?: string;
  cardBg?: string;
  accentGold?: string;
  pageThemes?: Record<string, any>;
  academicColors?: Record<string, any>;
  studentTabsVisibility?: Record<string, boolean>;
  registrationFieldsConfig?: Record<string, any>;
  allowedGrades?: string[];
  gradeInteractiveToolsConfig?: Record<string, Record<string, boolean>>;
  reviewsConfig?: Record<string, any>;
  showAiAssistant?: boolean;
  uiTemplate?: string;
  platformLanguages?: string[];
  notificationConfig?: Record<string, any>;
  mediaBank?: any[];
  bookings?: any[];
  payments: PaymentMethod[];
  onlinePay?: boolean;
  orders: Order[];
  students: any[];
  parents: any[];
  courses: Course[];
  content: CourseContentItem[];
  notices: Notice[];
  exams: Exam[];
  results: ExamResult[];
  appeals: any[];
  messages: Message[];
  codes: ActivationCode[];
  notifications: AppNotification[];
  socialLinks?: SocialLink[];
  gateways?: ManualGateway[];
  paymentGateways?: ManualGateway[];
  walletTransactions?: WalletTransaction[];
  walletRechargeRequests?: WalletTransaction[];
  packageOrders?: any[];
  liveSessions?: LiveSession[];
  liveAttendance?: any[];
  coupons?: Coupon[];
  supervisors?: any[];
  aboutUs?: AboutUsData;
  articles?: Article[];
  books?: StoreBook[];
  storeOrders?: StoreOrder[];
  topStudents?: TopStudent[];
}

