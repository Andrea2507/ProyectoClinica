import { useState } from 'react';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Pacientes from './pages/Pacientes.jsx';
import Medicos from './pages/Medicos.jsx';
import Citas from './pages/Citas.jsx';
import Pagos from './pages/Pagos.jsx';
import Historiales from './pages/Historiales.jsx';
import ReportesPostgres from './pages/ReportesPostgres.jsx';
import ReportesMongo from './pages/ReportesMongo.jsx';

const pages = {
  dashboard: <Dashboard />,
  pacientes: <Pacientes />,
  medicos: <Medicos />,
  citas: <Citas />,
  pagos: <Pagos />,
  historiales: <Historiales />,
  'reportes-postgres': <ReportesPostgres />,
  'reportes-mongo': <ReportesMongo />
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {pages[currentPage]}
    </Layout>
  );
}
