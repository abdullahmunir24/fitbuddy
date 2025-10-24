/**
 * Reusable Button component with variants and loading states
 * Variants: primary (default), secondary, outline
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  className = '',
  type = 'button',
  ...props 
}) => {
  // Define variant styles
  const variants = {
    primary: `
      bg-gradient-primary text-white 
      hover:shadow-lg hover:shadow-primary-500/30
      active:scale-95
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
    `,
    secondary: `
      bg-dark-800 text-white 
      hover:bg-dark-700 hover:shadow-lg
      active:scale-95
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    outline: `
      bg-transparent border-2 border-primary-500 text-primary-600
      hover:bg-primary-50 hover:shadow-md
      active:scale-95
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        w-full px-6 py-3 rounded-lg font-semibold
        transition-all duration-200
        flex items-center justify-center gap-2
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin h-5 w-5" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
