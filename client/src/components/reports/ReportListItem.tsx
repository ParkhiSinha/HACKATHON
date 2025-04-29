import { CrimeReport } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Car, Home, AlertCircle } from "lucide-react";

interface ReportListItemProps {
  report: CrimeReport;
  onClick?: () => void;
}

export default function ReportListItem({ report, onClick }: ReportListItemProps) {
  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Determine icon based on crime type
  const getIcon = (crimeType: string) => {
    const type = crimeType.toLowerCase();
    
    if (type.includes("vehicle") || type.includes("car")) {
      return (
        <div className="bg-blue-100 rounded-lg p-3 mr-4">
          <Car className="text-primary" />
        </div>
      );
    } else if (
      type.includes("break-in") ||
      type.includes("burglary") ||
      type.includes("theft")
    ) {
      return (
        <div className="bg-red-100 rounded-lg p-3 mr-4">
          <Home className="text-red-600" />
        </div>
      );
    } else {
      return (
        <div className="bg-green-100 rounded-lg p-3 mr-4">
          <AlertCircle className="text-green-600" />
        </div>
      );
    }
  };

  // Get status badge based on report status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-status-warning border-yellow-200 text-xs px-2 py-1 rounded-full">
            Pending
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-xs px-2 py-1 rounded-full">
            In Progress
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="outline" className="bg-green-100 text-status-success border-green-200 text-xs px-2 py-1 rounded-full">
            Resolved
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition cursor-pointer" onClick={onClick}>
      <div className="flex items-start">
        {getIcon(report.crimeType)}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-gray-800">{report.crimeType}</h4>
            {getStatusBadge(report.status)}
          </div>
          <p className="text-gray-600 text-sm mb-2">{report.description}</p>
          <div className="flex items-center text-xs text-gray-500">
            <span className="mr-3 flex items-center">
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Reported {formatDate(report.createdAt)}
            </span>
            <span className="flex items-center">
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {report.location}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
