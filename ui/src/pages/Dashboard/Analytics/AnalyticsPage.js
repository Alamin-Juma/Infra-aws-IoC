import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import withAuth from "../../../utils/withAuth";
import DonutChart from "../../../components/Charts/Doughnut";
import InventorySummaryChart from "../../../components/Charts/InventorySummary";
import IncidentChart from "../../../components/Charts/IncidentChart";
import { CountUp } from "use-count-up";
import api from "../../../utils/apiInterceptor";
import { formatDate } from "../../../utils/formatDate";
import { toSentenceCase } from "../../../../../api/src/components/dashboard_stats/sentenceCaseHelper";
import { useNavigate } from "react-router-dom";
import { toPascalCase } from "../../../utils/toPascalCase";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(false);
  const [coondtionStats, setConditionStats] = useState([]);
  const [typeStats, setByTypeStats] = useState([]);
  const [requestsArr, setRequestsArr] = useState([]);
  const [monthsArr, setMonthsArr] = useState([]);
  const [mouseStats, setMouseStats] = useState([]);
  const [monitorStats, setMonitorStats] = useState([]);
  const [laptopStats, setLaptopStats] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [ticketsList, setList] = useState([]);

  const navigate = useNavigate();

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const SamplePrevArrow = ({ onClick }) => (
    <div
      className="absolute z-20 left-[-20px] top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 cursor-pointer"
      onClick={onClick}
    >
      <IoIosArrowBack className="text-gray-800 text-xl" />
    </div>
  );

  const SampleNextArrow = ({ onClick }) => (
    <div
      className="absolute z-20 right-[-20px] top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 cursor-pointer"
      onClick={onClick}
    >
      <IoIosArrowForward className="text-gray-800 text-xl" />
    </div>
  );

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    prevArrow: <SamplePrevArrow />,
    nextArrow: <SampleNextArrow />,
    responsive: [
      {
        breakpoint: 1536,
        settings: { slidesToShow: 5 },
      },
      {
        breakpoint: 1280,
        settings: { slidesToShow: 4 },
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 2 },
      },
    ],
  };

  const lowStockDevices = ticketsList.filter(
    (device) => device?.availableCount < device?.low_stock_limit
  );

  const viewRequest = (id) => {
    navigate(`/app/external-requests/request-details/${id}`);
  };
  const fetchDeviceStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/analytics/statistics");
      if (res.status === 200) {
        setLoading(false);
        setConditionStats(res.data.data.byCondition);
        setByTypeStats(res.data.data.byType);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/analytics/monthly-requests");
      if (res.status === 200) {
        setLoading(false);

        const valuesArray = res.data.data.map((month) => month.value);

        setRequestsArr(valuesArray);

        const currentMonthIndex = new Date().getMonth();

        const monthsUntilNow = months.slice(0, currentMonthIndex + 1);

        setMonthsArr(monthsUntilNow);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const fetchDevicesSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/analytics/devices-summary");
      if (res.status === 200) {
        setLoading(false);
        const mouseStats = res.data.data.filter(
          (m) => m.deviceType === "Mouse"
        );
        const laptopStats = res.data.data.filter(
          (m) => m.deviceType === "Laptop"
        );
        const monitorStats = res.data.data.filter(
          (m) => m.deviceType === "Monitor"
        );
        setMouseStats(mouseStats);
        setMonitorStats(monitorStats);
        setLaptopStats(laptopStats);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const fetchExternalRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/externalRequest?page=${1}&limit=${10}`);
      setRequestsList(response?.data?.data?.requests);
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeviceTypeData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/devices/count`);
      setList(response.data.devices);
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceStats();
    fetchMonthlyStats();
    fetchDevicesSummary();
    fetchExternalRequests();
    fetchDeviceTypeData();
  }, []);

  return (
    <div className="flex w-full flex-row flex-wrap gap-4 p-4 ">
      {lowStockDevices.length > 0 && (
        <div className="w-full mt-8">
          <h2 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
            <span>⚠️</span> Low Stock Devices
          </h2>
          <div className="relative">
            <Slider {...sliderSettings}>
              {lowStockDevices.map((device) => (
                <div key={device.deviceType} className="px-2">
                  <div className="border border-gray-200 rounded-xl shadow-md p-5 bg-white cursor-pointer transform transition-all duration-300">
                    <div className="text-center mb-4">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {toPascalCase(device?.deviceType)}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-center">
                        <p className="text-xs text-green-600">Available</p>
                        <p className="font-bold text-xl text-green-800">
                          {device?.availableCount}
                        </p>
                      </div>
                      <div className="bg-violet-50 p-3 rounded-lg border border-violet-100 text-center">
                        <p className="text-xs text-violet-600">
                          Low Stock Limit
                        </p>
                        <p className="font-bold text-xl text-violet-800">
                          {device?.low_stock_limit}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                      <p className="text-sm text-red-600 font-medium">
                        Below stock limit!
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      )}

      <div className="my-4 grid w-full grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-2">
          {loading ? (
            <div className="skeleton h-64"></div>
          ) : (
            <DonutChart data={coondtionStats} className={"scale-90"} />
          )}
        </div>
        <div className="border rounded p-2">
          {loading ? (
            <div className="skeleton h-64"></div>
          ) : (
            <InventorySummaryChart data={typeStats} />
          )}
        </div>
      </div>

      <div className="border rounded p-2 w-full">
        {loading ? (
          <div className="skeleton h-80"></div>
        ) : (
          <IncidentChart data={requestsArr} months={monthsArr} />
        )}
      </div>

      <div className="border rounded p-2 w-full">
        <div className="mb-2">
          <h3 className="font-semibold">Latest Requests</h3>
        </div>
        <div className="flex w-full overflow-x-auto">
          <table className="table border-collapse border border-gray-200">
            <thead>
              <tr>
                <th>Date</th>
                <th>Ticket No.</th>
                <th>Requestor</th>
                <th>Request Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requestsList.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => viewRequest(m.id)}
                  className="hover:bg-gray-100 hover:cursor-pointer"
                >
                  <td>{formatDate(m.createdAt)}</td>
                  <td>{m.ticketTrails[0]?.ticketId}</td>
                  <td>
                    {toPascalCase(m.user.firstName)}{" "}
                    {toPascalCase(m.user.lastName)}
                  </td>
                  <td>{toSentenceCase(m.requestType?.label)}</td>
                  <td>
                    {m?.requestStatus === "PENDING" ? (
                      <span class="badge badge-primary">Pending</span>
                    ) : (
                      <span class="badge badge-success">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const WrappedLanding = withAuth(AnalyticsPage, false);
export default () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);
