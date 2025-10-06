import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Plus, X } from "lucide-react";

export default function CreatePatternModal({
  mode = "create",
  trigger,
  initialData = null,
  onSubmit,
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    frequency: 1,
    unit: "days",
    description: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData.id || 0,
        name: initialData.name || "",
        frequency: initialData.frequency || 1,
        unit: initialData.unit || "days",
        description: initialData.description || "",
      });
    }
  }, [initialData,open]);

  const isFormValid = () =>
    form.name.trim() &&
    form.description.trim() &&
    form.frequency > 0 &&
    form.unit.trim();

  const handleSubmit = () => {
    if (isFormValid()) {
      onSubmit(form);
      setOpen(false);
      resetForm();
    }
  };

  const handleCancel = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({ name: "", frequency: 1, unit: "days", description: "" });
  };

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>

      <Dialog open={open} onClose={handleCancel} className="relative z-[99999]">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-lg bg-white rounded-md shadow-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {mode === "edit" ? "Edit Pattern" : "New Custom Pattern"}
              </h2>
              <button onClick={handleCancel}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pattern Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-[#8BC34A] focus:border-[#8BC34A]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full mt-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-[#8BC34A] focus:border-[#8BC34A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Frequency <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.frequency}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        frequency: Math.max(parseInt(e.target.value) || 1, 1),
                      })
                    }
                    className="w-full mt-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-[#8BC34A] focus:border-[#8BC34A]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Time Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full mt-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-[#8BC34A] focus:border-[#8BC34A]"
                  >
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isFormValid()}
                className={`px-4 py-2 text-sm text-white rounded ${
                  isFormValid()
                    ? "bg-[#8BC34A] hover:bg-[#7CB342]"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {mode === "edit" ? "Save Changes" : "Create Pattern"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}