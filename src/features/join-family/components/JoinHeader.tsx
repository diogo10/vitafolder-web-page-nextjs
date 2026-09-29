import Link from "next/link";

export function JoinHeader() {
  return (
    <header className="border-b border-[#f0ebe3] bg-white">
      <div className="mx-auto flex h-[67px] w-full max-w-[1080px] items-center justify-between px-5 sm:px-14">
        <Link href="/" aria-label="HouseMira home" className="inline-flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-brand shadow-[0_6px_14px_rgba(139,115,85,0.35)]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1.5 1.8 6.7c-.3.25-.28.72.05.94.3.2.72.14.95-.12l.7-.6v5.33c0 .96.78 1.75 1.75 1.75h5.5c.97 0 1.75-.79 1.75-1.75V6.92l.7.6c.23.26.65.32.95.12.33-.22.35-.69.05-.94L8 1.5Z"
                fill="#fff"
              />
              <circle cx="8" cy="8.6" r="1.35" fill="#8b7355" />
              <path
                d="M6.55 11.4c.35-.85.85-1.3 1.45-1.3s1.1.45 1.45 1.3c.1.25-.08.53-.36.53H6.91c-.28 0-.46-.28-.36-.53Z"
                fill="#8b7355"
              />
            </svg>
          </span>
          <span className="text-[15px] font-extrabold tracking-[-0.01em] text-[#634f39]">
            HouseMira
          </span>
        </Link>
        <span className="text-[10.5px] tracking-[0.01em] text-[#b8a080]">Invitation System</span>
      </div>
    </header>
  );
}
