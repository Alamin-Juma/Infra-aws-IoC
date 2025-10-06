import React, { useState } from "react";
import {
  CHARACTER_MAX_LENGTH,
  CHARACTER_MIN_LENGTH,
} from "../constants/forms.constants.js";

const RejectionReasonForm = ({ onSubmit, onClose }) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value;
    setRejectionReason(value);

    if (value.length < CHARACTER_MIN_LENGTH) {
      setError(
        `Rejection reason must be at least ${CHARACTER_MIN_LENGTH} characters.`
      );
    } else if (value.length > CHARACTER_MAX_LENGTH) {
      setError(
        `Rejection reason cannot exceed ${CHARACTER_MAX_LENGTH} characters.`
      );
    } else {
      setError("");
    }
  };

  const handleSubmit = () => {
    if (!rejectionReason.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    if (
      rejectionReason.length < { CHARACTER_MIN_LENGTH } ||
      rejectionReason.length > { CHARACTER_MAX_LENGTH }
    ) {
      setError(
        `Rejection reason must be between ${CHARACTER_MIN_LENGTH} and ${CHARACTER_MAX_LENGTH} characters.`
      );
      return;
    }

    onSubmit(rejectionReason);
    onClose();
  };

  return (
    <div>
      <h3 className="font-bold mb-4">Reason for Rejection</h3>
      <textarea
        placeholder={`Enter rejection reason (${CHARACTER_MIN_LENGTH}-${CHARACTER_MAX_LENGTH} characters)`}
        value={rejectionReason}
        onChange={handleInputChange}
        maxLength={200}
        rows="5"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
      />
      <p className="text-sm text-gray-500 mt-2">
        {`${rejectionReason.length}/${CHARACTER_MAX_LENGTH}`}
      </p>

      {rejectionReason.length >= CHARACTER_MAX_LENGTH && (
        <p className="text-red-500 text-sm mt-2">
          Rejection reason should not exceed 200 characters.
        </p>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <div className="flex justify-end mt-6 space-x-4">
        <button
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className={`px-4 py-2 bg-[#77B634] text-white rounded hover:bg-[#4d7820]${
            error ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleSubmit}
          disabled={!!error}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default RejectionReasonForm;
