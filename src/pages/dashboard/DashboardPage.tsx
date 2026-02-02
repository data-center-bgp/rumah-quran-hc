import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Building2, ClipboardList, Clock } from "lucide-react";
import { api } from "../../utils/supabase";
import type {
  RumahQuran,
  WorkProgramSubmission,
  Profile,
} from "../../types/database";

interface DashboardStats {
  totalRumahQuran: number;
  activeRumahQuran: number;
  totalPrograms: number;
  pendingSubmissions: number;
  approvedPrograms: number;
  totalUsers: number;
}

export default function DashboardPage() {
  const { userName, userEmail } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRumahQuran: 0,
    activeRumahQuran: 0,
    totalPrograms: 0,
    pendingSubmissions: 0,
    approvedPrograms: 0,
    totalUsers: 0,
  });
  const [recentPrograms, setRecentPrograms] = useState<WorkProgramSubmission[]>(
    [],
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch Rumah Quran stats
        const { data: rumahQuran } = await api.get<RumahQuran[]>(
          "rumah_quran",
          {
            select: "*",
            filter: { deleted_at: "is.null" },
          },
        );

        const activeRQ =
          rumahQuran?.filter((rq) => rq.is_active === true).length || 0;

        // Fetch Work Program stats
        const { data: programs } = await api.get<WorkProgramSubmission[]>(
          "work_program_submission",
          {
            select: "*",
            filter: { deleted_at: "is.null" },
          },
        );

        const pending =
          programs?.filter((p) => p.submission_status === "submitted").length ||
          0;
        const approved =
          programs?.filter((p) => p.submission_status === "approved").length ||
          0;

        // Fetch Users count
        const { data: users } = await api.get<Profile[]>("profiles", {
          select: "*",
        });

        // Fetch recent programs (last 5)
        const { data: recent } = await api.get<WorkProgramSubmission[]>(
          "work_program_submission",
          {
            select: "*",
            filter: { deleted_at: "is.null" },
            order: { column: "created_at", ascending: false },
            limit: 5,
          },
        );

        setStats({
          totalRumahQuran: rumahQuran?.length || 0,
          activeRumahQuran: activeRQ,
          totalPrograms: programs?.length || 0,
          pendingSubmissions: pending,
          approvedPrograms: approved,
          totalUsers: users?.length || 0,
        });

        setRecentPrograms(recent || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-600 mt-1">
          Welcome back, {userName || userEmail || "User"}!
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow p-6 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-yellow-600">
                    Total Rumah Quran
                  </div>
                  <div className="text-3xl font-bold text-yellow-900 mt-2">
                    {stats.totalRumahQuran}
                  </div>
                  <div className="text-xs text-yellow-600 mt-1">
                    {stats.activeRumahQuran} active
                  </div>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-blue-600">
                    Total Programs
                  </div>
                  <div className="text-3xl font-bold text-blue-900 mt-2">
                    {stats.totalPrograms}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {stats.approvedPrograms} approved
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow p-6 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-orange-600">
                    Pending Submissions
                  </div>
                  <div className="text-3xl font-bold text-orange-900 mt-2">
                    {stats.pendingSubmissions}
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    Awaiting review
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Programs */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Recent Work Programs
                </h3>
                <button
                  onClick={() => navigate("/work-program")}
                  className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  View all
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentPrograms.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No work programs yet
                </div>
              ) : (
                recentPrograms.map((program) => (
                  <div
                    key={program.id}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/work-program/edit/${program.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {program.name}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {program.type} •{" "}
                          {formatDate(program.submitted_start_date)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[
                            program.submission_status || "submitted"
                          ] || statusColors.submitted
                        }`}
                      >
                        {statusLabels[
                          program.submission_status || "submitted"
                        ] || "SUBMITTED"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
