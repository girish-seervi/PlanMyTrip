import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-elevated border transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
            n.type === 'success'
              ? 'bg-forest text-offwhite border-mint-dark'
              : n.type === 'error'
              ? 'bg-[#3b1212] text-white border-red-800'
              : 'bg-charcoal text-offwhite border-charcoal-light'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-mint" />}
            {n.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
            {n.type === 'info' && <Info className="w-5 h-5 text-warmorange" />}
          </div>
          <div className="flex-1 text-sm font-medium leading-relaxed">{n.message}</div>
          <button
            onClick={() => removeNotification(n.id)}
            className="shrink-0 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
