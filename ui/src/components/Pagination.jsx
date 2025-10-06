import React from "react";

import {
  DEFAULT_LIMIT,
  PAGINATION_LIMIT_OPTIONS,
} from "../constants/table.constants";

const Pagination = ({
  total,
  dataTest,
  limit,
  page,
  handlePageChange,
  handleLimitChange,
}) => {
  const safeLimit = PAGINATION_LIMIT_OPTIONS.includes(Number(limit))
    ? Number(limit)
    : DEFAULT_LIMIT;

  const totalPages = Math.ceil(total / safeLimit);

  const getPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;

    buttons.push(
      <button
        key={1}
        onClick={() => handlePageChange(1)}
        className={`px-4 py-2 text-sm font-medium rounded-lg ${
          page === 1
            ? "bg-[#77B634] text-white"
            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
        }`}
      >
        1
      </button>
    );

    if (page > maxVisibleButtons - 1) {
      buttons.push(
        <span key="start-ellipsis" className="px-4 py-2 text-gray-700">
          ...
        </span>
      );
    }

    let start = Math.max(2, page - Math.floor(maxVisibleButtons / 2));
    let end = Math.min(
      totalPages - 1,
      page + Math.floor(maxVisibleButtons / 2)
    );

    if (end - start < maxVisibleButtons - 1) {
      start = Math.max(2, totalPages - (maxVisibleButtons - 1));
    }

    for (let i = start; i <= end; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 text-sm font-medium rounded-lg ${
            page === i
              ? "bg-[#77B634] text-white"
              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }

    if (page < totalPages - (maxVisibleButtons - 2)) {
      buttons.push(
        <span key="end-ellipsis" className="px-4 py-2 text-gray-700">
          ...
        </span>
      );
    }

    if (totalPages > 1) {
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-4 py-2 text-sm font-medium rounded-lg ${
            page === totalPages
              ? "bg-[#77B634] text-white"
              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="flex flex-row items-center justify-end gap-4 mt-6">
      <button
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
        className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 ${
          page === 1 ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Previous
      </button>

      <div className="flex items-center gap-2">{getPaginationButtons()}</div>

      <button
        onClick={() => handlePageChange(page + 1)}
        disabled={safeLimit * page >= total}
        className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 ${
          safeLimit * page >= total ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Next
      </button>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">
          Rows per page:
        </label>
        <select
            data-test={`${dataTest}-select`}
            value={safeLimit}
            onChange={handleLimitChange}
            className="select max-w-[70px]  text-sm text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#77B634] focus:border-[#77B634]"
          >
          {PAGINATION_LIMIT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Pagination;
