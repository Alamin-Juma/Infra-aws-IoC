import api from "../../../../utils/apiInterceptor";

export const fetchAllVendors = async () => {
  const response = await api.get("/api/vendors");
  return response.data.data.vendors || [];
};

export const fetchVendorEvaluations = async () => {
  const response = await api.get(`/api/vendorEvaluation`);
  return response.data?.data || [];
};

export const submitVendorEvaluation = async (evaluationData) => {
  const response = await api.post("/api/vendorEvaluation", evaluationData);
  return response.data;
};


