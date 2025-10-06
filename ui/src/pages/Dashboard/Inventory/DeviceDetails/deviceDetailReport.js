import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { format, subDays } from 'date-fns';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import animationData from '../../../../assets/lottie/no-history1.json';

const DeviceHistoryReport = ({ deviceId, deviceHistory }) => {
  const today = new Date();
  const [fromDate, setFromDate] = useState(subDays(today, 30));
  const [toDate, setToDate] = useState(today);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  
  useEffect(() => {
    // Filter history based on date range
    if (deviceHistory) {
      const filtered = deviceHistory.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= fromDate && entryDate <= toDate;
      });
      setFilteredHistory(filtered);
    }
  }, [deviceHistory, fromDate, toDate]);

  const handleExport = (type) => {
    if (filteredHistory.length === 0) {
      // Show error notification
      showNotification("No history found for the given date range.", "error");
      return;
    }

    // Implement export logic based on type (CSV or PDF)
    if (type === 'csv') {
      exportCSV();
    } else if (type === 'pdf') {
      exportPDF();
    }
    
    setShowExportDropdown(false);
  };

  const showNotification = (message, type) => {
    // Use RippleUI's notification system
    const notificationEl = document.getElementById('notification');
    if (notificationEl) {
      notificationEl.innerText = message;
      notificationEl.className = `alert ${type === 'error' ? 'alert-error' : 'alert-success'}`;
      notificationEl.style.display = 'flex';
      setTimeout(() => {
        notificationEl.style.display = 'none';
      }, 3000);
    } else {
      alert(message); // Fallback
    }
  };

  const exportCSV = () => {
    // Convert data to CSV format
    const headers = ['Action', 'Notes', 'Performed By', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredHistory.map(entry => [
        `"${entry.action}"`,
        `"${entry.notes}"`,
        `"${entry.performedBy}"`,
        `"${format(new Date(entry.date), 'MM/dd/yyyy hh:mm a')}"`
      ].join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `device-history-${deviceId}-${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification("Report exported successfully!", "success");
  };

  const exportPDF = () => {
    if (filteredHistory.length === 0) {
      showNotification("No history found for the given date range.", "error");
      return;
    }
  
    const doc = new jsPDF();
    
    // Title
    doc.text("Device History Report", 14, 10);
  
    // Define table columns
    const tableColumn = ["Action", "Notes", "Performed By", "Date"];
    
    // Extract row data
    const tableRows = filteredHistory.map(entry => [
      entry.action,
      entry.notes,
      entry.performedBy,
      format(new Date(entry.date), 'MM/dd/yyyy hh:mm a')
    ]);
  
    // Call autoTable correctly
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
  
    // Save the PDF
    doc.save(`device-history-${deviceId}-${format(new Date(), 'yyyyMMdd')}.pdf`);
  
    showNotification("Report exported successfully!", "success");
  };
  
  

  return (
    <div className="space-y-4">
      {/* Notification Element */}
      <div id="notification" className="alert hidden" role="alert"></div>
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Device History Report</h2>
        
        <div className="flex items-center gap-2 justify-center">
          {/* Date Range Filter */}
          <div className="flex items-center gap-2 justify-center">
            <div className="form-group">
              <label className="text-sm font-medium">From:</label>
              <input 
                type="date" 
                className="input input-bordered w-full max-w-xs" 
                value={format(fromDate, 'yyyy-MM-dd')}
                onChange={(e) => setFromDate(new Date(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="text-sm font-medium">To:</label>
              <input 
                type="date" 
                className="input input-bordered w-full max-w-xs" 
                value={format(toDate, 'yyyy-MM-dd')}
                onChange={(e) => setToDate(new Date(e.target.value))}
              />
            </div>
          </div>

          {/* Export Button with Dropdown */}
          <div className="relative ">
            <button 
              className="btn btn-primary flex items-center gap-1 mt-7 bg-[#77B634]"
              onClick={() => setShowExportDropdown(!showExportDropdown)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>
              <span>Export</span>
            </button>
            
            {showExportDropdown && (
              <div className="absolute right-0 mt-1 bg-white shadow-md rounded z-10">
                <ul className="menu">
                  <li>
                    <button 
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 w-full text-left"
                      onClick={() => handleExport('csv')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
                      <span>CSV</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 w-full text-left"
                      onClick={() => handleExport('pdf')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <span>PDF</span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Table */}
      <table className="table-auto w-full text-left border-collapse">
        {filteredHistory.length === 0 ? (
          <tbody>
            <tr>
              <td colSpan="4" className="text-center">
                <div className="flex flex-col items-center justify-center">
                  <Lottie animationData={animationData} loop={true} className="h-40" />
                  <span className="text-gray-600 text-lg font-semibold">
                    No history found for the given date range.
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        ) : (
          <>
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border-b">Action</th>
                <th className="p-2 border-b">Notes</th>
                <th className="p-2 border-b">Performed By</th>
                <th className="p-2 border-b">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((entry, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{entry.action}</td>
                  <td className="p-2">{entry.notes}</td>
                  <td className="p-2">{entry.performedBy}</td>
                  <td className="p-2">{format(new Date(entry.date), 'MM/dd/yyyy hh:mm a')}</td>
                </tr>
              ))}
            </tbody>
          </>
        )}
      </table>
    </div>
  );
};

export default DeviceHistoryReport;
