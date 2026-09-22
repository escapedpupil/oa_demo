import React, { useState, useEffect } from 'react';
import { User, AttendanceRule } from '../types';
import { db } from '../services/db';
import {
  Settings,
  Database,
  RotateCcw,
  Smartphone,
  ShieldCheck,
  UserCheck,
  Clock,
  Building,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface SettingsViewProps {
  currentUser: User;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onSwitchUser: (user: User) => void;
  onDatabaseReset: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onShowToast,
  onSwitchUser,
  onDatabaseReset,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [rule, setRule] = useState<AttendanceRule | null>(null);
  const [recordsCount, setRecordsCount] = useState(0);
  const [approvalsCount, setApprovalsCount] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const loadStats = async () => {
    const [u, r, atts, apps] = await Promise.all([
      db.getUsers(),
      db.getAttendanceRules(),
      db.getAttendanceRecords(),
      db.getApprovals(),
    ]);
    setUsers(u);
    setRule(r);
    setRecordsCount(atts.length);
    setApprovalsCount(apps.length);
  };

  useEffect(() => {
    loadStats();
  }, [currentUser]);

  const handleReset = async () => {
    try {
      await db.resetToDefaults();
      setShowResetConfirm(false);
      onShowToast('success', '手机本地数据库已重置恢复', '已还原初始演示员工账号、考勤与审批流程数据');
      onDatabaseReset();
    } catch {
      onShowToast('error', '重置失败');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Current User Profile Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-blue-600" />
          <span>当前登录用户档案</span>
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt=""
              className="h-16 w-16 rounded-full object-cover ring-2 ring-blue-500/30"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-zinc-900">{currentUser.name}</span>
                {currentUser.role === 'admin' ? (
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                    超级管理员
                  </span>
                ) : (
                  <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700">
                    {currentUser.role === 'manager' ? '部门主管' : '普通员工'}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500">
                {currentUser.department} · {currentUser.title}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
                <span>登录账号: {currentUser.username}</span>
                <span>·</span>
                <span>电话: {currentUser.phone}</span>
                <span>·</span>
                <span>邮箱: {currentUser.email}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              账号已认证
            </span>
          </div>
        </div>
      </div>

      {/* Local Database Information */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-600" />
              <span>手机本地数据库运行状态</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              遵循用户要求：第一版本所有业务数据持久化于客户端手机本地存储
            </p>
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>重置恢复初始演示数据</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
            <span className="text-zinc-400 block text-[11px]">存储引擎技术</span>
            <span className="font-semibold text-zinc-800 text-sm mt-1 block">Local Engine</span>
            <span className="text-[10px] text-emerald-600">离线可用 · 毫秒级读写</span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
            <span className="text-zinc-400 block text-[11px]">在册员工账号</span>
            <span className="font-semibold text-zinc-800 text-sm mt-1 block">{users.length} 个</span>
            <span className="text-[10px] text-zinc-400">含默认 admin 管理员</span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
            <span className="text-zinc-400 block text-[11px]">考勤打卡累计</span>
            <span className="font-semibold text-zinc-800 text-sm mt-1 block">{recordsCount} 条</span>
            <span className="text-[10px] text-zinc-400">含今日与历史打卡</span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
            <span className="text-zinc-400 block text-[11px]">流转审批单据</span>
            <span className="font-semibold text-zinc-800 text-sm mt-1 block">{approvalsCount} 个</span>
            <span className="text-[10px] text-zinc-400">含请假/报销/出差单</span>
          </div>
        </div>
      </div>

      {/* Quick Role Switcher for Testing Approval Workflow */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-zinc-900 mb-1 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-indigo-600" />
          <span>全流程角色一键切换（模拟各岗位操作视角）</span>
        </h3>
        <p className="text-xs text-zinc-500 mb-4">
          点击下方任一员工卡片，可无需重新输入账号密码直接切换当前登录者，体验员工发起、主管审核、财务复核的闭环协同。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {users.map((u) => {
            const isCurrent = u.id === currentUser.id;
            return (
              <div
                key={u.id}
                className={`p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/20'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <img src={u.avatar} alt="" className="h-9 w-9 rounded-full object-cover shrink-0" />
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-zinc-900 truncate">{u.name}</span>
                      {u.role === 'admin' && (
                        <span className="rounded bg-blue-100 text-blue-800 text-[10px] px-1">管理员</span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate">{u.department} · {u.title}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">账号: {u.username}</p>
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  {isCurrent ? (
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-1 rounded-md">
                      当前身份
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        onSwitchUser(u);
                        onShowToast('success', '已切换身份', `当前为: ${u.name} (${u.title})`);
                      }}
                      className="rounded-md bg-zinc-100 hover:bg-blue-600 hover:text-white px-2.5 py-1 text-xs text-zinc-700 font-medium transition-colors"
                    >
                      切换
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-zinc-200 text-xs">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span>确认恢复初始本地数据库？</span>
            </div>
            <p className="text-zinc-600 leading-relaxed">
              此操作将重置手机浏览器中的所有考勤打卡记录、新提交的审批单据以及聊天记录，恢复为系统出厂预设数据。默认管理员账号依然为 <strong className="font-mono text-zinc-900">admin / admin</strong>。
            </p>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-zinc-700 hover:bg-zinc-50"
              >
                取消
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg bg-rose-600 px-4 py-2 font-medium text-white hover:bg-rose-700"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
