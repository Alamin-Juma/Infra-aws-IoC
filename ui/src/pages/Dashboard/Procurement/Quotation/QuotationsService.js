import api from "../../../../utils/apiInterceptor";

export const fetchVendors = async () => {
  try {
    const response = await api.get(`/api/vendors`);
    if (response.data.data.vendors && Array.isArray(response.data.data.vendors)) {
      return response.data.data.vendors;
    }
    return [];
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch vendors");
  }
};

export const fetchQuotations = async (page, limit,filters) => {
  try {
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    if (isNaN(parsedPage) || isNaN(parsedLimit)) {
      throw new Error("Invalid page or limit parameters");
    }

    const response = await api.get(`/api/quotations`, {
      params: {
        page: parsedPage,
        limit: parsedLimit,
        quotationId: filters?.quotationId
      },
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch quotations");
  }
};


