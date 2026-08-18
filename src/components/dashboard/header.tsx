import { UserMenu } from "@/components/dashboard/user-menu";

type HeaderProps = {
  name: string;
  email: string;
  onMenuClick: () => void;
};

export function Header({
  name,
  email,
  onMenuClick,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Open sidebar"
        >
          ☰
        </button>

        {/* Desktop title */}
        <div>
          <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
            Dashboard
          </h2>

          <p className="hidden text-xs text-slate-500 sm:block">
            Overview
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification */}
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Notifications"
        >
          <span className="text-lg">○</span>

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        <UserMenu
          name={name}
          email={email}
        />
      </div>
    </header>
  );
}