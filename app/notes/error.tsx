"use client";

export default function NotesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-cream font-sans text-ink">
      <main className="mx-auto w-full max-w-[720px] px-5 py-14 text-center sm:px-8">
        <h2 className="text-lg font-semibold">Couldn&apos;t load shared notes.</h2>
        <p className="mt-2 text-sm text-mist">
          {error.message || "Something went wrong. Please try again."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
        >
          Try again
        </button>
      </main>
    </div>
  );
}
