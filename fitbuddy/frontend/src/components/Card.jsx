/**
 * Card.jsx
 * Reusable card component for displaying content with consistent styling
 */

const Card = ({ title, value, subtitle, icon, children, className = '', onClick }) => {
  const baseClasses = "bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-gray-200";
  
  return (
    <div 
      className={`${baseClasses} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="p-6">
        {/* Header with icon */}
        {(title || icon) && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              {title}
            </h3>
            {icon && (
              <div className="text-2xl">
                {icon}
              </div>
            )}
          </div>
        )}
        
        {/* Main value */}
        {value && (
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {value}
          </div>
        )}
        
        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-gray-500">
            {subtitle}
          </p>
        )}
        
        {/* Custom content */}
        {children}
      </div>
    </div>
  );
};

export default Card;
