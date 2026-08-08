// =========================================================
// Minimal toast pub/sub. Call toast('message') from anywhere;
// <Toaster/> (mounted in AppShell) renders the latest message.
// =========================================================
type Listener = (message: string) => void;

const listeners = new Set<Listener>();

export function toast(message: string): void {
  listeners.forEach((l) => l(message));
}

export function subscribeToast(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
