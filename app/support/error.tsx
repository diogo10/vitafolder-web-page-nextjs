"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-screen place-items-center p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-lg font-semibold">Could not load support articles</h2>
        <p className="text-sm opacity-70">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="rounded-full border px-5 py-2.5 text-sm font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
