import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Personelimiz | Kent Konut',
  description: 'Kent Konut personeli hakkında bilgiler',
};

async function getAllPersonnel() {
  return await db.personnel.findMany({
    where: { isActive: true },
    orderBy: [
      { type: 'asc' },
      { order: 'asc' },
    ],
    include: {
      directedDept: true,
      chiefInDepts: true,
    }
  });
}

export default async function PersonnelPage() {
  const personnel = await getAllPersonnel();
  
  // Separate personnel by type
  const directors = personnel.filter((person: any) => person.type === 'DIRECTOR');
  const chiefs = personnel.filter((person: any) => person.type === 'CHIEF');

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 text-center">
        Personelimiz
      </h1>
      
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <p className="text-lg text-gray-600">
          Kent Konut çalışanları ve yöneticileri hakkında detaylı bilgilere ulaşabilirsiniz.
        </p>
      </div>
      
      {/* Directors Section */}
      {directors.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-primary mb-8 border-b border-gray-200 pb-2">
            Birim Müdürlerimiz
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {directors.map((director: any) => (
              <Link
                href={`/personel/${director.slug}`}
                key={director.id}
                className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative w-full h-64">
                  {director.imageUrl ? (
                    <Image 
                      src={director.imageUrl}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      alt={director.name}
                    />
                  ) : (
                    <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex-grow flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{director.name}</h3>
                  <p className="text-primary mb-2">{director.title}</p>
                  
                  {director.directedDept && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">{director.directedDept.name} Müdürü</span>
                    </p>
                  )}
                  
                  <div className="mt-auto pt-4">
                    <span className="text-primary font-medium text-sm inline-flex items-center">
                      Özgeçmiş
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      {/* Chiefs Section */}
      {chiefs.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-primary mb-8 border-b border-gray-200 pb-2">
            Birim Şeflerimiz
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {chiefs.map((chief: any) => (
              <Link
                href={`/personel/${chief.slug}`}
                key={chief.id}
                className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative w-full h-48">
                  {chief.imageUrl ? (
                    <Image 
                      src={chief.imageUrl}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover"
                      alt={chief.name}
                    />
                  ) : (
                    <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">{chief.name}</h3>
                  <p className="text-primary text-sm mb-2">{chief.title}</p>
                  
                  {chief.chiefInDepts.length > 0 && (
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Birim{chief.chiefInDepts.length > 1 ? 'ler': ''}:</span>
                      <span> {chief.chiefInDepts.map((dept: any) => dept.name).join(', ')}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      {personnel.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">Henüz personel kaydı bulunmamaktadır.</p>
        </div>
      )}
    </div>
  );
}
