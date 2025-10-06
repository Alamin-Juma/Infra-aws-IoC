import React, { useState, useEffect } from "react";
import { FaEye, FaStar, FaArrowLeft } from "react-icons/fa";
import MainLayout from "../../../../layouts/MainLayout";
import withAuth from "../../../../utils/withAuth";
import { ToastContainer, toast } from "react-toastify";
import LoadingTable from "../../../../components/LoadingTable";
import Lottie from "lottie-react";
import animationData from "../../../../assets/lottie/no-data.json";
import Pagination from "../../../../components/Pagination";
import { IoSearchSharp } from "react-icons/io5";
import { debounce } from "lodash";
import {
  fetchAllVendors,
  fetchVendorEvaluations,
  submitVendorEvaluation,
} from "./vendorService";
import { useNavigate, useLocation } from "react-router-dom";
import Permission from "../../../../components/Permission";
import { PERMISSION_EVALUATE_VENDOR, PERMISSION_VIEW_VENDOR_EVALUATIONS } from "../../../../constants/permissions.constants";

const VendorPerformanceList = () => {
  const [evaluatedVendors, setEvaluatedVendors] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    vendorName: "",
  });
  const [evaluatingVendor, setEvaluatingVendor] = useState(null);
  const [viewingVendor, setViewingVendor] = useState(null);
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
  const navigate = useNavigate();
  const location = useLocation();

  const fetchAllVendorsData = async () => {
    try {
      const vendors = await fetchAllVendors();
      if (Array.isArray(vendors)) {
        setAllVendors(vendors);
      }
    } catch (error) {
      toast.error("Failed to fetch vendors list");
    }
  };

  const fetchVendorEvaluationsData = async () => {
    setLoading(true);
    try {
      const evaluations = await fetchVendorEvaluations();
      const groupedVendors = evaluations.reduce((acc, evaluation) => {
        const vendorId = evaluation.vendorId;
        const existingVendor = acc.find((v) => v.vendor.id === vendorId);
        const evaluationScore =
          (evaluation.deliveryTimeliness +
            evaluation.productQuality +
            evaluation.pricingCompetitiveness +
            evaluation.customerService +
            (evaluation.complianceAndSecurity || 0) +
            (evaluation.innovation || 0)) / 6;

        if (existingVendor) {
          existingVendor.evaluations.push(evaluation);
          existingVendor.totalScore += evaluationScore;
          existingVendor.averageScore =
            existingVendor.totalScore / existingVendor.evaluations.length;
        } else {
          acc.push({
            vendor: evaluation.vendor,
            evaluations: [evaluation],
            totalScore: evaluationScore,
            averageScore: evaluationScore,
          });
        }
        return acc;
      }, []);

      setEvaluatedVendors(groupedVendors);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch vendor evaluations"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllVendorsData();
    fetchVendorEvaluationsData();
  }, [page, limit, filters]);

  useEffect(() => {
    const evaluatedVendorIds = evaluatedVendors.map((v) => v.vendor.id);
    const nonEvaluatedVendors = allVendors.filter((vendor) => !evaluatedVendorIds.includes(vendor.id));
    setTotal(evaluatedVendors.length + nonEvaluatedVendors.length);
  }, [allVendors, evaluatedVendors]);

  const handleSearch = debounce((query) => {
    setFilters({ ...filters, vendorName: query.trim() });
  }, 500);

  const renderPerformanceStars = (score) => {
    if (score === undefined || score === null) {
      return (
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((i) => (
            <FaStar key={`empty-${i}`} className="text-gray-300" />
          ))}
          <span className="ml-2 text-sm text-gray-600">Not evaluated</span>
        </div>
      );
    }

    const stars = [];
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStar key="half" className="text-yellow-400 opacity-50" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="text-gray-300" />);
    }

    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-2 text-sm text-gray-600">{score.toFixed(1)}</span>
      </div>
    );
  };

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
        ...evaluationForm,
        vendorId: evaluatingVendor.id,
        evaluatorId: userId,
        deliveryTimeliness: parseInt(evaluationForm.deliveryTimeliness, 10),
        productQuality: parseInt(evaluationForm.productQuality, 10),
        pricingCompetitiveness: parseInt(evaluationForm.pricingCompetitiveness, 10),
        customerService: parseInt(evaluationForm.customerService, 10),
        complianceAndSecurity: parseInt(evaluationForm.complianceAndSecurity || "0", 10),
        innovation: parseInt(evaluationForm.innovation || "0", 10),
      };

      await submitVendorEvaluation(evaluationData);

      toast.success("Vendor evaluation submitted successfully!");
      navigate("/app/procurement/vendor-evaluation");
    } catch (error) {
      toast.error("Failed to submit evaluation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getFilteredVendors = () => {
    const evaluatedVendorIds = evaluatedVendors.map((v) => v.vendor.id);
    const nonEvaluatedVendors = allVendors
      .filter((vendor) => !evaluatedVendorIds.includes(vendor.id) && vendor.deletedAt === null)
      .map((vendor) => ({
        vendor,
        evaluations: [],
        averageScore: null,
      }));

    const allVendorData = [
      ...evaluatedVendors.filter(v => v.vendor.deletedAt === null),
      ...nonEvaluatedVendors
    ];

    return allVendorData.filter((vendorData) =>
      vendorData.vendor.name
        .toLowerCase()
        .includes(filters.vendorName.toLowerCase())
    );
  };

  const filteredVendors = getFilteredVendors();
  
  const paginatedVendors = filteredVendors.slice(
    (page - 1) * limit,
    page * limit
  );

  useEffect(() => {
    setTotal(filteredVendors.length);
  }, [filteredVendors]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const handleViewProfile = (vendor) => {
    navigate(`/app/procurement/vendor-evaluation/profile/${vendor.id}`, { state: { vendor } });
  };

  const handleEvaluateClick = (vendor) => {
    navigate(`/app/procurement/vendor-evaluation/evaluate/${vendor.id}`, { 
      state: { 
        evaluatingVendor: vendor,
        evaluationForm: {
          deliveryTimeliness: "",
          productQuality: "",
          pricingCompetitiveness: "",
          customerService: "",
          complianceAndSecurity: "",
          innovation: "",
          comments: "",
        }
      } 
    });
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between">
        <h2 className="ml-2 text-xl font-bold">Vendor Evaluation</h2>
      </div>

      <div className="h-[5rem] flex flex-col md:flex-row w-full gap-4 justify-between items-center py-4">
        <div className="flex flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-shrink-0 min-w-[220px] max-w-[220px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoSearchSharp className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#77B634] focus:border-[#77B634] text-sm"
              placeholder="Vendor Name"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading && <LoadingTable />}

      {!loading && filteredVendors.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-10 bg-white rounded-lg shadow-sm p-8">
          <Lottie animationData={animationData} loop className="h-40" />
          <p className="text-gray-500 mt-4 text-lg">
            {Object.values(filters).some((filter) => filter.trim())
              ? "No matching vendors found"
              : "No vendors available"}
          </p>
        </div>
      )}

      {!loading && filteredVendors.length > 0 && (
        <table className="min-w-full divide-y divide-gray-200 table-zebra table border-collapse border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                Vendor
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                Performance Score
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                Evaluations Count
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedVendors.map((vendorData) => (
              <tr key={vendorData.vendor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium  text-gray-500">{vendorData.vendor.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderPerformanceStars(vendorData.averageScore)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vendorData.evaluations.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <Permission
                      allowedPermission={[PERMISSION_VIEW_VENDOR_EVALUATIONS]}
                    >
                      <button
                        onClick={() => handleViewProfile(vendorData.vendor)}
                        className="text-[#0047AB] hover:text-[#0047AB] transition-colors duration-200"
                      >
                        <FaEye className="h-5 w-5" />
                      </button>
                    </Permission>
                    <Permission
                      allowedPermission={[PERMISSION_EVALUATE_VENDOR]}
                    >
                      <button
                        onClick={() => handleEvaluateClick(vendorData.vendor)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-[#77B634] hover:bg-[#5a8f2a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#77B634] transition-colors duration-200"
                      >
                        Evaluate
                      </button>
                    </Permission>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination
        total={total}
        limit={limit}
        page={page}
        handlePageChange={setPage}
        handleLimitChange={setLimit}
      />
    </div>
  );
};

const WrappedLanding = withAuth(VendorPerformanceList, false);
export default () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);
