import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Eye, Filter } from "lucide-react";
import {
  type WorkProgramSubmission,
  type RumahQuran,
} from "../../types/database";
import { api } from "../../utils/supabase";

const statusColors: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800",
  revised: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  completed: "bg-purple-100 text-purple-800",
};

const statusLabels: Record<string, string> = {
  submitted: "SUBMITTED",
  revised: "REVISED",
  approved: "APPROVED",
  rejected: "REJECTED",
  completed: "COMPLETED",
};

export default function ListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<WorkProgramSubmission[]>([]);
  const [rumahQuranList, setRumahQuranList] = useState<RumahQuran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [rumahQuranFilter, setRumahQuranFilter] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: result, error } = await api.get<WorkProgramSubmission[]>(
        "work_program_submission",
        {
          select: "*",
          filter: { deleted_at: "is.null" },
          order: { column: "created_at", ascending: false },
        },
      );

      if (error) throw error;

      setData(result || []);

      // Fetch Rumah Quran list for filter
      const { data: rumahQuranData } = await api.get<RumahQuran[]>(
        "rumah_quran",
        {
          select: "*",
          filter: { deleted_at: "is.null" },
          order: { column: "name", ascending: true },
        },
      );
      setRumahQuranList(rumahQuranData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this work program?")) return;

    try {
      const { error } = await api.softDelete("work_program_submission", {
        id: `eq.${id}`,
      });

      if (error) throw error;

      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getRumahQuranName = (id: number | null) => {
    if (!id) return "-";
    const rq = rumahQuranList.find((r) => r.id === id);
    return rq ? `${rq.code} - ${rq.name}` : "-";
  };

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.submission_status?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter
      ? item.submission_status === statusFilter
      : true;

    const matchesRumahQuran = rumahQuranFilter
      ? item.rumah_quran_id?.toString() === rumahQuranFilter
      : true;

    return matchesSearch && matchesStatus && matchesRumahQuran;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Work Program Submissions
          </h2>
          <p className="text-gray-600 mt-1">
            Manage work program proposals and submissions
          </p>
        </div>
        <button
          onClick={() => navigate("/work-program/create")}
          className="inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Submission
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, type, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="">All Status</option>
            <option value="submitted">SUBMITTED</option>
            <option value="revised">REVISED</option>
            <option value="approved">APPROVED</option>
            <option value="rejected">REJECTED</option>
            <option value="completed">COMPLETED</option>
          </select>
        </div>
        <div className="flex-1">
          <select
            value={rumahQuranFilter}
            onChange={(e) => setRumahQuranFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="">All Rumah Quran</option>
            {rumahQuranList.map((rq) => (
              <option key={rq.id} value={rq.id.toString()}>
                {rq.code} - {rq.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rumah Quran
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No work programs found
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.name || "-"}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {item.description || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getRumahQuranName(item.rumah_quran_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.type || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.submitted_start_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(item.submitted_cost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            statusColors[
                              item.submission_status || "submitted"
                            ] || statusColors.submitted
                          }`}
                        >
                          {statusLabels[
                            item.submission_status || "submitted"
                          ] || "SUBMITTED"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            navigate(`/work-program/view/${item.id}`)
                          }
                          className="text-gray-600 hover:text-gray-900 mr-3"
                          title="View"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/work-program/edit/${item.id}`)
                          }
                          className="text-yellow-600 hover:text-yellow-900 mr-3"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
