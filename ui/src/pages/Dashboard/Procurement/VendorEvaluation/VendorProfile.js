import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaStar, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../../../layouts/MainLayout";
import withAuth from "../../../../utils/withAuth";
import { fetchVendorEvaluations } from "./vendorService";

const VendorProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vendor, setVendor] = useState(location.state?.vendor);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const allEvaluations = await fetchVendorEvaluations();
        const vendorEvaluations = allEvaluations
          .filter((evaluation) => evaluation.vendorId === vendor.id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setEvaluations(vendorEvaluations);
      }  finally {
        setLoading(false);
      }
    };

    if (vendor) {
      fetchEvaluations();
    } else {
      navigate("/app/procurement/vendor-evaluation");
    }
  }, [vendor, navigate]);

  const calculateAverageScore = () => {
    if (evaluations.length === 0) return null;
    
    const totalScore = evaluations.reduce((acc, evaluation) => {
      const evaluationScore = (
        evaluation.deliveryTimeliness +
        evaluation.productQuality +
        evaluation.pricingCompetitiveness +
        evaluation.customerService +
        (evaluation.complianceAndSecurity || 0) +
        (evaluation.innovation || 0)
      ) / 6;
      return acc + evaluationScore;
    }, 0);

    return (totalScore / evaluations.length).toFixed(1);
  };

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
        <span className="ml-2 text-sm text-gray-600">{score}</span>
      </div>
    );
  };

  if (!vendor) {
    return null;
  }

  const averageScore = calculateAverageScore();

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
              {vendor.name}
            </h2>
          </div>
          
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-gray-600">{vendor.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Phone</p>
                <p className="text-gray-600">{vendor.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Address</p>
                <p className="text-gray-600">{vendor.physicalAddress || "N/A"}</p>
              </div>
            </div>
          </div>

         
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Score</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Average Score</p>
                  <p className="text-sm  text-gray-600">
                    {averageScore ? `${averageScore} / 5.0` : "No evaluations yet"}
                  </p>
                </div>
                {averageScore && renderPerformanceStars(averageScore)}
              </div>
            </div>
          </div>
         
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Evaluation History</h3>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#77B634] hover:bg-[#5a8f2a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#77B634] transition-colors duration-200"
              >
                {showDetails ? (
                  <>
                    <span>Hide Details</span>
                    <FaChevronUp className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>View Details</span>
                    <FaChevronDown className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            {showDetails && (
              <div className="mt-4 space-y-6">
                {evaluations.map((evaluation, index) => {
                  const evaluationScore = (
                    evaluation.deliveryTimeliness +
                    evaluation.productQuality +
                    evaluation.pricingCompetitiveness +
                    evaluation.customerService +
                    (evaluation.complianceAndSecurity || 0) +
                    (evaluation.innovation || 0)
                  ) / 6;

                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          
                        </div>
                        {renderPerformanceStars(evaluationScore.toFixed(1))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                          <p className="text-sm font-medium text-gray-900">Evaluated By</p>
                          <p className="text-gray-600">{evaluation.evaluator?.firstName} {evaluation.evaluator?.lastName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Date</p>
                          <p className="text-gray-600">
                          {new Date(evaluation.createdAt).toLocaleDateString('en-US', {
                              month: '2-digit',
                              day: '2-digit',
                              year: '2-digit'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Delivery Timeliness</p>
                          <p className="text-gray-600">{evaluation.deliveryTimeliness}/5</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-900">Product Quality</p>
                          <p className="text-gray-600">{evaluation.productQuality}/5</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Pricing Competitiveness</p>
                          <p className="text-gray-600">{evaluation.pricingCompetitiveness}/5</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Customer Service</p>
                          <p className="text-gray-600">{evaluation.customerService}/5</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Compliance and Security</p>
                          <p className="text-gray-600">{evaluation.complianceAndSecurity || 0}/5</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Innovation</p>
                          <p className="text-gray-600">{evaluation.innovation || 0}/5</p>
                        </div>
                      </div>

                      {evaluation.comments && (
                        <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Comments</p>
                        <p className="text-gray-600 whitespace-pre-wrap break-words w-full">
                          {evaluation.comments}
                        </p>
                      </div>
                      
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const WrappedVendorProfile = withAuth(VendorProfile, false);
export default () => (
  <MainLayout>
    <WrappedVendorProfile />
  </MainLayout>
); 