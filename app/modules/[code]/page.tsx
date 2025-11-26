import ModuleScheduleClient from "./_components/ModuleScheduleClient";

type PageProps = {
  params: {
    code: string;
  };
};

export default function ModuleSchedulePage({ params }: PageProps) {
  const moduleCode = decodeURIComponent(params.code || "");
  return <ModuleScheduleClient moduleCode={moduleCode} />;
}
