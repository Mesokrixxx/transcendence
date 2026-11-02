import './App.css';
import './services/i18n';
import AuthProvider from './context/AuthProvider';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

export default App;
