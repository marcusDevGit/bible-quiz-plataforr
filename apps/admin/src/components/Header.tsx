import { useState } from "react";

interface HeaderProps {
  onSettingsClick: () => void;
  onLogoutClick: () => void;
}
export function Header({ onSettingsClick, onLogoutClick }: HeaderProps) {
  const userJson = localStorage.getItem("admin_user");
  const user = userJson ? JSON.parse(userJson) : { name: "Administrador" };
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  return (
    <header className="h-16 bg-surface border-b border-outline-variant flex items-center justify-between px-8 shrink-0 relative">
      {/* Search */}
      <div className="relative w-96">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
          search
        </span>
        <input
          className="w-full h-10 pl-10 pr-4 rounded-full bg-surface-container-low border-none text-body-md focus:ring-2 focus:ring-primary focus:bg-surface transition-all"
          placeholder="Buscar perguntas, usuários..."
          type="text"
        />
      </div>
      {/* Profile & Actions */}
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        {/* Profile Container */}
        <div className="relative">
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 border-l border-outline-variant pl-4 cursor-pointer select-none"
          >
            <div className="text-right hidden md:block">
              <div className="font-label-lg text-label-lg text-on-surface font-semibold">
                {user.name}
              </div>
              <div className="font-label-sm text-label-sm text-on-surface-variant">
                {user.role}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-title-md font-bold border border-outline-variant">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-outline-variant rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <button
                onClick={() => {
                  onSettingsClick();
                  setIsDropdownOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-2 w-full text-left font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  settings
                </span>
                Configurações
              </button>
              <div className="border-t border-outline-variant my-1"></div>
              <button
                onClick={onLogoutClick}
                className="flex items-center gap-3 px-4 py-2 w-full text-left font-label-md text-label-md text-error hover:bg-error-container/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  logout
                </span>
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
