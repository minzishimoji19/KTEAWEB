
interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false,
    isLoading = false
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <h3 className={`text-lg font-bold mb-2 ${isDestructive ? 'text-red-600' : 'text-slate-800'}`}>
                    {title}
                </h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2 ${isDestructive
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-violet-600 hover:bg-violet-700'
                            }`}
                    >
                        {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
