function Header({ isAuthenticated, currentUser, onLoginClick, onLogout }) {
  return (
    <header className="mb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-5xl sm:text-6xl font-semibold text-[#dc2626] mb-2 tracking-tight">
            FitVerse
          </h1>
          <p className="text-[#6b7280] text-lg font-normal">Avatar Customizer</p>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:block text-sm text-[#1a1a1a] bg-[#f9fafb] px-4 py-2 rounded-full border border-[#e5e7eb] shadow-sm">
                <p className="font-medium">{currentUser?.email || 'User'}</p>
              </div>
              <button
                onClick={onLogout}
                className="px-6 py-2.5 bg-[#dc2626] text-white rounded-full hover:bg-[#b91c1c] transition-all duration-200 font-medium text-sm shadow-sm apple-button"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={onLoginClick}
              className="px-6 py-2.5 bg-[#dc2626] text-white rounded-full hover:bg-[#b91c1c] transition-all duration-200 font-medium text-sm shadow-sm apple-button"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
