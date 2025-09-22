import React from 'react';

interface PageHeaderProps {
  title: string;
  backgroundImage?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, backgroundImage }) => {
  const headerStyle = {
    backgroundImage: `url(${backgroundImage || '/images/antet_kurumsal.jpg'})`,
  };

  return (
    <div className="relative h-48 bg-kentblue bg-cover bg-center" style={headerStyle}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative h-full flex items-center justify-center">
        <h1 className="text-4xl font-bold text-white text-shadow">{title}</h1>
      </div>
    </div>
  );
};

export default PageHeader;