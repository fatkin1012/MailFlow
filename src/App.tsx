import React from 'react';

import { authService } from '@/sdk/AuthService';

import { KanbanBoard } from './components/kanban/KanbanBoard';
import { useKanban } from './hooks/useKanban';

export default function App() {
  const { tasks, moveTask, syncWithOutlook, isSyncing } = useKanban();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isCheckingAccount, setIsCheckingAccount] = React.useState(true);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const validateAccount = async () => {
      try {
        const isConnected = await authService.checkAccount();

        if (isMounted) {
          setIsAuthenticated(Boolean(isConnected));
          setAuthError(null);
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsCheckingAccount(false);
        }
      }
    };

    void validateAccount();

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void syncWithOutlook();
  }, [isAuthenticated, syncWithOutlook]);

  const handleConnectOutlook = React.useCallback(async () => {
    setIsConnecting(true);
    setAuthError(null);

    try {
      const loginResult = await authService.login();
      const isConnected = Boolean(loginResult) || (await authService.checkAccount());
      setIsAuthenticated(Boolean(isConnected));

      if (isConnected) {
        await syncWithOutlook();
      } else {
        setAuthError('Outlook login did not complete. Try connecting again.');
      }
    } catch (error) {
      setIsAuthenticated(false);
      setAuthError(error instanceof Error ? error.message : 'Unable to connect to Outlook.');
    } finally {
      setIsConnecting(false);
    }
  }, [syncWithOutlook]);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,1))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20 [mask-image:linear-gradient(180deg,black,transparent)]" />

      <div className="relative mx-auto flex min-h-dvh max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-3 border-b border-slate-800/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">MailFlow</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">Logistics Kanban Host</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
              A streamlined operations shell for routing, tracking, and clearing Outlook-driven work.
            </p>
          </div>

          {!isCheckingAccount && !isAuthenticated ? (
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400 px-5 text-sm font-semibold text-slate-950 transition-colors duration-200 hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => {
                void handleConnectOutlook();
              }}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting Outlook' : 'Connect Outlook'}
            </button>
          ) : null}
        </header>

        <section className="flex flex-1 items-center justify-center py-12">
          <div className="w-full">
            {isCheckingAccount ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 px-6 py-10 text-center shadow-[0_28px_80px_-40px_rgba(15,23,42,0.8)]">
                <p className="text-sm font-medium text-slate-200">Checking Outlook connection</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Verifying account state before loading the board.</p>
              </div>
            ) : isAuthenticated ? (
              <KanbanBoard
                tasks={tasks}
                onMoveTask={moveTask}
                onSyncWithOutlook={syncWithOutlook}
                isSyncing={isSyncing}
              />
            ) : (
              <div className="mx-auto w-full max-w-2xl rounded-[2rem] border border-slate-800 bg-slate-950/70 p-8 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.9)] backdrop-blur-sm sm:p-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                    Outlook required
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
                    Connect to start routing mail tasks
                  </h2>
                  <p className="max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                    This shell keeps the workflow lean: authenticate once, sync inbox mail into the To Do lane, then drag items across the board as the work moves.
                  </p>
                </div>

                <div className="mt-6 min-h-6 text-sm text-rose-300">
                  {authError ? authError : null}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400 px-5 text-sm font-semibold text-slate-950 transition-colors duration-200 hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => {
                      void handleConnectOutlook();
                    }}
                    disabled={isConnecting}
                  >
                    {isConnecting ? 'Connecting Outlook' : 'Connect Outlook'}
                  </button>

                  <div className="inline-flex min-h-11 items-center rounded-2xl border border-slate-800 bg-slate-900/80 px-4 text-sm text-slate-400">
                    Inbox sync remains local until Outlook is authorized.
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}