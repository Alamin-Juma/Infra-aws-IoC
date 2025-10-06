import api from "../../../../utils/apiInterceptor";

export const fetchPurchaseOrderDetailsService = async (id) => {
  try {
    const response = await api.get(`/api/purchase-orders/${id}`);
    if (!response.data.purchaseOrder) {
      throw new Error("No purchase order found");
    }
    return response.data.purchaseOrder;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch purchase order details";
    throw new Error(message);
  }
};

export const updatePurchaseOrderStatusService = async (id, status, user) => {
  try {
    const payload = {
      status,
      lastUpdatedById: user.id,
    };

    const response = await api.patch(
      `/api/purchase-orders/${id}/update-status`,
      payload
    );

    if (response.status === 200) {
      return { success: true, message: "Purchase Order sent to vendor" };
    } else {
      return {
        success: false,
        message: "Failed to send purchase order to the vendor.",
      };
    }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An error occurred while sending the purchase order.";

    return { success: false, message };
  }
};
