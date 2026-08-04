import { useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

// ── Singleton container rendered once at app root ──────────────────────────
let globalAddToast = null;

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const remove = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const add = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...toast, id }]);
    timers.current[id] = setTimeout(() => remove(id), toast.duration ?? 4000);
    return id;
  }, [remove]);

  // Expose globally
  globalAddToast = add;

  const icons = {
    success: <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />,
    error:   <XCircle    className="h-4 w-4 text-red-500     flex-shrink-0" />,
    info:    <Info       className="h-4 w-4 text-primary-500  flex-shrink-0" />,
    warn:    <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />,
  };

  const cls = {
    success: 'toast-success',
    error:   'toast-error',
    info:    'toast-info',
    warn:    'toast-warn',
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast">
      {toasts.map(t => (
        <div key={t.id} className={cls[t.type] ?? 'toast-info'}>
          {icons[t.type]}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)} className="ml-1 text-slate-400 hover:text-slate-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useToast() {
  const toast = useCallback((message, type = 'info', duration = 4000) => {
    globalAddToast?.({ message, type, duration });
  }, []);

  return {
    toast,
    success: (msg, d) => toast(msg, 'success', d),
    error:   (msg, d) => toast(msg, 'error',   d),
    info:    (msg, d) => toast(msg, 'info',     d),
    warn:    (msg, d) => toast(msg, 'warn',     d),
  };
}
