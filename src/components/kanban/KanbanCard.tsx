import React from 'react';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Clock, Mail, User } from 'lucide-react';

import type { MailTask } from '@/sdk/types';

type KanbanCardProps = {
  task: MailTask;
  onViewOriginal: (task: MailTask) => void;
};

type KanbanCardPreviewProps = KanbanCardProps & {
  isDragging?: boolean;
  style?: React.CSSProperties;
  dragProps?: React.HTMLAttributes<HTMLElement>;
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const KanbanCardPreviewBase = React.forwardRef<HTMLElement, KanbanCardPreviewProps>(function KanbanCardPreviewBase(
  { task, onViewOriginal, isDragging = false, style, dragProps },
  ref,
) {
  return (
    <article
      ref={ref}
      style={style}
      className={[
        'group rounded-2xl border border-slate-700/80 bg-slate-900/80 p-4 shadow-[0_20px_50px_-30px_rgba(2,6,23,0.8)] backdrop-blur-sm',
        'transition-all duration-200 ease-out focus-within:border-amber-400/70 hover:border-amber-400/40',
        isDragging ? 'cursor-grabbing scale-[0.98] shadow-[0_24px_60px_-24px_rgba(251,191,36,0.25)]' : 'cursor-grab',
      ].join(' ')}
      {...dragProps}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="break-words text-sm font-semibold leading-6 text-slate-100">{task.subject}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-950/60 px-2.5 py-1 text-slate-200">
              <User className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
              <span className="max-w-[14rem] truncate">{task.sender}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-950/60 px-2.5 py-1 text-slate-300">
              <Clock className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
              <span>{dateFormatter.format(task.receivedDateTime)}</span>
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-2 text-amber-300">
          <Mail className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-400">
        {task.bodyPreview || 'No preview available for this message.'}
      </p>

      <button
        type="button"
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/70 px-4 text-sm font-medium text-slate-100 transition-colors duration-200 hover:border-amber-400/50 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
        onClick={(event) => {
          event.stopPropagation();
          onViewOriginal(task);
        }}
      >
        View Original Email
      </button>
    </article>
  );
});

KanbanCardPreviewBase.displayName = 'KanbanCardPreviewBase';

export const KanbanCardPreview = React.memo(KanbanCardPreviewBase);

export const KanbanCard = React.memo(function KanbanCard({ task, onViewOriginal }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: {
      taskId: task.id,
      status: task.status,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
  };

  return (
    <KanbanCardPreview
      ref={setNodeRef}
      task={task}
      onViewOriginal={onViewOriginal}
      isDragging={isDragging}
      style={style}
      dragProps={{ ...attributes, ...listeners }}
    />
  );
});

KanbanCard.displayName = 'KanbanCard';