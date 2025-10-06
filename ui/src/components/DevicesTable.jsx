import React from 'react';
import { formatDate } from '../utils/formatDate';
import animationData from '../assets/lottie/no-data.json';

const DevicesTable = ({data}) => {
    return (
        <div className="flex w-full overflow-x-auto">
          <table className="table-zebra table">
            <thead>
              <tr>
                <th>Device Id</th>
                <th>Manufacturer</th>
                <th>Serial No.</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
              
                <tr>
                  <td colSpan="4" className="text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Lottie animationData={animationData} loop={true} className="h-40" />
                      <span className="text-gray-600 text-lg font-semibold">No Data</span>
                    </div>
                  </td>
                </tr>
              ) : (
                // Corrected mapping for device fields
                data.map((device) => (
                  <tr key={device.id}>
                    <th>{device.id}</th>
                    <td>{device.manufacturerId}</td> {/* Assuming manufacturerId maps to name */}
                    <td>{device.serialNumber}</td>
                    <td>{device.deviceStatusId}</td> {/* Assuming this represents status */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      );
}

export default DevicesTable;
