import React from 'react';

import { useDroppable } from '@dnd-kit/core';
import type { LucideIcon } from 'lucide-react';

import type { MailTask } from '@/sdk/types';

import { KanbanCard } from './KanbanCard';

type KanbanColumnProps = {
  id: MailTask['status'];
  title: string;
  description: string;
  icon: LucideIcon;
  tasks: MailTask[];
  accentClassName: string;
  onViewOriginal: (task: MailTask) => void;
};

export const KanbanColumn = React.memo(function KanbanColumn({
  id,
  title,
  description,
  icon: Icon,
  tasks,
  accentClassName,
  onViewOriginal,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${id}`,
    data: { status: id },
  });

  return (
    <section
      ref={setNodeRef}
      className={[
        'flex min-h-[28rem] min-w-0 flex-col rounded-3xl border bg-slate-950/70 p-4 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-sm transition-all duration-200',
        isOver ? 'border-amber-400/60 ring-1 ring-amber-400/20' : 'border-slate-800/80',
      ].join(' ')}
    >
      <header className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={['inline-flex h-9 w-9 items-center justify-center rounded-xl border', accentClassName].join(' ')}>
              <Icon className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <h2 className="text-base font-semibold tracking-wide text-slate-50">{title}</h2>
          </div>
          <p className="text-sm leading-6 text-slate-400">{description}</p>
        </div>

        <span className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-900 px-3 text-sm font-semibold text-slate-200">
          {tasks.length}
        </span>
      </header>

      <div className="mt-4 flex flex-1 flex-col gap-3">
        {tasks.length > 0 ? (
          tasks.map((task) => <KanbanCard key={task.id} task={task} onViewOriginal={onViewOriginal} />)
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 px-6 py-10 text-center">
            <div className="max-w-sm space-y-2">
              <p className="text-sm font-medium text-slate-200">No tasks in this lane</p>
              <p className="text-sm leading-6 text-slate-500">Drag an email here to change its workflow status.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

KanbanColumn.displayName = 'KanbanColumn';