import React, { useState, useEffect } from 'react';
import { User, ApprovalItem, ApprovalType, ApprovalStatus, ApprovalStep } from '../types';
import { db } from '../services/db';
import {
  FileCheck2,
  Plus,
  Search,
  Filter,
  Palmtree,
  Receipt,
  Plane,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCheck,
  ArrowRight,
  Send,
  CornerDownRight,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Building,
} from 'lucide-react';

interface ApprovalViewProps {
  currentUser: User;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  preselectedItem?: ApprovalItem | null;
  onCloseDetail?: () => void;
  preselectedType?: ApprovalType | null;
}

export const ApprovalView: React.FC<ApprovalViewProps> = ({
  currentUser,
  onShowToast,
  preselectedItem = null,
  onCloseDetail,
  preselectedType = null,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [listFilter, setListFilter] = useState<'pending' | 'my' | 'processed' | 'all'>('pending');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(preselectedItem);

  // Form State for creating new approval
  const [approvalType, setApprovalType] = useState<ApprovalType>(preselectedType || 'leave');
  const [priority, setPriority] = useState<'low' | 'normal' | 'urgent'>('normal');
  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');

  // Specific form fields
  const [leaveType, setLeaveType] = useState<'annual' | 'sick' | 'personal' | 'compensatory'>('annual');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0] + ' 09:00');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0] + ' 18:00');
  const [durationDays, setDurationDays] = useState(1);

  const [reimburseAmount, setReimburseAmount] = useState<number>(200);
  const [expenseCategory, setExpenseCategory] = useState('日常业务交通费');
  const [invoiceCount, setInvoiceCount] = useState<number>(1);

  const [destination, setDestination] = useState('上海市浦东新区');
  const [itemName, setItemName] = useState('笔记本电脑支架');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [overtimeHours, setOvertimeHours] = useState(3);

  // Approver Action State
  const [actionComment, setActionComment] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const loadData = async () => {
    const [apps, users] = await Promise.all([db.getApprovals(), db.getUsers()]);
    setApprovals(apps);
    setAllUsers(users);

    if (selectedApproval) {
      const refreshed = apps.find((a) => a.id === selectedApproval.id);
      if (refreshed) setSelectedApproval(refreshed);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  useEffect(() => {
    if (preselectedItem) {
      setSelectedApproval(preselectedItem);
      setActiveTab('list');
    }
  }, [preselectedItem]);

  useEffect(() => {
    if (preselectedType) {
      setApprovalType(preselectedType);
      setActiveTab('create');
    }
  }, [preselectedType]);

  // Handle Create Approval Submit
  const handleCreateApproval = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      onShowToast('error', '请填写事由说明');
      return;
    }

    // Determine title
    let autoTitle = title.trim();
    if (!autoTitle) {
      switch (approvalType) {
        case 'leave':
          autoTitle = `${currentUser.name}的请假申请 (${durationDays}天)`;
          break;
        case 'reimbursement':
          autoTitle = `${currentUser.name}的费用报销 (¥${reimburseAmount})`;
          break;
        case 'trip':
          autoTitle = `${currentUser.name}的前往${destination}出差申请`;
          break;
        case 'supplies':
          autoTitle = `${currentUser.name}的${itemName}申领`;
          break;
        case 'overtime':
          autoTitle = `${currentUser.name}的加班申请 (${overtimeHours}小时)`;
          break;
      }
    }

    // Auto-setup steps based on type & organization
    const steps: ApprovalStep[] = [];
    if (currentUser.role === 'admin') {
      steps.push({
        stepIndex: 0,
        roleName: '行政复核备案',
        approverId: 'u-2',
        approverName: '李美玲',
        status: 'pending',
      });
    } else {
      steps.push({
        stepIndex: 0,
        roleName: '部门总监/主管审批',
        approverId: 'u-admin',
        approverName: '陈管理员',
        status: 'pending',
      });
      if (approvalType === 'reimbursement') {
        steps.push({
          stepIndex: 1,
          roleName: '财务主管核准',
          approverId: 'u-3',
          approverName: '王建国',
          status: 'pending',
        });
      } else {
        steps.push({
          stepIndex: 1,
          roleName: '人事行政归档',
          approverId: 'u-2',
          approverName: '李美玲',
          status: 'pending',
        });
      }
    }

    try {
      const newApp = await db.createApproval({
        title: autoTitle,
        type: approvalType,
        applicantId: currentUser.id,
        applicantName: currentUser.name,
        department: currentUser.department,
        priority,
        steps,
        details: {
          leaveType: approvalType === 'leave' ? leaveType : undefined,
          startDate: approvalType === 'leave' || approvalType === 'trip' ? startDate : undefined,
          endDate: approvalType === 'leave' || approvalType === 'trip' ? endDate : undefined,
          durationDays: approvalType === 'leave' ? durationDays : undefined,
          amount: approvalType === 'reimbursement' ? reimburseAmount : undefined,
          expenseCategory: approvalType === 'reimbursement' ? expenseCategory : undefined,
          invoiceCount: approvalType === 'reimbursement' ? invoiceCount : undefined,
          destination: approvalType === 'trip' ? destination : undefined,
          itemName: approvalType === 'supplies' ? itemName : undefined,
          itemQuantity: approvalType === 'supplies' ? itemQuantity : undefined,
          overtimeHours: approvalType === 'overtime' ? overtimeHours : undefined,
          reason,
          remarks,
        },
      });

      onShowToast('success', '审批申请提交成功', `单号: ${newApp.id} 已流转至审批人`);
      setActiveTab('list');
      setListFilter('my');
      setSelectedApproval(newApp);
      // Reset basic form
      setTitle('');
      setReason('');
      setRemarks('');
      loadData();
    } catch {
      onShowToast('error', '提交审批失败，请重试');
    }
  };

  // Process Approval (Approve / Reject)
  const handleProcessAction = async (action: 'approved' | 'rejected') => {
    if (!selectedApproval) return;
    setIsSubmittingAction(true);

    try {
      const updated = await db.processApproval(
        selectedApproval.id,
        action,
        currentUser,
        actionComment.trim() || (action === 'approved' ? '同意' : '不予批准')
      );
      setSelectedApproval(updated);
      setActionComment('');
      onShowToast(
        action === 'approved' ? 'success' : 'info',
        action === 'approved' ? '审批已通过' : '单据已驳回',
        `单号: ${updated.id} 状态已更新`
      );
      loadData();
    } catch {
      onShowToast('error', '处理失败');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Filters logic
  const filteredApprovals = approvals.filter((app) => {
    // Tab filter
    if (listFilter === 'pending') {
      if (app.status !== 'pending') return false;
      const step = app.steps[app.currentStepIndex];
      const isApprover = step?.approverId === currentUser.id || currentUser.role === 'admin';
      if (!isApprover) return false;
    } else if (listFilter === 'my') {
      if (app.applicantId !== currentUser.id) return false;
    } else if (listFilter === 'processed') {
      if (app.status === 'pending') return false;
    }

    // Type filter
    if (typeFilter !== 'all' && app.type !== typeFilter) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = app.title.toLowerCase().includes(q);
      const matchApplicant = app.applicantName.toLowerCase().includes(q);
      const matchDept = app.department.toLowerCase().includes(q);
      if (!matchTitle && !matchApplicant && !matchDept) return false;
    }

    return true;
  });

  const pendingCount = approvals.filter((a) => {
    if (a.status !== 'pending') return false;
    const step = a.steps[a.currentStepIndex];
    return step?.approverId === currentUser.id || currentUser.role === 'admin';
  }).length;

  const getTypeIcon = (type: ApprovalType) => {
    switch (type) {
      case 'leave':
        return <Palmtree className="h-4 w-4 text-emerald-600" />;
      case 'reimbursement':
        return <Receipt className="h-4 w-4 text-blue-600" />;
      case 'trip':
        return <Plane className="h-4 w-4 text-indigo-600" />;
      case 'supplies':
        return <Package className="h-4 w-4 text-purple-600" />;
      case 'overtime':
        return <Clock className="h-4 w-4 text-amber-600" />;
    }
  };

  const getTypeLabel = (type: ApprovalType) => {
    switch (type) {
      case 'leave':
        return '请假申请';
      case 'reimbursement':
        return '报销审批';
      case 'trip':
        return '出差申请';
      case 'supplies':
        return '物品领用';
      case 'overtime':
        return '加班申请';
    }
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            审核中
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            已通过
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200">
            <XCircle className="h-3 w-3 text-rose-600" />
            已驳回
          </span>
        );
      case 'revoked':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
            已撤回
          </span>
        );
    }
  };

  // Check if current user is active approver of selected approval
  const canApproveSelected =
    selectedApproval &&
    selectedApproval.status === 'pending' &&
    (selectedApproval.steps[selectedApproval.currentStepIndex]?.approverId === currentUser.id ||
      currentUser.role === 'admin');

  return (
    <div className="space-y-6">
      {/* Top Bar Switcher */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <FileCheck2 className="h-4 w-4" />
            <span>审批流程列表</span>
            {pendingCount > 0 && (
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  activeTab === 'list' ? 'bg-white text-blue-700' : 'bg-rose-500 text-white'
                }`}
              >
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>发起新审批</span>
          </button>
        </div>
      </div>

      {/* TAB 1: APPROVAL LIST */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Filter + List (5 cols or 12 if no selection) */}
          <div className={`${selectedApproval ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-4`}>
            {/* Filter Tabs */}
            <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-2xs space-y-3">
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setListFilter('pending')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    listFilter === 'pending'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  待我审批 ({pendingCount})
                </button>
                <button
                  onClick={() => setListFilter('my')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    listFilter === 'my'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  我发起的
                </button>
                <button
                  onClick={() => setListFilter('processed')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    listFilter === 'processed'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  已办结
                </button>
                <button
                  onClick={() => setListFilter('all')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    listFilter === 'all'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  全公司单据
                </button>
              </div>

              {/* Secondary Filter & Search */}
              <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700"
                >
                  <option value="all">全部分类</option>
                  <option value="leave">请假</option>
                  <option value="reimbursement">报销</option>
                  <option value="trip">出差</option>
                  <option value="supplies">物品领用</option>
                  <option value="overtime">加班</option>
                </select>

                <div className="relative flex-1">
                  <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="搜索申请人/单号/标题..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white pl-8 pr-3 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Approval Cards List */}
            <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {filteredApprovals.length === 0 ? (
                <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-zinc-400">
                  <FileCheck2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">该筛选分类下暂无审批记录</p>
                </div>
              ) : (
                filteredApprovals.map((app) => {
                  const isSelected = selectedApproval?.id === app.id;
                  return (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApproval(app)}
                      className={`group cursor-pointer rounded-xl border p-4 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/40 shadow-sm ring-1 ring-blue-500/20'
                          : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100">
                            {getTypeIcon(app.type)}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-zinc-900 line-clamp-1">{app.title}</h4>
                            <p className="text-[11px] text-zinc-500">
                              {app.applicantName} · {app.department}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>

                      <p className="mt-2.5 text-[11px] text-zinc-600 line-clamp-2 leading-relaxed">
                        {app.details.reason || '无补充理由'}
                      </p>

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-100 text-[10px] text-zinc-400">
                        <span>{app.createdAt}</span>
                        {app.priority === 'urgent' && (
                          <span className="rounded bg-rose-100 text-rose-700 px-1.5 py-0.2 font-medium">
                            紧急单
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Selected Approval Detail (7 cols) */}
          {selectedApproval && (
            <div className="lg:col-span-7 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-zinc-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                      {getTypeLabel(selectedApproval.type)}
                    </span>
                    {selectedApproval.priority === 'urgent' && (
                      <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800">
                        加急审批
                      </span>
                    )}
                    <span className="text-[11px] text-zinc-400 font-mono">单号: {selectedApproval.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-900">{selectedApproval.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedApproval.status)}
                  <button
                    onClick={() => {
                      setSelectedApproval(null);
                      if (onCloseDetail) onCloseDetail();
                    }}
                    className="text-zinc-400 hover:text-zinc-600 text-xs px-2 py-1 rounded"
                  >
                    关闭
                  </button>
                </div>
              </div>

              {/* Applicant Info & Parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-zinc-50 p-4 rounded-xl border border-zinc-200/80">
                <div>
                  <span className="text-zinc-400 block text-[11px]">申请员工</span>
                  <span className="font-semibold text-zinc-800">{selectedApproval.applicantName}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[11px]">所属部门</span>
                  <span className="font-medium text-zinc-800">{selectedApproval.department}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[11px]">申请发起时间</span>
                  <span className="font-medium text-zinc-800">{selectedApproval.createdAt}</span>
                </div>

                {/* Conditional fields */}
                {selectedApproval.type === 'leave' && (
                  <>
                    <div>
                      <span className="text-zinc-400 block text-[11px]">请假类型</span>
                      <span className="font-medium text-zinc-800">
                        {selectedApproval.details.leaveType === 'annual'
                          ? '年假'
                          : selectedApproval.details.leaveType === 'sick'
                          ? '病假'
                          : selectedApproval.details.leaveType === 'personal'
                          ? '事假'
                          : '调休'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[11px]">起止时段</span>
                      <span className="font-medium text-zinc-800">
                        {selectedApproval.details.startDate} ~ {selectedApproval.details.endDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[11px]">请假天数</span>
                      <span className="font-bold text-blue-600">
                        {selectedApproval.details.durationDays} 天
                      </span>
                    </div>
                  </>
                )}

                {selectedApproval.type === 'reimbursement' && (
                  <>
                    <div>
                      <span className="text-zinc-400 block text-[11px]">报销总金额</span>
                      <span className="font-bold text-rose-600 text-sm">
                        ¥ {selectedApproval.details.amount?.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[11px]">费用科目</span>
                      <span className="font-medium text-zinc-800">
                        {selectedApproval.details.expenseCategory}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[11px]">发票单据张数</span>
                      <span className="font-medium text-zinc-800">
                        {selectedApproval.details.invoiceCount || 1} 张
                      </span>
                    </div>
                  </>
                )}

                {selectedApproval.type === 'trip' && (
                  <>
                    <div>
                      <span className="text-zinc-400 block text-[11px]">出差目的地</span>
                      <span className="font-medium text-zinc-800">
                        {selectedApproval.details.destination}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[11px]">预计行程</span>
                      <span className="font-medium text-zinc-800">
                        {selectedApproval.details.startDate} 起
                      </span>
                    </div>
                  </>
                )}

                {selectedApproval.type === 'supplies' && (
                  <>
                    <div>
                      <span className="text-zinc-400 block text-[11px]">申领物品</span>
                      <span className="font-medium text-zinc-800">
                        {selectedApproval.details.itemName}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[11px]">申领数量</span>
                      <span className="font-bold text-zinc-800">
                        {selectedApproval.details.itemQuantity} 件
                      </span>
                    </div>
                  </>
                )}

                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-zinc-200/80">
                  <span className="text-zinc-400 block text-[11px]">申请理由与详细说明</span>
                  <p className="mt-1 text-zinc-700 leading-relaxed font-normal">
                    {selectedApproval.details.reason}
                  </p>
                  {selectedApproval.details.remarks && (
                    <p className="mt-1 text-zinc-500 text-[11px]">
                      交接/补充备注: {selectedApproval.details.remarks}
                    </p>
                  )}
                </div>
              </div>

              {/* Approval Steps Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  <span>审批流转全流程节点</span>
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
                  {/* Node 0: Initiator */}
                  <div className="relative flex items-start gap-3">
                    <div className="absolute -left-6 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white shadow-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900">
                          {selectedApproval.applicantName} (发起申请)
                        </span>
                        <span className="text-[10px] text-zinc-400">{selectedApproval.createdAt}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">提交单据并启动多级协同审批流程</p>
                    </div>
                  </div>

                  {/* Nodes from Steps */}
                  {selectedApproval.steps.map((step, idx) => {
                    const isPassed = step.status === 'approved';
                    const isRejected = step.status === 'rejected';
                    const isCurrent =
                      selectedApproval.status === 'pending' &&
                      selectedApproval.currentStepIndex === idx;

                    return (
                      <div key={idx} className="relative flex items-start gap-3">
                        <div
                          className={`absolute -left-6 mt-1 flex h-5 w-5 items-center justify-center rounded-full text-white shadow-xs ${
                            isPassed
                              ? 'bg-emerald-600'
                              : isRejected
                              ? 'bg-rose-600'
                              : isCurrent
                              ? 'bg-amber-500 animate-pulse ring-4 ring-amber-100'
                              : 'bg-zinc-300'
                          }`}
                        >
                          {isPassed ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : isRejected ? (
                            <XCircle className="h-3.5 w-3.5" />
                          ) : (
                            <span className="text-[10px] font-bold">{idx + 1}</span>
                          )}
                        </div>

                        <div className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-900">{step.roleName}</span>
                            <span className="text-[11px] text-zinc-600 font-medium">
                              {step.approverName || '待指定审核人'}
                            </span>
                            {isPassed && (
                              <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2">
                                已同意
                              </span>
                            )}
                            {isRejected && (
                              <span className="rounded bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0.2">
                                已驳回
                              </span>
                            )}
                            {isCurrent && (
                              <span className="rounded bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2">
                                正在审批中
                              </span>
                            )}
                          </div>

                          {step.updatedAt && (
                            <p className="text-[10px] text-zinc-400 mt-0.5">{step.updatedAt}</p>
                          )}

                          {step.comment && (
                            <div className="mt-1 rounded-md bg-zinc-100 p-2 text-[11px] text-zinc-700 italic border-l-2 border-zinc-400">
                              审批批注: {step.comment}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Box for Approver */}
              {canApproveSelected && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <UserCheck className="h-4 w-4 text-blue-600" />
                      <span>您是当前节点的审批人，请签署审批意见</span>
                    </span>
                    <span className="text-[10px] text-blue-700">操作后将即时同步至本地数据库</span>
                  </div>

                  <input
                    type="text"
                    placeholder="输入审批意见（如：同意，准假；或填写驳回理由）..."
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                    className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  />

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isSubmittingAction}
                      onClick={() => handleProcessAction('rejected')}
                      className="rounded-lg border border-rose-300 bg-white px-4 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors"
                    >
                      驳回单据
                    </button>
                    <button
                      type="button"
                      disabled={isSubmittingAction}
                      onClick={() => handleProcessAction('approved')}
                      className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-medium text-white shadow-xs hover:bg-blue-700 transition-colors"
                    >
                      同意通过
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CREATE APPROVAL */}
      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-zinc-900 mb-1">发起日常协同审批</h3>
          <p className="text-xs text-zinc-500 mb-6">选择适合您的业务场景模版，填写后将流转至各级主管审批</p>

          {/* Type Selector Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-6">
            <button
              type="button"
              onClick={() => setApprovalType('leave')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                approvalType === 'leave'
                  ? 'border-blue-600 bg-blue-50/60 text-blue-700 ring-2 ring-blue-500/20 font-semibold'
                  : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
              }`}
            >
              <Palmtree className="h-5 w-5 mb-1 text-emerald-600" />
              <span className="text-xs">请假申请</span>
            </button>

            <button
              type="button"
              onClick={() => setApprovalType('reimbursement')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                approvalType === 'reimbursement'
                  ? 'border-blue-600 bg-blue-50/60 text-blue-700 ring-2 ring-blue-500/20 font-semibold'
                  : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
              }`}
            >
              <Receipt className="h-5 w-5 mb-1 text-blue-600" />
              <span className="text-xs">报销申请</span>
            </button>

            <button
              type="button"
              onClick={() => setApprovalType('trip')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                approvalType === 'trip'
                  ? 'border-blue-600 bg-blue-50/60 text-blue-700 ring-2 ring-blue-500/20 font-semibold'
                  : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
              }`}
            >
              <Plane className="h-5 w-5 mb-1 text-indigo-600" />
              <span className="text-xs">出差申请</span>
            </button>

            <button
              type="button"
              onClick={() => setApprovalType('supplies')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                approvalType === 'supplies'
                  ? 'border-blue-600 bg-blue-50/60 text-blue-700 ring-2 ring-blue-500/20 font-semibold'
                  : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
              }`}
            >
              <Package className="h-5 w-5 mb-1 text-purple-600" />
              <span className="text-xs">物品领用</span>
            </button>

            <button
              type="button"
              onClick={() => setApprovalType('overtime')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all col-span-2 sm:col-span-1 ${
                approvalType === 'overtime'
                  ? 'border-blue-600 bg-blue-50/60 text-blue-700 ring-2 ring-blue-500/20 font-semibold'
                  : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
              }`}
            >
              <Clock className="h-5 w-5 mb-1 text-amber-600" />
              <span className="text-xs">加班申请</span>
            </button>
          </div>

          <form onSubmit={handleCreateApproval} className="space-y-4 text-xs">
            {/* Applicant Pill */}
            <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-3 border border-zinc-200">
              <div className="flex items-center gap-2">
                <img src={currentUser.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                <span className="font-semibold text-zinc-900">{currentUser.name}</span>
                <span className="text-zinc-400">({currentUser.department} - {currentUser.title})</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-zinc-500">紧急程度:</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs"
                >
                  <option value="normal">普通</option>
                  <option value="urgent">加急</option>
                  <option value="low">较低</option>
                </select>
              </div>
            </div>

            {/* Custom Title (Optional) */}
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                审批标题 (可选，留空将根据内容自动生成)
              </label>
              <input
                type="text"
                placeholder="例如：张晓峰的调休请假申请"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 p-2.5 text-zinc-800"
              />
            </div>

            {/* Dynamic Template Fields */}
            {approvalType === 'leave' && (
              <div className="space-y-4 rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">请假假期类型</label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value as any)}
                      className="w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-zinc-800"
                    >
                      <option value="annual">年假 (带薪)</option>
                      <option value="compensatory">调休假</option>
                      <option value="sick">病假</option>
                      <option value="personal">事假</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">请假天数</label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      required
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-zinc-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">开始时间</label>
                    <input
                      type="text"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">结束时间</label>
                    <input
                      type="text"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-zinc-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {approvalType === 'reimbursement' && (
              <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/30 p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">报销金额 (¥)</label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      required
                      value={reimburseAmount}
                      onChange={(e) => setReimburseAmount(Number(e.target.value))}
                      className="w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-zinc-800 font-bold text-rose-600"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">费用分类科目</label>
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-zinc-800"
                    >
                      <option value="差旅交通住宿">差旅交通及住宿</option>
                      <option value="商务餐饮招待">商务餐饮招待</option>
                      <option value="研发设备采购">研发设备采购</option>
                      <option value="行政日常耗材">行政日常耗材</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">单据附件张数</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={invoiceCount}
                      onChange={(e) => setInvoiceCount(Number(e.target.value))}
                      className="w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-zinc-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {approvalType === 'trip' && (
              <div className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/30 p-4">
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">出差目的地城市/园区</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-zinc-800"
                  />
                </div>
              </div>
            )}

            {approvalType === 'supplies' && (
              <div className="space-y-4 rounded-xl border border-purple-100 bg-purple-50/30 p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">物品名称及型号</label>
                    <input
                      type="text"
                      required
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">领用数量</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Number(e.target.value))}
                      className="w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-zinc-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {approvalType === 'overtime' && (
              <div className="space-y-4 rounded-xl border border-amber-100 bg-amber-50/30 p-4">
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">预计加班时长 (小时)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={overtimeHours}
                    onChange={(e) => setOvertimeHours(Number(e.target.value))}
                    className="w-full rounded-lg border border-zinc-300 bg-white p-2.5 text-zinc-800"
                  />
                </div>
              </div>
            )}

            {/* Common Reason */}
            <div>
              <label className="block font-medium text-zinc-700 mb-1">申请事由与说明 *</label>
              <textarea
                rows={3}
                required
                placeholder="请详细叙述本次申请的原因、业务背景及预期效果..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 p-2.5 text-zinc-800 placeholder-zinc-400"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">工作交接人 / 补充备注</label>
              <input
                type="text"
                placeholder="例如：相关交接工作已与同组同事对接完成"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 p-2.5 text-zinc-800 placeholder-zinc-400"
              />
            </div>

            {/* Approval Preview Path */}
            <div className="rounded-xl bg-zinc-50 p-3.5 border border-zinc-200">
              <span className="text-[11px] font-semibold text-zinc-600 block mb-2">
                系统预设审批流程路径：
              </span>
              <div className="flex items-center gap-2 text-[11px] text-zinc-600">
                <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-800 font-medium">
                  {currentUser.name} (发起人)
                </span>
                <ArrowRight className="h-3 w-3 text-zinc-400" />
                <span className="rounded bg-zinc-200 px-2 py-0.5 font-medium">
                  {currentUser.role === 'admin' ? '人事行政复核 (李美玲)' : '部门总监 (陈管理员)'}
                </span>
                <ArrowRight className="h-3 w-3 text-zinc-400" />
                <span className="rounded bg-zinc-200 px-2 py-0.5 font-medium">
                  {approvalType === 'reimbursement' ? '财务核准 (王建国)' : '人事归档 (李美玲)'}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="rounded-lg border border-zinc-200 px-5 py-2 text-zinc-700 hover:bg-zinc-50"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                <span>立即提交审批</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
