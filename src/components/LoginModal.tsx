import React, { useState } from 'react';
import { db, DEFAULT_USERS } from '../services/db';
import { User } from '../types';
import { ShieldCheck, LogIn, AlertCircle, Building2, UserCheck, KeyRound } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await db.authenticate(username, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.message || '登录失败，请核实账号与密码');
      }
    } catch {
      setError('登录遇到异常，请重试');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-zinc-200">
        {/* Header */}
        <div className="bg-gradient-to-b from-zinc-50 to-zinc-100/70 p-6 text-center border-b border-zinc-200/80">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm ring-4 ring-blue-50">
            <Building2 className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">企业协同OA办公系统</h2>
          <p className="mt-1 text-xs text-zinc-500">员工考勤 · 审批流转 · 内部通讯 · 本地数据库持久化</p>
        </div>

        {/* Content & Form */}
        <div className="p-6">
          {/* Default notice tip */}
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-800">
            <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold">第一版本默认管理员凭证：</p>
              <p className="mt-0.5 font-mono text-blue-900">
                账号: <span className="font-bold underline">admin</span> / 密码: <span className="font-bold underline">admin</span>
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">登录账号</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入员工账号或 admin"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-700">访问密码</label>
                <span className="text-[11px] text-zinc-400">默认密码 admin</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入登录密码"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 active:bg-blue-800 disabled:opacity-70 transition-colors"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>立即登录系统</span>
                </>
              )}
            </button>
          </form>

          {/* Quick role test switcher */}
          <div className="mt-6 pt-4 border-t border-zinc-100">
            <p className="text-[11px] font-medium text-zinc-500 mb-2 flex items-center gap-1">
              <KeyRound className="h-3 w-3 text-zinc-400" />
              <span>快速体验各角色账号（点击一键填充）：</span>
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillCredentials('admin', 'admin')}
                className="flex items-center justify-between rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-left text-zinc-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
              >
                <span className="font-medium">系统管理员</span>
                <span className="text-[10px] text-zinc-400 font-mono">admin</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('zhangxf', '123456')}
                className="flex items-center justify-between rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-left text-zinc-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
              >
                <span className="font-medium">研发工程师</span>
                <span className="text-[10px] text-zinc-400 font-mono">zhangxf</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('limeiling', '123456')}
                className="flex items-center justify-between rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-left text-zinc-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
              >
                <span className="font-medium">人事主管</span>
                <span className="text-[10px] text-zinc-400 font-mono">limeiling</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('wangjg', '123456')}
                className="flex items-center justify-between rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-left text-zinc-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
              >
                <span className="font-medium">财务总监</span>
                <span className="text-[10px] text-zinc-400 font-mono">wangjg</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-zinc-50 px-6 py-3 text-center border-t border-zinc-100">
          <p className="text-[11px] text-zinc-400 flex items-center justify-center gap-1">
            <UserCheck className="h-3 w-3 text-zinc-400" />
            <span>本地客户端数据存储 · 无需外部网络依赖</span>
          </p>
        </div>
      </div>
    </div>
  );
};
