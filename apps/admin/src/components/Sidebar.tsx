import { Link, useLocation } from "react-router-dom";

export function Sidebar() {
  const location = useLocation();

  const getLinkClass = (path: string) => {
    const base =
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer select-none";
    if (location.pathname === path) {
      return `${base} bg-primary-container text-on-primary-container font-medium`;
    } else {
      return `${base} text-primary-fixed hover:bg-primary-container/50`;
    }
  };

  return (
    <aside className="w-64 bg-primary text-on-primary flex flex-col shrink-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-primary-container">
        <span className="material-symbols-outlined text-secondary-container mr-3">
          menu_book
        </span>
        <span className="font-title-md text-title-md font-bold tracking-tight">
          BibleQuest
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <Link to="/" className={getLinkClass("/")}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label-lg text-label-lg">Dashboard</span>
        </Link>
        <Link to="/perguntas" className={getLinkClass("/perguntas")}>
          <span className="material-symbols-outlined">quiz</span>
          <span className="font-label-lg text-label-lg">Perguntas</span>
        </Link>
        <Link to="/categorias" className={getLinkClass("/categorias")}>
          <span className="material-symbols-outlined">category</span>
          <span className="font-label-lg text-label-lg">Categorias</span>
        </Link>
        <Link to="/usuarios" className={getLinkClass("/usuarios")}>
          <span className="material-symbols-outlined">group</span>
          <span className="font-label-lg text-label-lg">Usuários</span>
        </Link>
        <Link to="/ranking" className={getLinkClass("/ranking")}>
          <span className="material-symbols-outlined">leaderboard</span>
          <span className="font-label-lg text-label-lg">Rankings</span>
        </Link>
        <Link to="/relatorios" className={getLinkClass("/relatorios")}>
          <span className="material-symbols-outlined">bar_chart</span>
          <span className="font-label-lg text-label-lg">Relatórios</span>
        </Link>
      </nav>
    </aside>
  );
}
