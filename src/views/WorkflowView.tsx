import React, { useState, useEffect } from 'react';
import {
  User,
  WorkflowDefinition,
  WorkflowInstance,
  CustomFormField,
  WorkflowStepConfig,
  WorkflowCategory,
  WorkflowApproverType,
  CustomFormFieldType,
} from '../types';
import { db } from '../services/db';
import {
  GitFork,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Settings2,
  Edit3,
  Trash2,
  Copy,
  Eye,
  ShoppingBag,
  FileCheck,
  Wallet,
  Shield,
  Layers,
  Send,
  FileText,
  Users,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Printer,
  AlertCircle,
  HelpCircle,
  MoveUp,
  MoveDown,
  Building,
  UserCheck,
  Tag,
  Share2,
} from 'lucide-react';

interface WorkflowViewProps {
  currentUser: User;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const WorkflowView: React.FC<WorkflowViewProps> = ({
  currentUser,
  onShowToast,
  onNavigateTab,
}) => {
  // Navigation & Sub-views
  const [activeSubTab, setActiveSubTab] = useState<'portal' | 'pending' | 'my' | 'definitions'>('portal');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Data
  const [definitions, setDefinitions] = useState<WorkflowDefinition[]>([]);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Panels
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
  const [approvingInstance, setApprovingInstance] = useState<WorkflowInstance | null>(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Form Launcher Modal
  const [launchingDefinition, setLaunchingDefinition] = useState<WorkflowDefinition | null>(null);
  const [launchFormData, setLaunchFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Workflow Designer Modal
  const [designerOpen, setDesignerOpen] = useState(false);
  const [designerTab, setDesignerTab] = useState<'basic' | 'fields' | 'steps'>('basic');
  const [editingDefinition, setEditingDefinition] = useState<WorkflowDefinition | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Load Data
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [defs, insts, users] = await Promise.all([
        db.getWorkflowDefinitions(),
        db.getWorkflowInstances(),
        db.getUsers(),
      ]);
      setDefinitions(defs);
      setInstances(insts);
      setAllUsers(users);

      // Refresh currently viewed instance if open
      if (selectedInstance) {
        const updated = insts.find((i) => i.id === selectedInstance.id);
        if (updated) setSelectedInstance(updated);
      }
    } catch (err) {
      console.error('Failed to load workflow data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filtered definitions
  const filteredDefinitions = definitions.filter((def) => {
    if (categoryFilter !== 'all' && def.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        def.name.toLowerCase().includes(q) ||
        def.description.toLowerCase().includes(q) ||
        def.code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Pending for current user
  const pendingForMe = instances.filter((inst) => {
    if (inst.status !== 'pending') return false;
    const currentStep = inst.steps[inst.currentStepIndex];
    if (!currentStep) return false;
    return currentStep.approverId === currentUser.id || currentUser.role === 'admin';
  });

  // My submitted instances
  const myInstances = instances.filter((inst) => inst.applicantId === currentUser.id);

  // Category labels and badges
  const getCategoryMeta = (cat: WorkflowCategory) => {
    switch (cat) {
      case 'admin':
        return { label: '行政后勤', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'business':
        return { label: '商务法务', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'finance':
        return { label: '财务报账', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'it':
        return { label: 'IT技术支持', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'hr':
        return { label: '人力资源', color: 'bg-pink-50 text-pink-700 border-pink-200' };
      default:
        return { label: '通用审批', color: 'bg-zinc-100 text-zinc-700 border-zinc-200' };
    }
  };

  const renderIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'ShoppingBag':
        return <ShoppingBag className={className} />;
      case 'FileCheck':
        return <FileCheck className={className} />;
      case 'Wallet':
        return <Wallet className={className} />;
      case 'Shield':
        return <Shield className={className} />;
      case 'Users':
        return <Users className={className} />;
      default:
        return <GitFork className={className} />;
    }
  };

  // -------------------------------------------------------------
  // Workflow Launcher Actions
  // -------------------------------------------------------------
  const handleOpenLaunch = (def: WorkflowDefinition) => {
    setLaunchingDefinition(def);
    const initialData: Record<string, any> = {};
    def.fields.forEach((f) => {
      initialData[f.id] = f.defaultValue !== undefined ? f.defaultValue : '';
    });
    setLaunchFormData(initialData);
    setFormErrors({});
  };

  const handleLaunchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!launchingDefinition) return;

    // Validate fields
    const errors: Record<string, string> = {};
    launchingDefinition.fields.forEach((f) => {
      if (f.required) {
        const val = launchFormData[f.id];
        if (val === undefined || val === null || String(val).trim() === '') {
          errors[f.id] = `请填写${f.label}`;
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      onShowToast('error', '请完善表单必填信息', '标红字段为必填内容');
      return;
    }

    try {
      setActionLoading(true);
      const newInst = await db.createWorkflowInstance({
        workflowId: launchingDefinition.id,
        applicant: currentUser,
        formData: launchFormData,
      });

      onShowToast(
        'success',
        '流程提报成功',
        `单号 ${newInst.id} 已提交，流转至：${newInst.steps[0]?.approverName}`
      );
      setLaunchingDefinition(null);
      await loadAllData();
      setSelectedInstance(newInst);
    } catch (err: any) {
      onShowToast('error', '提交失败', err.message || '系统错误');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Approvals & Rejections
  // -------------------------------------------------------------
  const handleConfirmApprove = async () => {
    if (!approvingInstance) return;
    try {
      setActionLoading(true);
      await db.approveWorkflowInstance(approvingInstance.id, currentUser, approvalComment);
      onShowToast('success', '审批通过', `单号 ${approvingInstance.id} 流程已推进`);
      setApprovingInstance(null);
      setApprovalComment('');
      await loadAllData();
    } catch (err: any) {
      onShowToast('error', '操作失败', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!approvingInstance) return;
    try {
      setActionLoading(true);
      await db.rejectWorkflowInstance(
        approvingInstance.id,
        currentUser,
        approvalComment || '审批不通过，单据驳回'
      );
      onShowToast('info', '已驳回', `单号 ${approvingInstance.id} 流程已驳回至发起人`);
      setApprovingInstance(null);
      setApprovalComment('');
      await loadAllData();
    } catch (err: any) {
      onShowToast('error', '操作失败', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async (inst: WorkflowInstance) => {
    if (!window.confirm(`确定要撤回流程申请「${inst.workflowName}」吗？`)) return;
    try {
      setActionLoading(true);
      await db.revokeWorkflowInstance(inst.id, currentUser);
      onShowToast('info', '已撤回', `单号 ${inst.id} 流程已被您撤回`);
      await loadAllData();
    } catch (err: any) {
      onShowToast('error', '撤回失败', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Workflow Designer Actions
  // -------------------------------------------------------------
  const handleOpenCreateDesigner = () => {
    const newDef: WorkflowDefinition = {
      id: `wf-custom-${Date.now()}`,
      name: '新建自定义业务审批流',
      code: `WF-${Math.floor(100 + Math.random() * 900)}`,
      category: 'general',
      icon: 'GitFork',
      color: 'blue',
      description: '请在表单设计器中配置该业务审批流所需的输入字段与审批节点。',
      status: 'published',
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fields: [
        {
          id: `field_${Date.now()}_1`,
          name: 'title',
          label: '申请事项名称',
          type: 'text',
          required: true,
          placeholder: '如：关于XXX业务推进的申请',
        },
        {
          id: `field_${Date.now()}_2`,
          name: 'reason',
          label: '申请事由与说明',
          type: 'textarea',
          required: true,
          placeholder: '请详细阐述具体背景、需求及预期成效...',
        },
      ],
      steps: [
        {
          id: `step_${Date.now()}_1`,
          name: '直接部门主管初审',
          approverType: 'dept_manager',
          approvalMode: 'or',
        },
        {
          id: `step_${Date.now()}_2`,
          name: '企业管理员终审归档',
          approverType: 'role',
          targetRole: 'admin',
          approvalMode: 'or',
        },
      ],
    };

    setEditingDefinition(newDef);
    setDesignerTab('basic');
    setDesignerOpen(true);
  };

  const handleOpenEditDesigner = (def: WorkflowDefinition) => {
    // deep clone
    setEditingDefinition(JSON.parse(JSON.stringify(def)));
    setDesignerTab('basic');
    setDesignerOpen(true);
  };

  const handleDuplicateDefinition = async (def: WorkflowDefinition) => {
    const cloned: WorkflowDefinition = {
      ...JSON.parse(JSON.stringify(def)),
      id: `wf-custom-${Date.now()}`,
      name: `${def.name} (副本)`,
      code: `${def.code}-COPY`,
      createdBy: currentUser.name,
      isPreset: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.saveWorkflowDefinition(cloned);
    onShowToast('success', '克隆成功', `已基于原模版生成新流程《${cloned.name}》`);
    await loadAllData();
  };

  const handleDeleteDefinition = async (id: string, name: string) => {
    if (!window.confirm(`确定要删除流程定义《${name}》吗？`)) return;
    await db.deleteWorkflowDefinition(id);
    onShowToast('info', '已删除', `流程定义《${name}》已从系统中移除`);
    await loadAllData();
  };

  const handleSaveDesignerDefinition = async () => {
    if (!editingDefinition) return;
    if (!editingDefinition.name.trim()) {
      onShowToast('error', '请输入流程名称');
      return;
    }
    if (editingDefinition.fields.length === 0) {
      onShowToast('error', '请至少添加一个表单字段');
      return;
    }
    if (editingDefinition.steps.length === 0) {
      onShowToast('error', '请至少配置一个审批流转节点');
      return;
    }

    try {
      await db.saveWorkflowDefinition(editingDefinition);
      onShowToast('success', '流程发布成功', `自定义流程《${editingDefinition.name}》已生效`);
      setDesignerOpen(false);
      setEditingDefinition(null);
      await loadAllData();
    } catch (err: any) {
      onShowToast('error', '保存失败', err.message);
    }
  };

  // Field manipulation in designer
  const addFieldToDesigner = (type: CustomFormFieldType) => {
    if (!editingDefinition) return;
    const newField: CustomFormField = {
      id: `field_${Date.now()}`,
      name: `field_${editingDefinition.fields.length + 1}`,
      label:
        type === 'number'
          ? '预算/申请金额'
          : type === 'date'
          ? '发生日期'
          : type === 'select'
          ? '项目类别划分'
          : '新增表单字段',
      type,
      required: true,
      placeholder: '请输入内容...',
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['选项一', '选项二', '选项三'] : undefined,
      unit: type === 'number' ? '元' : undefined,
    };

    setEditingDefinition({
      ...editingDefinition,
      fields: [...editingDefinition.fields, newField],
    });
  };

  const removeFieldFromDesigner = (fieldId: string) => {
    if (!editingDefinition) return;
    setEditingDefinition({
      ...editingDefinition,
      fields: editingDefinition.fields.filter((f) => f.id !== fieldId),
    });
  };

  const moveFieldOrder = (index: number, direction: 'up' | 'down') => {
    if (!editingDefinition) return;
    const fields = [...editingDefinition.fields];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    const temp = fields[index];
    fields[index] = fields[targetIdx];
    fields[targetIdx] = temp;
    setEditingDefinition({ ...editingDefinition, fields });
  };

  // Step manipulation in designer
  const addStepToDesigner = () => {
    if (!editingDefinition) return;
    const newStep: WorkflowStepConfig = {
      id: `step_${Date.now()}`,
      name: `环节 ${editingDefinition.steps.length + 1} 审批`,
      approverType: 'dept_manager',
      approvalMode: 'or',
    };
    setEditingDefinition({
      ...editingDefinition,
      steps: [...editingDefinition.steps, newStep],
    });
  };

  const removeStepFromDesigner = (stepId: string) => {
    if (!editingDefinition) return;
    if (editingDefinition.steps.length <= 1) {
      onShowToast('error', '审批流至少需要保留一个节点');
      return;
    }
    setEditingDefinition({
      ...editingDefinition,
      steps: editingDefinition.steps.filter((s) => s.id !== stepId),
    });
  };

  const moveStepOrder = (index: number, direction: 'up' | 'down') => {
    if (!editingDefinition) return;
    const steps = [...editingDefinition.steps];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= steps.length) return;
    const temp = steps[index];
    steps[index] = steps[targetIdx];
    steps[targetIdx] = temp;
    setEditingDefinition({ ...editingDefinition, steps });
  };

  return (
    <div className="space-y-6">
      {/* 顶部标题与快速统计栏 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
              <GitFork className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                流程中心与流转引擎
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                  支持流程自定义与条件分支
                </span>
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                支持表单可视化设计、审批流多级编排、部门主管自动动态解析与金额条件智能路由。
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreateDesigner}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            新建自定义流程
          </button>
        </div>
      </div>

      {/* 4大指标汇总卡 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div
          onClick={() => setActiveSubTab('portal')}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            activeSubTab === 'portal'
              ? 'border-blue-500 bg-blue-50/40 shadow-sm'
              : 'border-zinc-200 bg-white hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">可发起流程</span>
            <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900">{definitions.length}</span>
            <span className="text-xs text-zinc-400">个模版</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">点击进入发起大厅</p>
        </div>

        <div
          onClick={() => setActiveSubTab('pending')}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            activeSubTab === 'pending'
              ? 'border-amber-500 bg-amber-50/40 shadow-sm'
              : 'border-zinc-200 bg-white hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">待我审批</span>
            <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{pendingForMe.length}</span>
            <span className="text-xs text-zinc-400">件任务</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">待您审核流转</p>
        </div>

        <div
          onClick={() => setActiveSubTab('my')}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            activeSubTab === 'my'
              ? 'border-indigo-500 bg-indigo-50/40 shadow-sm'
              : 'border-zinc-200 bg-white hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">我发起的</span>
            <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
              <Send className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-600">{myInstances.length}</span>
            <span className="text-xs text-zinc-400">单申请</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">追踪流转历史</p>
        </div>

        <div
          onClick={() => setActiveSubTab('definitions')}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            activeSubTab === 'definitions'
              ? 'border-purple-500 bg-purple-50/40 shadow-sm'
              : 'border-zinc-200 bg-white hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">流程设计管理</span>
            <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
              <Settings2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-600">可视化</span>
            <span className="text-xs text-zinc-400">引擎</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">设计表单与节点</p>
        </div>
      </div>

      {/* 二级选项卡栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3">
        <div className="flex items-center gap-1 rounded-xl bg-zinc-100 p-1">
          <button
            onClick={() => setActiveSubTab('portal')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeSubTab === 'portal'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            流程发起大厅
          </button>
          <button
            onClick={() => setActiveSubTab('pending')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeSubTab === 'pending'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            待我审批
            {pendingForMe.length > 0 && (
              <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] text-white">
                {pendingForMe.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('my')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeSubTab === 'my'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            我发起的 ({myInstances.length})
          </button>
          <button
            onClick={() => setActiveSubTab('definitions')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeSubTab === 'definitions'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Settings2 className="h-3.5 w-3.5" />
            流程设计与模版 ({definitions.length})
          </button>
        </div>

        {/* 搜索与分类（发起大厅生效） */}
        {activeSubTab === 'portal' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="搜索流程模版..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 rounded-xl border border-zinc-200 bg-white pl-8 pr-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">全部分类</option>
              <option value="admin">行政后勤</option>
              <option value="business">商务法务</option>
              <option value="finance">财务报账</option>
              <option value="it">IT技术支持</option>
              <option value="hr">人力资源</option>
              <option value="general">通用审批</option>
            </select>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 模块 1: 流程发起大厅 (Portal) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'portal' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDefinitions.map((def) => {
              const meta = getCategoryMeta(def.category);
              return (
                <div
                  key={def.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-blue-400 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 group-hover:bg-blue-600 group-hover:text-white transition">
                          {renderIcon(def.icon, 'w-5 h-5')}
                        </div>
                        <div>
                          <h3 className="font-semibold text-zinc-900 text-sm group-hover:text-blue-600 transition">
                            {def.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-zinc-400">{def.code}</span>
                            <span
                              className={`rounded border px-1.5 py-0.2 text-[10px] font-medium ${meta.color}`}
                            >
                              {meta.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {def.description}
                    </p>

                    {/* 流程要素摘要 */}
                    <div className="mt-4 rounded-xl bg-zinc-50 p-2.5 text-[11px] text-zinc-600 border border-zinc-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">表单字段</span>
                        <span className="font-medium text-zinc-700">{def.fields.length} 个配置项</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">审批节点</span>
                        <span className="font-medium text-zinc-700">
                          {def.steps.length} 级流转 (含条件分支)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenEditDesigner(def)}
                      className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1"
                    >
                      <Settings2 className="h-3.5 w-3.5" />
                      查看配置
                    </button>

                    <button
                      onClick={() => handleOpenLaunch(def)}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-600 hover:text-white transition"
                    >
                      <span>立即发起</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredDefinitions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center">
              <Layers className="mx-auto h-8 w-8 text-zinc-400" />
              <h3 className="mt-2 text-sm font-semibold text-zinc-900">未检索到流程模版</h3>
              <p className="mt-1 text-xs text-zinc-500">您可以尝试清空筛选条件或点击右上角新建流程。</p>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 模块 2: 待我审批 (Pending) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'pending' && (
        <div className="space-y-3">
          {pendingForMe.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
              <h3 className="mt-2 text-sm font-semibold text-zinc-900">太棒了，待办全部处理完毕！</h3>
              <p className="mt-1 text-xs text-zinc-500">当前没有需要您审批流转的自定义业务单据。</p>
            </div>
          ) : (
            pendingForMe.map((inst) => {
              const currentStep = inst.steps[inst.currentStepIndex];
              const meta = getCategoryMeta(inst.workflowCategory);
              return (
                <div
                  key={inst.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={inst.applicantAvatar}
                      alt={inst.applicantName}
                      className="h-10 w-10 rounded-full object-cover ring-1 ring-zinc-200"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900">{inst.workflowName}</span>
                        <span className="font-mono text-xs text-zinc-400">{inst.id}</span>
                        <span className={`rounded border px-1.5 py-0.2 text-[10px] ${meta.color}`}>
                          {meta.label}
                        </span>
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          待您审核（第 {inst.currentStepIndex + 1}/{inst.steps.length} 步）
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-zinc-600">
                        申请人：<span className="font-medium text-zinc-900">{inst.applicantName}</span> ·{' '}
                        {inst.applicantDepartment} · 提交于 {inst.createdAt}
                      </p>

                      {/* 当前环节与审批要点 */}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-zinc-700">
                          当前环节：<strong className="text-blue-600">{currentStep?.name}</strong>
                        </span>
                        {/* 摘要提取一个关键字段 */}
                        {Object.entries(inst.formData).slice(0, 2).map(([k, v]) => (
                          <span key={k} className="text-zinc-500 bg-zinc-50 border border-zinc-200/60 rounded px-2 py-0.5">
                            {String(v).slice(0, 30)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => setSelectedInstance(inst)}
                      className="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      查看详情
                    </button>
                    <button
                      onClick={() => {
                        setApprovingInstance(inst);
                        setApprovalComment('同意，按规定流转办理');
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                    >
                      <Check className="h-3.5 w-3.5" />
                      审批处理
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 模块 3: 我发起的 (My Submissions) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'my' && (
        <div className="space-y-3">
          {myInstances.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
              <Send className="mx-auto h-10 w-10 text-zinc-400" />
              <h3 className="mt-2 text-sm font-semibold text-zinc-900">暂无由您发起的自定义流程</h3>
              <p className="mt-1 text-xs text-zinc-500">点击「流程发起大厅」选择所需模版即可发起申请。</p>
            </div>
          ) : (
            myInstances.map((inst) => {
              const currentStep = inst.steps[inst.currentStepIndex];
              return (
                <div
                  key={inst.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-blue-300"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-zinc-900">{inst.workflowName}</span>
                      <span className="font-mono text-xs text-zinc-400">{inst.id}</span>
                      {inst.status === 'approved' && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          已办结归档
                        </span>
                      )}
                      {inst.status === 'pending' && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          正在流转中 (步骤 {inst.currentStepIndex + 1}/{inst.steps.length})
                        </span>
                      )}
                      {inst.status === 'rejected' && (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 border border-red-200 flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          已驳回
                        </span>
                      )}
                      {inst.status === 'revoked' && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 border border-zinc-200">
                          已撤回
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-zinc-500">
                      发起时间：{inst.createdAt}
                      {inst.completedAt && ` · 办结时间：${inst.completedAt}`}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-xs text-zinc-600">
                      {inst.status === 'pending' ? (
                        <span>
                          当前处理人：
                          <strong className="text-zinc-900">{currentStep?.approverName}</strong>
                          （{currentStep?.name}）
                        </span>
                      ) : (
                        <span>流转记录数：{inst.history.length} 条</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    {inst.status === 'pending' && inst.currentStepIndex === 0 && (
                      <button
                        onClick={() => handleRevoke(inst)}
                        className="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50"
                      >
                        撤销申请
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedInstance(inst)}
                      className="rounded-xl bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 transition"
                    >
                      查看流转详情
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 模块 4: 流程设计与模版管理 (Definitions) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'definitions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">企业流程模版库与设计管理</h2>
              <p className="text-xs text-zinc-500">
                可自由设计表单字段、添加部门审批人/指定角色、配置金额与条件智能路由规则。
              </p>
            </div>
            <button
              onClick={handleOpenCreateDesigner}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              创建新流程模版
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200 font-semibold">
                <tr>
                  <th className="p-3.5">流程名称与编号</th>
                  <th className="p-3.5">所属类别</th>
                  <th className="p-3.5">表单字段数</th>
                  <th className="p-3.5">审批链路与规则</th>
                  <th className="p-3.5">更新时间</th>
                  <th className="p-3.5">状态</th>
                  <th className="p-3.5 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {definitions.map((def) => {
                  const meta = getCategoryMeta(def.category);
                  return (
                    <tr key={def.id} className="hover:bg-zinc-50/70 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            {renderIcon(def.icon, 'w-4 h-4')}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                              {def.name}
                              {def.isPreset && (
                                <span className="rounded bg-zinc-100 text-[10px] text-zinc-500 px-1 py-0.2">
                                  系统预置
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[10px] text-zinc-400">{def.code}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className={`rounded border px-2 py-0.5 text-[10px] font-medium ${meta.color}`}>
                          {meta.label}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-zinc-800">{def.fields.length}</span> 个控件
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1">
                          {def.steps.map((step, idx) => (
                            <React.Fragment key={step.id}>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                  step.condition
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-zinc-100 text-zinc-700'
                                }`}
                                title={step.condition ? `条件分支: 满足触发` : step.name}
                              >
                                {step.name.slice(0, 4)}
                              </span>
                              {idx < def.steps.length - 1 && (
                                <ChevronRight className="h-3 w-3 text-zinc-400" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </td>

                      <td className="p-3.5 text-zinc-400 font-mono text-[11px]">{def.updatedAt}</td>

                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          已启用
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenLaunch(def)}
                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
                            title="立即发起"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditDesigner(def)}
                            className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100"
                            title="可视化设计"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicateDefinition(def)}
                            className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100"
                            title="复制模版"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          {!def.isPreset && (
                            <button
                              onClick={() => handleDeleteDefinition(def.id, def.name)}
                              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                              title="删除流程"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 弹窗 A: 动态发起流程表单 (Workflow Launcher Modal) */}
      {/* ------------------------------------------------------------- */}
      {launchingDefinition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-zinc-200 my-8 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/80 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                  {renderIcon(launchingDefinition.icon, 'w-5 h-5')}
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">{launchingDefinition.name}</h3>
                  <p className="text-xs text-zinc-500">{launchingDefinition.description}</p>
                </div>
              </div>
              <button
                onClick={() => setLaunchingDefinition(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleLaunchSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* 发起人信息只读展示 */}
              <div className="rounded-xl bg-blue-50/60 p-3 border border-blue-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <div>
                    <span className="font-semibold text-zinc-900">{currentUser.name}</span>
                    <span className="text-zinc-500 ml-1.5">
                      ({currentUser.department} · {currentUser.title})
                    </span>
                  </div>
                </div>
                <span className="text-blue-600 font-medium">发起人</span>
              </div>

              {/* 动态渲染表单字段 */}
              <div className="space-y-4">
                {launchingDefinition.fields.map((field) => {
                  const errorMsg = formErrors[field.id];
                  return (
                    <div key={field.id} className="space-y-1">
                      <label className="block text-xs font-semibold text-zinc-800">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>

                      {/* 单行文本 */}
                      {field.type === 'text' && (
                        <input
                          type="text"
                          placeholder={field.placeholder || '请输入...'}
                          value={launchFormData[field.id] || ''}
                          onChange={(e) =>
                            setLaunchFormData({ ...launchFormData, [field.id]: e.target.value })
                          }
                          className={`w-full rounded-xl border px-3.5 py-2 text-xs focus:outline-none focus:ring-1 ${
                            errorMsg
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-zinc-200 focus:border-blue-500 focus:ring-blue-500'
                          }`}
                        />
                      )}

                      {/* 多行文本 */}
                      {field.type === 'textarea' && (
                        <textarea
                          rows={3}
                          placeholder={field.placeholder || '请输入详细说明...'}
                          value={launchFormData[field.id] || ''}
                          onChange={(e) =>
                            setLaunchFormData({ ...launchFormData, [field.id]: e.target.value })
                          }
                          className={`w-full rounded-xl border px-3.5 py-2 text-xs focus:outline-none focus:ring-1 ${
                            errorMsg
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-zinc-200 focus:border-blue-500 focus:ring-blue-500'
                          }`}
                        />
                      )}

                      {/* 数字与金额 */}
                      {field.type === 'number' && (
                        <div className="relative">
                          <input
                            type="number"
                            placeholder={field.placeholder || '请输入数值'}
                            value={launchFormData[field.id] !== undefined ? launchFormData[field.id] : ''}
                            onChange={(e) =>
                              setLaunchFormData({
                                ...launchFormData,
                                [field.id]: e.target.value === '' ? '' : Number(e.target.value),
                              })
                            }
                            className={`w-full rounded-xl border px-3.5 py-2 pr-12 text-xs focus:outline-none focus:ring-1 ${
                              errorMsg
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-zinc-200 focus:border-blue-500 focus:ring-blue-500'
                            }`}
                          />
                          {field.unit && (
                            <span className="absolute right-3 top-2 text-xs font-medium text-zinc-400">
                              {field.unit}
                            </span>
                          )}
                        </div>
                      )}

                      {/* 日期选择 */}
                      {field.type === 'date' && (
                        <input
                          type="date"
                          value={launchFormData[field.id] || ''}
                          onChange={(e) =>
                            setLaunchFormData({ ...launchFormData, [field.id]: e.target.value })
                          }
                          className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
                        />
                      )}

                      {/* 下拉单选 */}
                      {field.type === 'select' && (
                        <select
                          value={launchFormData[field.id] || ''}
                          onChange={(e) =>
                            setLaunchFormData({ ...launchFormData, [field.id]: e.target.value })
                          }
                          className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">-- 请选择 --</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* 单选 Radio */}
                      {field.type === 'radio' && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {field.options?.map((opt) => (
                            <label
                              key={opt}
                              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs cursor-pointer transition ${
                                launchFormData[field.id] === opt
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                  : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name={field.id}
                                value={opt}
                                checked={launchFormData[field.id] === opt}
                                onChange={() =>
                                  setLaunchFormData({ ...launchFormData, [field.id]: opt })
                                }
                                className="hidden"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {errorMsg && <p className="text-[11px] text-red-500">{errorMsg}</p>}
                    </div>
                  );
                })}
              </div>

              {/* 动态预测即将流转的审批节点 */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 mt-6">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-800 mb-2.5">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    预估流转链路（根据当前输入智能计算）
                  </span>
                  <span className="text-[11px] font-normal text-zinc-400">
                    支持按金额条件自动增减节点
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-600">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">
                      发
                    </span>
                    <span>{currentUser.name} 提报申请</span>
                  </div>

                  {launchingDefinition.steps.map((step, idx) => {
                    // 检查条件是否激活
                    let isSkipped = false;
                    let conditionTip = '';
                    if (step.condition) {
                      const val = Number(launchFormData[step.condition.fieldId]);
                      const threshold = Number(step.condition.value);
                      if (!isNaN(val) && !isNaN(threshold)) {
                        if (step.condition.operator === '>=' && val < threshold) {
                          isSkipped = true;
                          conditionTip = `(金额未达 ${threshold}元，不触发此节点)`;
                        } else if (step.condition.operator === '>' && val <= threshold) {
                          isSkipped = true;
                          conditionTip = `(金额未达 ${threshold}元，不触发此节点)`;
                        }
                      }
                    }

                    return (
                      <div
                        key={step.id}
                        className={`flex items-center gap-2 text-xs transition pl-1 border-l-2 ${
                          isSkipped
                            ? 'border-zinc-300 text-zinc-400 line-through'
                            : 'border-blue-500 text-zinc-800'
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                            isSkipped ? 'bg-zinc-200 text-zinc-500' : 'bg-blue-600 text-white'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold">{step.name}</span>
                          <span className="text-zinc-500 text-[11px]">
                            {step.approverType === 'dept_manager'
                              ? `[直属主管: ${currentUser.department}负责人]`
                              : step.approverName || '[指定角色审批]'}
                          </span>
                          {conditionTip && (
                            <span className="text-[10px] text-zinc-400 font-normal no-underline">
                              {conditionTip}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setLaunchingDefinition(null)}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {actionLoading ? '正在提交...' : '确认发起并进入流转'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 弹窗 B: 流程详情与流转全景抽屉 (Instance Detail Modal) */}
      {/* ------------------------------------------------------------- */}
      {selectedInstance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-zinc-200 my-6 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <GitFork className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-zinc-900 text-base">{selectedInstance.workflowName}</h3>
                    <span className="font-mono text-xs text-zinc-400">{selectedInstance.id}</span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    由 {selectedInstance.applicantName} ({selectedInstance.applicantDepartment}) 提交于{' '}
                    {selectedInstance.createdAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="rounded-lg border border-zinc-200 p-1.5 text-zinc-600 hover:bg-zinc-100"
                  title="打印单据"
                >
                  <Printer className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedInstance(null)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* 状态横幅 */}
              <div className="flex items-center justify-between rounded-xl bg-zinc-50 p-4 border border-zinc-200/80">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-white ${
                      selectedInstance.status === 'approved'
                        ? 'bg-emerald-600'
                        : selectedInstance.status === 'rejected'
                        ? 'bg-red-600'
                        : selectedInstance.status === 'revoked'
                        ? 'bg-zinc-500'
                        : 'bg-blue-600'
                    }`}
                  >
                    {selectedInstance.status === 'approved' && <Check className="h-5 w-5" />}
                    {selectedInstance.status === 'rejected' && <X className="h-5 w-5" />}
                    {selectedInstance.status === 'pending' && <Clock className="h-5 w-5" />}
                    {selectedInstance.status === 'revoked' && <RotateCcw className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">
                      {selectedInstance.status === 'approved' && '流程已全部办结通过'}
                      {selectedInstance.status === 'rejected' && '流程已被驳回'}
                      {selectedInstance.status === 'pending' &&
                        `流转中（等待 ${selectedInstance.steps[selectedInstance.currentStepIndex]?.approverName} 审批）`}
                      {selectedInstance.status === 'revoked' && '发起人已自行撤销'}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {selectedInstance.completedAt
                        ? `归档时间：${selectedInstance.completedAt}`
                        : `当前停留在第 ${selectedInstance.currentStepIndex + 1} 审批节点`}
                    </p>
                  </div>
                </div>

                {/* 快捷操作：若当前用户有待办权限 */}
                {selectedInstance.status === 'pending' && (
                  <button
                    onClick={() => {
                      setApprovingInstance(selectedInstance);
                      setApprovalComment('同意，按规定办理');
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm"
                  >
                    <Check className="h-3.5 w-3.5" />
                    立即办理该单据
                  </button>
                )}
              </div>

              {/* 表单数据详情卡片 */}
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-zinc-500" />
                  表单提交明细
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {Object.entries(selectedInstance.formData).map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-zinc-50 p-2.5 border border-zinc-100">
                      <span className="text-[11px] font-medium text-zinc-400 block mb-0.5">{k}</span>
                      <span className="font-semibold text-zinc-800 break-words">{String(v) || '-'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 可视化流转流链图 */}
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <GitFork className="h-4 w-4 text-zinc-500" />
                  审批节点流转链路
                </h4>

                <div className="space-y-4">
                  {selectedInstance.steps.map((step, idx) => {
                    const isCurrent =
                      selectedInstance.status === 'pending' && selectedInstance.currentStepIndex === idx;
                    const isPassed = step.status === 'approved';
                    const isRejected = step.status === 'rejected';

                    return (
                      <div key={step.id} className="relative flex items-start gap-4">
                        {/* 连接竖线 */}
                        {idx < selectedInstance.steps.length - 1 && (
                          <div
                            className={`absolute left-4 top-8 w-0.5 -bottom-4 ${
                              isPassed ? 'bg-emerald-400' : 'bg-zinc-200'
                            }`}
                          />
                        )}

                        <div
                          className={`z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ring-4 ring-white ${
                            isPassed
                              ? 'bg-emerald-600 text-white'
                              : isRejected
                              ? 'bg-red-600 text-white'
                              : isCurrent
                              ? 'bg-blue-600 text-white animate-pulse'
                              : 'bg-zinc-100 text-zinc-400'
                          }`}
                        >
                          {isPassed ? <Check className="h-4 w-4" /> : isRejected ? <X className="h-4 w-4" /> : idx + 1}
                        </div>

                        <div className="flex-1 rounded-xl bg-zinc-50 p-3 border border-zinc-100">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-zinc-900">{step.name}</span>
                            <span
                              className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${
                                isPassed
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : isRejected
                                  ? 'bg-red-100 text-red-700'
                                  : isCurrent
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-zinc-200 text-zinc-600'
                              }`}
                            >
                              {isPassed ? '已同意' : isRejected ? '已驳回' : isCurrent ? '审核中' : '等待流转'}
                            </span>
                          </div>

                          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                            <span>审批人：{step.approverName}</span>
                            {step.actionTime && <span>· {step.actionTime}</span>}
                          </div>

                          {step.comment && (
                            <div className="mt-2 rounded-lg bg-white p-2 text-xs text-zinc-700 border border-zinc-200/60 flex items-start gap-1.5">
                              <span className="text-zinc-400 font-medium">意见:</span>
                              <span>{step.comment}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 流转历史审计日志 */}
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-zinc-500" />
                  操作轨迹与审计时间线
                </h4>
                <div className="space-y-2">
                  {selectedInstance.history.map((h) => (
                    <div key={h.id} className="flex items-center justify-between text-xs py-1 border-b border-zinc-100 last:border-0">
                      <div>
                        <span className="font-semibold text-zinc-900">{h.operatorName}</span>
                        <span className="text-zinc-600 ml-1.5">{h.action}</span>
                        {h.comment && <span className="text-zinc-500 ml-1">「{h.comment}」</span>}
                      </div>
                      <span className="text-zinc-400 font-mono text-[11px]">{h.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-3 flex items-center justify-end">
              <button
                onClick={() => setSelectedInstance(null)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 弹窗 C: 快速审批/驳回确认框 (Approve/Reject Action Modal) */}
      {/* ------------------------------------------------------------- */}
      {approvingInstance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-zinc-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-blue-600" />
                流程审批办理
              </h3>
              <button
                onClick={() => setApprovingInstance(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-200/70 text-xs">
              <p className="font-semibold text-zinc-800">{approvingInstance.workflowName}</p>
              <p className="text-zinc-500 mt-0.5">
                申请人：{approvingInstance.applicantName} ({approvingInstance.applicantDepartment}) ·{' '}
                {approvingInstance.id}
              </p>
            </div>

            {/* 常用批语快捷选择 */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                审批意见与指导说明
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {['同意，按计划采购流转', '核对无误，予以准许', '预算符合规范，同意', '单据缺少凭据，请补充修正'].map(
                  (phrase) => (
                    <button
                      key={phrase}
                      type="button"
                      onClick={() => setApprovalComment(phrase)}
                      className="rounded-md bg-zinc-100 px-2 py-1 text-[11px] text-zinc-600 hover:bg-zinc-200"
                    >
                      {phrase}
                    </button>
                  )
                )}
              </div>
              <textarea
                rows={3}
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                placeholder="请输入您的审批意见..."
                className="w-full rounded-xl border border-zinc-200 p-3 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionLoading}
                className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
              >
                <X className="h-3.5 w-3.5" />
                驳回流程
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                disabled={actionLoading}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm"
              >
                <Check className="h-3.5 w-3.5" />
                同意通过
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 弹窗 D: 可视化自定义流程设计器 (Visual Workflow Designer) */}
      {/* ------------------------------------------------------------- */}
      {designerOpen && editingDefinition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-zinc-200 my-4 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Designer Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-900 text-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                  <Settings2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                    可视化自定义流程设计器
                    <span className="rounded bg-blue-500/30 text-blue-300 text-[10px] px-1.5 py-0.2">
                      工作流引擎
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    设计自定义业务表单、编排审批节点链、设置金额与条件智能分支
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDesignerOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Designer Nav Tabs */}
            <div className="flex items-center border-b border-zinc-200 bg-zinc-50 px-6 gap-2 pt-2">
              <button
                onClick={() => setDesignerTab('basic')}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                  designerTab === 'basic'
                    ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                    : 'border-transparent text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Tag className="h-3.5 w-3.5" />
                1. 基础信息配置
              </button>
              <button
                onClick={() => setDesignerTab('fields')}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                  designerTab === 'fields'
                    ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                    : 'border-transparent text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                2. 表单字段设计 ({editingDefinition.fields.length})
              </button>
              <button
                onClick={() => setDesignerTab('steps')}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                  designerTab === 'steps'
                    ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                    : 'border-transparent text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <GitFork className="h-3.5 w-3.5" />
                3. 审批节点与分支编排 ({editingDefinition.steps.length})
              </button>
            </div>

            {/* Designer Tab Contents */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Tab 1: Basic Info */}
              {designerTab === 'basic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-800">
                      流程名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingDefinition.name}
                      onChange={(e) =>
                        setEditingDefinition({ ...editingDefinition, name: e.target.value })
                      }
                      placeholder="如：营销宣传物料申请流"
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-800">
                      流程编码 (唯一标识) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingDefinition.code}
                      onChange={(e) =>
                        setEditingDefinition({ ...editingDefinition, code: e.target.value })
                      }
                      placeholder="如：WF-MARKETING"
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs font-mono uppercase focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-800">业务所属分类</label>
                    <select
                      value={editingDefinition.category}
                      onChange={(e) =>
                        setEditingDefinition({
                          ...editingDefinition,
                          category: e.target.value as WorkflowCategory,
                        })
                      }
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    >
                      <option value="admin">行政后勤</option>
                      <option value="business">商务法务</option>
                      <option value="finance">财务报账</option>
                      <option value="it">IT技术支持</option>
                      <option value="hr">人力资源</option>
                      <option value="general">通用业务</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-800">流程图标</label>
                    <select
                      value={editingDefinition.icon}
                      onChange={(e) =>
                        setEditingDefinition({ ...editingDefinition, icon: e.target.value })
                      }
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    >
                      <option value="ShoppingBag">采购购物袋 (ShoppingBag)</option>
                      <option value="FileCheck">合同公章 (FileCheck)</option>
                      <option value="Wallet">钱包借款 (Wallet)</option>
                      <option value="Shield">盾牌安全与IT (Shield)</option>
                      <option value="Users">组织人事 (Users)</option>
                      <option value="GitFork">通用工作流 (GitFork)</option>
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="font-semibold text-zinc-800">流程业务说明与指引</label>
                    <textarea
                      rows={3}
                      value={editingDefinition.description}
                      onChange={(e) =>
                        setEditingDefinition({ ...editingDefinition, description: e.target.value })
                      }
                      placeholder="请简要说明该流程适用场景、申请要求及流转规范..."
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Form Fields Designer */}
              {designerTab === 'fields' && (
                <div className="space-y-4">
                  {/* 控件添加快捷面板 */}
                  <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3">
                    <span className="text-xs font-bold text-blue-900 block mb-2">
                      + 点击快速添加表单控件到当前流程：
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => addFieldToDesigner('text')}
                        className="rounded-lg bg-white border border-blue-200 px-2.5 py-1 text-xs text-blue-800 font-medium hover:bg-blue-100 transition shadow-xs"
                      >
                        + 单行文本
                      </button>
                      <button
                        type="button"
                        onClick={() => addFieldToDesigner('textarea')}
                        className="rounded-lg bg-white border border-blue-200 px-2.5 py-1 text-xs text-blue-800 font-medium hover:bg-blue-100 transition shadow-xs"
                      >
                        + 多行文本
                      </button>
                      <button
                        type="button"
                        onClick={() => addFieldToDesigner('number')}
                        className="rounded-lg bg-white border border-blue-200 px-2.5 py-1 text-xs text-blue-800 font-medium hover:bg-blue-100 transition shadow-xs"
                      >
                        + 数字/金额 (可做条件分支)
                      </button>
                      <button
                        type="button"
                        onClick={() => addFieldToDesigner('date')}
                        className="rounded-lg bg-white border border-blue-200 px-2.5 py-1 text-xs text-blue-800 font-medium hover:bg-blue-100 transition shadow-xs"
                      >
                        + 日期选择
                      </button>
                      <button
                        type="button"
                        onClick={() => addFieldToDesigner('select')}
                        className="rounded-lg bg-white border border-blue-200 px-2.5 py-1 text-xs text-blue-800 font-medium hover:bg-blue-100 transition shadow-xs"
                      >
                        + 下拉单选
                      </button>
                      <button
                        type="button"
                        onClick={() => addFieldToDesigner('radio')}
                        className="rounded-lg bg-white border border-blue-200 px-2.5 py-1 text-xs text-blue-800 font-medium hover:bg-blue-100 transition shadow-xs"
                      >
                        + 单选按钮
                      </button>
                    </div>
                  </div>

                  {/* 字段列表管理 */}
                  <div className="space-y-3">
                    {editingDefinition.fields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs transition hover:border-zinc-300"
                      >
                        <div className="flex items-center justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-100 text-[11px] font-bold text-zinc-600">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-xs text-zinc-900">{field.label}</span>
                            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 font-mono">
                              {field.type}
                            </span>
                            {field.required && (
                              <span className="rounded bg-red-50 text-red-600 text-[10px] px-1 py-0.2">
                                必填
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveFieldOrder(idx, 'up')}
                              disabled={idx === 0}
                              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                              title="上移"
                            >
                              <MoveUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveFieldOrder(idx, 'down')}
                              disabled={idx === editingDefinition.fields.length - 1}
                              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                              title="下移"
                            >
                              <MoveDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFieldFromDesigner(field.id)}
                              className="rounded p-1 text-red-500 hover:bg-red-50"
                              title="删除字段"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* 字段内嵌配置属性 */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-2 border-t border-zinc-100">
                          <div>
                            <span className="text-[11px] text-zinc-500">字段标签名称</span>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => {
                                const fields = [...editingDefinition.fields];
                                fields[idx].label = e.target.value;
                                setEditingDefinition({ ...editingDefinition, fields });
                              }}
                              className="w-full rounded-lg border border-zinc-200 px-2.5 py-1 text-xs"
                            />
                          </div>

                          <div>
                            <span className="text-[11px] text-zinc-500">占位提示文案</span>
                            <input
                              type="text"
                              value={field.placeholder || ''}
                              onChange={(e) => {
                                const fields = [...editingDefinition.fields];
                                fields[idx].placeholder = e.target.value;
                                setEditingDefinition({ ...editingDefinition, fields });
                              }}
                              className="w-full rounded-lg border border-zinc-200 px-2.5 py-1 text-xs"
                            />
                          </div>

                          <div className="flex items-center justify-between pt-4">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => {
                                  const fields = [...editingDefinition.fields];
                                  fields[idx].required = e.target.checked;
                                  setEditingDefinition({ ...editingDefinition, fields });
                                }}
                                className="rounded text-blue-600"
                              />
                              <span className="text-xs text-zinc-700 font-medium">设为必填项</span>
                            </label>

                            {field.type === 'number' && (
                              <input
                                type="text"
                                placeholder="单位(如元)"
                                value={field.unit || ''}
                                onChange={(e) => {
                                  const fields = [...editingDefinition.fields];
                                  fields[idx].unit = e.target.value;
                                  setEditingDefinition({ ...editingDefinition, fields });
                                }}
                                className="w-20 rounded-lg border border-zinc-200 px-2 py-1 text-xs"
                              />
                            )}
                          </div>
                        </div>

                        {/* 选项管理（针对 select 与 radio） */}
                        {(field.type === 'select' || field.type === 'radio') && (
                          <div className="mt-2.5 pt-2 border-t border-zinc-100 text-xs">
                            <span className="text-[11px] text-zinc-500 block mb-1">
                              可选项列表（英文逗号或分号分隔）:
                            </span>
                            <input
                              type="text"
                              value={(field.options || []).join('; ')}
                              onChange={(e) => {
                                const raw = e.target.value;
                                const opts = raw.split(/[;,；，]/).map((s) => s.trim()).filter(Boolean);
                                const fields = [...editingDefinition.fields];
                                fields[idx].options = opts;
                                setEditingDefinition({ ...editingDefinition, fields });
                              }}
                              placeholder="如：选项A; 选项B; 选项C"
                              className="w-full rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-mono"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Workflow Steps & Conditional Branches */}
              {designerTab === 'steps' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900">审批链条多级编排</h4>
                      <p className="text-[11px] text-zinc-500">
                        支持主管动态解析、指定员工、角色兜底与条件分支（例如金额满 5000 触发总监审批）。
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addStepToDesigner}
                      className="flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      添加审批节点
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* 发起人起点 */}
                    <div className="flex items-center gap-3 rounded-xl bg-zinc-100 p-3 text-xs text-zinc-600 border border-zinc-200">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-white font-bold text-[10px]">
                        始
                      </div>
                      <div>
                        <span className="font-bold text-zinc-900">发起人提交</span>
                        <span className="text-zinc-500 ml-2">面向全体在职员工</span>
                      </div>
                    </div>

                    {/* 节点列表 */}
                    {editingDefinition.steps.map((step, idx) => (
                      <div
                        key={step.id}
                        className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-xs text-zinc-900">{step.name}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveStepOrder(idx, 'up')}
                              disabled={idx === 0}
                              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                              title="上移节点"
                            >
                              <MoveUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveStepOrder(idx, 'down')}
                              disabled={idx === editingDefinition.steps.length - 1}
                              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                              title="下移节点"
                            >
                              <MoveDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeStepFromDesigner(step.id)}
                              className="rounded p-1 text-red-500 hover:bg-red-50"
                              title="删除节点"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* 节点配置详情 */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1 border-t border-zinc-100">
                          <div>
                            <span className="text-[11px] text-zinc-500">环节名称</span>
                            <input
                              type="text"
                              value={step.name}
                              onChange={(e) => {
                                const steps = [...editingDefinition.steps];
                                steps[idx].name = e.target.value;
                                setEditingDefinition({ ...editingDefinition, steps });
                              }}
                              className="w-full rounded-lg border border-zinc-200 px-2.5 py-1 text-xs mt-0.5"
                            />
                          </div>

                          <div>
                            <span className="text-[11px] text-zinc-500">审批人类型</span>
                            <select
                              value={step.approverType}
                              onChange={(e) => {
                                const steps = [...editingDefinition.steps];
                                steps[idx].approverType = e.target.value as WorkflowApproverType;
                                setEditingDefinition({ ...editingDefinition, steps });
                              }}
                              className="w-full rounded-lg border border-zinc-200 px-2 py-1 text-xs mt-0.5"
                            >
                              <option value="dept_manager">申请人直属部门主管 (动态解析)</option>
                              <option value="specific_user">指定组织成员</option>
                              <option value="role">指定组织角色 (如管理员/主管)</option>
                              <option value="applicant_select">由申请人提报时自选</option>
                            </select>
                          </div>

                          {/* 指定具体人选择 */}
                          {step.approverType === 'specific_user' && (
                            <div>
                              <span className="text-[11px] text-zinc-500">选择指定员工</span>
                              <select
                                value={step.approverId || ''}
                                onChange={(e) => {
                                  const targetUser = allUsers.find((u) => u.id === e.target.value);
                                  const steps = [...editingDefinition.steps];
                                  steps[idx].approverId = e.target.value;
                                  steps[idx].approverName = targetUser
                                    ? `${targetUser.name} (${targetUser.title})`
                                    : '';
                                  setEditingDefinition({ ...editingDefinition, steps });
                                }}
                                className="w-full rounded-lg border border-zinc-200 px-2 py-1 text-xs mt-0.5"
                              >
                                <option value="">-- 选择员工 --</option>
                                {allUsers.map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.name} - {u.department} ({u.title})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* 指定角色 */}
                          {step.approverType === 'role' && (
                            <div>
                              <span className="text-[11px] text-zinc-500">选择审批角色</span>
                              <select
                                value={step.targetRole || 'admin'}
                                onChange={(e) => {
                                  const steps = [...editingDefinition.steps];
                                  steps[idx].targetRole = e.target.value as any;
                                  setEditingDefinition({ ...editingDefinition, steps });
                                }}
                                className="w-full rounded-lg border border-zinc-200 px-2 py-1 text-xs mt-0.5"
                              >
                                <option value="admin">系统管理员 (全权)</option>
                                <option value="manager">部门主管 (Manager)</option>
                              </select>
                            </div>
                          )}
                        </div>

                        {/* 条件分支配置 */}
                        <div className="rounded-lg bg-zinc-50 p-2.5 text-xs border border-zinc-200/60">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!step.condition}
                                onChange={(e) => {
                                  const steps = [...editingDefinition.steps];
                                  if (e.target.checked) {
                                    // 默认绑定第一个数字字段或第一个字段
                                    const numField = editingDefinition.fields.find(
                                      (f) => f.type === 'number'
                                    );
                                    steps[idx].condition = {
                                      fieldId: numField ? numField.id : editingDefinition.fields[0]?.id,
                                      operator: '>=',
                                      value: 5000,
                                    };
                                  } else {
                                    delete steps[idx].condition;
                                  }
                                  setEditingDefinition({ ...editingDefinition, steps });
                                }}
                                className="rounded text-blue-600"
                              />
                              <span className="font-semibold text-zinc-800">
                                开启条件分支 (不满足规则时自动跳过此环节)
                              </span>
                            </label>
                          </div>

                          {step.condition && (
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              <div>
                                <span className="text-[10px] text-zinc-400 block mb-0.5">关联表单字段</span>
                                <select
                                  value={step.condition.fieldId}
                                  onChange={(e) => {
                                    const steps = [...editingDefinition.steps];
                                    if (steps[idx].condition) {
                                      steps[idx].condition!.fieldId = e.target.value;
                                      setEditingDefinition({ ...editingDefinition, steps });
                                    }
                                  }}
                                  className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-xs"
                                >
                                  {editingDefinition.fields.map((f) => (
                                    <option key={f.id} value={f.id}>
                                      {f.label} ({f.type})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <span className="text-[10px] text-zinc-400 block mb-0.5">比较条件</span>
                                <select
                                  value={step.condition.operator}
                                  onChange={(e) => {
                                    const steps = [...editingDefinition.steps];
                                    if (steps[idx].condition) {
                                      steps[idx].condition!.operator = e.target.value as any;
                                      setEditingDefinition({ ...editingDefinition, steps });
                                    }
                                  }}
                                  className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-xs"
                                >
                                  <option value=">=">&gt;= (大于等于)</option>
                                  <option value=">">&gt; (大于)</option>
                                  <option value="<=">&lt;= (小于等于)</option>
                                  <option value="==">== (等于)</option>
                                </select>
                              </div>

                              <div>
                                <span className="text-[10px] text-zinc-400 block mb-0.5">触发阈值/标准值</span>
                                <input
                                  type="text"
                                  value={step.condition.value}
                                  onChange={(e) => {
                                    const steps = [...editingDefinition.steps];
                                    if (steps[idx].condition) {
                                      steps[idx].condition!.value = e.target.value;
                                      setEditingDefinition({ ...editingDefinition, steps });
                                    }
                                  }}
                                  className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-xs"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* 终点办结 */}
                    <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                        结
                      </div>
                      <div>
                        <span className="font-bold">通过审批并归档办结</span>
                        <span className="text-emerald-600 ml-2">自动向全员与申请人发送办结通知</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Designer Footer */}
            <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-3 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                当前定义: {editingDefinition.name} ({editingDefinition.fields.length} 个字段 ·{' '}
                {editingDefinition.steps.length} 级流转)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDesignerOpen(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                >
                  取消退出
                </button>
                <button
                  type="button"
                  onClick={handleSaveDesignerDefinition}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm"
                >
                  <Check className="h-3.5 w-3.5" />
                  保存并立即发布上线
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
