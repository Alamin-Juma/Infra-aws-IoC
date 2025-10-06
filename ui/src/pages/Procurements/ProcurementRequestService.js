import { toast } from "react-toastify";
import api from "../../utils/apiInterceptor";

const PROCUREMENT_REQUESTS_ENDPOINT = "/api/procurements-requests";
const PROCUREMENT_REQUEST_ITEMS_ENDPOINT = "/api/procurements-requests/items";

export const editProcurementRequest = async (data) => {
  try {
    await api.put(`${PROCUREMENT_REQUESTS_ENDPOINT}/${data?.id}`, {
      ...data,
      expectedDelivery: new Date(data.expectedDelivery),
    });
    toast.success("Request successfully edited, awaiting approval.");
    return true;
  } catch (error) {
    toast.error("Failed to submit procurement request. Please try again.");
    return false;
  }
};

export const fetchProcurementRequests = async (page, limit, statusFilter) => {
  try {
    const response = await api.get(PROCUREMENT_REQUESTS_ENDPOINT, {
      params: {
        page,
        limit,
        status: statusFilter,
      },
    });
    const result = response?.data?.data;
    return {
      data: result,
      pagination: result?.pagination,
    };
  } catch (error) {
    toast.error("Failed to fetch procurement requests.");
    return { data: [], pagination: { total: 0 } };
  }
};

export const handleApproveRejectSubmitService = async (data, action) => {
  try {
    const response = await api.put(
      `${PROCUREMENT_REQUESTS_ENDPOINT}/${data?.id}/${action}`,
      data
    );
    toast.success(response.data.message);
    return true;
  } catch (error) {
    toast.error("Failed to update request. Please try again.");
    return false;
  }
};

export const fetchProcurementRequestItems = async (
  page,
  limit,
  searchTerm,
  statusFilter
) => {
  try {
    const response = await api.get(PROCUREMENT_REQUEST_ITEMS_ENDPOINT, {
      params: {
        page,
        limit,
        search: searchTerm,
        status: statusFilter,
      },
    });
    return {
      data: response?.data?.data,
      pagination: response?.data?.pagination,
    };
  } catch (error) {
    toast.error("Failed to fetch procurement request items.");
    return { data: [], pagination: { total: 0 } };
  }
};

export const handleSubmitRequestService = async (
  data,
  user,
  fetchData,
  setIsCreateRequestModalOpen
) => {
  try {
    const endpoint = data?.id
      ? `${PROCUREMENT_REQUESTS_ENDPOINT}/item/${data?.id}`
      : PROCUREMENT_REQUEST_ITEMS_ENDPOINT;
    const method = data?.id ? "put" : "post";
    const successMessage = data?.id
      ? "Request updated successfully!"
      : "Request saved successfully!";
    const requestData = { ...data };

    if (!data?.id) {
      requestData.submittedBy = user?.id;
      if (data?.deviceType?.name !== "laptop") {
        requestData.category = "Custom";
      }
    }

    await api[method](endpoint, requestData);
    toast.success(successMessage);
    fetchData();
    setIsCreateRequestModalOpen(false);
    return true;
  } catch (error) {
    toast.error(
      data?.id
        ? "Failed to update request. Please try again."
        : "Failed to save request. Please try again."
    );
    return false;
  }
};

export const handleSubmitProcurementRequestService = async (
  data,
  selectedRequests,
  user,
  fetchData,
  setIsSubmitToProcurementModalOpen
) => {
  try {
    await api.post(PROCUREMENT_REQUESTS_ENDPOINT, {
      ...data,
      expectedDelivery: new Date(data.expectedDelivery),
      procurementRequestItemIds: selectedRequests,
      createdByID: user?.id,
    });
    toast.success("Requests successfully submitted, awaiting approval.");
    fetchData();
    setIsSubmitToProcurementModalOpen(false);
    return true;
  } catch (error) {
    toast.error("Failed to submit procurement request. Please try again.");
    return false;
  }
};
