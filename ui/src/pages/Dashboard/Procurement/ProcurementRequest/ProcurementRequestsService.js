

import api from "../../../../utils/apiInterceptor";

export const fetchProcurementRequests = async (searchQuery, page, limit) => {
  try {
    const response = await api.get("/api/procurementRequests", {
      params: {
        requestId: searchQuery,
        page,
        limit,
        status: "Approved"
      }
    });

    const approvedRequests = response.data.data.requests.filter(
      request => request.status === "Approved"
    );

    return {
      requests: approvedRequests,
      total: approvedRequests.length
    };
  } catch (error) {
    throw new Error("Failed to fetch procurement requests");
  }
};


