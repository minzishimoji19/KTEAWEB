
interface EmptyStateProps {
    title: string;
    description?: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm">
                {description || "Sprint 1 will implement this module."}
            </p>
        </div>
    );
}
