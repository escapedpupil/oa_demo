import {
  User,
  AttendanceRecord,
  AttendanceRule,
  ApprovalItem,
  ChatMessage,
  ChatChannel,
  Department,
  ApprovalStatus,
  AttendanceStatus,
} from '../types';

const DB_NAME = 'oa_local_database';
const DB_VERSION = 1;

// Default initial data seeds
export const DEFAULT_USERS: User[] = [
  {
    id: 'u-admin',
    username: 'admin',
    password: 'admin',
    name: '陈管理员',
    department: '总经办',
    role: 'admin',
    title: '系统管理员 / 运营总监',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    phone: '13800138000',
    email: 'admin@company.com',
    status: 'online',
    joinedDate: '2023-01-01',
  },
  {
    id: 'u-1',
    username: 'zhangxf',
    password: '123456',
    name: '张晓峰',
    department: '研发部',
    role: 'employee',
    title: '高级全栈工程师',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    phone: '13912345678',
    email: 'zhangxf@company.com',
    status: 'online',
    joinedDate: '2023-03-15',
  },
  {
    id: 'u-2',
    username: 'limeiling',
    password: '123456',
    name: '李美玲',
    department: '人事行政部',
    role: 'manager',
    title: '人事行政主管',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    phone: '13798765432',
    email: 'limeiling@company.com',
    status: 'online',
    joinedDate: '2022-06-10',
  },
  {
    id: 'u-3',
    username: 'wangjg',
    password: '123456',
    name: '王建国',
    department: '财务部',
    role: 'manager',
    title: '财务总监',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    phone: '13655556666',
    email: 'wangjg@company.com',
    status: 'busy',
    joinedDate: '2021-08-01',
  },
  {
    id: 'u-4',
    username: 'liuting',
    password: '123456',
    name: '刘婷',
    department: '市场部',
    role: 'employee',
    title: '资深品牌策划',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    phone: '13588889999',
    email: 'liuting@company.com',
    status: 'leave',
    joinedDate: '2023-09-01',
  },
  {
    id: 'u-5',
    username: 'zhaolei',
    password: '123456',
    name: '赵磊',
    department: '研发部',
    role: 'manager',
    title: '技术研发总监',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    phone: '13977778888',
    email: 'zhaolei@company.com',
    status: 'online',
    joinedDate: '2022-01-15',
  },
];

export const DEFAULT_DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: '总经办', managerName: '陈管理员', employeeCount: 3, description: '企业核心经营策略与行政统筹' },
  { id: 'dept-2', name: '研发部', managerName: '赵磊', employeeCount: 18, description: '负责产品研发、系统架构与技术维护' },
  { id: 'dept-3', name: '人事行政部', managerName: '李美玲', employeeCount: 6, description: '负责企业人力资源、考勤薪酬与后勤保障' },
  { id: 'dept-4', name: '财务部', managerName: '王建国', employeeCount: 5, description: '负责公司财务核算、预算控制与报销审批' },
  { id: 'dept-5', name: '市场部', managerName: '孙华', employeeCount: 10, description: '负责市场营销拓展、渠道合作与品牌建设' },
];

export const DEFAULT_RULE: AttendanceRule = {
  workStartTime: '09:00',
  workEndTime: '18:00',
  flexMinutes: 15,
  officeLocationName: '高新科技产业园A座·801室 (企业Wi-Fi范围内)',
  allowMakeup: true,
};

// Helper for today & relative dates
const getTodayStr = (offsetDays = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const DEFAULT_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    userId: 'u-admin',
    userName: '陈管理员',
    department: '总经办',
    date: getTodayStr(0),
    clockInTime: '08:52:14',
    clockInLocation: '公司总部园区·Wi-Fi自动识别',
    status: 'normal',
    note: '今日早会准时到达',
  },
  {
    id: 'att-2',
    userId: 'u-1',
    userName: '张晓峰',
    department: '研发部',
    date: getTodayStr(0),
    clockInTime: '09:08:22',
    clockInLocation: '公司大堂闸机打卡',
    status: 'normal',
    note: '',
  },
  {
    id: 'att-3',
    userId: 'u-2',
    userName: '李美玲',
    department: '人事行政部',
    date: getTodayStr(0),
    clockInTime: '08:45:00',
    clockInLocation: '园区定位打卡',
    status: 'normal',
  },
  {
    id: 'att-4',
    userId: 'u-3',
    userName: '王建国',
    department: '财务部',
    date: getTodayStr(0),
    clockInTime: '09:28:10',
    clockInLocation: '远程打卡申请',
    status: 'late',
    note: '路上交通拥堵，已报备',
  },
  {
    id: 'att-5',
    userId: 'u-4',
    userName: '刘婷',
    department: '市场部',
    date: getTodayStr(0),
    status: 'absent',
    note: '已请年假',
  },
  // Yesterday's records
  {
    id: 'att-6',
    userId: 'u-admin',
    userName: '陈管理员',
    department: '总经办',
    date: getTodayStr(-1),
    clockInTime: '08:55:00',
    clockOutTime: '18:35:10',
    clockInLocation: '公司总部园区',
    clockOutLocation: '公司总部园区',
    status: 'normal',
    workHours: 9.6,
  },
  {
    id: 'att-7',
    userId: 'u-1',
    userName: '张晓峰',
    department: '研发部',
    date: getTodayStr(-1),
    clockInTime: '09:02:18',
    clockOutTime: '20:15:00',
    clockInLocation: '公司大堂',
    clockOutLocation: '公司研发区',
    status: 'normal',
    workHours: 11.2,
    note: '发布版本加班',
  },
];

export const DEFAULT_APPROVALS: ApprovalItem[] = [
  {
    id: 'app-001',
    title: '张晓峰的调休请假申请',
    type: 'leave',
    applicantId: 'u-1',
    applicantName: '张晓峰',
    department: '研发部',
    createdAt: `${getTodayStr(0)} 09:30:00`,
    status: 'pending',
    currentStepIndex: 0,
    priority: 'normal',
    steps: [
      { stepIndex: 0, roleName: '部门总监/主管审批', approverId: 'u-admin', approverName: '陈管理员', status: 'pending' },
      { stepIndex: 1, roleName: '人事行政复核备案', approverId: 'u-2', approverName: '李美玲', status: 'pending' },
    ],
    details: {
      leaveType: 'compensatory',
      startDate: `${getTodayStr(1)} 09:00`,
      endDate: `${getTodayStr(1)} 18:00`,
      durationDays: 1,
      reason: '因上周末项目上线应急加班支持，现申请调休一天。',
      remarks: '工作已与同组李工完成交接。',
    },
  },
  {
    id: 'app-002',
    title: '刘婷的市场调研差旅费用报销',
    type: 'reimbursement',
    applicantId: 'u-4',
    applicantName: '刘婷',
    department: '市场部',
    createdAt: `${getTodayStr(-1)} 14:20:00`,
    status: 'pending',
    currentStepIndex: 1,
    priority: 'urgent',
    steps: [
      { stepIndex: 0, roleName: '直属部门主管', approverId: 'u-admin', approverName: '陈管理员', status: 'approved', comment: '差旅行程已核实，同意报销', updatedAt: `${getTodayStr(-1)} 16:00:00` },
      { stepIndex: 1, roleName: '财务主管审核入账', approverId: 'u-3', approverName: '王建国', status: 'pending' },
    ],
    details: {
      amount: 2480.0,
      expenseCategory: '差旅交通及住宿费',
      invoiceCount: 4,
      reason: '赴上海参加2026年华东数字化企业创新峰会及渠道客户商务拜访。',
      remarks: '电子发票及行程水单均已附齐。',
    },
  },
  {
    id: 'app-003',
    title: '赵磊的办公测试用高配显示器申领',
    type: 'supplies',
    applicantId: 'u-5',
    applicantName: '赵磊',
    department: '研发部',
    createdAt: `${getTodayStr(-2)} 10:15:00`,
    status: 'approved',
    currentStepIndex: 1,
    priority: 'normal',
    steps: [
      { stepIndex: 0, roleName: '部门总监审批', approverId: 'u-admin', approverName: '陈管理员', status: 'approved', comment: '研发团队生产力必需，予以支持', updatedAt: `${getTodayStr(-2)} 11:00:00` },
      { stepIndex: 1, roleName: '行政后勤资产出库', approverId: 'u-2', approverName: '李美玲', status: 'approved', comment: '库存有现货，已领用出库登记', updatedAt: `${getTodayStr(-2)} 14:30:00` },
    ],
    details: {
      itemName: 'Dell 27寸 4K 专业级超清显示器',
      itemQuantity: 1,
      reason: '前端UI组件库重构与微服务全景监控大屏调试使用。',
    },
  },
  {
    id: 'app-004',
    title: '李美玲的年度部门团建方案审批',
    type: 'trip',
    applicantId: 'u-2',
    applicantName: '李美玲',
    department: '人事行政部',
    createdAt: `${getTodayStr(-3)} 11:30:00`,
    status: 'approved',
    currentStepIndex: 1,
    priority: 'normal',
    steps: [
      { stepIndex: 0, roleName: '总经办审批', approverId: 'u-admin', approverName: '陈管理员', status: 'approved', comment: '方案详实，注意安全与预算控制', updatedAt: `${getTodayStr(-3)} 15:20:00` },
      { stepIndex: 1, roleName: '财务预支审核', approverId: 'u-3', approverName: '王建国', status: 'approved', comment: '年度福利预算内额度合规', updatedAt: `${getTodayStr(-3)} 17:00:00` },
    ],
    details: {
      destination: '莫干山生态度假区',
      startDate: `${getTodayStr(7)} 08:30`,
      endDate: `${getTodayStr(8)} 18:00`,
      tripReason: '增强团队凝聚力，总结上半年经营成效，开展团队破冰活动。',
      reason: '增强团队凝聚力，总结上半年经营成效，开展团队破冰活动。',
    },
  },
];

export const DEFAULT_CHANNELS: ChatChannel[] = [
  {
    id: 'chan-notice',
    name: '全员通知公告',
    type: 'system_notice',
    memberIds: ['all'],
    lastMessage: '【系统通知】欢迎使用全新企业协同OA移动办公系统！',
    lastTimestamp: '09:00',
    unreadCount: 1,
    avatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&auto=format&fit=crop&q=80',
    departmentTag: '全公司',
  },
  {
    id: 'chan-team',
    name: '企业综合工作交流群',
    type: 'group',
    memberIds: ['u-admin', 'u-1', 'u-2', 'u-3', 'u-4', 'u-5'],
    lastMessage: '张晓峰：今日版本新特性已提交测试环境，请各部门查验。',
    lastTimestamp: '09:25',
    unreadCount: 2,
    avatar: 'https://images.unsplash.com/photo-1522071823996-a67b2d56a0cf?w=100&auto=format&fit=crop&q=80',
    departmentTag: '跨部门协同',
  },
  {
    id: 'chan-direct-zhang',
    name: '张晓峰 (高级工程师)',
    type: 'direct',
    memberIds: ['u-admin', 'u-1'],
    lastMessage: '陈总，我的调休审批刚刚提交了，有空麻烦您过目一下~',
    lastTimestamp: '09:32',
    unreadCount: 1,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    departmentTag: '研发部',
  },
  {
    id: 'chan-direct-li',
    name: '李美玲 (人事行政主管)',
    type: 'direct',
    memberIds: ['u-admin', 'u-2'],
    lastMessage: '收到！本月考勤报表已自动归档汇总。',
    lastTimestamp: '昨天 17:45',
    unreadCount: 0,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    departmentTag: '人事行政部',
  },
];

export const DEFAULT_MESSAGES: Record<string, ChatMessage[]> = {
  'chan-notice': [
    {
      id: 'msg-n-1',
      channelId: 'chan-notice',
      senderId: 'sys',
      senderName: '系统企业广播',
      senderAvatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&auto=format&fit=crop&q=80',
      content: '📢【公告】欢迎使用企业OA协同办公管理系统！第一版本支持员工移动考勤打卡、日常多场景审批流程流转，以及即时内部通讯与全员通讯录。所有数据采用手机本地数据库持久存储，断网亦可顺畅运行。',
      timestamp: `${getTodayStr(0)} 08:30:00`,
      type: 'system',
      status: 'read',
    },
    {
      id: 'msg-n-2',
      channelId: 'chan-notice',
      senderId: 'sys',
      senderName: '行政部广播',
      senderAvatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&auto=format&fit=crop&q=80',
      content: '📌【温馨提醒】请全体同事每日工作前准时完成上下班打卡，遇到外勤出差或异常情况请及时提交补卡申请。',
      timestamp: `${getTodayStr(0)} 09:00:00`,
      type: 'text',
      status: 'unread',
    },
  ],
  'chan-team': [
    {
      id: 'msg-t-1',
      channelId: 'chan-team',
      senderId: 'u-admin',
      senderName: '陈管理员',
      senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
      content: '各位同事早上好，本周重点关注系统联调进度，有审批待办的请及时处理。',
      timestamp: `${getTodayStr(0)} 09:05:00`,
      type: 'text',
      status: 'read',
    },
    {
      id: 'msg-t-2',
      channelId: 'chan-team',
      senderId: 'u-2',
      senderName: '李美玲',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      content: '收到，人事行政部已完成本周入职新员工的权限指派。',
      timestamp: `${getTodayStr(0)} 09:12:00`,
      type: 'text',
      status: 'read',
    },
    {
      id: 'msg-t-3',
      channelId: 'chan-team',
      senderId: 'u-1',
      senderName: '张晓峰',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      content: '张晓峰：今日版本新特性已提交测试环境，请各部门查验。',
      timestamp: `${getTodayStr(0)} 09:25:00`,
      type: 'text',
      status: 'unread',
    },
  ],
  'chan-direct-zhang': [
    {
      id: 'msg-z-1',
      channelId: 'chan-direct-zhang',
      senderId: 'u-1',
      senderName: '张晓峰',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      content: '陈总，我的调休审批刚刚提交了，有空麻烦您过目一下~',
      timestamp: `${getTodayStr(0)} 09:32:00`,
      type: 'text',
      status: 'unread',
    },
  ],
  'chan-direct-li': [
    {
      id: 'msg-l-1',
      channelId: 'chan-direct-li',
      senderId: 'u-2',
      senderName: '李美玲',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      content: '收到！本月考勤报表已自动归档汇总。',
      timestamp: '昨天 17:45',
      type: 'text',
      status: 'read',
    },
  ],
};

// Local storage key constants
const STORAGE_KEYS = {
  USERS: 'oa_users_store',
  CURRENT_USER: 'oa_current_user',
  ATTENDANCE: 'oa_attendance_store',
  RULES: 'oa_rules_store',
  APPROVALS: 'oa_approvals_store',
  CHANNELS: 'oa_channels_store',
  MESSAGES: 'oa_messages_store',
  DEPARTMENTS: 'oa_departments_store',
};

class LocalDatabaseService {
  private initialized = false;

  private readStorage<T>(key: string, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  }

  private writeStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error('LocalStorage write error:', err);
    }
  }

  public async init(): Promise<void> {
    if (this.initialized) return;

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.writeStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      // Default to admin
      this.writeStorage(STORAGE_KEYS.CURRENT_USER, DEFAULT_USERS[0]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
      this.writeStorage(STORAGE_KEYS.ATTENDANCE, DEFAULT_ATTENDANCE);
    }
    if (!localStorage.getItem(STORAGE_KEYS.RULES)) {
      this.writeStorage(STORAGE_KEYS.RULES, DEFAULT_RULE);
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPROVALS)) {
      this.writeStorage(STORAGE_KEYS.APPROVALS, DEFAULT_APPROVALS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHANNELS)) {
      this.writeStorage(STORAGE_KEYS.CHANNELS, DEFAULT_CHANNELS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      this.writeStorage(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) {
      this.writeStorage(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS);
    }

    this.initialized = true;
  }

  // --- Auth & Users ---
  public async getCurrentUser(): Promise<User | null> {
    await this.init();
    return this.readStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  public async setCurrentUser(user: User): Promise<void> {
    await this.init();
    this.writeStorage(STORAGE_KEYS.CURRENT_USER, user);
  }

  public async getUsers(): Promise<User[]> {
    await this.init();
    return this.readStorage<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  }

  public async getUserById(id: string): Promise<User | undefined> {
    const users = await this.getUsers();
    return users.find((u) => u.id === id);
  }

  public async authenticate(username: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> {
    await this.init();
    const users = await this.getUsers();
    const matched = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());

    if (!matched) {
      return { success: false, message: '账号不存在，请检查输入或使用默认账号 admin / admin' };
    }

    if (matched.password !== password) {
      return { success: false, message: '密码错误，请核实后重试' };
    }

    await this.setCurrentUser(matched);
    return { success: true, user: matched };
  }

  public async logout(): Promise<void> {
    await this.init();
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  // --- Attendance ---
  public async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    await this.init();
    return this.readStorage<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, DEFAULT_ATTENDANCE);
  }

  public async getAttendanceRules(): Promise<AttendanceRule> {
    await this.init();
    return this.readStorage<AttendanceRule>(STORAGE_KEYS.RULES, DEFAULT_RULE);
  }

  public async updateAttendanceRules(rule: AttendanceRule): Promise<void> {
    await this.init();
    this.writeStorage(STORAGE_KEYS.RULES, rule);
  }

  public async getTodayRecordForUser(userId: string): Promise<AttendanceRecord | null> {
    const records = await this.getAttendanceRecords();
    const today = getTodayStr(0);
    return records.find((r) => r.userId === userId && r.date === today) || null;
  }

  public async clockIn(user: User, location: string, note?: string): Promise<AttendanceRecord> {
    await this.init();
    const records = await this.getAttendanceRecords();
    const rules = await this.getAttendanceRules();
    const today = getTodayStr(0);
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    // Determine status: check workStartTime + flexMinutes
    const [startHour, startMin] = rules.workStartTime.split(':').map(Number);
    const maxOnTimeMinutes = startHour * 60 + startMin + (rules.flexMinutes || 0);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const isLate = currentMinutes > maxOnTimeMinutes;

    let existing = records.find((r) => r.userId === user.id && r.date === today);

    if (existing) {
      existing.clockInTime = timeStr;
      existing.clockInLocation = location;
      existing.status = isLate ? 'late' : 'normal';
      if (note) existing.note = note;
    } else {
      existing = {
        id: `att-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        department: user.department,
        date: today,
        clockInTime: timeStr,
        clockInLocation: location,
        status: isLate ? 'late' : 'normal',
        note: note || '',
      };
      records.unshift(existing);
    }

    this.writeStorage(STORAGE_KEYS.ATTENDANCE, records);
    return existing;
  }

  public async clockOut(user: User, location: string, note?: string): Promise<AttendanceRecord> {
    await this.init();
    const records = await this.getAttendanceRecords();
    const rules = await this.getAttendanceRules();
    const today = getTodayStr(0);
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    // Determine early leave
    const [endHour, endMin] = rules.workEndTime.split(':').map(Number);
    const reqMinutes = endHour * 60 + endMin;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const isEarly = currentMinutes < reqMinutes;

    let existing = records.find((r) => r.userId === user.id && r.date === today);

    if (!existing) {
      existing = {
        id: `att-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        department: user.department,
        date: today,
        status: isEarly ? 'early_leave' : 'normal',
      };
      records.unshift(existing);
    }

    existing.clockOutTime = timeStr;
    existing.clockOutLocation = location;
    if (isEarly && existing.status === 'normal') {
      existing.status = 'early_leave';
    }
    if (note) existing.note = (existing.note ? existing.note + '; ' : '') + note;

    // Calculate hours if both exist
    if (existing.clockInTime) {
      const [inH, inM] = existing.clockInTime.split(':').map(Number);
      const hours = Math.max(0, (now.getHours() * 60 + now.getMinutes() - (inH * 60 + inM)) / 60);
      existing.workHours = Number(hours.toFixed(1));
    }

    this.writeStorage(STORAGE_KEYS.ATTENDANCE, records);
    return existing;
  }

  public async requestMakeupPunch(user: User, date: string, type: 'in' | 'out', time: string, reason: string): Promise<void> {
    await this.init();
    const records = await this.getAttendanceRecords();
    let existing = records.find((r) => r.userId === user.id && r.date === date);

    if (existing) {
      if (type === 'in') existing.clockInTime = time;
      if (type === 'out') existing.clockOutTime = time;
      existing.status = 'supplement';
      existing.note = (existing.note ? existing.note + '; ' : '') + `补卡原因: ${reason}`;
    } else {
      existing = {
        id: `att-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        department: user.department,
        date,
        clockInTime: type === 'in' ? time : undefined,
        clockOutTime: type === 'out' ? time : undefined,
        clockInLocation: '考勤补卡申请',
        status: 'supplement',
        note: `补卡原因: ${reason}`,
      };
      records.unshift(existing);
    }

    this.writeStorage(STORAGE_KEYS.ATTENDANCE, records);
  }

  // --- Approvals ---
  public async getApprovals(): Promise<ApprovalItem[]> {
    await this.init();
    return this.readStorage<ApprovalItem[]>(STORAGE_KEYS.APPROVALS, DEFAULT_APPROVALS);
  }

  public async createApproval(approvalData: Omit<ApprovalItem, 'id' | 'createdAt' | 'status' | 'currentStepIndex'>): Promise<ApprovalItem> {
    await this.init();
    const approvals = await this.getApprovals();
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);

    const newApproval: ApprovalItem = {
      ...approvalData,
      id: `app-${Date.now()}`,
      createdAt: dateStr,
      status: 'pending',
      currentStepIndex: 0,
    };

    approvals.unshift(newApproval);
    this.writeStorage(STORAGE_KEYS.APPROVALS, approvals);

    // Also send an automated notification to company channels or direct chat
    await this.sendApprovalNotice(newApproval);

    return newApproval;
  }

  public async processApproval(
    approvalId: string,
    action: 'approved' | 'rejected' | 'transferred',
    approver: User,
    comment?: string
  ): Promise<ApprovalItem> {
    await this.init();
    const approvals = await this.getApprovals();
    const index = approvals.findIndex((a) => a.id === approvalId);
    if (index === -1) throw new Error('审批项目未找到');

    const item = approvals[index];
    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);

    const currentStep = item.steps[item.currentStepIndex];
    if (currentStep) {
      currentStep.approverId = approver.id;
      currentStep.approverName = approver.name;
      currentStep.comment = comment || (action === 'approved' ? '同意' : '已驳回');
      currentStep.updatedAt = timeStr;
      currentStep.status = action === 'approved' ? 'approved' : 'rejected';
    }

    if (action === 'rejected') {
      item.status = 'rejected';
    } else if (action === 'approved') {
      // Check if there are more steps
      if (item.currentStepIndex + 1 < item.steps.length) {
        item.currentStepIndex += 1;
      } else {
        item.status = 'approved';
      }
    }

    approvals[index] = item;
    this.writeStorage(STORAGE_KEYS.APPROVALS, approvals);

    // Notify applicant via direct message or notice
    await this.sendMessage('chan-notice', {
      senderId: 'sys',
      senderName: '审批助手',
      senderAvatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&auto=format&fit=crop&q=80',
      content: `【审批结果】${approver.name}已${action === 'approved' ? '通过' : '驳回'}了您的单据《${item.title}》${comment ? `，备注：${comment}` : ''}`,
      type: 'approval_card',
      cardData: {
        approvalId: item.id,
        approvalTitle: item.title,
        approvalType: item.type,
        status: item.status,
      },
    });

    return item;
  }

  private async sendApprovalNotice(approval: ApprovalItem) {
    const approverName = approval.steps[0]?.approverName || '审批人';
    await this.sendMessage('chan-notice', {
      senderId: 'sys',
      senderName: '审批流转小助手',
      senderAvatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&auto=format&fit=crop&q=80',
      content: `【待办提醒】${approval.applicantName} 提交了《${approval.title}》，请相关审核人 (${approverName}) 及时跟进审批。`,
      type: 'approval_card',
      cardData: {
        approvalId: approval.id,
        approvalTitle: approval.title,
        approvalType: approval.type,
        status: approval.status,
      },
    });
  }

  // --- Internal Messaging & Channels ---
  public async getChannels(userId: string): Promise<ChatChannel[]> {
    await this.init();
    const channels = this.readStorage<ChatChannel[]>(STORAGE_KEYS.CHANNELS, DEFAULT_CHANNELS);
    // Filter channels user is member of or system
    return channels.filter((c) => c.memberIds.includes('all') || c.memberIds.includes(userId));
  }

  public async getMessages(channelId: string): Promise<ChatMessage[]> {
    await this.init();
    const allMsgs = this.readStorage<Record<string, ChatMessage[]>>(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);
    return allMsgs[channelId] || [];
  }

  public async sendMessage(
    channelId: string,
    msg: Omit<ChatMessage, 'id' | 'timestamp' | 'channelId' | 'status'>
  ): Promise<ChatMessage> {
    await this.init();
    const allMsgs = this.readStorage<Record<string, ChatMessage[]>>(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);
    const channels = this.readStorage<ChatChannel[]>(STORAGE_KEYS.CHANNELS, DEFAULT_CHANNELS);

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      channelId,
      timestamp: timeStr,
      status: 'sent',
    };

    if (!allMsgs[channelId]) {
      allMsgs[channelId] = [];
    }
    allMsgs[channelId].push(newMsg);
    this.writeStorage(STORAGE_KEYS.MESSAGES, allMsgs);

    // Update channel summary
    const chanIndex = channels.findIndex((c) => c.id === channelId);
    if (chanIndex !== -1) {
      channels[chanIndex].lastMessage = `${msg.senderName}: ${msg.content.slice(0, 30)}`;
      channels[chanIndex].lastTimestamp = timeStr;
      this.writeStorage(STORAGE_KEYS.CHANNELS, channels);
    }

    return newMsg;
  }

  public async markChannelRead(channelId: string): Promise<void> {
    await this.init();
    const channels = this.readStorage<ChatChannel[]>(STORAGE_KEYS.CHANNELS, DEFAULT_CHANNELS);
    const chan = channels.find((c) => c.id === channelId);
    if (chan) {
      chan.unreadCount = 0;
      this.writeStorage(STORAGE_KEYS.CHANNELS, channels);
    }
  }

  public async getOrCreateDirectChannel(user1: User, user2: User): Promise<ChatChannel> {
    await this.init();
    const channels = this.readStorage<ChatChannel[]>(STORAGE_KEYS.CHANNELS, DEFAULT_CHANNELS);
    const existing = channels.find(
      (c) => c.type === 'direct' && c.memberIds.includes(user1.id) && c.memberIds.includes(user2.id)
    );

    if (existing) return existing;

    const newChan: ChatChannel = {
      id: `chan-direct-${user1.id}-${user2.id}`,
      name: `${user2.name} (${user2.title})`,
      type: 'direct',
      memberIds: [user1.id, user2.id],
      lastMessage: '新发起的会话',
      lastTimestamp: '刚刚',
      unreadCount: 0,
      avatar: user2.avatar,
      departmentTag: user2.department,
    };

    channels.push(newChan);
    this.writeStorage(STORAGE_KEYS.CHANNELS, channels);
    return newChan;
  }

  // --- Departments ---
  public async getDepartments(): Promise<Department[]> {
    await this.init();
    return this.readStorage<Department[]>(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS);
  }

  // --- System Reset ---
  public async resetToDefaults(): Promise<void> {
    this.writeStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    this.writeStorage(STORAGE_KEYS.CURRENT_USER, DEFAULT_USERS[0]);
    this.writeStorage(STORAGE_KEYS.ATTENDANCE, DEFAULT_ATTENDANCE);
    this.writeStorage(STORAGE_KEYS.RULES, DEFAULT_RULE);
    this.writeStorage(STORAGE_KEYS.APPROVALS, DEFAULT_APPROVALS);
    this.writeStorage(STORAGE_KEYS.CHANNELS, DEFAULT_CHANNELS);
    this.writeStorage(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);
    this.writeStorage(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS);
  }
}

export const db = new LocalDatabaseService();
