import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl border border-gray-200 p-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 bg-red-100 p-2 rounded-lg">
            <AlertTriangle className="text-danger" size={22} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-dark">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{message}</p>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-dark py-2.5 rounded-lg hover:bg-gray-300 font-semibold transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-danger text-white py-2.5 rounded-lg hover:opacity-90 font-semibold transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
