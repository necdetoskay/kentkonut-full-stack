import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Birimlerimiz | Kent Konut',
  description: 'Kent Konut kurumsal departmanları ve birimlerine ilişkin bilgiler',
};

async function getAllDepartments() {
  return await db.department.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      director: true,
      chiefs: {
        where: { isActive: true },
        orderBy: { order: 'asc' }
      }
    }
  });
}

export default async function BirimlerimizPage() {
  const departments = await getAllDepartments();

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 text-center">
        Birimlerimiz
      </h1>
      
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <p className="text-lg text-gray-600">
          Kent Konut'un çeşitli birimlerinin detaylı bilgilerine bu sayfadan ulaşabilirsiniz.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
        {departments.map((department: { id: string; slug: string; imageUrl: string | null; name: string; director?: { name: string } | null; services?: string[] }) => (
          <Link 
            href={`/birimlerimiz/${department.slug}`} 
            key={department.id}
            className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:shadow-xl hover:-translate-y-1"
          >
            <div className="relative w-full h-48">
              {department.imageUrl ? (
                <Image 
                  src={department.imageUrl}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  alt={department.name}
                />
              ) : (
                <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="p-5 flex-grow flex flex-col">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">{department.name}</h2>
              
              {department.director && (
                <p className="text-gray-500 mt-1 text-sm">
                  <span className="font-medium">Birim Müdürü:</span> {department.director.name}
                </p>
              )}
              
              {department.services && department.services.length > 0 && (
                <div className="mt-3">
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    {department.services.slice(0, 3).map((service: string, index: number) => (
                      <li key={index} className="truncate">{service}</li>
                    ))}
                    {department.services.length > 3 && (
                      <li className="text-primary font-medium">+{department.services.length - 3} daha fazla...</li>
                    )}
                  </ul>
                </div>
              )}
              
              <div className="mt-auto pt-4">
                <span className="text-primary font-medium text-sm inline-flex items-center">
                  Detaylı Bilgi
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
