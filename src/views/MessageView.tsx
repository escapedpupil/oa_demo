import React, { useState, useEffect, useRef } from 'react';
import { User, ChatChannel, ChatMessage, Department } from '../types';
import { db } from '../services/db';
import {
  MessageSquare,
  Users,
  Search,
  Send,
  Paperclip,
  Smile,
  ShieldAlert,
  Building2,
  Phone,
  Mail,
  CheckCheck,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Sparkles,
  UserCheck,
} from 'lucide-react';

interface MessageViewProps {
  currentUser: User;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onNavigateToApproval?: (approvalId: string) => void;
  onSwitchUser?: (user: User) => void;
}

export const MessageView: React.FC<MessageViewProps> = ({
  currentUser,
  onShowToast,
  onNavigateToApproval,
  onSwitchUser,
}) => {
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts'>('chats');
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('chan-notice');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadChannelsAndUsers = async () => {
    const [chans, users, depts] = await Promise.all([
      db.getChannels(currentUser.id),
      db.getUsers(),
      db.getDepartments(),
    ]);
    setChannels(chans);
    setAllUsers(users);
    setDepartments(depts);

    if (chans.length > 0 && !selectedChannelId) {
      setSelectedChannelId(chans[0].id);
    }
  };

  const loadMessages = async (channelId: string) => {
    const msgs = await db.getMessages(channelId);
    setMessages(msgs);
    await db.markChannelRead(channelId);
    scrollToBottom();
  };

  useEffect(() => {
    loadChannelsAndUsers();
  }, [currentUser]);

  useEffect(() => {
    if (selectedChannelId) {
      loadMessages(selectedChannelId);
    }
  }, [selectedChannelId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    try {
      await db.sendMessage(selectedChannelId, {
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        content: inputText.trim(),
        type: 'text',
      });
      setInputText('');
      setShowEmojiPicker(false);
      await loadMessages(selectedChannelId);
      // Reload channel preview list
      const chans = await db.getChannels(currentUser.id);
      setChannels(chans);
    } catch {
      onShowToast('error', '消息发送失败');
    }
  };

  // Quick reply chip
  const handleQuickReply = (text: string) => {
    setInputText(text);
  };

  // Start direct chat with user from directory
  const handleStartChatWithUser = async (targetUser: User) => {
    if (targetUser.id === currentUser.id) {
      onShowToast('info', '无法与自己发起私聊');
      return;
    }

    try {
      const channel = await db.getOrCreateDirectChannel(currentUser, targetUser);
      await loadChannelsAndUsers();
      setSelectedChannelId(channel.id);
      setActiveTab('chats');
      onShowToast('success', '已打开会话', `与 ${targetUser.name} 的即时对话`);
    } catch {
      onShowToast('error', '建立会话失败');
    }
  };

  // Send mock attachment
  const handleSendMockFile = async () => {
    await db.sendMessage(selectedChannelId, {
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content: '📎【企业文档】2026年第三季度协同办公运营汇报及考勤分析.pdf (2.4MB)',
      type: 'text',
    });
    loadMessages(selectedChannelId);
    onShowToast('success', '文档已分享至当前会话');
  };

  const selectedChannel = channels.find((c) => c.id === selectedChannelId);

  // Filter channels or directory
  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const filteredUsers = allUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      u.title.toLowerCase().includes(q)
    );
  });

  const emojis = ['👍', '👌', '👏', '🤝', '🎉', '😊', '🙏', '💪', '☕', '💡', '✅', '📌'];

  return (
    <div className="h-[calc(100vh-140px)] min-h-[550px] rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* LEFT COLUMN: Sidebar (Channels / Contacts) */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col bg-zinc-50/70">
        {/* Toggle between Chats & Contacts */}
        <div className="p-3 border-b border-zinc-200 bg-white flex items-center gap-2">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'chats'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>消息会话</span>
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'contacts'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>企业通讯录</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-zinc-200/80 bg-white">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder={activeTab === 'chats' ? '搜索群组或会话...' : '搜索姓名/部门/职位...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-3 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tab 1: CHAT LIST */}
        {activeTab === 'chats' && (
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
            {filteredChannels.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-400">未找到匹配的会话</div>
            ) : (
              filteredChannels.map((chan) => {
                const isSelected = chan.id === selectedChannelId;
                return (
                  <div
                    key={chan.id}
                    onClick={() => {
                      setSelectedChannelId(chan.id);
                    }}
                    className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 border-r-2 border-blue-600'
                        : 'hover:bg-zinc-100/70'
                    }`}
                  >
                    <div className="relative shrink-0">
                      {chan.avatar ? (
                        <img
                          src={chan.avatar}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover ring-1 ring-zinc-200"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                          {chan.name.slice(0, 2)}
                        </div>
                      )}
                      {chan.type === 'system_notice' && (
                        <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-blue-600 p-0.5 text-white">
                          <Building2 className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold text-zinc-900 truncate">
                          {chan.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 shrink-0 font-mono">
                          {chan.lastTimestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate">{chan.lastMessage || '暂无消息'}</p>
                    </div>

                    {chan.unreadCount > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shrink-0 self-center">
                        {chan.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: CONTACTS DIRECTORY */}
        {activeTab === 'contacts' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {departments.map((dept) => {
              const deptUsers = filteredUsers.filter((u) => u.department === dept.name);
              if (deptUsers.length === 0) return null;

              return (
                <div key={dept.id} className="space-y-1.5">
                  <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    <span>{dept.name}</span>
                    <span>{deptUsers.length} 人</span>
                  </div>

                  <div className="space-y-1">
                    {deptUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-zinc-200/80 hover:border-blue-300 hover:shadow-2xs transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative">
                            <img
                              src={user.avatar}
                              alt=""
                              className="h-8 w-8 rounded-full object-cover"
                            />
                            <span
                              className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ring-2 ring-white ${
                                user.status === 'online'
                                  ? 'bg-emerald-500'
                                  : user.status === 'busy'
                                  ? 'bg-amber-500'
                                  : 'bg-zinc-400'
                              }`}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-zinc-900 truncate">
                                {user.name}
                              </span>
                              {user.role === 'admin' && (
                                <span className="rounded bg-blue-100 text-blue-800 text-[9px] px-1 py-0.2">
                                  管理
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-400 truncate">{user.title}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {user.id !== currentUser.id ? (
                            <button
                              onClick={() => handleStartChatWithUser(user)}
                              className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                            >
                              发消息
                            </button>
                          ) : (
                            <span className="text-[10px] text-zinc-400 px-2">当前账号</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Active Chat Panel */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChannel ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 bg-white shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {selectedChannel.avatar ? (
                    <img
                      src={selectedChannel.avatar}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover ring-1 ring-zinc-200"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs">
                      {selectedChannel.name.slice(0, 2)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900">{selectedChannel.name}</h3>
                    {selectedChannel.departmentTag && (
                      <span className="rounded bg-zinc-100 px-1.5 py-0.2 text-[10px] font-medium text-zinc-600">
                        {selectedChannel.departmentTag}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    {selectedChannel.type === 'system_notice'
                      ? '全公司全员统一通知与审批助手消息广播频道'
                      : selectedChannel.type === 'group'
                      ? `群成员: ${selectedChannel.memberIds.length} 位企业同事`
                      : '端到端离线本地即时会话'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  本地通讯就绪
                </span>
              </div>
            </div>

            {/* Chat Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50">
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                const isSystem = msg.senderId === 'sys' || msg.type === 'system';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="mx-auto max-w-lg my-2">
                      <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 text-xs text-blue-900 shadow-2xs">
                        <div className="flex items-center gap-2 font-semibold text-blue-900 mb-1">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <span>{msg.senderName}</span>
                          <span className="text-[10px] text-blue-500 font-normal font-mono">
                            {msg.timestamp}
                          </span>
                        </div>
                        <p className="text-zinc-700 leading-relaxed text-xs">{msg.content}</p>

                        {/* Interactive Approval Card inside System Notice */}
                        {msg.cardData?.approvalId && (
                          <div className="mt-2.5 pt-2 border-t border-blue-200/80 flex items-center justify-between">
                            <span className="text-[11px] text-blue-800 font-medium">
                              单据号: {msg.cardData.approvalId}
                            </span>
                            {onNavigateToApproval && (
                              <button
                                onClick={() => onNavigateToApproval(msg.cardData!.approvalId!)}
                                className="flex items-center gap-1 rounded bg-blue-600 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-blue-700 transition-colors"
                              >
                                <span>前往审批中心查看</span>
                                <ExternalLink className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-zinc-200 shrink-0"
                    />

                    <div className={`space-y-1 max-w-[80%] sm:max-w-md ${isMe ? 'items-end' : ''}`}>
                      <div
                        className={`flex items-center gap-2 text-[10px] text-zinc-400 ${
                          isMe ? 'justify-end' : ''
                        }`}
                      >
                        {!isMe && <span className="font-medium text-zinc-700">{msg.senderName}</span>}
                        <span>{msg.timestamp}</span>
                      </div>

                      <div
                        className={`rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white text-zinc-900 border border-zinc-200/80 rounded-tl-none'
                        }`}
                      >
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Response Chips */}
            <div className="px-4 py-2 bg-white border-t border-zinc-100 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-zinc-400 shrink-0 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>快捷回复:</span>
              </span>
              <button
                type="button"
                onClick={() => handleQuickReply('收到，马上跟进处理。')}
                className="shrink-0 rounded-full bg-zinc-100 hover:bg-blue-50 hover:text-blue-700 px-2.5 py-1 text-zinc-600 transition-colors"
              >
                收到，马上处理
              </button>
              <button
                type="button"
                onClick={() => handleQuickReply('好的，没问题！')}
                className="shrink-0 rounded-full bg-zinc-100 hover:bg-blue-50 hover:text-blue-700 px-2.5 py-1 text-zinc-600 transition-colors"
              >
                好的，没问题
              </button>
              <button
                type="button"
                onClick={() => handleQuickReply('审批流程已核准通过，请查阅。')}
                className="shrink-0 rounded-full bg-zinc-100 hover:bg-blue-50 hover:text-blue-700 px-2.5 py-1 text-zinc-600 transition-colors"
              >
                审批流程已通过
              </button>
              <button
                type="button"
                onClick={() => handleQuickReply('相关文档及交接清单已同步。')}
                className="shrink-0 rounded-full bg-zinc-100 hover:bg-blue-50 hover:text-blue-700 px-2.5 py-1 text-zinc-600 transition-colors"
              >
                交接清单已同步
              </button>
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 border-t border-zinc-200 bg-white">
              {showEmojiPicker && (
                <div className="mb-2 p-2 rounded-xl bg-white border border-zinc-200 shadow-lg flex flex-wrap gap-2 animate-in fade-in">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setInputText((prev) => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="h-8 w-8 text-base flex items-center justify-center hover:bg-zinc-100 rounded-lg transition-transform active:scale-125"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-colors"
                  title="表情符号"
                >
                  <Smile className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={handleSendMockFile}
                  className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-colors"
                  title="发送工作附件/文档"
                >
                  <Paperclip className="h-4 w-4" />
                </button>

                <input
                  type="text"
                  placeholder="输入沟通消息，按回车键直接发送..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">发送</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-400">
            <MessageSquare className="h-12 w-12 text-zinc-300 mb-3" />
            <h3 className="text-sm font-semibold text-zinc-700">请选择一个对话</h3>
            <p className="text-xs text-zinc-400 mt-1">从左侧列表选择群聊、公告或联系人开启即时通讯</p>
          </div>
        )}
      </div>
    </div>
  );
};
