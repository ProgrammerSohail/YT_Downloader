import React from 'react';

const ThemeSwitcher = ({ theme, setTheme }) => {
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleTheme}
      className="button flex items-center hover:bg-gray-800 gap-2 px-4 py-2 rounded-full shadow-md transition bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      style={{ minWidth: 48 }}
    >
      {isDark ? (
        <i className="fas fa-sun text-yellow-400"></i>
      ) : (
        <i className="fas fa-moon text-gray-700"></i>
      )}
      <span className="font-semibold text-sm" style={{ color: isDark ? '#fff' : '#222' }}>
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  );
};

export default ThemeSwitcher; 