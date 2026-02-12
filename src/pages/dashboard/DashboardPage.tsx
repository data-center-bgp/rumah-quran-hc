import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Building2,
  ClipboardList,
  Clock,
  Users,
  MapPin,
  GraduationCap,
} from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const { userName, userEmail, userProfile } = useAuth();
  const navigate = useNavigate();
  const isMaster = userProfile?.user_roles === "MASTER";

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

  // Non-MASTER: assigned Rumah Quran details
  const [assignedRumahQuran, setAssignedRumahQuran] =
    useState<RumahQuran | null>(null);

  // MASTER: staff list for their assigned RQ
  const [staffList, setStaffList] = useState<Profile[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Common data
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

        const { data: recent } = await api.get<WorkProgramSubmission[]>(
          "work_program_submission",
          {
            select: "*",
            filter: { deleted_at: "is.null" },
            order: { column: "created_at", ascending: false },
            limit: 5,
          },
        );

        if (isMaster) {
          // MASTER: fetch all RQ + staff for their assigned RQ
          const { data: rumahQuran } = await api.get<RumahQuran[]>(
            "rumah_quran",
            {
              select: "*",
              filter: { deleted_at: "is.null" },
            },
          );

          const activeRQ =
            rumahQuran?.filter((rq) => rq.is_active === true).length || 0;

          const { data: users } = await api.get<Profile[]>("profiles", {
            select: "*",
            filter: { deleted_at: "is.null" },
          });

          setStats({
            totalRumahQuran: rumahQuran?.length || 0,
            activeRumahQuran: activeRQ,
            totalPrograms: programs?.length || 0,
            pendingSubmissions: pending,
            approvedPrograms: approved,
            totalUsers: users?.length || 0,
          });

          // Fetch staff for MASTER's assigned RQ
          if (userProfile?.rumah_quran_id) {
            const rq = rumahQuran?.find(
              (r) => r.id === userProfile.rumah_quran_id,
            );
            setAssignedRumahQuran(rq || null);

            const staff =
              users?.filter(
                (u) => u.rumah_quran_id === userProfile.rumah_quran_id,
              ) || [];
            setStaffList(staff);
          }
        } else {
          // Non-MASTER: fetch their assigned RQ
          if (userProfile?.rumah_quran_id) {
            const { data: rqData } = await api.get<RumahQuran[]>(
              "rumah_quran",
              {
                select: "*",
                filter: {
                  id: `eq.${userProfile.rumah_quran_id}`,
                  deleted_at: "is.null",
                },
              },
            );
            setAssignedRumahQuran(rqData?.[0] || null);
          }

          setStats({
            totalRumahQuran: 0,
            activeRumahQuran: 0,
            totalPrograms: programs?.length || 0,
            pendingSubmissions: pending,
            approvedPrograms: approved,
            totalUsers: 0,
          });
        }

        setRecentPrograms(recent || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isMaster, userProfile?.rumah_quran_id]);

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
          {/* Non-MASTER: Assigned Rumah Quran Card */}
          {!isMaster && assignedRumahQuran && (
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-sm">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {assignedRumahQuran.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <span className="font-mono text-yellow-700">
                      {assignedRumahQuran.code}
                    </span>
                    <span className="mx-1">·</span>
                    <Badge
                      variant={
                        assignedRumahQuran.is_active ? "active" : "inactive"
                      }
                    >
                      {assignedRumahQuran.is_active ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 mt-2">
                  {assignedRumahQuran.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-600">
                        {assignedRumahQuran.address}
                      </span>
                    </div>
                  )}
                  {assignedRumahQuran.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-600">
                        {assignedRumahQuran.location}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {!isMaster && !assignedRumahQuran && (
            <Card className="border-gray-200">
              <CardContent className="py-8 text-center text-sm text-gray-500">
                <Building2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                You are not assigned to any Rumah Quran. Contact your
                administrator.
              </CardContent>
            </Card>
          )}

          {/* Stats - different for MASTER vs non-MASTER */}
          <div
            className={`grid gap-4 ${isMaster ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"}`}
          >
            {isMaster && (
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
            )}

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

          {/* MASTER: Staff list for assigned Rumah Quran */}
          {isMaster && assignedRumahQuran && staffList.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>
                      Staff — {assignedRumahQuran.code}{" "}
                      {assignedRumahQuran.name}
                    </CardTitle>
                    <CardDescription>
                      {staffList.length} member
                      {staffList.length !== 1 ? "s" : ""} assigned
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffList.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell className="font-medium">
                          {staff.name || "-"}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {staff.email || "-"}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {staff.position || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="text-xs">
                            {staff.user_roles || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={staff.is_active ? "active" : "inactive"}
                          >
                            {staff.is_active ? "ACTIVE" : "INACTIVE"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

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
