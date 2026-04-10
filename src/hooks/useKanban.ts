import { useCallback, useMemo, useState } from 'react';

import { MailService } from '@/sdk/MailService';
import type { MailTask } from '@/sdk/types';

type MailTaskStatus = MailTask['status'];

const mailService = MailService.getInstance();

export function useKanban() {
  const [tasks, setTasks] = useState<MailTask[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const moveTask = useCallback((taskId: string, newStatus: MailTaskStatus) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task,
      ),
    );
  }, []);

  const syncWithOutlook = useCallback(async () => {
    setIsSyncing(true);

    try {
      const inboxTasks = await mailService.fetchInbox(50);

      setTasks((currentTasks) => {
        const existingIds = new Set(currentTasks.map((task) => task.id));
        const newTasks = inboxTasks.filter((task) => !existingIds.has(task.id));

        if (newTasks.length === 0) {
          return currentTasks;
        }

        return [...newTasks, ...currentTasks];
      });

      return inboxTasks.length;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return useMemo(
    () => ({
      tasks,
      moveTask,
      syncWithOutlook,
      isSyncing,
    }),
    [isSyncing, moveTask, syncWithOutlook, tasks],
  );
}