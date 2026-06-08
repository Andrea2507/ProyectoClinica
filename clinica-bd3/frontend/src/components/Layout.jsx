import { API_BASE } from '../services/api.js';

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'pacientes', label: 'Pacientes' },
  { id: 'medicos', label: 'Medicos' },
  { id: 'citas', label: 'Citas' },
  { id: 'pagos', label: 'Pagos' },
  { id: 'historiales', label: 'Historiales' },
  { id: 'reportes-postgres', label: 'Reportes PostgreSQL' },
  { id: 'reportes-mongo', label: 'Reportes MongoDB' }
];

export default function Layout({ currentPage, onNavigate, children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">+</span>
          <div>
            <strong>Clinica BD3</strong>
            <small>PostgreSQL + MongoDB</small>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={currentPage === item.id ? 'active' : ''}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="api-pill">API: {API_BASE}</div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
