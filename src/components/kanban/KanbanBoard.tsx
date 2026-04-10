import React from 'react';

import { closestCenter, DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { Clock, Mail, RefreshCw, User } from 'lucide-react';

import type { MailTask } from '@/sdk/types';

import { KanbanCardPreview } from './KanbanCard';
import { KanbanColumn } from './KanbanColumn';

type MailTaskStatus = MailTask['status'];

type KanbanBoardProps = {
  tasks: MailTask[];
  onMoveTask: (taskId: string, newStatus: MailTaskStatus) => void;
  onSyncWithOutlook: () => Promise<unknown>;
  isSyncing: boolean;
};

const statusOrder: MailTaskStatus[] = ['todo', 'in-progress', 'done'];

const columnMeta: Record<
  MailTaskStatus,
  {
    title: string;
    description: string;
    icon: typeof Mail;
    accentClassName: string;
  }
> = {
  todo: {
    title: 'To Do',
    description: 'Incoming mail waiting for triage and routing.',
    icon: Mail,
    accentClassName: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  },
  'in-progress': {
    title: 'In Progress',
    description: 'Active responses and follow-up work in flight.',
    icon: Clock,
    accentClassName: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300',
  },
  done: {
    title: 'Done',
    description: 'Resolved tasks cleared from the operational queue.',
    icon: User,
    accentClassName: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  },
};

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

function parseStatusFromDroppableId(id: string): MailTaskStatus | null {
  if (!id.startsWith('column-')) {
    return null;
  }

  const status = id.slice('column-'.length) as MailTaskStatus;
  return statusOrder.includes(status) ? status : null;
}

export const KanbanBoard = React.memo(function KanbanBoard({
  tasks,
  onMoveTask,
  onSyncWithOutlook,
  isSyncing,
}: KanbanBoardProps) {
  const [activeTaskId, setActiveTaskId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const groupedTasks = React.useMemo(() => {
    const groups: Record<MailTaskStatus, MailTask[]> = {
      todo: [],
      'in-progress': [],
      done: [],
    };

    for (const task of tasks) {
      groups[task.status].push(task);
    }

    for (const status of statusOrder) {
      groups[status].sort((left, right) => right.receivedDateTime.getTime() - left.receivedDateTime.getTime());
    }

    return groups;
  }, [tasks]);

  const activeTask = React.useMemo(
    () => tasks.find((task) => task.id === activeTaskId) ?? null,
    [activeTaskId, tasks],
  );

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    const taskId = String(event.active.data.current?.taskId ?? '').trim();
    setActiveTaskId(taskId || null);
  }, []);

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTaskId(null);

      if (!over) {
        return;
      }

      const taskId = String(active.data.current?.taskId ?? '').trim();
      const currentStatus = active.data.current?.status as MailTaskStatus | undefined;
      const targetStatus = parseStatusFromDroppableId(String(over.id));

      if (!taskId || !currentStatus || !targetStatus || currentStatus === targetStatus) {
        return;
      }

      onMoveTask(taskId, targetStatus);
    },
    [onMoveTask],
  );

  const handleDragCancel = React.useCallback(() => {
    setActiveTaskId(null);
  }, []);

  const handleViewOriginal = React.useCallback((task: MailTask) => {
    console.info(`[Kanban] View original email requested for ${task.id}`);
  }, []);

  const totalTasks = tasks.length;
  const lastUpdatedLabel = totalTasks > 0 ? formatTime(tasks[0].receivedDateTime) : 'Waiting for Outlook sync';

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-5 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.7)] backdrop-blur-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              Logistics Mail Desk
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
              High-performance inbox operations board
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
              Route messages through a clean three-lane workflow, keep the inbox synchronized with Outlook, and move work without losing context.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Last update</div>
              <div className="mt-1 font-medium text-slate-100">{lastUpdatedLabel}</div>
            </div>

            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 text-sm font-semibold text-amber-200 transition-colors duration-200 hover:border-amber-300/60 hover:bg-amber-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => {
                void onSyncWithOutlook();
              }}
              disabled={isSyncing}
            >
              <RefreshCw className={['h-4 w-4', isSyncing ? 'animate-spin' : ''].join(' ')} aria-hidden="true" />
              {isSyncing ? 'Syncing Outlook' : 'Sync Outlook'}
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {statusOrder.map((status) => {
            const meta = columnMeta[status];
            const Icon = meta.icon;

            return (
              <div
                key={status}
                className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className={['inline-flex h-9 w-9 items-center justify-center rounded-xl border', meta.accentClassName].join(' ')}>
                    <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-slate-100">{meta.title}</div>
                    <div className="text-xs text-slate-500">{groupedTasks[status].length} items</div>
                  </div>
                </div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{status.replace('-', ' ')}</div>
              </div>
            );
          })}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {statusOrder.map((status) => {
            const meta = columnMeta[status];

            return (
              <KanbanColumn
                key={status}
                id={status}
                title={meta.title}
                description={meta.description}
                icon={meta.icon}
                tasks={groupedTasks[status]}
                accentClassName={meta.accentClassName}
                onViewOriginal={handleViewOriginal}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? <KanbanCardPreview task={activeTask} onViewOriginal={handleViewOriginal} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
});

KanbanBoard.displayName = 'KanbanBoard';