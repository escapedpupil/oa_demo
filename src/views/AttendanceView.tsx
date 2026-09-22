import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, AttendanceRule, AttendanceStatus } from '../types';
import { db } from '../services/db';
import {
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Settings2,
  Plus,
  Search,
  Filter,
  Users,
  ShieldCheck,
  Building,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface AttendanceViewProps {
  currentUser: User;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  openMakeupOnMount?: boolean;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  currentUser,
  onShowToast,
  openMakeupOnMount = false,
}) => {
  const [activeTab, setActiveTab] = useState<'my' | 'manage'>('my');
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const [rules, setRules] = useState<AttendanceRule | null>(null);
  const [loading, setLoading] = useState(false);

  // Real-time clock for punch
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Makeup Punch Modal state
  const [showMakeupModal, setShowMakeupModal] = useState(openMakeupOnMount);
  const [makeupDate, setMakeupDate] = useState(new Date().toISOString().split('T')[0]);
  const [makeupType, setMakeupType] = useState<'in' | 'out'>('in');
  const [makeupTime, setMakeupTime] = useState('09:00');
  const [makeupReason, setMakeupReason] = useState('');

  // Rules Modal state
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [editingRules, setEditingRules] = useState<AttendanceRule>({
    workStartTime: '09:00',
    workEndTime: '18:00',
    flexMinutes: 15,
    officeLocationName: '高新科技产业园A座·801室 (企业Wi-Fi范围内)',
    allowMakeup: true,
  });

  // Admin filter states
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchName, setSearchName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    const [rec, recs, r] = await Promise.all([
      db.getTodayRecordForUser(currentUser.id),
      db.getAttendanceRecords(),
      db.getAttendanceRules(),
    ]);
    setTodayRecord(rec);
    setAllRecords(recs);
    setRules(r);
    setEditingRules(r);
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
      const days = ['日', '一', '二', '三', '四', '五', '六'];
      setCurrentDate(`${now.getMonth() + 1}月${now.getDate()}日 星期${days[now.getDay()]}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentUser]);

  // Clock in action
  const handleClockIn = async () => {
    setLoading(true);
    try {
      const loc = rules?.officeLocationName || '公司总部园区·Wi-Fi自动识别';
      const res = await db.clockIn(currentUser, loc);
      setTodayRecord(res);
      onShowToast(
        'success',
        res.status === 'late' ? '上班打卡成功（迟到）' : '上班打卡成功',
        `打卡时间: ${res.clockInTime} | 地点: ${loc}`
      );
      loadData();
    } catch {
      onShowToast('error', '打卡失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // Clock out action
  const handleClockOut = async () => {
    setLoading(true);
    try {
      const loc = rules?.officeLocationName || '公司总部园区·Wi-Fi自动识别';
      const res = await db.clockOut(currentUser, loc);
      setTodayRecord(res);
      onShowToast(
        'success',
        res.status === 'early_leave' ? '下班打卡成功（早退）' : '下班打卡成功',
        `打卡时间: ${res.clockOutTime} | 今日出勤: ${res.workHours || 0}小时`
      );
      loadData();
    } catch {
      onShowToast('error', '打卡失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // Submit Makeup Punch
  const handleSubmitMakeup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!makeupReason.trim()) {
      onShowToast('error', '请填写补卡理由');
      return;
    }

    try {
      await db.requestMakeupPunch(currentUser, makeupDate, makeupType, makeupTime, makeupReason);
      onShowToast('success', '补卡申请提交成功', `日期: ${makeupDate} ${makeupType === 'in' ? '上班卡' : '下班卡'}`);
      setShowMakeupModal(false);
      setMakeupReason('');
      loadData();
    } catch {
      onShowToast('error', '补卡提交失败');
    }
  };

  // Save Rules
  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.updateAttendanceRules(editingRules);
      setRules(editingRules);
      setShowRulesModal(false);
      onShowToast('success', '考勤规则配置已更新');
    } catch {
      onShowToast('error', '保存规则失败');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['记录ID', '员工姓名', '部门', '日期', '上班时间', '上班地点', '下班时间', '下班地点', '状态', '工时(小时)', '备注'];
    const rows = filteredRecords.map((r) => [
      r.id,
      r.userName,
      r.department,
      r.date,
      r.clockInTime || '-',
      r.clockInLocation || '-',
      r.clockOutTime || '-',
      r.clockOutLocation || '-',
      getStatusLabel(r.status),
      r.workHours || 0,
      r.note || '',
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `考勤报表_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('success', '考勤报表导出成功', `文件已保存为 考勤报表_${selectedDate}.csv`);
  };

  const getStatusLabel = (status: AttendanceStatus) => {
    switch (status) {
      case 'normal':
        return '正常出勤';
      case 'late':
        return '迟到';
      case 'early_leave':
        return '早退';
      case 'supplement':
        return '补卡审核';
      case 'absent':
        return '缺卡/请假';
      default:
        return '待确认';
    }
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'normal':
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">正常出勤</span>;
      case 'late':
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200">迟到</span>;
      case 'early_leave':
        return <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-700 border border-orange-200">早退</span>;
      case 'supplement':
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 border border-blue-200">已补卡</span>;
      case 'absent':
        return <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 border border-rose-200">缺勤/请假</span>;
    }
  };

  // Filter records for management tab
  const filteredRecords = allRecords.filter((r) => {
    if (r.date !== selectedDate) return false;
    if (filterDepartment !== 'all' && r.department !== filterDepartment) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (searchName && !r.userName.toLowerCase().includes(searchName.trim().toLowerCase())) return false;
    return true;
  });

  // Calculate stats for current selected date
  const dateRecords = allRecords.filter((r) => r.date === selectedDate);
  const normalCount = dateRecords.filter((r) => r.status === 'normal' || r.status === 'supplement').length;
  const lateCount = dateRecords.filter((r) => r.status === 'late').length;
  const earlyCount = dateRecords.filter((r) => r.status === 'early_leave').length;
  const absentCount = dateRecords.filter((r) => r.status === 'absent').length;

  // User's own historical records
  const myRecords = allRecords.filter((r) => r.userId === currentUser.id);

  return (
    <div className="space-y-6">
      {/* Top Tab Switcher */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('my')}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'my'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            我的打卡考勤
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'manage'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <span>考勤统计管理</span>
            {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
              <span className="rounded bg-blue-100 text-blue-800 text-[10px] px-1 py-0.2">管理权限</span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMakeupModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-2xs hover:bg-zinc-50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-blue-600" />
            <span>申请考勤补卡</span>
          </button>
          {activeTab === 'manage' && (
            <button
              onClick={() => setShowRulesModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-2xs hover:bg-zinc-50 transition-colors"
            >
              <Settings2 className="h-3.5 w-3.5 text-zinc-500" />
              <span>考勤规则设置</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: MY ATTENDANCE */}
      {activeTab === 'my' && (
        <div className="space-y-6">
          {/* Main Punch Clock Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Left: Punch Button & Clock */}
              <div className="flex flex-col items-center sm:items-start space-y-3">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>{currentDate}</span>
                  <span className="text-zinc-300">|</span>
                  <span>打卡规则: {rules?.workStartTime || '09:00'} 上班 · {rules?.workEndTime || '18:00'} 下班</span>
                </div>

                {/* Big Digital Clock */}
                <div className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-zinc-900">
                  {currentTime || '09:00:00'}
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-600">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium">{rules?.officeLocationName || '公司总部园区'}</span>
                  <span className="rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 text-[10px]">
                    已进入打卡范围
                  </span>
                </div>
              </div>

              {/* Center: Punch Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {/* Clock In */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={handleClockIn}
                    disabled={loading}
                    className={`relative flex h-28 w-28 flex-col items-center justify-center rounded-full text-white shadow-md transition-all active:scale-95 ${
                      todayRecord?.clockInTime
                        ? 'bg-zinc-400 cursor-not-allowed hover:bg-zinc-500'
                        : 'bg-blue-600 hover:bg-blue-700 ring-4 ring-blue-100 hover:shadow-lg'
                    }`}
                  >
                    <Clock className="h-6 w-6 mb-1" />
                    <span className="text-sm font-bold">上班打卡</span>
                    <span className="text-[10px] opacity-80">{rules?.workStartTime || '09:00'} 之前</span>
                  </button>
                  <div className="mt-2 text-center text-xs">
                    {todayRecord?.clockInTime ? (
                      <span className="font-medium text-emerald-600">已打卡: {todayRecord.clockInTime}</span>
                    ) : (
                      <span className="text-zinc-400">未打卡</span>
                    )}
                  </div>
                </div>

                {/* Clock Out */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={handleClockOut}
                    disabled={loading}
                    className={`relative flex h-28 w-28 flex-col items-center justify-center rounded-full text-white shadow-md transition-all active:scale-95 ${
                      todayRecord?.clockOutTime
                        ? 'bg-emerald-600 hover:bg-emerald-700 ring-4 ring-emerald-100'
                        : 'bg-amber-600 hover:bg-amber-700 ring-4 ring-amber-100 hover:shadow-lg'
                    }`}
                  >
                    <CheckCircle2 className="h-6 w-6 mb-1" />
                    <span className="text-sm font-bold">{todayRecord?.clockOutTime ? '更新下班卡' : '下班打卡'}</span>
                    <span className="text-[10px] opacity-80">{rules?.workEndTime || '18:00'} 之后</span>
                  </button>
                  <div className="mt-2 text-center text-xs">
                    {todayRecord?.clockOutTime ? (
                      <span className="font-medium text-emerald-600">已打卡: {todayRecord.clockOutTime}</span>
                    ) : (
                      <span className="text-zinc-400">未打卡</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Today Punch Summary Cards */}
            <div className="mt-6 pt-5 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl bg-zinc-50 p-3.5 border border-zinc-200/80">
                <span className="text-zinc-500 block mb-1">今日上班打卡</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-zinc-900">
                    {todayRecord?.clockInTime || '未打卡'}
                  </span>
                  {todayRecord?.clockInTime && getStatusBadge(todayRecord.status)}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 truncate">
                  {todayRecord?.clockInLocation || '尚未记录定位'}
                </p>
              </div>

              <div className="rounded-xl bg-zinc-50 p-3.5 border border-zinc-200/80">
                <span className="text-zinc-500 block mb-1">今日下班打卡</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-zinc-900">
                    {todayRecord?.clockOutTime || '未打卡'}
                  </span>
                  {todayRecord?.clockOutTime && (
                    <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.2 text-[10px] border border-emerald-200">
                      正常
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 truncate">
                  {todayRecord?.clockOutLocation || '尚未记录定位'}
                </p>
              </div>

              <div className="rounded-xl bg-zinc-50 p-3.5 border border-zinc-200/80">
                <span className="text-zinc-500 block mb-1">今日有效出勤工时</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-zinc-900">
                    {todayRecord?.workHours ? `${todayRecord.workHours} 小时` : '计算中...'}
                  </span>
                  <span className="text-[11px] text-zinc-500">标准 8.0 小时</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">自动剔除午休及异常时长</p>
              </div>
            </div>
          </div>

          {/* My Past Attendance History Table */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-zinc-900 mb-4">我的近期考勤记录</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 bg-zinc-50/70">
                    <th className="py-2.5 px-3 font-medium">打卡日期</th>
                    <th className="py-2.5 px-3 font-medium">上班打卡</th>
                    <th className="py-2.5 px-3 font-medium">下班打卡</th>
                    <th className="py-2.5 px-3 font-medium">出勤工时</th>
                    <th className="py-2.5 px-3 font-medium">考勤状态</th>
                    <th className="py-2.5 px-3 font-medium">备注说明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {myRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-50/60">
                      <td className="py-3 px-3 font-medium text-zinc-900">{r.date}</td>
                      <td className="py-3 px-3 font-mono text-zinc-700">{r.clockInTime || '-'}</td>
                      <td className="py-3 px-3 font-mono text-zinc-700">{r.clockOutTime || '-'}</td>
                      <td className="py-3 px-3 font-mono text-zinc-700">
                        {r.workHours ? `${r.workHours}h` : '-'}
                      </td>
                      <td className="py-3 px-3">{getStatusBadge(r.status)}</td>
                      <td className="py-3 px-3 text-zinc-500 max-w-xs truncate">{r.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ATTENDANCE MANAGEMENT */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          {/* Metrics summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <span className="text-xs text-zinc-500">应出勤人数</span>
              <p className="mt-1 text-2xl font-bold text-zinc-900">6 人</p>
              <span className="text-[10px] text-zinc-400">在册全职员工</span>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <span className="text-xs text-zinc-500">今日出勤率</span>
              <p className="mt-1 text-2xl font-bold text-emerald-600">
                {Math.round((normalCount / 6) * 100)}%
              </p>
              <span className="text-[10px] text-emerald-600">{normalCount} 人正常打卡</span>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <span className="text-xs text-zinc-500">迟到人数</span>
              <p className="mt-1 text-2xl font-bold text-amber-600">{lateCount} 人</p>
              <span className="text-[10px] text-amber-600">超过弹性时间</span>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <span className="text-xs text-zinc-500">早退人数</span>
              <p className="mt-1 text-2xl font-bold text-orange-600">{earlyCount} 人</p>
              <span className="text-[10px] text-orange-600">未满下班时间</span>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 col-span-2 lg:col-span-1">
              <span className="text-xs text-zinc-500">请假 / 缺卡</span>
              <p className="mt-1 text-2xl font-bold text-rose-600">{absentCount} 人</p>
              <span className="text-[10px] text-rose-600">已关联流程单据</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Date selector */}
              <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs text-zinc-700">
                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs text-zinc-800 focus:outline-hidden"
                />
              </div>

              {/* Department selector */}
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700 focus:outline-hidden"
              >
                <option value="all">全部部门</option>
                <option value="总经办">总经办</option>
                <option value="研发部">研发部</option>
                <option value="人事行政部">人事行政部</option>
                <option value="财务部">财务部</option>
                <option value="市场部">市场部</option>
              </select>

              {/* Status selector */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700 focus:outline-hidden"
              >
                <option value="all">全部状态</option>
                <option value="normal">正常出勤</option>
                <option value="late">迟到</option>
                <option value="early_leave">早退</option>
                <option value="supplement">已补卡</option>
                <option value="absent">缺勤/请假</option>
              </select>

              {/* Name search */}
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="搜索员工姓名..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-white pl-8 pr-3 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-2xs hover:bg-emerald-700 transition-colors"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>导出考勤报表 (CSV)</span>
            </button>
          </div>

          {/* Attendance Table */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 bg-zinc-50/70">
                    <th className="py-2.5 px-3 font-medium">员工姓名</th>
                    <th className="py-2.5 px-3 font-medium">所属部门</th>
                    <th className="py-2.5 px-3 font-medium">打卡日期</th>
                    <th className="py-2.5 px-3 font-medium">上班打卡时间</th>
                    <th className="py-2.5 px-3 font-medium">打卡地点</th>
                    <th className="py-2.5 px-3 font-medium">下班打卡时间</th>
                    <th className="py-2.5 px-3 font-medium">出勤工时</th>
                    <th className="py-2.5 px-3 font-medium">考勤状态</th>
                    <th className="py-2.5 px-3 font-medium">备注说明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-zinc-400">
                        当前筛选条件下无考勤记录
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-zinc-50/60">
                        <td className="py-3 px-3 font-semibold text-zinc-900">{r.userName}</td>
                        <td className="py-3 px-3 text-zinc-600">{r.department}</td>
                        <td className="py-3 px-3 font-medium text-zinc-700">{r.date}</td>
                        <td className="py-3 px-3 font-mono text-zinc-700">{r.clockInTime || '-'}</td>
                        <td className="py-3 px-3 text-zinc-500 max-w-xs truncate">
                          {r.clockInLocation || '-'}
                        </td>
                        <td className="py-3 px-3 font-mono text-zinc-700">{r.clockOutTime || '-'}</td>
                        <td className="py-3 px-3 font-mono text-zinc-700">
                          {r.workHours ? `${r.workHours}h` : '-'}
                        </td>
                        <td className="py-3 px-3">{getStatusBadge(r.status)}</td>
                        <td className="py-3 px-3 text-zinc-500 max-w-xs truncate">{r.note || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: 考勤补卡申请 */}
      {showMakeupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>申请考勤补卡</span>
              </h3>
              <button
                onClick={() => setShowMakeupModal(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitMakeup} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">补卡员工</label>
                <div className="rounded-lg bg-zinc-50 p-2.5 text-zinc-900 border border-zinc-200 font-medium">
                  {currentUser.name} ({currentUser.department} - {currentUser.title})
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">补卡日期</label>
                <input
                  type="date"
                  required
                  value={makeupDate}
                  onChange={(e) => setMakeupDate(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">卡点类型</label>
                  <select
                    value={makeupType}
                    onChange={(e) => setMakeupType(e.target.value as 'in' | 'out')}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 text-zinc-800"
                  >
                    <option value="in">上班卡</option>
                    <option value="out">下班卡</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">补签时间</label>
                  <input
                    type="time"
                    required
                    value={makeupTime}
                    onChange={(e) => setMakeupTime(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 p-2.5 text-zinc-800"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">补卡事由及异常说明</label>
                <textarea
                  rows={3}
                  required
                  placeholder="例如：因外勤客户沟通、大厦闸机网络异常或早会出差未打卡..."
                  value={makeupReason}
                  onChange={(e) => setMakeupReason(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-zinc-800 placeholder-zinc-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowMakeupModal(false)}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-zinc-700 hover:bg-zinc-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  提交补卡
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: 考勤规则设置 */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-1.5">
                <Settings2 className="h-4 w-4 text-blue-600" />
                <span>企业考勤规则配置</span>
              </h3>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRules} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">标准上班时间</label>
                  <input
                    type="time"
                    required
                    value={editingRules.workStartTime}
                    onChange={(e) =>
                      setEditingRules({ ...editingRules, workStartTime: e.target.value })
                    }
                    className="w-full rounded-lg border border-zinc-300 p-2.5 text-zinc-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">标准下班时间</label>
                  <input
                    type="time"
                    required
                    value={editingRules.workEndTime}
                    onChange={(e) =>
                      setEditingRules({ ...editingRules, workEndTime: e.target.value })
                    }
                    className="w-full rounded-lg border border-zinc-300 p-2.5 text-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">
                  弹性打卡缓冲时间 (分钟)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={editingRules.flexMinutes}
                  onChange={(e) =>
                    setEditingRules({ ...editingRules, flexMinutes: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-zinc-800"
                />
                <p className="mt-1 text-[11px] text-zinc-400">
                  在该缓冲分钟内打卡不计为迟到 (例如允许迟到15分钟内)
                </p>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">打卡办公地点范围识别名称</label>
                <input
                  type="text"
                  required
                  value={editingRules.officeLocationName}
                  onChange={(e) =>
                    setEditingRules({ ...editingRules, officeLocationName: e.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-zinc-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="allowMakeup"
                  checked={editingRules.allowMakeup}
                  onChange={(e) =>
                    setEditingRules({ ...editingRules, allowMakeup: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600"
                />
                <label htmlFor="allowMakeup" className="text-xs text-zinc-700 font-medium">
                  允许员工在线提交考勤补卡申请
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowRulesModal(false)}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-zinc-700 hover:bg-zinc-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  保存生效
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
