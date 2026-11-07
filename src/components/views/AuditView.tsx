import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Shield, Lock, Clock, UserCheck } from 'lucide-react';
import { db } from '../../db/schema';
import { formatDateTimeFr } from '../../utils/formatters';

export const AuditView: React.FC = () => {
  const auditLogs = useLiveQuery(() => db.auditLogs.toArray(), []) || [];

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto custom-scroll bg-[var(--bg-app)]">
      <div>
        <h2 className="text-base font-black text-[var(--text-main)] flex items-center gap-2">
          <Shield className="w-5 h-5 text-teal-500" />
          <span>Piste d'Audit & Sécurité Système (Audit Trail Immuable)</span>
        </h2>
        <div className="text-xs text-[var(--text-muted)]">
          Traçabilité chronologique inaltérable des créations d'articles, décaissements, modifications et clôtures
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm text-[var(--text-main)]">Journal des Événements Système</h3>
          <span className="text-xs font-mono text-[var(--text-muted)]">{auditLogs.length} événements répertoriés</span>
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scroll">
          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)]">
              Aucun événement dans le journal d'audit.
            </div>
          ) : (
            auditLogs.slice().reverse().map(log => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[9px] bg-teal-500/15 text-teal-500 border border-teal-500/20">
                      {log.action}
                    </span>
                    <span className="font-bold text-[var(--text-main)]">Module : {log.module}</span>
                  </div>
                  <div className="text-[var(--text-muted)]">{log.details}</div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-[var(--text-main)]">{log.user}</div>
                  <div className="text-[10px] text-[var(--text-muted)] font-mono">{formatDateTimeFr(log.timestamp)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
