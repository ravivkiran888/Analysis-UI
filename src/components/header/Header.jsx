const Header = () => {
  return (
    <header className="flex items-center justify-center gap-8 bg-slate-900 px-6 py-4">
      <a
        href="#buy"
        className="text-sm font-semibold text-green-400 hover:text-green-300 transition-colors"
      >
        BUY
      </a>

      <span className="h-4 w-px bg-slate-700" />

      <a
        href="#sell"
        className="text-sm font-semibold text-red-400 hover:text-red-300 transition-colors"
      >
        SELL
      </a>
    </header>
  );
};

export default Header;
