import api from "../../../../utils/apiInterceptor";
import { toast } from "react-toastify";

export const fetchRequestDetails = async (id) => {
  try {
    const response = await api.get(`/api/procurementRequests/${id}`);
    if (!response.data.data) {
      throw new Error("No procurement request found");
    }
    return response.data.data;
  } catch (error) {
    toast.error("Failed to fetch procurement request details");
    throw error;
  }
};

export const fetchVendors = async () => {
  try {
    const response = await api.get(`/api/vendors`);
    if (response.data.data && Array.isArray(response.data.data.vendors)) {
      return response.data.data.vendors;
    }
    return [];
  } catch (error) {
    toast.error("Failed to fetch vendors");
    throw error;
  }
};

export const fetchVendorDevices = async () => {
  try {
    const response = await api.get(`/api/vendorDevices`);
    if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    toast.error("Failed to fetch vendor devices");
    throw error;
  }
};

export const submitQuotation = async (request, quotationValues, vendors) => {
  try {
    const groupedItems = {};
    request.procurementRequestItems.forEach((item) => {
      const vendorId = quotationValues[item.id]?.vendor;
      if (vendorId) {
        if (!groupedItems[vendorId]) groupedItems[vendorId] = [];
        groupedItems[vendorId].push({
          ...item,
          unitPrice: parseFloat(quotationValues[item.id]?.unitPrice || 0),
        });
      }
    });

    for (const vendorId in groupedItems) {
      const items = groupedItems[vendorId];
      const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

      await api.post("/api/quotations", {
        vendorId: parseInt(vendorId),
        submittedById: request.createdById,
        procurementRequestId: request.id,
        totalAmount,
        status: "Submitted",
        lineItems: items.map((item) => ({
          deviceTypeId: item.deviceTypeId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          specification: item.specification,
          expectedDeliveryDate: request.expectedDelivery,
        })),
      });

      const userData = localStorage.getItem("user");
      let userId = null;
      if (userData) {
        const user = JSON.parse(userData);
        userId = user.id;
      }

      const auditData = {
        activity: "Submitted a quotation for procurement request",
        performedBy: userId,
        note: `Submitted quotation for request ID ${request.id}`,
      };

      await api.post("/api/audit-trail", auditData);
    }

    await api.put(`/api/procurementRequests/${request.id}`, {
      status: "Quoted",
    });
   
  } catch (error) {
    toast.error(error.response?.data?.error || "Failed to submit quotation");
    throw error;
  }
};



