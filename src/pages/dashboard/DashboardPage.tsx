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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  totalRumahQuran: number;
  activeRumahQuran: number;
  totalPrograms: number;
  pendingSubmissions: number;
  approvedPrograms: number;
  totalUsers: number;
}

const statusLabels: Record<string, string> = {
  submitted: "SUBMITTED",
  revised: "REVISED",
  approved: "APPROVED",
  rejected: "REJECTED",
  completed: "COMPLETED",
};

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
        const { data: rumahQuran } = await api.get<RumahQuran[]>(
          "rumah_quran",
          {
            select: "*",
            filter: { deleted_at: "is.null" },
          },
        );

        const activeRQ =
          rumahQuran?.filter((rq) => rq.is_active === true).length || 0;

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

        const { data: users } = await api.get<Profile[]>("profiles", {
          select: "*",
        });

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
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-gray-500 mt-1">
          Welcome back, {userName || userEmail || "User"}!
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Rumah Quran
                </CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-100">
                  <Building2 className="h-4 w-4 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.totalRumahQuran}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.activeRumahQuran} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Programs
                </CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                  <ClipboardList className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalPrograms}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.approvedPrograms} approved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Pending Submissions
                </CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.pendingSubmissions}
                </div>
                <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Programs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Work Programs</CardTitle>
                <CardDescription>
                  Latest submitted work programs
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                className="text-yellow-600 hover:text-yellow-700"
                onClick={() => navigate("/work-program")}
              >
                View all
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {recentPrograms.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">
                    No work programs yet
                  </p>
                ) : (
                  recentPrograms.map((program) => (
                    <div
                      key={program.id}
                      className="flex items-center justify-between rounded-lg px-3 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() =>
                        navigate(`/work-program/view/${program.id}`)
                      }
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {program.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {program.type} &middot;{" "}
                          {formatDate(program.submitted_start_date)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          (program.submission_status as
                            | "submitted"
                            | "revised"
                            | "approved"
                            | "rejected"
                            | "completed") || "submitted"
                        }
                      >
                        {statusLabels[
                          program.submission_status || "submitted"
                        ] || "SUBMITTED"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
