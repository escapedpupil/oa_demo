import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  FileCheck2,
  MessageSquare,
  Settings,
  Building2,
  X,
  Smartphone,
  ShieldCheck,
  GitFork,
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  pendingApprovalsCount: number;
  unreadMessagesCount: number;
  currentUser: User;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  pendingApprovalsCount,
  unreadMessagesCount,
  currentUser,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: '工作台',
      sub: '概览与快捷待办',
      icon: LayoutDashboard,
    },
    {
      id: 'workflow',
      label: '流程中心',
      sub: '自定义流程与引擎',
      icon: GitFork,
    },
    {
      id: 'approval',
      label: '常规审批',
      sub: '请假报销与出差',
      icon: FileCheck2,
      badge: pendingApprovalsCount,
    },
    {
      id: 'attendance',
      label: '员工考勤',
      sub: '日常打卡与统计管理',
      icon: CalendarCheck,
    },
    {
      id: 'message',
      label: '内部通讯',
      sub: '即时沟通与通讯录',
      icon: MessageSquare,
      badge: unreadMessagesCount,
    },
    {
      id: 'settings',
      label: '系统与数据',
      sub: '考勤规则与本地存储',
      icon: Settings,
    },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between bg-zinc-900 text-white">
      {/* Brand logo & title */}
      <div>
        <div className="flex h-16 items-center justify-between px-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-900/40">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">企业协同OA</span>
              <span className="text-[10px] text-zinc-400 block font-mono">办公自动化管理平台</span>
            </div>
          </div>
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Current user card in sidebar */}
        <div className="mx-3 my-4 rounded-xl bg-zinc-800/80 p-3 border border-zinc-700/60">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-blue-500/40"
            />
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white truncate">{currentUser.name}</span>
                {currentUser.role === 'admin' && (
                  <span className="rounded bg-blue-500/20 text-blue-300 text-[10px] px-1 py-0.2">管理员</span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 truncate">{currentUser.department} · {currentUser.title}</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="px-3 space-y-1">
          <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            核心工作模块
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-sm shadow-blue-900/30'
                    : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  />
                  <div>
                    <span className="block text-xs leading-none">{item.label}</span>
                    <span
                      className={`block text-[10px] mt-0.5 leading-none ${
                        isActive ? 'text-blue-100' : 'text-zinc-500 group-hover:text-zinc-400'
                      }`}
                    >
                      {item.sub}
                    </span>
                  </div>
                </div>

                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span
                    className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                      isActive ? 'bg-white text-blue-600' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info: Local DB banner */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950/40">
        <div className="flex items-start gap-2 rounded-lg bg-zinc-800/60 p-2.5 text-[11px] text-zinc-400 border border-zinc-700/40">
          <Smartphone className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-zinc-200 block">手机本地数据库生效中</span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">离线持久化存储 · 数据随时备份</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:shrink-0 h-screen sticky top-0 border-r border-zinc-800">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex w-72 max-w-xs flex-1 flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
