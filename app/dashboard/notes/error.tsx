"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[960px]">
      <div className="flex flex-col items-start gap-4 rounded-[24px] border border-line bg-white p-6 text-left shadow-[0_20px_45px_rgba(26,26,26,0.06)] sm:p-8">
        <h2 className="text-lg font-semibold text-ink">Couldn&rsquo;t load your notes</h2>
        <p className="text-sm text-mist">Something went wrong. Please try again.</p>
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
