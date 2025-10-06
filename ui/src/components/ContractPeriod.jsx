import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ContractPeriod = ({ vendorId }) => {
  const [contractPeriod, setContractPeriod] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    axios.get(`/api/vendors/${vendorId}/contracts`)
      .then((res) => {
        const contract = res.data[0];
        setContractPeriod({
          startDate: contract.startDate,
          endDate: contract.endDate,
        });
      })
      .catch(() => alert("Failed to load contract period."));
  }, [vendorId]);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-l font-semibold text-gray-800 mb-4">Contract Period</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
        <div>
          <span className="font-medium text-sm">Start Date:</span> {contractPeriod.startDate}
        </div>
        <div>
          <span className="font-medium text-sm">End Date:</span> {contractPeriod.endDate}
        </div>
      </div>
    </div>
  );
};

export default ContractPeriod;
