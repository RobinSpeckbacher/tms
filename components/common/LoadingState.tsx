interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Wird geladen…" }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-blue-600 mb-4" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
