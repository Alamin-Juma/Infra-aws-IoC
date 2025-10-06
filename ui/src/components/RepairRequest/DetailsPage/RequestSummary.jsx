import React from "react";
import { FiFileText } from "react-icons/fi";
import { RxPerson } from "react-icons/rx";
import { formatDate } from "../../../utils/formatDate";

function RequestSummary({ repairRequest }) {
  const LineItem = ({ label, description }) => {
    return (
      <div className="flex flex-col py-3 border-b border-b-gray-100 gap-1">
        <h6 className="text-sm text-gray-500 font-medium">{label}</h6>
        <p className="text-base text-black">{description}</p>
      </div>
    );
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="border border-green-700/30 rounded-md p-5 shadow-md">
        <div className="flex flex-row gap-2 items-center mb-4">
          <FiFileText className="text-green-400 size-6" />
          <h4 className="text-lg md:text-xl font-bold text-black">
            Request Information
          </h4>
        </div>

        <LineItem
          label={"Description"}
          description={repairRequest?.description || ""}
        />
        <LineItem label={"Location"} description={repairRequest?.location} />
        <LineItem
          label={"Device Type"}
          description={repairRequest?.deviceType?.name}
        />
      </div>

      <div className="border border-green-700/30 rounded-md p-5 shadow-md">
        <div className="flex flex-row gap-2 items-center mb-4">
          <RxPerson className="text-green-400 size-6" />
          <h4 className="text-lg md:text-xl font-bold text-black">
            Assignement & Status
          </h4>
        </div>

        <LineItem
          label={"Assigned User"}
          description={`${repairRequest?.assignedTo?.firstName} ${repairRequest?.assignedTo?.lastName}`}
        />

        <LineItem
          label={"Submitted By"}
          description={`${repairRequest?.createdBy?.firstName} ${repairRequest?.createdBy?.lastName}`}
        />

        <LineItem
          label={"Submitted At"}
          description={
            repairRequest?.createdAt ? formatDate(repairRequest?.createdAt) : ""
          }
        />
      </div>
    </section>
  );
}

export default RequestSummary;
