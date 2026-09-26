type ToastProps = {
  message: string;
};

export default function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <p
      role="status"
      className="fixed bottom-6 left-6 z-50 animate-[fadeIn_180ms_ease] rounded-xl bg-[#14213D] px-4 py-3 text-sm font-medium text-white shadow-[0_8px_24px_rgba(16,24,40,0.18)]"
    >
      {message}
    </p>
  );
}
