import {
  LayoutDashboard,
  Send,
  Users,
  Plus,
  Settings,
  LogOut,
} from "lucide-react";

import {
  NavLink,
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navClass = ({ isActive }) =>
    `flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
      isActive
        ? "bg-zinc-900 text-white"
        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
    }`;

  function handleLogout() {
    logout();
    navigate("/login", {
      replace: true,
    });
  }

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

  return (
    <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white lg:flex lg:min-h-screen lg:flex-col">

      {/* Logo */}

      <div className="flex items-center gap-3 px-5 py-6">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-lg font-bold text-white">
          R
        </div>

        <div>
          <h1 className="text-base font-bold text-zinc-900">
            ReachInbox
          </h1>

          <p className="text-[11px] text-zinc-500">
            Email Scheduler
          </p>
        </div>

      </div>

      {/* Navigation */}

      <nav className="flex flex-1 flex-col px-4">

        <p className="mb-2 px-3 text-[10px] font-bold tracking-widest text-zinc-400">
          WORKSPACE
        </p>

        <NavLink
          to="/"
          end
          className={navClass}
        >
          <LayoutDashboard size={17} />
          Dashboard
        </NavLink>

        <NavLink
          to="/campaigns"
          className={navClass}
        >
          <Send size={17} />
          Campaigns
        </NavLink>

        <NavLink
          to="/senders"
          className={navClass}
        >
          <Users size={17} />
          Senders
        </NavLink>

        <Link
          to="/campaigns/create"
          className="mt-4 flex h-10 items-center justify-center gap-2 rounded-lg bg-zinc-900 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          <Plus size={17} />
          New Campaign
        </Link>

        <p className="mb-2 mt-8 px-3 text-[10px] font-bold tracking-widest text-zinc-400">
          SYSTEM
        </p>

        <button
          type="button"
          className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
        >
          <Settings size={17} />
          Settings
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-red-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={17} />
          Logout
        </button>

      </nav>

      {/* Authenticated User */}

      <div className="border-t border-zinc-200 p-4">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-bold text-zinc-700">
            {initial}
          </div>

          <div className="min-w-0">

            <p className="truncate text-sm font-semibold text-zinc-900">
              {userName}
            </p>

            <p className="truncate text-[11px] text-zinc-500">
              {userEmail}
            </p>

          </div>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;