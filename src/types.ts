export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  department: string;
  role: UserRole;
  title: string;
  avatar: string;
  phone: string;
  email: string;
  status: 'online' | 'busy' | 'leave' | 'offline';
  joinedDate: string;
}

export type AttendanceStatus = 'normal' | 'late' | 'early_leave' | 'absent' | 'supplement';

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  department: string;
  date: string; // YYYY-MM-DD
  clockInTime?: string; // HH:mm:ss
  clockOutTime?: string; // HH:mm:ss
  clockInLocation?: string;
  clockOutLocation?: string;
  status: AttendanceStatus;
  workHours?: number;
  note?: string;
}

export interface AttendanceRule {
  workStartTime: string; // e.g. "09:00"
  workEndTime: string; // e.g. "18:00"
  flexMinutes: number; // e.g. 15
  officeLocationName: string;
  allowMakeup: boolean;
}

export type ApprovalType = 'leave' | 'reimbursement' | 'trip' | 'supplies' | 'overtime';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revoked';

export interface ApprovalStep {
  stepIndex: number;
  roleName: string;
  approverId?: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  comment?: string;
  updatedAt?: string;
}

export interface ApprovalItem {
  id: string;
  title: string;
  type: ApprovalType;
  applicantId: string;
  applicantName: string;
  department: string;
  createdAt: string;
  status: ApprovalStatus;
  currentStepIndex: number;
  steps: ApprovalStep[];
  priority: 'low' | 'normal' | 'urgent';
  details: {
    // Leave
    leaveType?: 'annual' | 'sick' | 'personal' | 'compensatory';
    startDate?: string;
    endDate?: string;
    durationDays?: number;
    // Reimbursement
    amount?: number;
    expenseCategory?: string;
    invoiceCount?: number;
    // Trip
    destination?: string;
    tripReason?: string;
    // Supplies
    itemName?: string;
    itemQuantity?: number;
    // Overtime
    overtimeHours?: number;
    // Common
    reason: string;
    remarks?: string;
  };
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'system' | 'approval_card';
  status: 'sent' | 'delivered' | 'read' | 'unread';
  cardData?: {
    approvalId?: string;
    approvalTitle?: string;
    approvalType?: string;
    status?: string;
  };
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'system_notice';
  memberIds: string[];
  lastMessage?: string;
  lastTimestamp?: string;
  unreadCount: number;
  avatar?: string;
  departmentTag?: string;
}

export interface Department {
  id: string;
  name: string;
  managerName: string;
  employeeCount: number;
  description: string;
}
