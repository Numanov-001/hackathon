type ToastProps = {
  message: string;
};

export default function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <p
      role="status"
      className="fixed bottom-24 left-3 right-3 z-50 animate-[fadeIn_180ms_ease] rounded-[10px] bg-ink px-4 py-3 text-sm font-medium text-on-accent shadow-overlay sm:left-6 sm:right-auto lg:bottom-6"
    >
      {message}
    </p>
  );
}
