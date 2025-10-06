import React, { useEffect, useState } from "react";
import api from "../../utils/apiInterceptor";
import { FiFileText } from "react-icons/fi";
import { CiLocationOn } from "react-icons/ci";
import { FaRegUser } from "react-icons/fa6";
import { LuCalendar } from "react-icons/lu";
import { IoWarningOutline } from "react-icons/io5";
import { TfiNewWindow } from "react-icons/tfi";
import { createExcerptByWords } from "../../utils/util";
import { Link } from "react-router-dom";

const cache = {};

const QuickView = ({ requestId, onClose }) => {
   const [repairRequest, setRepairRequest] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   const SEVERITY_COLORS = {
      high: "bg-orange-500",
      critical: "bg-red-500",
      low: "bg-blue-500",
      medium: "bg-gray-500"
   };

   const colorsMap = {
      "submitted": "bg-blue-500/30 text-blue-500",
      "in_progress": "bg-purple-500/30 text-purple-500",
      "completed": "bg-green-500/30 text-green-500",
   }

   const { 
      createdAt, 
      description, 
      location, 
      assignedTo, 
      createdBy, 
      severity, 
      repairDevices, 
      currentStatus, 
      deviceType
   } = repairRequest || {};

   const sentenceCase = (str) => {
      if (!str) return '';
      const word = str.toLowerCase();
      return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
   };

   const formatDate = (dateToFormat) => {
      if (!dateToFormat) return '';
      const date = new Date(dateToFormat);
      return date.toLocaleString('en-US', {
         month: 'short',
         day: 'numeric',
         year: 'numeric',
         hour: '2-digit',
         minute: '2-digit',
         hour12: true
      });
   };

   const fetchRepairRequest = async () => {
      const URL = `/api/repair-requests/${requestId}`;

      try {
         setLoading(true);
         setError(null);
         if (URL in cache) {
            setRepairRequest(cache[URL]);
         } else {
         const response = await api.get(URL);
         const { repairRequest } = response?.data?.data;
         cache[URL] = repairRequest;
         setRepairRequest(repairRequest);
         }
      } catch (error) {
         setError('Failed to load repair request details');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (requestId) {
         fetchRepairRequest();
      }
   }, [requestId]);

   if (loading) {
      return (
         <section className="p-4 sm:p-6">
            <div className="flex items-center justify-center py-12">
               <p className="text-gray-500">Loading...</p>
            </div>
         </section>
      );
   }

   if (error) {
      return (
         <section className="p-4 sm:p-6">
            <div className="flex items-center justify-center py-12">
               <p className="text-red-500">{error}</p>
            </div>
         </section>
      );
   }

   if (!repairRequest) {
      return null;
   }

   return (
      <section className="p-4 sm:p-6 m-w-[100%] md:max-w-6xl mx-auto">
         <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 pb-4 border-b-2 border-gray-200">
               <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {`RR-${new Date(createdAt).getFullYear()}-${requestId}`}
               </h1>
               <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold text-white ${SEVERITY_COLORS[severity.toLowerCase()]}`}>
                     {sentenceCase(severity)}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${colorsMap[currentStatus.toLowerCase()]}`}>
                     {sentenceCase(currentStatus)}
                  </span>
               </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
               {/* Left Column */}
               <div className="space-y-4">
                  <div>
                     <h3 className="flex items-center text-sm font-semibold text-gray-700 gap-x-2 mb-1">
                        <FiFileText className="flex-shrink-0" /> Description
                     </h3>
                     <p className="text-gray-900">{ createExcerptByWords(description) || 'N/A'}</p>
                  </div>

                  <div>
                     <h3 className="flex items-center text-sm font-semibold text-gray-700 gap-x-2 mb-1">
                        <CiLocationOn className="flex-shrink-0" /> Location
                     </h3>
                     <p className="text-gray-900">{sentenceCase(location) || 'N/A'}</p>
                  </div>

                  <div>
                     <h3 className="flex items-center text-sm font-semibold text-gray-700 gap-x-2 mb-1">
                        <IoWarningOutline className="flex-shrink-0" /> Severity
                     </h3>
                     <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold text-white ${SEVERITY_COLORS[severity.toLowerCase()]}`}>{sentenceCase(severity) || 'N/A'}</span>
                  </div>
               </div>

               {/* Right Column */}
               <div className="space-y-4">
                  <div>
                     <h3 className="flex items-center text-sm font-semibold text-gray-700 gap-x-2 mb-1">
                        <FaRegUser className="flex-shrink-0" /> Assigned To
                     </h3>
                     <p className="text-gray-900">
                        {assignedTo ? `${assignedTo.firstName} ${assignedTo.lastName}` : 'Unassigned'}
                     </p>
                  </div>

                  <div>
                     <h3 className="flex items-center text-sm font-semibold text-gray-700 gap-x-2 mb-1">
                        <FaRegUser className="flex-shrink-0" /> Submitted By
                     </h3>
                     <p className="text-gray-900">
                        {createdBy ? `${createdBy.firstName} ${createdBy.lastName}` : 'N/A'}
                     </p>
                  </div>

                  <div>
                     <h3 className="flex items-center text-sm font-semibold text-gray-700 gap-x-2 mb-1">
                        <LuCalendar className="flex-shrink-0" /> Submitted At
                     </h3>
                     <p className="text-gray-900">{formatDate(createdAt)}</p>
                  </div>
               </div>
            </div>

            {/* Affected Devices Section */}
            <div className="mb-6">
               <h4 className="font-bold text-gray-900 mb-3">Affected Devices</h4>
               {repairDevices && repairDevices.length > 0 ? (
                  <ul className="space-y-2 mb-4">
                     {repairDevices.slice(0, 3).map((device, index) => (
                        <li 
                           key={device?.device?.serialNumber || index} 
                           className="p-3 bg-gray-100 rounded-md text-sm"
                        >
                           {sentenceCase(deviceType?.name)} - {device?.device?.serialNumber}
                        </li>
                     ))}
                  </ul>
               ) : (
                  <p className="text-gray-500 text-sm mb-4">No devices listed</p>
               )}

               <hr className="border-gray-300 my-6" />

               <h4 className="font-bold text-gray-900 mb-2">Device Type</h4>
               <div>
                  <span className="inline-flex items-center rounded-full border border-gray-300 px-3 py-1 text-sm font-medium bg-white">
                     {sentenceCase(deviceType?.name) || 'N/A'}
                  </span>
               </div>
            </div>

            <hr className="border-gray-300 my-6" />

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold border border-gray-300 py-2.5 px-4 rounded-md transition duration-200"
               >
                  Close
               </button>
               <Link
                  to={`/app/preventive-maintenance/repair-request/${requestId}`}
                  className="w-full bg-[#8BC34A] hover:bg-[#7CB342] font-semibold text-white py-2.5 px-4 rounded-md transition duration-200 flex items-center justify-center gap-2"
               >
                  <TfiNewWindow className="text-md" />
                  <span>View Full Details</span>
               </Link>
            </div>
         </div>
      </section>
   );
};

export default QuickView;