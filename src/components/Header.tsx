import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../services/db';
import {
  Bell,
  LogOut,
  Users,
  ChevronDown,
  Building2,
  Menu,
  Clock,
  Sparkles,
  Shield,
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  onSwitchUser: (user: User) => void;
  onOpenMobileMenu: () => void;
  activeTab: string;
  pendingApprovalsCount: number;
  unreadMessagesCount: number;
  onNavigateTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onSwitchUser,
  onOpenMobileMenu,
  activeTab,
  pendingApprovalsCount,
  unreadMessagesCount,
  onNavigateTab,
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${mins}:${secs}`);

      const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const date = now.getDate();
      setCurrentDate(`${year}年${month}月${date}日 ${days[now.getDay()]}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    db.getUsers().then(setAllUsers);
  }, []);

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return '协同办公工作台';
      case 'workflow':
        return '自定义流程与工作流引擎';
      case 'attendance':
        return '员工考勤管理';
      case 'approval':
        return '常规审批中心';
      case 'message':
        return '内部通讯与通讯录';
      case 'settings':
        return '系统与本地数据设置';
      default:
        return '协同工作台';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      {/* Left: Mobile hamburger & title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 md:hidden"
          aria-label="打开菜单"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs md:hidden">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-zinc-900">{getTabLabel(activeTab)}</h1>
            <p className="hidden text-xs text-zinc-500 sm:block">企业办公自动化与协同管理平台</p>
          </div>
        </div>
      </div>

      {/* Center: Live clock */}
      <div className="hidden items-center gap-2 rounded-full border border-zinc-200/80 bg-zinc-50/80 px-3 py-1 text-xs text-zinc-600 lg:flex shadow-2xs">
        <Clock className="h-3.5 w-3.5 text-blue-600" />
        <span className="font-mono font-medium text-zinc-900">{currentTime}</span>
        <span className="text-zinc-300">|</span>
        <span>{currentDate}</span>
      </div>

      {/* Right: Notifications & User switcher */}
      <div className="flex items-center gap-3">
        {/* Quick notification bell */}
        <button
          onClick={() => onNavigateTab('approval')}
          className="relative rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-colors"
          title="待办审批"
        >
          <Bell className="h-4 w-4" />
          {pendingApprovalsCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-2xs">
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        {/* User profile with switch dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 rounded-lg border border-zinc-200/90 bg-zinc-50/80 p-1.5 pr-2.5 hover:bg-zinc-100/80 transition-colors"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-7 w-7 rounded-full object-cover ring-1 ring-zinc-300"
            />
            <div className="hidden text-left sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-900">{currentUser.name}</span>
                {currentUser.role === 'admin' ? (
                  <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[10px] font-medium text-blue-800">
                    管理员
                  </span>
                ) : (
                  <span className="rounded bg-zinc-200/80 px-1.5 py-0.2 text-[10px] font-medium text-zinc-700">
                    {currentUser.department}
                  </span>
                )}
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          </button>

          {/* User switch dropdown modal */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 z-50 w-72 origin-top-right rounded-xl border border-zinc-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95">
                {/* Active user info */}
                <div className="border-b border-zinc-100 p-2.5 pb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500/20"
                    />
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-zinc-900 truncate">{currentUser.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{currentUser.title}</p>
                      <p className="text-[11px] text-zinc-400 font-mono">账号: {currentUser.username}</p>
                    </div>
                  </div>
                </div>

                {/* Switch to other colleagues */}
                <div className="py-2">
                  <p className="px-2 pb-1 text-[11px] font-medium text-zinc-400 flex items-center justify-between">
                    <span>快速切换登录身份</span>
                    <Sparkles className="h-3 w-3 text-blue-500" />
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-0.5">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u);
                          setShowUserMenu(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                          u.id === currentUser.id
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src={u.avatar} alt={u.name} className="h-5 w-5 rounded-full object-cover" />
                          <span>{u.name}</span>
                          <span className="text-[10px] text-zinc-400">({u.department})</span>
                        </div>
                        {u.role === 'admin' && (
                          <span className="rounded bg-blue-100 text-[10px] text-blue-800 px-1">管理员</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logout option */}
                <div className="border-t border-zinc-100 pt-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>退出当前账号</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
