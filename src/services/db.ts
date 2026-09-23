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
  WorkflowDefinition,
  WorkflowInstance,
  WorkflowStepConfig,
  CustomFormField,
  WorkflowCategory,
  WorkflowInstanceStep,
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

// Default Custom Workflow Definitions
export const DEFAULT_WORKFLOW_DEFINITIONS: WorkflowDefinition[] = [
  {
    id: 'wf-procurement',
    name: '办公设备与IT资产采购审批流',
    code: 'WF-PROC',
    category: 'admin',
    icon: 'ShoppingBag',
    color: 'blue',
    description: '用于各部门办公电脑、专业外设、办公家具及耗材物资的规范申购与预算核销。',
    status: 'published',
    createdBy: '陈管理员',
    createdAt: `${getTodayStr(-30)} 10:00:00`,
    updatedAt: `${getTodayStr(-2)} 15:30:00`,
    isPreset: true,
    notifyUserIds: ['u-2'], // 李美玲抄送
    fields: [
      {
        id: 'field_item_name',
        name: 'item_name',
        label: '物资设备名称',
        type: 'text',
        required: true,
        placeholder: '如：Dell 27寸 4K 专业显示器 / 苹果 M3 笔记本',
      },
      {
        id: 'field_category',
        name: 'category',
        label: '物资品类划分',
        type: 'select',
        required: true,
        options: ['办公笔记本/工作站', '显示器/外设配件', '办公桌椅/人体工学家具', '服务器/网络硬件', '日常办公耗材'],
      },
      {
        id: 'field_amount',
        name: 'amount',
        label: '预估总金额',
        type: 'number',
        unit: '元',
        required: true,
        placeholder: '请输入预估总金额，>=3000元触发财务总监复核',
      },
      {
        id: 'field_quantity',
        name: 'quantity',
        label: '采购数量',
        type: 'number',
        unit: '件/套',
        required: true,
        defaultValue: 1,
      },
      {
        id: 'field_supplier',
        name: 'supplier',
        label: '拟选供应商/购买渠道',
        type: 'text',
        required: false,
        placeholder: '如：京东企业采购 / 戴尔官方直营店',
      },
      {
        id: 'field_expected_date',
        name: 'expected_date',
        label: '期望到货日期',
        type: 'date',
        required: true,
      },
      {
        id: 'field_reason',
        name: 'reason',
        label: '采购业务必要性与规格论证',
        type: 'textarea',
        required: true,
        placeholder: '请详细阐述该采购对当前业务研发或办公效率的支撑必要性...',
      },
    ],
    steps: [
      {
        id: 'step-1',
        name: '直接部门主管审核',
        approverType: 'dept_manager',
        approvalMode: 'or',
      },
      {
        id: 'step-2',
        name: '财务总监预算复核',
        approverType: 'specific_user',
        approverId: 'u-3',
        approverName: '王建国 (财务总监)',
        approvalMode: 'or',
        condition: {
          fieldId: 'field_amount',
          operator: '>=',
          value: 3000,
        },
      },
      {
        id: 'step-3',
        name: '总经理/总经办终审',
        approverType: 'role',
        targetRole: 'admin',
        approvalMode: 'or',
        condition: {
          fieldId: 'field_amount',
          operator: '>=',
          value: 8000,
        },
      },
    ],
  },
  {
    id: 'wf-contract',
    name: '企业公章使用与合同会签流',
    code: 'WF-SEAL',
    category: 'business',
    icon: 'FileCheck',
    color: 'indigo',
    description: '用于企业商务合作框架协议、采购合同、保密协议及公司公章、合同章的合规审批。',
    status: 'published',
    createdBy: '陈管理员',
    createdAt: `${getTodayStr(-45)} 09:00:00`,
    updatedAt: `${getTodayStr(-5)} 14:00:00`,
    isPreset: true,
    fields: [
      {
        id: 'field_doc_title',
        name: 'doc_title',
        label: '用印文件/合同全称',
        type: 'text',
        required: true,
        placeholder: '如：《2026年企业级大数据中台战略采购框架协议》',
      },
      {
        id: 'field_seal_type',
        name: 'seal_type',
        label: '申请使用印章类型',
        type: 'select',
        required: true,
        options: ['公司公章 (法人主体章)', '合同专用章', '法人人名章', '财务专用章'],
      },
      {
        id: 'field_partner',
        name: 'partner',
        label: '签约相对方名称',
        type: 'text',
        required: true,
        placeholder: '合作企业或供应商官方工商登记名称',
      },
      {
        id: 'field_contract_val',
        name: 'contract_val',
        label: '合同总金额标的',
        type: 'number',
        unit: '元',
        required: false,
        placeholder: '无固定标的金额可填 0',
      },
      {
        id: 'field_copies',
        name: 'copies',
        label: '用印份数',
        type: 'number',
        unit: '份',
        required: true,
        defaultValue: 2,
      },
      {
        id: 'field_legal_state',
        name: 'legal_state',
        label: '法务合规前置评估',
        type: 'radio',
        required: true,
        options: ['已由外部法务顾问审查无歧义', '完全采用公司标准制式合同', '定制条款待行政合规复核'],
      },
      {
        id: 'field_summary',
        name: 'summary',
        label: '合同核心条款与权责简述',
        type: 'textarea',
        required: true,
        placeholder: '请简述合同有效期限、支付条款、违约责任等核心内容...',
      },
    ],
    steps: [
      {
        id: 'step-c1',
        name: '业务所属部门负责人审批',
        approverType: 'dept_manager',
        approvalMode: 'or',
      },
      {
        id: 'step-c2',
        name: '行政与法务负责人合规审查',
        approverType: 'specific_user',
        approverId: 'u-2',
        approverName: '李美玲 (行政主管)',
        approvalMode: 'or',
      },
      {
        id: 'step-c3',
        name: '企业法人/总经理核准签字',
        approverType: 'role',
        targetRole: 'admin',
        approvalMode: 'or',
      },
    ],
  },
  {
    id: 'wf-borrow',
    name: '财务借款与备用金申请流',
    code: 'WF-LOAN',
    category: 'finance',
    icon: 'Wallet',
    color: 'emerald',
    description: '用于市场开拓、大型会展异地出差或紧急公务的公款备用金预支申请。',
    status: 'published',
    createdBy: '陈管理员',
    createdAt: `${getTodayStr(-20)} 11:00:00`,
    updatedAt: `${getTodayStr(-3)} 11:00:00`,
    isPreset: true,
    fields: [
      {
        id: 'field_loan_amount',
        name: 'loan_amount',
        label: '预支借款金额',
        type: 'number',
        unit: '元',
        required: true,
        placeholder: '请输入申请借款金额',
      },
      {
        id: 'field_pay_channel',
        name: 'pay_channel',
        label: '借款发放方式',
        type: 'radio',
        required: true,
        options: ['对私员工银行卡转账', '对公供应商直接预付'],
      },
      {
        id: 'field_repay_date',
        name: 'repay_date',
        label: '承诺核销冲账日期',
        type: 'date',
        required: true,
      },
      {
        id: 'field_bank_info',
        name: 'bank_info',
        label: '收款人账号及开户行',
        type: 'text',
        required: true,
        placeholder: '如：工商银行 深圳高新支行 6222... 张三',
      },
      {
        id: 'field_loan_purpose',
        name: 'loan_purpose',
        label: '借款用途与支出明细测算',
        type: 'textarea',
        required: true,
        placeholder: '请列明具体差旅天数、参会门票、物料搭建费等测算依据...',
      },
    ],
    steps: [
      {
        id: 'step-b1',
        name: '直属部门主管审批',
        approverType: 'dept_manager',
        approvalMode: 'or',
      },
      {
        id: 'step-b2',
        name: '财务总监出纳放款核准',
        approverType: 'specific_user',
        approverId: 'u-3',
        approverName: '王建国 (财务总监)',
        approvalMode: 'or',
      },
    ],
  },
  {
    id: 'wf-it-support',
    name: 'IT权限开通与专业软件申请',
    code: 'WF-IT',
    category: 'it',
    icon: 'Shield',
    color: 'amber',
    description: '用于员工生产服务器运维权限、企业VPN访问授权及开发商业软件申领。',
    status: 'published',
    createdBy: '陈管理员',
    createdAt: `${getTodayStr(-15)} 14:00:00`,
    updatedAt: `${getTodayStr(-1)} 16:00:00`,
    isPreset: true,
    fields: [
      {
        id: 'field_it_type',
        name: 'it_type',
        label: '权限或软件类别',
        type: 'select',
        required: true,
        options: ['商业开发软件 (JetBrains / Figma / Adobe)', '生产环境服务器与数据库读写', '代码仓库高级管理员权限', '异地办公安全VPN通道'],
      },
      {
        id: 'field_soft_name',
        name: 'soft_name',
        label: '系统或软件具体名称',
        type: 'text',
        required: true,
        placeholder: '如：AWS 生产集群 Kubernetes只读权限 / WebStorm 年度商业授权',
      },
      {
        id: 'field_duration',
        name: 'duration',
        label: '权限使用期限',
        type: 'radio',
        required: true,
        options: ['长期使用 (与岗位在职绑定)', '阶段性攻坚 (1~3个月)', '临时排查 (7天内自动收回)'],
      },
      {
        id: 'field_security_pledge',
        name: 'security_pledge',
        label: '业务理由及数据安全保密承诺',
        type: 'textarea',
        required: true,
        placeholder: '本人承诺严格遵循企业数据安全合规手册，杜绝敏感密钥外泄...',
      },
    ],
    steps: [
      {
        id: 'step-it1',
        name: '技术总监/业务主管审核',
        approverType: 'specific_user',
        approverId: 'u-4',
        approverName: '赵磊 (技术总监)',
        approvalMode: 'or',
      },
      {
        id: 'step-it2',
        name: '系统管理员授权执行',
        approverType: 'role',
        targetRole: 'admin',
        approvalMode: 'or',
      },
    ],
  },
];

// Default Workflow Instances
export const DEFAULT_WORKFLOW_INSTANCES: WorkflowInstance[] = [
  {
    id: 'WF-2026-001',
    workflowId: 'wf-procurement',
    workflowName: '办公设备与IT资产采购审批流',
    workflowCategory: 'admin',
    applicantId: 'u-1',
    applicantName: '张晓峰',
    applicantDepartment: '研发部',
    applicantAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    status: 'pending',
    currentStepIndex: 1, // 当前正在第二步（财务总监王建国审核）
    createdAt: `${getTodayStr(0)} 09:30:00`,
    formData: {
      field_item_name: 'Dell 27寸 4K HDR 专业防眩光编程显示器',
      field_category: '显示器/外设配件',
      field_amount: 4398,
      field_quantity: 2,
      field_supplier: '戴尔官方企业直营采购渠道',
      field_expected_date: `${getTodayStr(3)}`,
      field_reason: '当前微服务架构重构与多端代码联调需要大屏高分屏幕协同，现有1080P旧显示器存在字符发虚且效率受限。',
    },
    ccUserNames: ['李美玲 (行政主管)'],
    steps: [
      {
        id: 'step-1',
        name: '直接部门主管审核',
        approverId: 'u-4',
        approverName: '赵磊 (研发部负责人)',
        approverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
        status: 'approved',
        comment: '同意采购，开发团队近期确实面临多屏多仓架构调试需求，且报价合理。',
        actionTime: `${getTodayStr(0)} 10:15:20`,
      },
      {
        id: 'step-2',
        name: '财务总监预算复核 (金额>=3000元触发)',
        approverId: 'u-3',
        approverName: '王建国 (财务总监)',
        approverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        status: 'pending',
      },
    ],
    history: [
      {
        id: 'hist-1',
        operatorName: '张晓峰',
        action: '提交自定义流程申请',
        comment: '发起《办公设备与IT资产采购审批流》申请单',
        timestamp: `${getTodayStr(0)} 09:30:00`,
      },
      {
        id: 'hist-2',
        operatorName: '赵磊 (研发部负责人)',
        action: '部门主管审批同意',
        comment: '同意采购，开发团队近期确实面临多屏多仓架构调试需求，且报价合理。',
        timestamp: `${getTodayStr(0)} 10:15:20`,
      },
    ],
  },
  {
    id: 'WF-2026-002',
    workflowId: 'wf-contract',
    workflowName: '企业公章使用与合同会签流',
    workflowCategory: 'business',
    applicantId: 'u-admin',
    applicantName: '陈管理员',
    applicantDepartment: '总经办',
    applicantAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    status: 'approved',
    currentStepIndex: 2,
    createdAt: `${getTodayStr(-2)} 14:00:00`,
    completedAt: `${getTodayStr(-1)} 11:30:00`,
    formData: {
      field_doc_title: '《2026年度南方大数据算力云平台服务采购框架协议》',
      field_seal_type: '合同专用章',
      field_partner: '南方科技云计算股份有限公司',
      field_contract_val: 128000,
      field_copies: 4,
      field_legal_state: '已由外部法务顾问审查无歧义',
      field_summary: '算力按年框架采购协议，包含SLA99.99%可用性承诺与双副本数据备份，付款方式为季度后付。',
    },
    ccUserNames: ['王建国 (财务总监)', '赵磊 (技术总监)'],
    steps: [
      {
        id: 'step-c1',
        name: '业务所属部门负责人审批',
        approverId: 'u-admin',
        approverName: '陈管理员 (总经办负责人)',
        approverAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
        status: 'approved',
        comment: '框架协议符合下半年业务扩张预算指标，准予用印流转。',
        actionTime: `${getTodayStr(-2)} 15:10:00`,
      },
      {
        id: 'step-c2',
        name: '行政与法务负责人合规审查',
        approverId: 'u-2',
        approverName: '李美玲 (行政主管)',
        approverAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        status: 'approved',
        comment: '合同主体资质已做工商穿透核查，无涉诉被执行风险，条款合规。',
        actionTime: `${getTodayStr(-2)} 17:40:00`,
      },
      {
        id: 'step-c3',
        name: '企业法人/总经理核准签字',
        approverId: 'u-admin',
        approverName: '陈管理员 (超级管理员)',
        approverAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
        status: 'approved',
        comment: '予以核准，加盖合同专用章并归档电子扫描件备查。',
        actionTime: `${getTodayStr(-1)} 11:30:00`,
      },
    ],
    history: [
      {
        id: 'h-1',
        operatorName: '陈管理员',
        action: '发起用印审批流',
        timestamp: `${getTodayStr(-2)} 14:00:00`,
      },
      {
        id: 'h-2',
        operatorName: '陈管理员 (总经办负责人)',
        action: '部门负责人核准',
        comment: '框架协议符合下半年业务扩张预算指标，准予用印流转。',
        timestamp: `${getTodayStr(-2)} 15:10:00`,
      },
      {
        id: 'h-3',
        operatorName: '李美玲 (行政主管)',
        action: '法务合规审核通过',
        comment: '合同主体资质已做工商穿透核查，无涉诉被执行风险，条款合规。',
        timestamp: `${getTodayStr(-2)} 17:40:00`,
      },
      {
        id: 'h-4',
        operatorName: '陈管理员 (总经理)',
        action: '最终审批通过并归档',
        comment: '予以核准，加盖合同专用章并归档电子扫描件备查。',
        timestamp: `${getTodayStr(-1)} 11:30:00`,
      },
    ],
  },
];

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
  WORKFLOW_DEFINITIONS: 'oa_workflow_definitions_store',
  WORKFLOW_INSTANCES: 'oa_workflow_instances_store',
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
    if (!localStorage.getItem(STORAGE_KEYS.WORKFLOW_DEFINITIONS)) {
      this.writeStorage(STORAGE_KEYS.WORKFLOW_DEFINITIONS, DEFAULT_WORKFLOW_DEFINITIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.WORKFLOW_INSTANCES)) {
      this.writeStorage(STORAGE_KEYS.WORKFLOW_INSTANCES, DEFAULT_WORKFLOW_INSTANCES);
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
    this.writeStorage(STORAGE_KEYS.WORKFLOW_DEFINITIONS, DEFAULT_WORKFLOW_DEFINITIONS);
    this.writeStorage(STORAGE_KEYS.WORKFLOW_INSTANCES, DEFAULT_WORKFLOW_INSTANCES);
  }

  // ==========================================
  // --- Custom Workflow System (工作流引擎) ---
  // ==========================================

  public async getWorkflowDefinitions(): Promise<WorkflowDefinition[]> {
    await this.init();
    return this.readStorage<WorkflowDefinition[]>(
      STORAGE_KEYS.WORKFLOW_DEFINITIONS,
      DEFAULT_WORKFLOW_DEFINITIONS
    );
  }

  public async getWorkflowDefinitionById(id: string): Promise<WorkflowDefinition | null> {
    const list = await this.getWorkflowDefinitions();
    return list.find((w) => w.id === id) || null;
  }

  public async saveWorkflowDefinition(def: WorkflowDefinition): Promise<WorkflowDefinition> {
    await this.init();
    const list = await this.getWorkflowDefinitions();
    const existingIndex = list.findIndex((w) => w.id === def.id);

    const updatedDef = {
      ...def,
      updatedAt: `${getTodayStr(0)} ${new Date().toTimeString().split(' ')[0]}`,
    };

    if (existingIndex >= 0) {
      list[existingIndex] = updatedDef;
    } else {
      list.unshift(updatedDef);
    }

    this.writeStorage(STORAGE_KEYS.WORKFLOW_DEFINITIONS, list);
    return updatedDef;
  }

  public async deleteWorkflowDefinition(id: string): Promise<void> {
    await this.init();
    const list = await this.getWorkflowDefinitions();
    const filtered = list.filter((w) => w.id !== id);
    this.writeStorage(STORAGE_KEYS.WORKFLOW_DEFINITIONS, filtered);
  }

  public async getWorkflowInstances(filter?: {
    applicantId?: string;
    approverId?: string;
    status?: string;
  }): Promise<WorkflowInstance[]> {
    await this.init();
    let instances = this.readStorage<WorkflowInstance[]>(
      STORAGE_KEYS.WORKFLOW_INSTANCES,
      DEFAULT_WORKFLOW_INSTANCES
    );

    if (filter) {
      if (filter.applicantId) {
        instances = instances.filter((i) => i.applicantId === filter.applicantId);
      }
      if (filter.approverId) {
        instances = instances.filter((i) => {
          if (i.status !== 'pending') return false;
          const currentStep = i.steps[i.currentStepIndex];
          return currentStep && currentStep.approverId === filter.approverId;
        });
      }
      if (filter.status && filter.status !== 'all') {
        instances = instances.filter((i) => i.status === filter.status);
      }
    }

    return instances;
  }

  public async getWorkflowInstanceById(id: string): Promise<WorkflowInstance | null> {
    const list = await this.getWorkflowInstances();
    return list.find((i) => i.id === id) || null;
  }

  public async createWorkflowInstance(params: {
    workflowId: string;
    applicant: User;
    formData: Record<string, any>;
  }): Promise<WorkflowInstance> {
    await this.init();
    const def = await this.getWorkflowDefinitionById(params.workflowId);
    if (!def) {
      throw new Error('未找到对应流程定义');
    }

    const allUsers = await this.getUsers();
    const departments = await this.getDepartments();

    // 动态解析步骤与条件分支
    const parsedSteps: WorkflowInstanceStep[] = [];

    for (let idx = 0; idx < def.steps.length; idx++) {
      const stepCfg = def.steps[idx];

      // 评估条件分支
      if (stepCfg.condition) {
        const val = params.formData[stepCfg.condition.fieldId];
        const targetVal = stepCfg.condition.value;
        const op = stepCfg.condition.operator;

        let conditionPassed = true;
        const numVal = Number(val);
        const numTarget = Number(targetVal);

        if (!isNaN(numVal) && !isNaN(numTarget)) {
          if (op === '>') conditionPassed = numVal > numTarget;
          else if (op === '>=') conditionPassed = numVal >= numTarget;
          else if (op === '<') conditionPassed = numVal < numTarget;
          else if (op === '<=') conditionPassed = numVal <= numTarget;
          else if (op === '==') conditionPassed = numVal === numTarget;
          else if (op === '!=') conditionPassed = numVal !== numTarget;
        } else {
          if (op === '==') conditionPassed = String(val) === String(targetVal);
          else if (op === '!=') conditionPassed = String(val) !== String(targetVal);
        }

        if (!conditionPassed) {
          // 条件不满足，跳过此步骤
          continue;
        }
      }

      // 动态解析审批人
      let approverUser: User | undefined;

      if (stepCfg.approverType === 'dept_manager') {
        // 查找申请人所属部门主管
        const userDept = departments.find((d) => d.name === params.applicant.department);
        if (userDept) {
          approverUser = allUsers.find((u) => u.name === userDept.managerName);
        }
        if (!approverUser) {
          // fallback 找部门角色为 manager 或 admin
          approverUser =
            allUsers.find((u) => u.department === params.applicant.department && u.role === 'manager') ||
            allUsers.find((u) => u.role === 'admin');
        }
      } else if (stepCfg.approverType === 'specific_user' && stepCfg.approverId) {
        approverUser = allUsers.find((u) => u.id === stepCfg.approverId);
      } else if (stepCfg.approverType === 'role' && stepCfg.targetRole) {
        approverUser = allUsers.find((u) => u.role === stepCfg.targetRole);
      } else if (stepCfg.approverType === 'applicant_select') {
        // 检查表单中是否有指定审批人
        const selectId = params.formData['approver_select'] || params.formData['approverId'];
        if (selectId) {
          approverUser = allUsers.find((u) => u.id === selectId);
        }
        if (!approverUser) {
          approverUser = allUsers.find((u) => u.role === 'admin');
        }
      }

      if (!approverUser) {
        approverUser = allUsers[0]; // fallback admin
      }

      parsedSteps.push({
        id: `step-inst-${idx + 1}-${Date.now()}`,
        name: stepCfg.name,
        approverId: approverUser.id,
        approverName: `${approverUser.name} (${approverUser.title})`,
        approverAvatar: approverUser.avatar,
        status: idx === 0 ? 'pending' : 'pending',
      });
    }

    // 若所有节点都不满足，则至少兜底保留一个管理员审核节点
    if (parsedSteps.length === 0) {
      const adminUser = allUsers.find((u) => u.role === 'admin') || allUsers[0];
      parsedSteps.push({
        id: `step-inst-fallback-${Date.now()}`,
        name: '系统管理员兜底复核',
        approverId: adminUser.id,
        approverName: `${adminUser.name} (${adminUser.title})`,
        approverAvatar: adminUser.avatar,
        status: 'pending',
      });
    }

    // 格式化抄送人名单
    const ccUserNames: string[] = [];
    if (def.notifyUserIds && def.notifyUserIds.length > 0) {
      def.notifyUserIds.forEach((uid) => {
        const u = allUsers.find((user) => user.id === uid);
        if (u) ccUserNames.push(`${u.name} (${u.title})`);
      });
    }

    const timeNow = `${getTodayStr(0)} ${new Date().toTimeString().split(' ')[0]}`;
    const newInstance: WorkflowInstance = {
      id: `WF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      workflowId: def.id,
      workflowName: def.name,
      workflowCategory: def.category,
      applicantId: params.applicant.id,
      applicantName: params.applicant.name,
      applicantDepartment: params.applicant.department,
      applicantAvatar: params.applicant.avatar,
      formData: params.formData,
      status: 'pending',
      currentStepIndex: 0,
      steps: parsedSteps,
      ccUserNames: ccUserNames.length > 0 ? ccUserNames : undefined,
      createdAt: timeNow,
      history: [
        {
          id: `hist-${Date.now()}`,
          operatorName: params.applicant.name,
          action: '发起流程申请',
          comment: `成功提交《${def.name}》，流转至：${parsedSteps[0].approverName}`,
          timestamp: timeNow,
        },
      ],
    };

    const list = await this.getWorkflowInstances();
    list.unshift(newInstance);
    this.writeStorage(STORAGE_KEYS.WORKFLOW_INSTANCES, list);

    // 发送系统通知
    await this.sendMessage('chan-notice', {
      senderId: 'sys',
      senderName: '流程中心小助手',
      senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
      content: `【新流程提报】${params.applicant.name} 提交了《${def.name}》，单号：${newInstance.id}，等待 ${parsedSteps[0].approverName} 进行初审。`,
      type: 'system',
      cardData: {
        approvalId: newInstance.id,
        approvalTitle: def.name,
        status: 'pending',
      },
    });

    return newInstance;
  }

  public async approveWorkflowInstance(
    instanceId: string,
    approverUser: User,
    comment?: string
  ): Promise<WorkflowInstance> {
    await this.init();
    const list = await this.getWorkflowInstances();
    const inst = list.find((i) => i.id === instanceId);
    if (!inst) throw new Error('流程实例不存在');

    const currentStep = inst.steps[inst.currentStepIndex];
    if (!currentStep) throw new Error('当前审批步骤无效');

    const timeNow = `${getTodayStr(0)} ${new Date().toTimeString().split(' ')[0]}`;

    currentStep.status = 'approved';
    currentStep.comment = comment || '同意通过';
    currentStep.actionTime = timeNow;

    inst.history.push({
      id: `hist-${Date.now()}`,
      operatorName: approverUser.name,
      action: `${currentStep.name} · 同意`,
      comment: comment || '予以通过',
      timestamp: timeNow,
    });

    // 检查下一步
    if (inst.currentStepIndex + 1 < inst.steps.length) {
      inst.currentStepIndex += 1;
      const nextStep = inst.steps[inst.currentStepIndex];

      await this.sendMessage('chan-notice', {
        senderId: 'sys',
        senderName: '流程中心小助手',
        senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
        content: `【流程流转】单号 ${inst.id}《${inst.workflowName}》已由 ${approverUser.name} 审批通过，现已转交下一步：${nextStep.name}（${nextStep.approverName}）。`,
        type: 'system',
      });
    } else {
      // 全链完结
      inst.status = 'approved';
      inst.completedAt = timeNow;

      await this.sendMessage('chan-notice', {
        senderId: 'sys',
        senderName: '流程中心小助手',
        senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
        content: `🎉【流程办结】单号 ${inst.id}《${inst.workflowName}》已通过所有审批节点，正式归档生效！`,
        type: 'system',
      });
    }

    this.writeStorage(STORAGE_KEYS.WORKFLOW_INSTANCES, list);
    return inst;
  }

  public async rejectWorkflowInstance(
    instanceId: string,
    approverUser: User,
    comment?: string
  ): Promise<WorkflowInstance> {
    await this.init();
    const list = await this.getWorkflowInstances();
    const inst = list.find((i) => i.id === instanceId);
    if (!inst) throw new Error('流程实例不存在');

    const currentStep = inst.steps[inst.currentStepIndex];
    const timeNow = `${getTodayStr(0)} ${new Date().toTimeString().split(' ')[0]}`;

    if (currentStep) {
      currentStep.status = 'rejected';
      currentStep.comment = comment || '审批不通过，驳回修改';
      currentStep.actionTime = timeNow;
    }

    inst.status = 'rejected';
    inst.completedAt = timeNow;

    inst.history.push({
      id: `hist-${Date.now()}`,
      operatorName: approverUser.name,
      action: `${currentStep?.name || '节点'} · 驳回`,
      comment: comment || '审核不符合标准，单据驳回',
      timestamp: timeNow,
    });

    await this.sendMessage('chan-notice', {
      senderId: 'sys',
      senderName: '流程中心小助手',
      senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
      content: `⚠️【流程驳回】单号 ${inst.id}《${inst.workflowName}》已被 ${approverUser.name} 驳回。意见：${comment || '审核未通过'}。`,
      type: 'system',
    });

    this.writeStorage(STORAGE_KEYS.WORKFLOW_INSTANCES, list);
    return inst;
  }

  public async revokeWorkflowInstance(instanceId: string, applicantUser: User): Promise<WorkflowInstance> {
    await this.init();
    const list = await this.getWorkflowInstances();
    const inst = list.find((i) => i.id === instanceId);
    if (!inst) throw new Error('流程实例不存在');

    const timeNow = `${getTodayStr(0)} ${new Date().toTimeString().split(' ')[0]}`;
    inst.status = 'revoked';
    inst.completedAt = timeNow;

    inst.history.push({
      id: `hist-${Date.now()}`,
      operatorName: applicantUser.name,
      action: '撤回流程',
      comment: '申请人自行撤销本次流转',
      timestamp: timeNow,
    });

    this.writeStorage(STORAGE_KEYS.WORKFLOW_INSTANCES, list);
    return inst;
  }
}

export const db = new LocalDatabaseService();
