import { useState } from "react";
import "./Navbar.css";

/**
 * Mobile-first app shell navigation bar.
 *
 * Renders the app title and a hamburger menu toggle that reveals a nav
 * panel containing a "Log in" affordance. The login item is purely a
 * navigation/UI placeholder for now — it has no Supabase Auth wiring.
 *
 * TODO(1.3): wire the login item to the real Supabase Auth client and
 * session context once `src/features/auth/*` exists (see task 1.3 in
 * openspec/changes/urban-explorer-mvp/tasks.md).
 */
export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  return (
    <header className="navbar">
      <div className="navbar__bar">
        <span className="navbar__title">Explorador Urbano</span>

        <button
          type="button"
          className="navbar__toggle"
          aria-expanded={isMenuOpen}
          aria-controls="navbar-menu"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={toggleMenu}
        >
          <span className="navbar__toggle-icon" aria-hidden="true" />
        </button>
      </div>

      <nav
        id="navbar-menu"
        className="navbar__menu"
        aria-label="Navegación principal"
        hidden={!isMenuOpen}
      >
        <ul className="navbar__menu-list">
          <li>
            {/* Placeholder de navegación: sin lógica de Supabase todavía.
                La conexión real de auth se implementa en la tarea 1.3. */}
            <button type="button" className="navbar__login-item">
              Iniciar sesión
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
