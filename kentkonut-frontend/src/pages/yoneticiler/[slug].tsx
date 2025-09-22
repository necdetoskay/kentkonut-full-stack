import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getApiBaseUrl } from '../../config/environment';

interface Executive {
  id: string;
  name: string;
  title: string;
  biography?: string;
  content: string;
  imageUrl?: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
  // Add other fields as needed from your Prisma schema
}

const ExecutiveDetailPage: React.FC = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [executive, setExecutive] = useState<Executive | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      const fetchExecutive = async () => {
        try {
          setLoading(true);
          const apiBaseUrl = getApiBaseUrl();
          console.log('Fetching executive with slug:', slug);
          console.log('Using API URL:', `${apiBaseUrl}/api/public/executives/slug/${slug}`);
          
          const response = await fetch(`${apiBaseUrl}/api/public/executives/slug/${slug}`);
          if (!response.ok) {
            if (response.status === 404) {
              setError('Executive not found.');
            } else {
              setError('Failed to fetch executive data.');
            }
            setExecutive(null);
            return;
          }
          const responseData = await response.json();
          const data: Executive = responseData.data || responseData;
          setExecutive(data);
        } catch (err) {
          console.error('Error fetching executive:', err);
          setError('An unexpected error occurred.');
          setExecutive(null);
        } finally {
          setLoading(false);
        }
      };

      fetchExecutive();
    }
  }, [slug]);

  if (loading) {
    return <div>Loading executive details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!executive) {
    return <div>No executive found.</div>;
  }

  return (
    <div className="executive-detail-page">
      <h1>{executive.name}</h1>
      <h2>{executive.title}</h2>
      {executive.imageUrl && (
        <img src={executive.imageUrl} alt={executive.name} style={{ maxWidth: '300px' }} />
      )}
      {executive.biography && <p><strong>Biography:</strong> {executive.biography}</p>}
      <div dangerouslySetInnerHTML={{ __html: executive.content }} />
      {executive.email && <p>Email: {executive.email}</p>}
      {executive.phone && <p>Phone: {executive.phone}</p>}
      {executive.linkedIn && <p><a href={executive.linkedIn} target="_blank" rel="noopener noreferrer">LinkedIn</a></p>}
      {/* Add more executive details as needed */}
    </div>
  );
};

export default ExecutiveDetailPage;
