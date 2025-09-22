import prisma from "@/lib/prisma";
import { SayfaArkaPlanForm } from "../_components/form";

const EditSayfaArkaPlanPage = async ({
  params,
}: {
  params: { id: string };
}) => {
  const record = await prisma.sayfaArkaPlan.findUnique({
    where: {
      id: parseInt(params.id, 10),
    },
  });

  return (
    <div className="p-8 pt-6">
      <SayfaArkaPlanForm initialData={record} />
    </div>
  );
};

export default EditSayfaArkaPlanPage;
