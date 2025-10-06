import React, { useEffect, useState, useTransition } from "react";
import { TiSpanner } from "react-icons/ti";
import api from "../../../utils/apiInterceptor";
import LoadingTable from "../../LoadingTable";
import repairRequestTableColumns from "./Columns";
import animationData from "../../../assets/lottie/no-data.json";
import Lottie from "lottie-react";
import QuickView from "../QuickView";
import ModalWrapper from "../../ModalWrapper";
import Swal from 'sweetalert2';
import { toast } from "react-toastify";

import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";
import Filters from "./Filters"
import Pagination from "../../Pagination";

const defaultFilters = {
    dateFrom: "",
    dateTo: "",
    status: "ALL",
    severity: "ALL",
    assignedTo: "",
    deviceType: "",
}

export default function RequestTable({ refreshKey, setRefreshKey }) {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState(defaultFilters);
    const [requests, setRequests] = useState([]);
    const [isPending, startTransition] = useTransition();
    const [showQuickView, setShowQuickView] = useState(false);
    const [requestId, setRequestId] = useState(null);

    const fetchRepairRequests = async () => {
        try {
            let params = {
                page,
                limit
            }

            if (filters?.assignedTo) {
                params = { ...params, assignedTo: filters.assignedTo }
            }

            if (filters?.dateFrom) {
                params = { ...params, dateFrom: filters.dateFrom }
            }

            if (filters?.dateTo && filters?.dateFrom) {
                params = { ...params, dateTo: filters.dateTo }
            }

            if (filters?.status) {
                if (filters.status != "ALL") {
                    params = { ...params, status: filters.status }
                }
            }

            const result = await api.get(`/api/repair-requests`, {
                params
            });
            const items = result.data?.data?.repairRequests ?? [];

            startTransition(() => {
                setRequests(items);
                setTotal(result.data.data.total);
            });
        } catch (err) {
            console.error("Failed fetching repair requests:", err);
        }
    };

    const deleteRepairRequest = async (id) => {

    const result = await Swal.fire({
      title: "Are you sure you want to delete this request?",
      text: "This action cannot be undone. This will permanently delete this request and remove all associated data.",
      showCancelButton: true,
      confirmButtonColor: "#FF0000",
      cancelButtonColor: "#494848",
      confirmButtonText: "Delete Request",
      reverseButtons: true,
      showCloseButton: true,
    });

    if (result.isConfirmed) {
      Swal.showLoading();
      const response = await api.delete(`/api/repair-requests/${id}`);
      if (response) {
        toast.success('Repair request deleted successfully');
        setRefreshKey((prev) => prev - 1);
      }
      else {
        Swal.hideLoading();
        toast.error('Error: Unable to delete repair request');
      }
    }

  };

    useEffect(() => {
        fetchRepairRequests();
    }, []);

    const openQuickViewModal = (recordId) => {
        setRequestId(recordId);
        setShowQuickView(true);
    }

    const table = useReactTable({
        columns: repairRequestTableColumns({openQuickViewModal, deleteRepairRequest}),
        data: requests,
        getCoreRowModel: getCoreRowModel(),
    });

    useEffect(() => {
        fetchRepairRequests();
    }, [filters, page, limit, refreshKey])
  
    return (
        <>
            <Filters onFiltersChangeAction={setFilters} />

            <section className="border border-gray-200 rounded-md shadow-lg p-6 bg-white">
                <div className="flex flex-row items-center gap-1">
                    <TiSpanner className="text-green-600 size-7" />
                    <h3 className="text-lg lg:text-xl font-bold">Repair Requests</h3>
                </div>

                <p className="text-xs text-gray-500">Showing repair requests</p>

                <div className="my-4">
                    {isPending && <LoadingTable />}

                    {!isPending && <>
                        <div className="w-full overflow-x-auto pt-4">
                            <table className="min-w-full table-fixed rounded-lg divide-y divide-gray-200 bg-white">
                                <thead className="bg-gray-50">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <th
                                                    key={header.id}
                                                    className="px-4 py-3 text-left text-sm font-bold tracking-wider border-b border-gray-200"
                                                >
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>

                                <tbody className="bg-white">
                                    {table.getRowModel().rows.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="odd:bg-white even:bg-gray-50 hover:bg-gray-100"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td
                                                    key={cell.id}
                                                    className="px-4 py-3 text-sm text-gray-700 align-top border-b border-gray-200 break-words"
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {table.getRowModel().rows.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={table.getAllColumns().length}
                                                className="px-4 py-8 text-center text-gray-500"
                                            >
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
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <Pagination
                            total={total}
                            limit={limit}
                            page={page}
                            handlePageChange={(v) => setPage(v)}
                            handleLimitChange={(v) => setLimit(v.target.value)}
                        />
                    </>}
                </div>
            </section>
            <ModalWrapper isOpen={showQuickView} onClose={() => setShowQuickView(false) }>
                <QuickView requestId={requestId} onClose={() => setShowQuickView(false) } />
            </ModalWrapper>
        </>
    );
}
