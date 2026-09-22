import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, ApprovalItem } from '../types';
import { db } from '../services/db';
import {
  CalendarCheck,
  FileCheck2,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Plane,
  Receipt,
  Palmtree,
  Package,
  AlertTriangle,
  Building,
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: User;
  onNavigateTab: (tab: string, subParam?: any) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onOpenApprovalDetail: (item: ApprovalItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onNavigateTab,
  onShowToast,
  onOpenApprovalDetail,
}) => {
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [currentTime, setCurrentTime] = useState('');
  const [loadingPunch, setLoadingPunch] = useState(false);

  const loadData = async () => {
    const [rec, atts, apps] = await Promise.all([
      db.getTodayRecordForUser(currentUser.id),
      db.getAttendanceRecords(),
      db.getApprovals(),
    ]);
    setTodayRecord(rec);
    setAllAttendance(atts);
    setApprovals(apps);
  };

  useEffect(() => {
    loadData();

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
          now.getSeconds()
        ).padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [currentUser]);

  // Quick punch action
  const handleQuickPunch = async (type: 'in' | 'out') => {
    setLoadingPunch(true);
    try {
      const mockLocation = '公司总部园区·Wi-Fi自动识别 (高新科技园A座)';
      if (type === 'in') {
        const res = await db.clockIn(currentUser, mockLocation, '工作台快速打卡');
        setTodayRecord(res);
        onShowToast(
          'success',
          res.status === 'late' ? '上班打卡成功 (记录为迟到)' : '上班打卡成功',
          `打卡时间: ${res.clockInTime} | 地点: ${mockLocation}`
        );
      } else {
        const res = await db.clockOut(currentUser, mockLocation, '工作台快速打卡');
        setTodayRecord(res);
        onShowToast(
          'success',
          res.status === 'early_leave' ? '下班打卡成功 (记录为早退)' : '下班打卡成功',
          `打卡时间: ${res.clockOutTime} | 今日工时: ${res.workHours || 0}小时`
        );
      }
      loadData();
    } catch {
      onShowToast('error', '打卡操作失败', '请检查本地存储后重试');
    } finally {
      setLoadingPunch(false);
    }
  };

  // Quick approve action right from dashboard
  const handleQuickApprove = async (approvalId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await db.processApproval(approvalId, 'approved', currentUser, '快速审核通过');
      onShowToast('success', '审批已通过', '该审批单已流转至下一节点或已归档');
      loadData();
    } catch {
      onShowToast('error', '操作失败');
    }
  };

  // Filter tasks pending my approval
  const pendingForMe = approvals.filter((a) => {
    if (a.status !== 'pending') return false;
    const step = a.steps[a.currentStepIndex];
    if (!step) return false;
    // If admin or matching approver
    return step.approverId === currentUser.id || currentUser.role === 'admin';
  });

  const myInitiated = approvals.filter((a) => a.applicantId === currentUser.id);

  // Today attendance stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = allAttendance.filter((r) => r.date === todayStr);
  const clockedInCount = todayRecords.filter((r) => r.clockInTime).length;
  const attendanceRate = Math.min(100, Math.round((clockedInCount / 6) * 100)); // out of 6 active employees

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-medium backdrop-blur-xs">
                {currentUser.department}
              </span>
              <span className="text-blue-100 text-xs font-mono">{currentTime || '09:00:00'}</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              早安，{currentUser.name}！
            </h2>
            <p className="text-xs text-blue-100/90 max-w-xl">
              今天是高效协作的一天。您有 <span className="font-semibold text-white underline">{pendingForMe.length} 项</span> 待办审批需要处理，系统运行良好。
            </p>
          </div>

          {/* Quick Attendance Widget inside Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-xl bg-white/10 p-3.5 backdrop-blur-md border border-white/20">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-blue-100">
                <MapPin className="h-3.5 w-3.5 text-blue-200" />
                <span>公司园区打卡点</span>
              </div>
              <p className="mt-1 text-xs font-medium text-white">
                {todayRecord?.clockInTime ? (
                  todayRecord?.clockOutTime ? (
                    <span className="text-emerald-300">今日打卡已完成 ({todayRecord.clockInTime} ~ {todayRecord.clockOutTime})</span>
                  ) : (
                    <span>已打上班卡: <strong className="font-mono text-emerald-300">{todayRecord.clockInTime}</strong></span>
                  )
                ) : (
                  <span className="text-amber-200">今日尚未打卡</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!todayRecord?.clockInTime ? (
                <button
                  onClick={() => handleQuickPunch('in')}
                  disabled={loadingPunch}
                  className="flex-1 sm:flex-none rounded-lg bg-white px-4 py-2 text-xs font-bold text-blue-700 shadow-sm hover:bg-blue-50 active:bg-blue-100 transition-colors"
                >
                  {loadingPunch ? '打卡中...' : '上班打卡'}
                </button>
              ) : !todayRecord?.clockOutTime ? (
                <button
                  onClick={() => handleQuickPunch('out')}
                  disabled={loadingPunch}
                  className="flex-1 sm:flex-none rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 active:bg-emerald-700 transition-colors"
                >
                  {loadingPunch ? '打卡中...' : '下班打卡'}
                </button>
              ) : (
                <button
                  onClick={() => handleQuickPunch('out')}
                  disabled={loadingPunch}
                  className="flex-1 sm:flex-none rounded-lg bg-white/20 px-3 py-2 text-xs font-medium text-white hover:bg-white/30 transition-colors"
                >
                  更新下班卡
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div
          onClick={() => onNavigateTab('approval')}
          className="group cursor-pointer rounded-xl border border-zinc-200 bg-white p-4.5 shadow-2xs hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">待我审批</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
              <FileCheck2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">{pendingForMe.length}</span>
            <span className="text-[11px] text-zinc-400">项单据待处理</span>
          </div>
          <p className="mt-1 text-[11px] text-blue-600 flex items-center gap-1 group-hover:underline">
            <span>点击立即处理</span>
            <ArrowRight className="h-3 w-3" />
          </p>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => onNavigateTab('approval')}
          className="group cursor-pointer rounded-xl border border-zinc-200 bg-white p-4.5 shadow-2xs hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">我发起的审批</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">{myInitiated.length}</span>
            <span className="text-[11px] text-zinc-400">项流程追踪</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            {myInitiated.filter((a) => a.status === 'pending').length} 项流转中
          </p>
        </div>

        {/* Metric 3 */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="group cursor-pointer rounded-xl border border-zinc-200 bg-white p-4.5 shadow-2xs hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">今日企业出勤率</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">{attendanceRate}%</span>
            <span className="text-[11px] text-emerald-600 font-medium">({clockedInCount}人已打卡)</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            考勤规则: 09:00~18:00
          </p>
        </div>

        {/* Metric 4 */}
        <div
          onClick={() => onNavigateTab('message')}
          className="group cursor-pointer rounded-xl border border-zinc-200 bg-white p-4.5 shadow-2xs hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">内部通讯与公告</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900">4</span>
            <span className="text-[11px] text-zinc-400">个活跃工作群组</span>
          </div>
          <p className="mt-1 text-[11px] text-indigo-600 flex items-center gap-1 group-hover:underline">
            <span>进入即时沟通</span>
            <ArrowRight className="h-3 w-3" />
          </p>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs">
        <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-3">
          快捷办公入口
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <button
            onClick={() => onNavigateTab('approval', { preselectType: 'leave' })}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-zinc-100 bg-zinc-50 hover:bg-blue-50/60 hover:border-blue-200 transition-colors group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-2 group-hover:scale-110 transition-transform">
              <Palmtree className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-zinc-800">请假申请</span>
            <span className="text-[10px] text-zinc-400 mt-0.5">年假/病假/调休</span>
          </button>

          <button
            onClick={() => onNavigateTab('approval', { preselectType: 'reimbursement' })}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-zinc-100 bg-zinc-50 hover:bg-blue-50/60 hover:border-blue-200 transition-colors group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 mb-2 group-hover:scale-110 transition-transform">
              <Receipt className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-zinc-800">报销申请</span>
            <span className="text-[10px] text-zinc-400 mt-0.5">差旅/餐饮/采购</span>
          </button>

          <button
            onClick={() => onNavigateTab('approval', { preselectType: 'trip' })}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-zinc-100 bg-zinc-50 hover:bg-blue-50/60 hover:border-blue-200 transition-colors group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 mb-2 group-hover:scale-110 transition-transform">
              <Plane className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-zinc-800">出差申请</span>
            <span className="text-[10px] text-zinc-400 mt-0.5">行程与预算备案</span>
          </button>

          <button
            onClick={() => onNavigateTab('approval', { preselectType: 'supplies' })}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-zinc-100 bg-zinc-50 hover:bg-blue-50/60 hover:border-blue-200 transition-colors group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700 mb-2 group-hover:scale-110 transition-transform">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-zinc-800">物品领用</span>
            <span className="text-[10px] text-zinc-400 mt-0.5">耗材及固定资产</span>
          </button>

          <button
            onClick={() => onNavigateTab('attendance', { openMakeup: true })}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-zinc-100 bg-zinc-50 hover:bg-blue-50/60 hover:border-blue-200 transition-colors group col-span-2 sm:col-span-1"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700 mb-2 group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-zinc-800">考勤补卡</span>
            <span className="text-[10px] text-zinc-400 mt-0.5">异常缺卡申诉</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Pending Approvals Queue */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-900">待办审批流程</h3>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                {pendingForMe.length} 条待处理
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('approval')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>查看全部审批</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {pendingForMe.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-400">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-2" />
              <p className="text-xs font-medium text-zinc-600">当前没有待您审批的单据</p>
              <p className="text-[11px] text-zinc-400 mt-1">各项工作协同顺畅，您也可以前往“发起审批”提交申请。</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {pendingForMe.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  onClick={() => onOpenApprovalDetail(app)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 hover:bg-zinc-50/70 -mx-2 px-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-zinc-900">{app.title}</span>
                      {app.priority === 'urgent' && (
                        <span className="rounded bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.2 font-medium">
                          紧急
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 line-clamp-1">
                      {app.details.reason || '无备注事由'}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <span>申请人: {app.applicantName} ({app.department})</span>
                      <span>·</span>
                      <span>{app.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={(e) => handleQuickApprove(app.id, e)}
                      className="rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-2xs hover:bg-blue-700 transition-colors"
                    >
                      同意
                    </button>
                    <button
                      onClick={() => onOpenApprovalDetail(app)}
                      className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      查看详情
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Company Announcements & Info */}
        <div className="space-y-6">
          {/* Announcements Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>企业通知公告</span>
              </h3>
              <button
                onClick={() => onNavigateTab('message')}
                className="text-[11px] text-blue-600 hover:underline"
              >
                进入公告频道
              </button>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => onNavigateTab('message')}
                className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                  <span className="font-semibold text-blue-700">【系统通知】</span>
                  <span>今日 08:30</span>
                </div>
                <h4 className="text-xs font-semibold text-zinc-900 leading-snug">
                  企业协同OA管理系统正式上线运行
                </h4>
                <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">
                  包含考勤打卡、日常审批流转、内部即时通讯功能，支持离线本地数据库存储。
                </p>
              </div>

              <div
                onClick={() => onNavigateTab('message')}
                className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                  <span className="font-semibold text-amber-700">【考勤规范】</span>
                  <span>今日 09:00</span>
                </div>
                <h4 className="text-xs font-semibold text-zinc-900 leading-snug">
                  员工考勤打卡与补卡指引提醒
                </h4>
                <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">
                  标准上班时间为09:00，下班时间18:00。遇异常可使用“考勤补卡”申请。
                </p>
              </div>
            </div>
          </div>

          {/* Quick System Info */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600">
            <h4 className="font-semibold text-zinc-900 mb-1 flex items-center gap-1">
              <Building className="h-3.5 w-3.5 text-zinc-500" />
              <span>协同办公环境信息</span>
            </h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              数据源模式: <span className="font-semibold text-emerald-700">手机本地浏览器存储 (LocalStorage / IndexedDB)</span>
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">
              支持一键切换张工程师、李主管、王总监等账号，全流程体验审批闭环。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
