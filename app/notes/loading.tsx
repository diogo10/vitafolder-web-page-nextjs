export default function NotesLoading() {
  return (
    <div className="min-h-screen bg-cream font-sans text-ink">
      <main className="mx-auto w-full max-w-[720px] px-5 py-14 sm:px-8">
        <div
          aria-busy="true"
          aria-label="Loading shared notes"
          className="animate-pulse rounded-2xl border border-line bg-white p-6"
        >
          <div className="h-5 w-32 rounded bg-line" />
          <div className="mt-2 h-4 w-64 rounded bg-line" />
          <div className="mt-4 h-10 rounded-lg bg-line" />
          <div className="mt-3 h-20 rounded-lg bg-line" />
        </div>
      </main>
    </div>
  );
}
