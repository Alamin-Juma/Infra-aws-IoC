import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import { ProcurementRequestStatus } from "../../utils/constants";

const ApproveRejectModal = ({
  id,
  action,
  onClose,
  isOpen,
  onSubmit,
  approvalRef,
}) => {
  const [comment, setComment] = useState("");
  const [commentsErrors, setCommentsErrors] = useState("");

  if (!isOpen) return null;
  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    if (
      (action == ProcurementRequestStatus.REJECTED ||
        action == ProcurementRequestStatus.PENDING) &&
      !comment
    ) {
      setCommentsErrors("Comment is required");
      return;
    }
    if (
      (action == ProcurementRequestStatus.REJECTED ||
        action == ProcurementRequestStatus.PENDING) &&
      comment.length < 10
    ) {
      setCommentsErrors("Comment must be at least 10 characters");
      return;
    }
    onSubmit({
      id,
      action,
      comment,
    });
    setCommentsErrors("");
    setComment("");
  };

  return (
    <div className="z-[99999] flex items-center justify-center  fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
      <div
        ref={approvalRef}
        className=" bg-white rounded-lg shadow-xl w-full max-w-md p-6"
      >
        <div className="flex relative">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 w-full text-center">
            {action === ProcurementRequestStatus.APPROVED
              ? "Approval Modal"
              : action === ProcurementRequestStatus.REJECTED
              ? "Rejection Modal"
              : "More Information Modal"}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 absolute right-0"
            aria-label="Close"
          >
            <MdClose className="text-2xl" />
          </button>
        </div>

        <p className="text-black text-base mb-3">
          Are you sure you want to{" "}
          {action === ProcurementRequestStatus.APPROVED
            ? "approve"
            : action === ProcurementRequestStatus.REJECTED
            ? "reject"
            : "request more information for"}{" "}
          this request?
        </p>
        <p className="text-sm text-gray-500 mb-4">Kindly add a comment below</p>

        <div className="mb-4">
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 sr-only"
          >
            Comment
          </label>
          <textarea
            id="comment"
            className="mt-1 block border w-full rounded-md border-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
            rows={3}
            maxLength={200}
            onChange={(e) => {
              if (e.target.value.length == 200) {
                setCommentsErrors("Comment cannot exceed 200 characters");
              }
              setComment(e.target.value);
              if (
                comment.length < 10 &&
                (action == ProcurementRequestStatus.REJECTED ||
                  action == ProcurementRequestStatus.PENDING)
              ) {
                setCommentsErrors("Comment must be at least 10 characters");
              }
              if (
                comment.length >= 10 &&
                (action == ProcurementRequestStatus.REJECTED ||
                  action == ProcurementRequestStatus.PENDING)
              ) {
                setCommentsErrors("");
              }
            }}
            placeholder="Comment"
          />
          <p
            className={`text-sm ${
              comment.length < 10 && comment.length > 0
                ? "text-red-500"
                : comment.length > 200
                ? "text-red-500"
                : comment.length >= 10 && comment.length < 200
                ? "text-green-500"
                : comment.length == 200
                ? "text-red-500"
                : "text-gray-500"
            }`}
          >
            {comment?.length}/200 characters
          </p>

          {commentsErrors != "" && (
            <p className="text-red-500 text-sm mt-1">{commentsErrors}</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 ${
              action === ProcurementRequestStatus.APPROVED ||
              action === ProcurementRequestStatus.PENDING
                ? "bg-green-500 hover:bg-green-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {action === ProcurementRequestStatus.APPROVED
              ? "Accept"
              : action === ProcurementRequestStatus.REJECTED
              ? "Reject"
              : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveRejectModal;
