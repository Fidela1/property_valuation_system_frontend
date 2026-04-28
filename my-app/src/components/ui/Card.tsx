interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, icon }) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${className}`}>
      {(title || icon) && (
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {icon && <div className="text-2xl">{icon}</div>}
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;