import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaStar } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../../../layouts/MainLayout";
import withAuth from "../../../../utils/withAuth";
import { submitVendorEvaluation } from "./vendorService";
import { toast } from "react-toastify";

const VendorEvaluationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [evaluatingVendor, setEvaluatingVendor] = useState(location.state?.evaluatingVendor);
  const [evaluationForm, setEvaluationForm] = useState({
    deliveryTimeliness: "",
    productQuality: "",
    pricingCompetitiveness: "",
    customerService: "",
    complianceAndSecurity: "",
    innovation: "",
    comments: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!evaluatingVendor) {
      navigate("/app/procurement/vendor-evaluation");
    }
  }, [evaluatingVendor, navigate]);

  const handleEvaluateChange = (e) => {
    const { name, value } = e.target;
    setEvaluationForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateEvaluationForm = () => {
    const newErrors = {};
    const validateRating = (field, label) => {
      const rating = parseInt(evaluationForm[field], 10);
      if (isNaN(rating)) {
        newErrors[field] = `Please rate ${label}`;
      } else if (rating < 1 || rating > 5) {
        newErrors[field] = `Please rate ${label} between 1 and 5`;
      }
    };

    validateRating("deliveryTimeliness", "delivery timeliness");
    validateRating("productQuality", "product quality");
    validateRating("pricingCompetitiveness", "pricing competitiveness");
    validateRating("customerService", "customer service responsiveness");
    validateRating("complianceAndSecurity", "compliance and security");
    validateRating("innovation", "innovation");

    if (evaluationForm.comments.length > 200) {
      newErrors.comments = "Comment must not exceed 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitEvaluation = async () => {
    if (!validateEvaluationForm()) return;

    setSubmitting(true);

    try {
      const userData = localStorage.getItem("user");
      let userId = null;
      if (userData) {
        const user = JSON.parse(userData);
        userId = user.id;
      }

      const evaluationData = {
        vendorId: evaluatingVendor.id,
        evaluatorId: userId,
        deliveryTimeliness: parseInt(evaluationForm.deliveryTimeliness, 10),
        productQuality: parseInt(evaluationForm.productQuality, 10),
        pricingCompetitiveness: parseInt(evaluationForm.pricingCompetitiveness, 10),
        customerService: parseInt(evaluationForm.customerService, 10),
        complianceAndSecurity: parseInt(evaluationForm.complianceAndSecurity, 10),
        innovation: parseInt(evaluationForm.innovation, 10),
        comments: evaluationForm.comments || null
      };

     
      await submitVendorEvaluation(evaluationData);     

       toast.success('Vendor evaluation submitted successfully!', {
                  onClose: () => navigate("/app/procurement/vendor-evaluation"),
                });
      
      
    } catch (error) {
     
      toast.error(error.response?.data?.error || "Failed to submit evaluation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!evaluatingVendor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
     
      <div className="max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back</span>
        </button>
      </div>

     
      <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-4 mx-auto">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
         
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              {evaluatingVendor.name}
            </h2>
          </div>

         
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Evaluation Scale</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please rate the vendor on the following criteria. Use the scale of 1 to 5, where:
            </p>
            <ol className="list-decimal pl-6 text-sm text-gray-600 space-y-2">
              <li>Very Poor</li>
              <li>Poor</li>
              <li>Average</li>
              <li>Good</li>
              <li>Excellent</li>
            </ol>
          </div>

          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {[
                { label: "Delivery Timeliness", name: "deliveryTimeliness" },
                { label: "Product Quality", name: "productQuality" },
                { label: "Pricing Competitiveness", name: "pricingCompetitiveness" },
                { label: "Customer Service", name: "customerService" },
                { label: "Compliance and Security", name: "complianceAndSecurity" },
                { label: "Innovation", name: "innovation" }
              ].map((field) => (
                <div key={field.name} className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    {field.label} <span className="text-red-600">*</span>
                  </label>
                  <div className="flex items-center space-x-4">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <label key={rating} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={field.name}
                          value={rating}
                          checked={parseInt(evaluationForm[field.name]) === rating}
                          onChange={handleEvaluateChange}
                          className="h-4 w-4 text-[#77B634] focus:ring-[#77B634] border-gray-300"
                          required
                        />
                        <span className="text-sm text-gray-600">{rating}</span>
                      </label>
                    ))}
                  </div>
                  {errors[field.name] && (
                    <p className="mt-2 text-sm text-red-600">{errors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>

           
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Comments
              </label>
              <div className="relative">
                <textarea
                  name="comments"
                  className={`block w-full px-4 py-3 border ${
                    errors.comments ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#77B634] focus:border-[#77B634] text-gray-600 placeholder-gray-400 whitespace-pre-wrap`}
                  rows="3"
                  value={evaluationForm.comments}
                  onChange={handleEvaluateChange}
                  placeholder="Add your detailed comments about the vendor's performance..."
                  maxLength={200}
                ></textarea>
                <div className="flex justify-between mt-1">
                  {errors.comments && (
                    <div className="text-sm text-red-600">
                      {errors.comments}
                    </div>
                  )}
                  <div className={`text-sm ${
                    evaluationForm.comments.length === 200 ? "text-red-600 font-medium" : "text-gray-500"
                  }`}>
                    {evaluationForm.comments.length}/200 characters
                    {evaluationForm.comments.length === 200 && " (Maximum limit reached)"}
                  </div>
                </div>
              </div>
            </div>

           
            <div className="flex justify-end">
              <button
                className="px-6 py-3 bg-[#77B634] text-white rounded-lg hover:bg-[#5a8f2a] focus:outline-none focus:ring-2 focus:ring-[#77B634] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                onClick={submitEvaluation}
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  "Submit Evaluation"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WrappedVendorEvaluationForm = withAuth(VendorEvaluationForm, false);
export default () => (
  <MainLayout>
    <WrappedVendorEvaluationForm />
  </MainLayout>
); 