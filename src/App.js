import "./App.css";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useLocation } from "react-router-dom";

function App() {
  const locatioin = useLocation();
  
  return (
    <div className="h-screen">
      {!locatioin.pathname.startsWith("/room") && <Navbar />}
      <main className="h-full">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
