import LecturerScheduleClient from "../_components/LecturerScheduleClient";

type PageProps = {
  params: {
    name: string;
  };
};

export default function LecturerSchedulePage({ params }: PageProps) {
  const lecturer = decodeURIComponent(params.name || "");
  return <LecturerScheduleClient lecturer={lecturer} />;
}
