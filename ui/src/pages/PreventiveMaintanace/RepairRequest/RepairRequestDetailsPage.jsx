import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../utils/apiInterceptor";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import RequestSummary from "../../../components/RepairRequest/DetailsPage/RequestSummary";
import RepairRequestStats from "../../../components/RepairRequest/DetailsPage/RepairRequestStats";
import RepairDevicesList from "../../../components/RepairRequest/DetailsPage/RepairDevicesList";
import { FiFileText } from "react-icons/fi";
import { FiMonitor } from "react-icons/fi";
import { IoMdArrowBack } from "react-icons/io";
import RepairRequestStatus from "../../../components/RepairRequest/RepairRequestStatus";
import RepairRequestSeverity from "../../../components/RepairRequest/RepairRequestSeverity";

const tabs = [
  {
    label: "Overview",
    icon: FiFileText,
  },
  {
    label: "Devices",
    icon: FiMonitor,
  },
];

function RepairRequestDetailsPage() {
  const { id: requestId } = useParams();
  const [repairRequest, setRepairRequest] = useState(undefined);
  const [activeTab, setActiveTab] = useState(tabs[0].label);
  const [loading, setLoading] = useState(false);

  const fetchRepairRequestDetails = async (id) => {
    try {
      setLoading(true);
      const result = await api.get(`/api/repair-requests/${id}`, {});
      setRepairRequest(result.data.data.repairRequest);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairRequestDetails(requestId);
  }, [requestId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-32 grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {new Array(4).fill(undefined).map((_, idx) => {
                return (
                  <div key={idx} className="bg-gray-200 h-full rounded-md" />
                );
              })}
            </div>
            <div className="h-32 bg-gray-200 rounded w-full mb-6"></div>
            <div className="h-96 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!repairRequest) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 p-4 rounded-md flex flex-row items-center gap-4">
            <Link
              to={"/app/preventive-maintenance/repair-request"}
              className="flex flex-row items-center bg-white border border-gray-200 px-4 py-1.5 rounded-md hover:bg-gray-100"
            >
              <IoMdArrowBack className="size-4 mr-1" />
              Back
            </Link>

            <p className="text-red-600">Repair request was not found</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full p-6 space-y-4">
        <div className="w-full flex flex-row gap-4 justify-between items-center">
          <div className="flex flex-row gap-4 items-center">
            <Link
              to={"/app/preventive-maintenance/repair-request"}
              className="flex flex-row items-center bg-white border border-gray-200 px-4 py-1.5 rounded-md hover:bg-gray-100"
            >
              <IoMdArrowBack className="size-4 mr-1" />
              Back
            </Link>

            <h3 className="font-bold text-xl lg:text-2xl">{`RR-${requestId}`}</h3>
          </div>

          <div className="flex flex-row gap-4 items-center">
            <RepairRequestSeverity label={repairRequest?.severity || ""} />
            <RepairRequestStatus label={repairRequest?.currentStatus || ""} />
          </div>
        </div>

        <RepairRequestStats
          repairDevices={repairRequest?.repairDevices || []}
        />

        <section className="w-full bg-white rounded-md shadow-lg p-6 space-y-6 border border-gray-300">
          <div className="w-full flex flex-row gap-6 bg-white rounded-md p-2 transition-all duration-150 ease-in-out">
            {tabs.map((tab, idx) => {
              const active = tab.label == activeTab;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveTab(tab.label);
                  }}
                  className={`border border-gray-200 flex-1 flex flex-row items-center justify-center justify-self-center gap-4 p-4 rounded-md 
                  transition-all duration-150 ease-in-out hover:bg-gray-600/10 hover:text-gray-600 text-gray-500
                  ${active ? "bg-gray-600/20 text-black" : ""}`}
                >
                  <tab.icon className={`size-6`} /> {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab == tabs[0].label && (
            <RequestSummary repairRequest={repairRequest} />
          )}

          {activeTab == tabs[1].label && (
            <RepairDevicesList repairDevices={repairRequest.repairDevices} />
          )}
        </section>
      </div>
    </MainLayout>
  );
}

export default RepairRequestDetailsPage;
