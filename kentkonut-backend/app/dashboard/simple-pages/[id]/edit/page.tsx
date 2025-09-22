import EditSimplePageClient from './EditSimplePageClient';

export default async function EditSimplePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return <EditSimplePageClient id={id} />;
}
