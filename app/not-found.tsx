"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FaHome, FaExclamationTriangle, FaTruck, FaHardHat, FaTools, FaDigitalTachograph } from 'react-icons/fa';
import { GiBulldozer } from 'react-icons/gi';
import { useEffect, useState } from 'react';

// Özel CSS için stil tanımları
const constructionTapeStyle = {
  background: 'repeating-linear-gradient(45deg, #f6dc35, #f6dc35 20px, #242424 20px, #242424 40px)',
  height: '30px',
  width: '100%',
  position: 'absolute' as 'absolute',
  boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
};

const dirtPileStyle = {
  position: 'absolute' as 'absolute',
  bottom: '-20px',
  right: '-30px',
  width: '150px',
  height: '80px',
  backgroundColor: '#8B4513',
  borderRadius: '50%',
  transform: 'rotate(-15deg)',
  boxShadow: 'inset 0 0 20px 5px rgba(0,0,0,0.3)',
  zIndex: '-1'
};

const sandPatternStyle = {
  position: 'absolute' as 'absolute',
  inset: '0',
  opacity: '0.1',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
  pointerEvents: 'none' as 'none',
  zIndex: '1'
};

// Bulldozer animasyonu
const BulldozerAnimation = () => {
  const [position, setPosition] = useState(-100);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setPosition(prev => {
        if (prev > window.innerWidth + 100) {
          return -100;
        }
        return prev + 5;
      });
    }, 50);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div style={{ 
      position: 'absolute', 
      bottom: '5px', 
      left: `${position}px`, 
      fontSize: '2.5rem',
      color: '#f59e0b',
      filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))',
      zIndex: 20,
      transition: 'left 0.05s linear'
    }}>
      <GiBulldozer />
    </div>
  );
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-orange-100 px-4 overflow-hidden">
      {/* İnşaat bantları */}
      <div style={constructionTapeStyle} className="top-12 -rotate-1"></div>
      <div style={constructionTapeStyle} className="bottom-12 rotate-1"></div>
      
      {/* Bulldozer animasyonu */}
      <BulldozerAnimation />
      
      <div className="max-w-3xl w-full p-8 bg-white rounded-lg shadow-xl border border-gray-200 relative z-10">
        {/* Kum/toprak dokusu */}
        <div style={sandPatternStyle}></div>
        
        {/* Toprak yığını */}
        <div style={dirtPileStyle}></div>
        <div style={{...dirtPileStyle, bottom: '-15px', right: '40px', width: '100px', height: '50px', transform: 'rotate(10deg)', backgroundColor: '#A0522D'}}></div>
        
        <div className="flex flex-col items-center text-center relative z-10">
          {/* İnşaat görseli/animasyonu */}
          <div className="mb-6 relative">
            <div className="text-yellow-500 text-8xl mb-4 animate-bounce">
              <FaExclamationTriangle />
            </div>
            <div className="absolute -bottom-2 -right-2 text-gray-600 text-4xl transform rotate-12 animate-pulse">
              <FaTruck />
            </div>
            <div className="absolute -top-4 -left-4 text-yellow-600 text-3xl animate-spin-slow">
              <FaTools />
            </div>
            <div className="absolute top-2 right-16 text-orange-500 text-2xl animate-bounce-slow">
              <FaHardHat />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-3">
            404
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
            İnşaat Alanı!
          </h2>
          
          <p className="text-gray-600 mb-8 max-w-md">
            Aradığınız sayfa bulunamadı. Bu alan şu anda inşaat halinde olabilir veya 
            adres değişmiş olabilir. Ana sayfaya dönerek devam edebilirsiniz.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4">
            <Button asChild variant="default" size="lg" className="gap-2 bg-yellow-600 hover:bg-yellow-700">
              <Link href="/">
                <FaHome className="mr-2" /> Ana Sayfaya Dön
              </Link>
            </Button>
          </div>
          
          <div className="mt-12 pt-6 border-t border-gray-200 w-full">
            <p className="text-gray-500 text-sm">
              Kent Konut - Kaliteli ve Güvenilir Konut Çözümleri
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 