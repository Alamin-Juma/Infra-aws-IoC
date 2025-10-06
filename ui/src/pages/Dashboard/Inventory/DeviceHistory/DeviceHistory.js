import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Users, AlertTriangle, Tags } from 'lucide-react';

const DeviceHistoryTable = ({ deviceId = "demo-device" }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filterConfig, setFilterConfig] = useState({ activity: '', status: '' });
  const recordsPerPage = 5;

  useEffect(() => {
    // Mock data - in a real app, this would come from an API
    const mockHistory = [
      {
        id: 1,
        activity: 'Assigned',
        date: '2025-03-10T14:30:00',
        performedBy: 'John Smith',
        assignedTo: 'Emma Johnson',
        previousOwner: '',
        status: 'In Use'
      },
      {
        id: 2,
        activity: 'Unassigned',
        date: '2025-02-15T10:22:00',
        performedBy: 'John Smith',
        assignedTo: '',
        previousOwner: 'Emma Johnson',
        status: 'Available'
      },
      {
        id: 3,
        activity: 'Marked Damaged',
        date: '2025-01-20T16:45:00',
        performedBy: 'Michael Brown',
        assignedTo: '',
        previousOwner: 'Emma Johnson',
        status: 'Damaged'
      },
      {
        id: 4,
        activity: 'Assigned',
        date: '2024-12-05T09:15:00',
        performedBy: 'Sarah Wilson',
        assignedTo: 'Emma Johnson',
        previousOwner: 'David Lee',
        status: 'In Use'
      },
      {
        id: 5,
        activity: 'Unassigned',
        date: '2024-11-20T11:30:00',
        performedBy: 'Sarah Wilson',
        assignedTo: '',
        previousOwner: 'David Lee',
        status: 'Available'
      },
      {
        id: 6,
        activity: 'Assigned',
        date: '2024-10-15T14:00:00',
        performedBy: 'Michael Brown',
        assignedTo: 'David Lee',
        previousOwner: '',
        status: 'In Use'
      },
      {
        id: 7,
        activity: 'Decommissioned',
        date: '2024-09-01T15:20:00',
        performedBy: 'John Smith',
        assignedTo: '',
        previousOwner: 'David Lee',
        status: 'Decommissioned'
      }
    ];
    
    setHistory(mockHistory);
    setTotalPages(Math.ceil(mockHistory.length / recordsPerPage));
    setLoading(false);
    setError(null);
  }, [deviceId]);

  // Sorting function
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filtering function
  const handleFilterChange = (key, value) => {
    setFilterConfig({
      ...filterConfig,
      [key]: value
    });
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Apply sorting and filtering
  const getSortedAndFilteredData = () => {
    let filteredData = [...history];
    
    // Apply filters
    if (filterConfig.activity) {
      filteredData = filteredData.filter(item => 
        item.activity.toLowerCase().includes(filterConfig.activity.toLowerCase())
      );
    }
    
    if (filterConfig.status) {
      filteredData = filteredData.filter(item => 
        item.status.toLowerCase().includes(filterConfig.status.toLowerCase())
      );
    }
    
    // Apply sorting
    filteredData.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return filteredData;
  };

  // Get current page data
  const getCurrentPageData = () => {
    const sortedAndFilteredData = getSortedAndFilteredData();
    setTotalPages(Math.ceil(sortedAndFilteredData.length / recordsPerPage));
    
    const startIndex = (currentPage - 1) * recordsPerPage;
    return sortedAndFilteredData.slice(startIndex, startIndex + recordsPerPage);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Use':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
          {status}
        </span>;
      case 'Available':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <span className="h-2 w-2 rounded-full bg-blue-500 mr-1.5"></span>
          {status}
        </span>;
      case 'Damaged':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <span className="h-2 w-2 rounded-full bg-orange-500 mr-1.5"></span>
          {status}
        </span>;
      case 'Decommissioned':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <span className="h-2 w-2 rounded-full bg-red-500 mr-1.5"></span>
          {status}
        </span>;
      default:
        return <span>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="text-center py-8">
          <p className="text-gray-500">Loading device history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center py-8 text-red-500">
          <AlertTriangle className="mr-2" size={20} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="text-center py-8">
          <p className="text-gray-500">No history records found for this device.</p>
        </div>
      </div>
    );
  }

  const currentData = getCurrentPageData();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Device History</h2>
        
        <div className="flex space-x-4">
          <div>
            <label htmlFor="activity-filter" className="block text-sm font-medium text-gray-700 mb-1">Activity</label>
            <select
              id="activity-filter"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filterConfig.activity}
              onChange={(e) => handleFilterChange('activity', e.target.value)}
            >
              <option value="">All Activities</option>
              <option value="Assigned">Assigned</option>
              <option value="Unassigned">Unassigned</option>
              <option value="Marked Damaged">Marked Damaged</option>
              <option value="Decommissioned">Decommissioned</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status-filter"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filterConfig.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="In Use">In Use</option>
              <option value="Available">Available</option>
              <option value="Damaged">Damaged</option>
              <option value="Decommissioned">Decommissioned</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('activity')}
              >
                <div className="flex items-center">
                  <Tags size={16} className="mr-1" />
                  Activity
                  {sortConfig.key === 'activity' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('date')}
              >
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  Date
                  {sortConfig.key === 'date' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('performedBy')}
              >
                <div className="flex items-center">
                  <User size={16} className="mr-1" />
                  Performed By
                  {sortConfig.key === 'performedBy' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('assignedTo')}
              >
                <div className="flex items-center">
                  <Users size={16} className="mr-1" />
                  Assigned To
                  {sortConfig.key === 'assignedTo' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('previousOwner')}
              >
                <div className="flex items-center">
                  <User size={16} className="mr-1" />
                  Previous Owner
                  {sortConfig.key === 'previousOwner' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {sortConfig.key === 'status' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.activity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatDate(item.date)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.performedBy}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.assignedTo || '—'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.previousOwner || '—'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * recordsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * recordsPerPage, getSortedAndFilteredData().length)}
                </span>{' '}
                of <span className="font-medium">{getSortedAndFilteredData().length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                    currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      currentPage === i + 1
                        ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                    currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceHistoryTable;
