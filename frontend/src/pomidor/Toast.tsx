type ToastProps = {
  message: string;
};

export default function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <p
      role="status"
      className="fixed bottom-6 left-6 z-50 animate-[fadeIn_180ms_ease] rounded-[10px] bg-ink px-4 py-3 text-sm font-medium text-on-accent shadow-overlay"
    >
      {message}
    </p>
  );
}
