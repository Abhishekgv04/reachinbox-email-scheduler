import {
  Search,
  Bell,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userName =
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const userEmail =
    user?.email || "";

  const initial =
    userName
      .charAt(0)
      .toUpperCase();

  function handleLogout() {
    logout();

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-5 sm:px-8">

      {/* Search */}

      <div className="flex w-full max-w-sm items-center gap-2 text-zinc-400">

        <Search size={17} />

        <input
          type="text"
          placeholder="Search..."
          className="w-full border-none bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
        />

      </div>

      {/* Right */}

      <div className="ml-4 flex items-center gap-3">

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
        >
          <Bell size={17} />
        </button>

        {/* User */}

        <div className="hidden items-center gap-2 sm:flex">

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-700">
            {initial}
          </div>

          <div className="max-w-[160px]">

            <p className="truncate text-xs font-semibold text-zinc-900">
              {userName}
            </p>

            <p className="truncate text-[10px] text-zinc-500">
              {userEmail}
            </p>

          </div>

        </div>

        {/* Logout */}

        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={17} />
        </button>

      </div>

    </header>
  );
}

export default Topbar;