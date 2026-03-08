import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 shadow-md">
      <div className="flex items-center gap-3">
        <img
          src="/logo.png"
          alt="Logo"
          className="h-8 w-8 rounded-full"
        />
      </div>

      <nav className="flex items-center gap-6">
        <Link to="/" className="text-gray-300 hover:text-white transition">
          Home
        </Link>
        <Link to="/analysis" className="text-gray-300 hover:text-white transition">
          Analysis
        </Link>
      </nav>
    </header>
  );
};

export default Header;