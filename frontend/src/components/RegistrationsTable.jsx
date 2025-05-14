import React from "react";
import { format, parseISO, isValid } from "date-fns";

const RegistrationsTable = ({ registrations, onApprove, showTourColumn }) => {
  const safeFormatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date =
        typeof dateString === "string"
          ? parseISO(dateString)
          : new Date(dateString);
      return isValid(date) ? format(date, "MMM d, yyyy") : "Invalid date";
    } catch {
      return "N/A";
    }
  };

  if (!registrations || registrations.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        No registrations found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            {showTourColumn && <th className="py-2 px-4 text-left">Tour</th>}
            <th className="py-2 px-4 text-left">User</th>
            <th className="py-2 px-4 text-left">Date</th>
            <th className="py-2 px-4 text-left">Status</th>
            <th className="py-2 px-4 text-left">Registered At</th>
            {onApprove && <th className="py-2 px-4 text-left">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {registrations.map((reg) => (
            <tr key={reg.id} className="border-b">
              {showTourColumn && (
                <td className="py-2 px-4">{reg.title || "N/A"}</td>
              )}
              <td className="py-2 px-4">
                {reg.name || "N/A"} ({reg.email || "N/A"})
              </td>
              <td className="py-2 px-4">{safeFormatDate(reg.date)}</td>
              <td className="py-2 px-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    reg.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {reg.status || "N/A"}
                </span>
              </td>
              <td className="py-2 px-4">{safeFormatDate(reg.registered_at)}</td>
              {onApprove && (
                <td className="py-2 px-4">
                  <button
                    onClick={() => onApprove(reg.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RegistrationsTable;
