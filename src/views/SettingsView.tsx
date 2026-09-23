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
  FileCode2,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  ArrowRight,
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
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'workflow' | 'pitfalls' | 'checklist'>('workflow');

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

  const workflowYaml = `name: Build Android APK

on:
  push:
    branches: [ main, master ]  # 推送代码到 main / master 分支自动触发构建
  workflow_dispatch:            # 允许在 GitHub 网页界面手动点击 "Run workflow"

jobs:
  build-apk:
    name: Build & Package Android APK
    runs-on: ubuntu-latest

    steps:
      # 1. 检出仓库代码
      - name: Checkout Code
        uses: actions/checkout@v4

      # 2. 配置 Node.js（推荐使用 Node 22）
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      # 3. 配置 Java JDK（Capacitor 7 必须用 JDK 21）
      - name: Set up Java JDK 21
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '21'

      # 4. 自动同意系统预装 Android SDK 许可
      - name: Accept Android SDK Licenses
        run: |
          yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses || true

      # 5. 安全安装 Web 前端依赖（规避 peer 依赖与 lock 文件缺失风险）
      - name: Install Dependencies
        run: npm install --legacy-peer-deps

      # 6. 编译前端静态资源（生成 dist 文件夹）
      - name: Build Web Application
        run: npm run build

      # 7. 初始化或同步 Capacitor Android 原生工程
      - name: Initialize & Sync Capacitor Android
        run: |
          if [ ! -d "android" ]; then
            npx cap add android
          fi
          npx cap sync android

      # 8. 使用 Gradle 编译 Debug APK
      - name: Build Debug APK with Gradle
        run: |
          cd android
          chmod +x ./gradlew
          ./gradlew assembleDebug --stacktrace

      # 9. 上传产物至 Actions Artifacts 供下载
      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: enterprise-oa-debug-apk
          path: android/app/build/outputs/apk/debug/app-debug.apk
          retention-days: 14`;

  const handleCopyYaml = () => {
    navigator.clipboard.writeText(workflowYaml);
    setCopiedWorkflow(true);
    onShowToast('success', '已复制工作流配置', '.github/workflows/build-apk.yml 内容已写入剪贴板');
    setTimeout(() => setCopiedWorkflow(false), 2000);
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

      {/* Android APK GitHub Actions Build & Guide Section */}
      <div className="rounded-2xl border border-blue-200 bg-linear-to-br from-blue-50/60 via-white to-indigo-50/40 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-blue-600 p-2.5 text-white shadow-xs">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900">
                  Android APK 自动化打包配置（GitHub Actions + Capacitor）
                </h3>
                <span className="rounded-full bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5">
                  CI/CD 模板已就绪
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                依据《打包 Android APK 避坑指南与标准模板》已预置 Capacitor 7 配置、JDK 21 规约与标准工作流
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWorkflowModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 active:bg-blue-800 shadow-xs transition-colors"
            >
              <FileCode2 className="h-3.5 w-3.5" />
              <span>查看避坑指南与打包配置</span>
            </button>
          </div>
        </div>

        {/* 4 Key Guardrails Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white border border-blue-100/80 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
              <span>Java 编译器环境</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                <Check className="h-3 w-3" /> JDK 21
              </span>
            </div>
            <div className="font-semibold text-zinc-800">Temurin JDK 21</div>
            <p className="text-[10px] text-zinc-500 mt-1">
              适配 Capacitor 7+ 必须的 Java 21 目标兼容性，避免 invalid source release 21 报错。
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-blue-100/80 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
              <span>Android SDK 许可</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                <Check className="h-3 w-3" /> 系统原生
              </span>
            </div>
            <div className="font-semibold text-zinc-800">$ANDROID_HOME</div>
            <p className="text-[10px] text-zinc-500 mt-1">
              直接使用 GitHub runner 原生 SDK，静默接受许可，弃用易产生冲突的第三方 Action。
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-blue-100/80 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
              <span>依赖安装策略</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                <Check className="h-3 w-3" /> 容错安装
              </span>
            </div>
            <div className="font-semibold text-zinc-800">--legacy-peer-deps</div>
            <p className="text-[10px] text-zinc-500 mt-1">
              免除强缓存对 package-lock.json 的硬依赖，安全解决 peer 依赖与版本冲突。
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-blue-100/80 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
              <span>Capacitor 移动包名</span>
              <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                <Check className="h-3 w-3" /> dist
              </span>
            </div>
            <div className="font-semibold text-zinc-800">com.enterprise.oa</div>
            <p className="text-[10px] text-zinc-500 mt-1">
              `capacitor.config.json` 与 `.github/workflows/build-apk.yml` 现已写入工程根目录。
            </p>
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

      {/* GitHub Actions & Capacitor APK Build Modal */}
      {showWorkflowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-zinc-200 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 bg-zinc-50">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-blue-600 p-2 text-white">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    Android APK 打包避坑指南与标准工作流
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Capacitor 7 + GitHub Actions 自动化编译配置及真机运行步骤
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowWorkflowModal(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-200 px-6 bg-white gap-4 text-xs font-semibold">
              <button
                onClick={() => setActiveGuideTab('workflow')}
                className={`py-3 border-b-2 transition-colors ${
                  activeGuideTab === 'workflow'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                工作流配置 (build-apk.yml)
              </button>
              <button
                onClick={() => setActiveGuideTab('pitfalls')}
                className={`py-3 border-b-2 transition-colors ${
                  activeGuideTab === 'pitfalls'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                四大关键避坑法则
              </button>
              <button
                onClick={() => setActiveGuideTab('checklist')}
                className={`py-3 border-b-2 transition-colors ${
                  activeGuideTab === 'checklist'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                推送前检查与下载安装
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {activeGuideTab === 'workflow' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-zinc-500">
                      文件存储位置: .github/workflows/build-apk.yml
                    </span>
                    <button
                      onClick={handleCopyYaml}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      {copiedWorkflow ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span>已复制到剪贴板</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>一键复制 YAML 内容</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-4 rounded-xl bg-zinc-900 text-zinc-100 text-[11px] font-mono leading-relaxed overflow-x-auto max-h-96 border border-zinc-800">
                    {workflowYaml}
                  </pre>
                </div>
              )}

              {activeGuideTab === 'pitfalls' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-zinc-900">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">
                        1
                      </span>
                      <span>Java JDK 与 Capacitor 7+ 必须严格统一为 JDK 21</span>
                    </div>
                    <p className="text-zinc-600 leading-relaxed text-[11px]">
                      Capacitor 7+ 初始化生成的 Android 工程默认将编译目标设定为 Java 21。如果使用 JDK 17 会触发 <code className="bg-zinc-200 px-1 rounded text-rose-600">invalid source release: 21</code> 错误。流水线已配置 <code className="bg-zinc-200 px-1 rounded">temurin @ 21</code>。
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-zinc-900">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">
                        2
                      </span>
                      <span>直接使用系统预装 Android SDK，避免第三方 Action 冲突</span>
                    </div>
                    <p className="text-zinc-600 leading-relaxed text-[11px]">
                      GitHub ubuntu-latest 镜像已自备完整 Android 工具链，第三方 Action 往往会在更新组件时退出 code 1。仅需一行命令静默同意许可：<code className="bg-zinc-200 px-1 rounded">yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses || true</code>。
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-zinc-900">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">
                        3
                      </span>
                      <span>采用容错率高的 npm install --legacy-peer-deps</span>
                    </div>
                    <p className="text-zinc-600 leading-relaxed text-[11px]">
                      移除强硬的 <code className="bg-zinc-200 px-1 rounded">cache: 'npm'</code> 避免没有提交 package-lock.json 时直接失败，同时加上 --legacy-peer-deps 防止前端生态的小版本 peer 冲突。
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-zinc-900">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">
                        4
                      </span>
                      <span>Node.js 运行时统一采用活跃的 Node 22</span>
                    </div>
                    <p className="text-zinc-600 leading-relaxed text-[11px]">
                      避免 Node 20 报 Deprecated 警告，提供最新稳定的构建支持。
                    </p>
                  </div>
                </div>
              )}

              {activeGuideTab === 'checklist' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-bold text-zinc-900 text-xs">提交 Git 时的自检清单 (Checklist)</h4>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-zinc-700 bg-emerald-50/60 border border-emerald-200/80 p-2 rounded-lg">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span><strong>1. capacitor.config.json 已配置</strong>：webDir 已设定为 "dist"，appId 为 "com.enterprise.oa"。</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-700 bg-emerald-50/60 border border-emerald-200/80 p-2 rounded-lg">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span><strong>2. package.json 依赖完备</strong>：包含 @capacitor/core、@capacitor/android 与 @capacitor/cli。</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-700 bg-emerald-50/60 border border-emerald-200/80 p-2 rounded-lg">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span><strong>3. .gitignore 规范忽略</strong>：已过滤 android/app/build/、android/.gradle/、dist/，并保留配置文件。</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-200">
                    <h4 className="font-bold text-zinc-900 text-xs">APK 下载与真机安装指南</h4>
                    <ol className="list-decimal list-inside space-y-1.5 text-zinc-600 text-[11px]">
                      <li>代码推送至 GitHub 仓库（或在 Actions 页面点击 <strong>Run workflow</strong>）。</li>
                      <li>等待 <strong>Build Android APK</strong> 流水线运行完成（约 2~3 分钟，所有图标打勾变绿）。</li>
                      <li>在构建详情页面底部找到 <strong>Artifacts</strong> 区域。</li>
                      <li>点击 <strong>enterprise-oa-debug-apk</strong> 下载 ZIP 压缩包并解压出 <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono">app-debug.apk</code>。</li>
                      <li>通过微信、QQ、网盘或 USB 发送到安卓手机，开启「允许安装未知来源应用」即可直接安装使用！</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-200 px-6 py-3 bg-zinc-50 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">
                本规约已同步收录至根目录 <strong className="font-mono">README_APK_BUILD.md</strong>
              </span>
              <button
                onClick={() => setShowWorkflowModal(false)}
                className="rounded-lg bg-zinc-200 px-4 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-300 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
