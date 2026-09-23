/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, ApprovalItem, ApprovalType } from './types';
import { db } from './services/db';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { DashboardView } from './views/DashboardView';
import { AttendanceView } from './views/AttendanceView';
import { ApprovalView } from './views/ApprovalView';
import { WorkflowView } from './views/WorkflowView';
import { MessageView } from './views/MessageView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cross-view deep-linking states
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [selectedApprovalForModal, setSelectedApprovalForModal] = useState<ApprovalItem | null>(null);
  const [preselectedApprovalType, setPreselectedApprovalType] = useState<ApprovalType | null>(null);
  const [openAttendanceMakeup, setOpenAttendanceMakeup] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial load
  const loadUserDataAndBadges = async () => {
    try {
      const user = await db.getCurrentUser();
      setCurrentUser(user);

      if (user) {
        const [apps, chans, wfInsts] = await Promise.all([
          db.getApprovals(),
          db.getChannels(user.id),
          db.getWorkflowInstances(),
        ]);

        // Pending approvals for this user
        const pendingRegular = apps.filter((a) => {
          if (a.status !== 'pending') return false;
          const step = a.steps[a.currentStepIndex];
          return step?.approverId === user.id || user.role === 'admin';
        }).length;

        const pendingWf = wfInsts.filter((w) => {
          if (w.status !== 'pending') return false;
          const step = w.steps[w.currentStepIndex];
          return step?.approverId === user.id || user.role === 'admin';
        }).length;

        setPendingApprovalsCount(pendingRegular + pendingWf);

        // Unread messages
        const unread = chans.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setUnreadMessagesCount(unread);
      }
    } catch (err) {
      console.error('Failed to init user:', err);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    loadUserDataAndBadges();
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    addToast('success', '登录成功', `欢迎回来，${user.name} (${user.department} - ${user.title})`);
    loadUserDataAndBadges();
  };

  const handleLogout = async () => {
    await db.logout();
    setCurrentUser(null);
    addToast('info', '已安全登出', '您可以使用 admin/admin 或其他角色账号重新登录');
  };

  const handleSwitchUser = async (user: User) => {
    await db.setCurrentUser(user);
    setCurrentUser(user);
    addToast('success', '已切换身份', `当前操作人: ${user.name} (${user.title})`);
    loadUserDataAndBadges();
  };

  const handleNavigateTab = (tab: string, param?: any) => {
    setActiveTab(tab);
    if (tab === 'approval' && param?.preselectType) {
      setPreselectedApprovalType(param.preselectType);
    } else {
      setPreselectedApprovalType(null);
    }

    if (tab === 'attendance' && param?.openMakeup) {
      setOpenAttendanceMakeup(true);
    } else {
      setOpenAttendanceMakeup(false);
    }
  };

  const handleOpenApprovalDetail = (item: ApprovalItem) => {
    setSelectedApprovalForModal(item);
    setActiveTab('approval');
  };

  const handleDatabaseReset = async () => {
    await loadUserDataAndBadges();
    setActiveTab('dashboard');
  };

  if (loadingUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          <p className="text-xs font-medium text-zinc-500">正在载入企业协同OA本地数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-50 text-zinc-900 font-sans">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Login Modal if unauthenticated */}
      {!currentUser ? (
        <LoginModal onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          {/* Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={handleNavigateTab}
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
            pendingApprovalsCount={pendingApprovalsCount}
            unreadMessagesCount={unreadMessagesCount}
            currentUser={currentUser}
          />

          {/* Main Area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Top Header */}
            <Header
              currentUser={currentUser}
              onLogout={handleLogout}
              onSwitchUser={handleSwitchUser}
              onOpenMobileMenu={() => setMobileMenuOpen(true)}
              activeTab={activeTab}
              pendingApprovalsCount={pendingApprovalsCount}
              unreadMessagesCount={unreadMessagesCount}
              onNavigateTab={handleNavigateTab}
            />

            {/* Scrollable Main Content */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <div className="mx-auto max-w-7xl">
                {activeTab === 'dashboard' && (
                  <DashboardView
                    currentUser={currentUser}
                    onNavigateTab={handleNavigateTab}
                    onShowToast={addToast}
                    onOpenApprovalDetail={handleOpenApprovalDetail}
                  />
                )}

                {activeTab === 'workflow' && (
                  <WorkflowView
                    currentUser={currentUser}
                    onShowToast={addToast}
                    onNavigateTab={handleNavigateTab}
                  />
                )}

                {activeTab === 'attendance' && (
                  <AttendanceView
                    currentUser={currentUser}
                    onShowToast={addToast}
                    openMakeupOnMount={openAttendanceMakeup}
                  />
                )}

                {activeTab === 'approval' && (
                  <ApprovalView
                    currentUser={currentUser}
                    onShowToast={addToast}
                    preselectedItem={selectedApprovalForModal}
                    onCloseDetail={() => setSelectedApprovalForModal(null)}
                    preselectedType={preselectedApprovalType}
                    onNavigateTab={handleNavigateTab}
                  />
                )}

                {activeTab === 'message' && (
                  <MessageView
                    currentUser={currentUser}
                    onShowToast={addToast}
                    onNavigateToApproval={(appId) => {
                      db.getApprovals().then((all) => {
                        const target = all.find((a) => a.id === appId);
                        if (target) {
                          handleOpenApprovalDetail(target);
                        } else {
                          setActiveTab('approval');
                        }
                      });
                    }}
                    onSwitchUser={handleSwitchUser}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsView
                    currentUser={currentUser}
                    onShowToast={addToast}
                    onSwitchUser={handleSwitchUser}
                    onDatabaseReset={handleDatabaseReset}
                  />
                )}
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
}
