import { useRequireAuth } from "@/lib/auth";
import UserLayout from "@/components/layout/UserLayout";
import ReportForm from "@/components/reports/ReportForm";

export default function ReportCrime() {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <UserLayout title="Report a Crime">
      <ReportForm />
    </UserLayout>
  );
}
