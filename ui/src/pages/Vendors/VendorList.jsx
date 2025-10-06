import React, { useState, useEffect } from 'react';
import api from '../../utils/apiInterceptor';
import { IoSearchSharp, IoTrashOutline } from 'react-icons/io5';
import { data, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BsPencilSquare } from 'react-icons/bs';
import Pagination from '../../components/Pagination';

import Swal from 'sweetalert2';
import { FaEye, FaFileUpload } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import LoadingTable from '../../components/LoadingTable';
import Lottie from 'lottie-react';
import animationData from '../../assets/lottie/no-data.json';
import { FaRegCalendarAlt } from "react-icons/fa"; 
import Permission from '../../components/Permission';
import { PERMISSION_DELETE_VENDOR, PERMISSION_MANAGE_VENDOR, PERMISSION_MANAGE_VENDOR_CONTRACTS } from '../../constants/permissions.constants';


export default function VendorList({ onEdit }) {
  const [filters, setFilters] = useState({ status: '', expiryBefore: '' });
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortKey, setSortKey] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedVendorIds, setSelectedVendorIds] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");


const sortBy = (key) => {
  const order = sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc';
  setSortKey(key);
  setSortOrder(order);

  const sorted = [...vendors].sort((a, b) => {
    const aVal = a[key]?.toString().toLowerCase() || '';
    const bVal = b[key]?.toString().toLowerCase() || '';
    return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  setVendors(sorted);
};


  const handleUpload = (id) => {
    navigate(`/app/vendors/upload-contract/${id}`);

};

useEffect(() => {
  const timerId = setTimeout(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 2000);

  return () => {
    clearTimeout(timerId);
  };
}, [searchTerm]);

const handleCheckboxChange = (id) => {
  setSelectedVendorIds(prev =>
    prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
  );
};

const handleSelectAll = () => {
  if (allSelected) {
    setSelectedVendorIds([]);
  } else {
    setSelectedVendorIds(vendors.map((v) => v.id));
  }
  setAllSelected(!allSelected);
};

const handleBulkDelete = () => {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#77B634",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete!",
  }).then((result) => {
    if (result.isConfirmed) {
      const data = { ids: selectedVendorIds };
 

      api.post(`/api/vendors/bulk/archive`, data)
        .then(() => {
          toast.success("Request archived successfully!");
          setSelectedVendorIds([]); 
          fetchVendors(); 
        })
        .catch((error) => {
          console.error("Error deleting request:", error);
          toast.error(
            "Failed to delete request. Please try again.",
            error.message
          );
        });
    }
  });
};


  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  useEffect(() => {
    fetchVendors();
  }, [page, limit, filters, debouncedSearchTerm]);


const handleEdit = (id) => {
  navigate(`/app/vendors/edit-vendor/${id}`);
};

const handleToggle = async (vendor) => {
  const isCurrentlyActive = vendor.status === 'ACTIVE';
  const action = isCurrentlyActive ? 'Deactivate' : 'Activate';

  try {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will ${action.toLowerCase()} this vendor.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#77B634',
      cancelButtonColor: '#494848',
      confirmButtonText: `Yes, ${action}!`,
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: `${action} in progress...`,
      text: `Please wait while the vendor is being ${action.toLowerCase()}.`,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const response = await api.patch(`/api/vendors/${vendor.id}/toggle-status`);

    if (response.status === 200) {
      setVendors((prevVendors) =>
        prevVendors.map((v) =>
          v.id === vendor.id
            ? { ...v, status: isCurrentlyActive ? 'INACTIVE' : 'ACTIVE' }
            : v
        )
      );

      Swal.fire({
        title: `Vendor ${action}d`,
        text: `The vendor has been successfully ${action.toLowerCase()}d.`,
        icon: 'success',
        confirmButtonColor: '#77B634',
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      throw new Error('Unexpected response status');
    }
  } catch (error) {
    Swal.fire({
      title: 'Error!',
      text: error.response?.data?.error || 'Failed to update vendor status.',
      icon: 'error',
      confirmButtonColor: '#77B634',
    });
  }
};



  const handleDelete = async(id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#77B634",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete!",
    }).then((result) => {
      if (result.isConfirmed) {
        api
          .post("/api/vendors/bulk/archive", { ids: [id] }) 
          .then((res) => {
            toast.success(res.data.message || "Vendors archived successfully!");
            fetchVendors(); 
          })
          .catch((error) => {
            console.error("Error archiving vendors:", error);
            toast.error(
              error.response?.data?.message ||
                "Failed to archive vendors. Please try again."
            );
          });
      }
    });
    
  }

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  
  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

 
  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/vendors/get-all', {

        
        params: {
          name: debouncedSearchTerm || undefined,
          status: filters.status || undefined,
          expiryBefore: filters.expiryBefore || undefined,
          page: page,
          limit: limit,

        },
      });

      setVendors(response?.data?.vendors || []);
      setTotalPages(response?.data?.totalPages || 1);
      setTotal(response?.data?.totalCount || 0);

    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  
  return (
    
  <div className="bg-white shadow rounded-lg p-6 text-sm">
    <h2 className="font-bold mb-1 ml-1">Search Vendors</h2>
    
    <div className="flex gap-4 mb-4">
        <div className="relative flex-shrink-0 min-w-[220px] max-w-[220px]"> 
        <input
          name="name"
          className="input input-bordered text-sm mt-1 w-full "
          placeholder="Vendor Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
           </div>
     
         <div className="relative flex-shrink-0 min-w-[220px] max-w-[220px]">
         <label className="text-sm font-bold mb-2 block -mt-6 w-full ml-1">Status</label>
          
          <select
            name="status"
            className="select select-bordered"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
  

     
<div className="relative flex-shrink-0 min-w-[220px] max-w-[220px]"> 
  <label className="text-sm font-bold mb-2 block -mt-6 ">Contract Expiration Date</label>
  <div className="relative w-full">
    <DatePicker
      selected={filters.expiryBefore ? new Date(filters.expiryBefore) : null}
      onChange={(date) =>
        setFilters({ ...filters, expiryBefore: date ? date.toISOString() : '' })
      }
      className="input input-bordered w-full py-2 text-sm pr-10 pl-10"
      placeholderText="mm/dd/yyyy"
      dateFormat="MM/dd/yyyy"
      isClearable={!!filters.expiryBefore}
  
     

    />
     <FaRegCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>
</div>

          </div>

          {selectedVendorIds.length > 0 && (
        <div className="mb-2">
          <button
            onClick={handleBulkDelete}
            className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
          >
            Delete Selected ({selectedVendorIds.length})
          </button>
        </div>
          )}
        

          {loading && <LoadingTable />}
          {!loading  && (<table className="w-full table table-zebra border-collapse border border-gray-200">
    <thead>
    <tr className="bg-gray-100">
      <th className="p-2 w-4">
        <input
          type="checkbox"
          onChange={handleSelectAll}
          checked={allSelected}
        />
      </th>
      <th
        className="p-2 w-1/5 cursor-pointer"
        onClick={() => sortBy('name')}
      >
        Vendor Name {sortKey === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
      </th>
      <th
        className="p-2 w-1/5 cursor-pointer"
        onClick={() => sortBy('email')}
      >
        Email {sortKey === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
      </th>
      <th
        className="p-2 w-1/6 cursor-pointer"
        onClick={() => sortBy('status')}
      >
        Status {sortKey === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
      </th>
      <th
        className="p-2 w-1/6 cursor-pointer"
        onClick={() => sortBy('contractEndDate')}
      >
        Contract Expiration Date {sortKey === 'contractEndDate' && (sortOrder === 'asc' ? '↑' : '↓')}
      </th>
      <th className="p-2 w-1/8 text-right">Actions</th>
    </tr>
  </thead>
  
      <tbody>
        {vendors.length === 0 ? (
          <tr className="w-full">
          <td colSpan="5" className="text-center w-full">
            <div className="flex flex-col items-center justify-center">
              <Lottie
                animationData={animationData}
                loop={true}
                className="h-40"
              />
              <span className="text-gray-600 text-lg font-semibold">
                No Data
              </span>
            </div>
          </td>
        </tr>
        ) : (vendors.length > 0 && (
          vendors.map((vendor) => (
            <tr key={vendor.id} className="border-b">
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={selectedVendorIds.includes(vendor.id)}
                  onChange={() => handleCheckboxChange(vendor.id)}
                />
              </td>
              <td className="p-2">{vendor.name}</td>
              <td className="p-2">{vendor.email}</td>             
              <td className="p-2">
                <Permission
                  allowedPermission={[PERMISSION_MANAGE_VENDOR]}
                >
                  <input
                    type="checkbox"
                    className="switch switch-success"
                    checked={vendor.status === "ACTIVE"}
                    disabled={loading}
                    onChange={() => handleToggle(vendor)}
                  />
                </Permission>
              </td>

              <td className="p-2">
                {vendor.contracts.length > 0
                  ? vendor.contracts[0].endDate
                    ? new Date(vendor.contracts[0].endDate).toLocaleDateString()
                    : '—' : "—"}
              </td>
              <td className=" p-2 text-right align-middle">
                <div className="inline-flex gap-2 justify-end">
                  <Permission
                    allowedPermission={[PERMISSION_MANAGE_VENDOR_CONTRACTS]}
                  >
                    <label
                      onClick={() => handleUpload(vendor.id)}
                      className="btn btn-sm bg-transparent hover:bg-gray-300"
                      title="Upload File"
                    >
                      <FaFileUpload className="text-blue-600 text-lg cursor-pointer" />
                    </label>
                  </Permission>
                  <Permission
                    allowedPermission={[PERMISSION_MANAGE_VENDOR]}
                  >
                    <label
                      onClick={() => handleEdit(vendor.id)}
                      className="btn btn-sm bg-transparent hover:bg-gray-300"
                      title="Edit Vendor"
                    >
                    <BsPencilSquare className="text-[#E3963E] text-lg cursor-pointer" />
                  </label>
                  </Permission>
                  
                  <Permission
                    allowedPermission={[PERMISSION_DELETE_VENDOR]}
                  >
                    <label
                      onClick={() => handleDelete(vendor.id)}
                      className="btn btn-sm bg-transparent hover:bg-gray-300"
                      title="Delete Vendor"
                    >
                      <IoTrashOutline className="text-red-600 text-lg cursor-pointer" />
                    </label>
                  </Permission>
                </div>
              </td>
            </tr>
          ))
        ))}
      </tbody>
    </table>)}
    
  
    
    <Pagination
      total={total}
      limit={limit}
      page={page}
      handlePageChange={handlePageChange}
      handleLimitChange={handleLimitChange}
    />
  </div>
 
  
  );
}
