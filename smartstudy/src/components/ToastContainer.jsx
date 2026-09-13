import { CheckCircle, Info, AlertCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ICONS = {
  success: <CheckCircle size={16} className="text-green-500 flex-shrink-0" />,
  info:    <Info size={16} className="text-blue-500 flex-shrink-0" />,
  error:   <AlertCircle size={16} className="text-red-500 flex-shrink-0" />,
};

const BORDER = {
  success: 'border-green-200',
  info:    'border-blue-200',
  error:   'border-red-200',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-xs w-full">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            toast-enter pointer-events-auto
            flex items-center gap-3 bg-white border rounded-lg shadow-lg px-4 py-3
            ${BORDER[toast.type] || BORDER.success}
          `}
        >
          {ICONS[toast.type] || ICONS.success}
          <span className="text-sm text-slate-700 flex-1 min-w-0">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-300 hover:text-slate-500 transition-colors ml-1"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
