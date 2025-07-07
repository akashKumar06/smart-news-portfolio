function Header() {
  return (
    <div className="bg-blue-600 text-white p-6 rounded-t-lg shadow-md flex items-center justify-between">
      <h1 className="text-3xl font-bold">Smart News Portfolio</h1>
      <p className="text-sm opacity-90 hidden sm:block">
        Real-time market insights powered by AI
      </p>
    </div>
  );
}

export default Header;
