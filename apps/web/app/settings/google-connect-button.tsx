"use client";

export function GoogleConnectButton({ connected }: { connected: boolean }) {
  function handleConnect() {
    window.location.href = "/api/google/connect";
  }

  function handleDisconnect() {
    fetch("/api/google/connect", { method: "DELETE" }).then(() =>
      window.location.reload()
    );
  }

  if (connected) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-green-600 font-medium">Connected</span>
        <button
          onClick={handleDisconnect}
          className="rounded-md border px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
    >
      Connect Google Calendar
    </button>
  );
}
