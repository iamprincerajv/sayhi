import './App.css';
import { Outlet } from "react-router-dom";
import Navbar from './components/Navbar';

function App() {
  return (
    <div className='h-screen'>
    <Navbar />
    <main className='h-full'>
      <Outlet />
    </main>
    </div>
  );
}

export default App;
