import React, { useState } from "react";
import { Calendar, Edit, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import withAuth from "../../../utils/withAuth";
import MainLayout from "../../../layouts/MainLayout";
import CreatePatternModal from "../../../components/CreatePatternModal";
import api from "../../../utils/apiInterceptor";
import {
  PERMISSION_CREATE_PATTERN,
  PERMISSION_DELETE_PATTERN,
  PERMISSION_EDIT_PATTERN,
} from "../../../constants/permissions.constants";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";

const RecurrencePatterns = () => {
  const { hasPermissions } = useAuth();
  const [customPatterns, setCustomPatterns] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const patternsPerPage = 5;
  const defaultPatterns = ["Daily", "Weekly", "Monthly", "Yearly"];

  useEffect(() => {
    fetchPatterns(currentPage);
  }, [currentPage]);

  const fetchPatterns = async (page=currentPage) => {
    setIsLoading(true);
    try {
      const res = await api.get("/api/recurrence-patterns", {
        params: {
          page,
          limit: patternsPerPage,
        },
      });

      const { data = [], meta = {} } = res.data;
      const sortedData = data.sort((a, b) => {
        if (a.isDeleted && !b.isDeleted) return 1;
        if (!a.isDeleted && b.isDeleted) return -1;

        const aIndex = defaultPatterns.indexOf(a.name);
        const bIndex = defaultPatterns.indexOf(b.name);

        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }

        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;

        return a.name.localeCompare(b.name);
      });

      setCustomPatterns(sortedData);
      setTotalPages(meta.totalPages || 1);
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePattern = async (newPattern) => {
    try {
      await api.post("/api/recurrence-patterns", newPattern);
      fetchPatterns();
      toast.info("Pattern has been created.");
    } catch (err) {}
  };

  const handleUpdatePattern = async (updatedPattern) => {
    console.log("updatedPattern", updatedPattern);
    try {
      await api.put(
        `/api/recurrence-patterns/${updatedPattern.id}`,
        updatedPattern
      );
      fetchPatterns();
      toast.info("Pattern has been updated.");
    } catch (err) {}
  };

  const handleDeleteCustomPattern = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Pattern",
      text: "Are you sure you want to Delete this pattern?",
      icon: "error",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
    });
    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/api/recurrence-patterns/${id}`);
      setCustomPatterns((prev) => prev.filter((p) => p.id !== id));
      toast.success("Pattern has been deleted");
      fetchPatterns();
    } catch (err) {}
  };

  const toggleCustomPatternStatus = async (id, isActive) => {
    const confirm = await Swal.fire({
      title: `${isActive ? "Deactivate" : "Activate"} Pattern`,
      text: `Are you sure you want to ${
        isActive ? "deactivate" : "activate"
      } this pattern?`,
      icon: `${isActive ? "warning" : "success"}`,
      showCancelButton: true,
      confirmButtonText: `Yes, ${isActive ? "deactivate" : "activate"} it`,
      cancelButtonText: "Cancel",
      confirmButtonColor: `${isActive ? "#d33" : "#7AB34A"}`,
      cancelButtonColor: "#aaa",
    });
    if (!confirm.isConfirmed) return;

    try {
      await api.put(`/api/recurrence-patterns/${id}/status`, {
        isActive: !isActive,
      });
      setCustomPatterns((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
      );
      toast.success("Pattern status updated");
      fetchPatterns();
    } catch (err) {}
  };

  const formatPatternDescription = (frequency, unit) => {
    const unitLabel = frequency === 1 ? unit.slice(0, -1) : unit;
    return `Every ${frequency} ${unitLabel}`;
  };

  return (
    <div className="p-6 w-full">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Calendar className="text-[#8BC34A]" />
              Recurrence Patterns
            </h1>
            <p className="text-gray-600 text-sm">
              Create and manage custom recurrence patterns
            </p>
          </div>
          {hasPermissions(PERMISSION_CREATE_PATTERN) && (
            <CreatePatternModal
              mode="create"
              trigger={
                <button className="bg-[#8BC34A] hover:bg-[#7AB34A] text-white px-4 py-2 rounded-md text-sm">
                  + Create Pattern
                </button>
              }
              onSubmit={handleCreatePattern}
            />
          )}
        </div>

        <div className="bg-white p-4 rounded-md shadow-sm border">
          <h2 className="font-medium text-lg mb-4">Custom Patterns</h2>
          {customPatterns.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p>No custom patterns created yet.</p>
              <p className="text-sm">Click "Create Pattern" to add one.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {customPatterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className="flex items-center justify-between border border-gray-200 rounded-md p-4 bg-white"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {pattern.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          defaultPatterns.includes(pattern.name)
                            ? "bg-gray-100 text-gray-600"
                            : pattern.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {defaultPatterns.includes(pattern.name)
                          ? "Default"
                          : pattern.isActive
                          ? "Active"
                          : pattern.isDeleted
                          ? "Deleted"
                          : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatPatternDescription(
                        pattern.frequency,
                        pattern.unit
                      )}
                    </p>
                    {pattern.description && (
                      <p className="text-sm text-gray-500">
                        {pattern.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!defaultPatterns.includes(pattern.name) &&
                      !pattern.isDeleted && (
                        <>
                          <button
                            onClick={() =>
                              toggleCustomPatternStatus(
                                pattern.id,
                                pattern.isActive
                              )
                            }
                            className={`px-3 py-1 text-sm border rounded ${
                              pattern.isActive
                                ? "text-orange-600 border-orange-300 hover:bg-orange-50"
                                : "text-green-600 border-green-300 hover:bg-green-50"
                            }`}
                          >
                            {pattern.isActive ? "Deactivate" : "Activate"}
                          </button>

                          {hasPermissions(PERMISSION_EDIT_PATTERN) && (
                            <CreatePatternModal
                              mode="edit"
                              trigger={
                                <button
                                  disabled={!pattern.isActive}
                                  title="Edit"
                                  className={`p-2 border rounded transition 
                                ${
                                  pattern.isActive
                                    ? "hover:bg-blue-100"
                                    : "opacity-50 cursor-not-allowed"
                                }`}
                                >
                                  <Edit className="w-4 h-4 text-blue-600" />
                                </button>
                              }
                              initialData={pattern}
                              onSubmit={handleUpdatePattern}
                            />
                          )}

                          {hasPermissions(PERMISSION_DELETE_PATTERN) && (
                            <button
                              disabled={!pattern.isActive}
                              onClick={() =>
                                handleDeleteCustomPattern(pattern.id)
                              }
                              title="Delete"
                              className={`p-2 border rounded transition 
                            ${
                              pattern.isActive
                                ? "hover:bg-red-100"
                                : "opacity-50 cursor-not-allowed"
                            }`}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          )}
                        </>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded text-sm ${
                  page === currentPage
                    ? "bg-[#8BC34A] text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const WrappedRecurrencePatterns = withAuth(RecurrencePatterns, false);
export default () => (
  <MainLayout>
    <WrappedRecurrencePatterns />
  </MainLayout>
);
