import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showBackButton = true }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="header">
      {showBackButton && (
        <div className="back-button" onClick={handleBack}>
          <ChevronLeft size={24} color="white" />
        </div>
      )}
      {title}
    </div>
  );
};

export default Header;