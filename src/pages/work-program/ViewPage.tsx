import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  type WorkProgramSubmission,
  type RumahQuran,
  type Profile,
} from "../../types/database";
import { api } from "../../utils/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const statusLabels: Record<string, string> = {
  submitted: "SUBMITTED",
  revised: "REVISED",
  approved: "APPROVED",
  rejected: "REJECTED",
  completed: "COMPLETED",
};

export default function ViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const isMaster = userProfile?.user_roles === "MASTER";

  const [program, setProgram] = useState<WorkProgramSubmission | null>(null);
  const [rumahQuran, setRumahQuran] = useState<RumahQuran | null>(null);
  const [submittedBy, setSubmittedBy] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await api.get<WorkProgramSubmission[]>(
          "work_program_submission",
          {
            select: "*",
            filter: { id: `eq.${id}`, deleted_at: "is.null" },
          },
        );

        if (error) throw error;
        const prog = data?.[0];
        if (!prog) {
          setError("Work program not found");
          return;
        }
        setProgram(prog);

        // Fetch related data
        if (prog.rumah_quran_id) {
          const { data: rqData } = await api.get<RumahQuran[]>("rumah_quran", {
            select: "*",
            filter: { id: `eq.${prog.rumah_quran_id}` },
          });
          setRumahQuran(rqData?.[0] || null);
        }

        if (prog.submitted_by) {
          const { data: profileData } = await api.get<Profile[]>("profiles", {
            select: "*",
            filter: { id: `eq.${prog.submitted_by}` },
          });
          setSubmittedBy(profileData?.[0] || null);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">
            Work Program Details
          </h2>
        </div>
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error || "Work program not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">
                {program.name}
              </h2>
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
                {statusLabels[program.submission_status || "submitted"] ||
                  "SUBMITTED"}
              </Badge>
            </div>
            <p className="text-gray-500 mt-1">
              {program.type}
              {rumahQuran ? ` · ${rumahQuran.code} - ${rumahQuran.name}` : ""}
            </p>
          </div>
        </div>
        <Button onClick={() => navigate(`/work-program/edit/${program.id}`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Program
        </Button>
      </div>

      {/* Description */}
      {program.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 whitespace-pre-wrap">
              {program.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Schedule */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-yellow-500" />
              Submitted Schedule
            </CardTitle>
            <CardDescription>Proposed timeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Start Date</span>
              <span className="text-sm font-medium">
                {formatDate(program.submitted_start_date)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">End Date</span>
              <span className="text-sm font-medium">
                {formatDate(program.submitted_end_date)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Duration</span>
              <span className="text-sm font-medium">
                {program.submitted_duration
                  ? `${program.submitted_duration} days`
                  : "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Actual Schedule
            </CardTitle>
            <CardDescription>Execution timeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Start Date</span>
              <span className="text-sm font-medium">
                {formatDate(program.actual_start_date)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">End Date</span>
              <span className="text-sm font-medium">
                {formatDate(program.actual_end_date)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Duration</span>
              <span className="text-sm font-medium">
                {program.actual_duration
                  ? `${program.actual_duration} days`
                  : "-"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-yellow-500" />
              Budget
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Submitted Budget</span>
              <span className="text-sm font-medium">
                {formatCurrency(program.submitted_cost)}
              </span>
            </div>
            {isMaster && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Approved Budget</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(program.approved_cost)}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-yellow-500" />
              Audience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Estimated</span>
              <span className="text-sm font-medium">
                {program.estimated_audience_number ?? "-"}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Actual</span>
              <span className="text-sm font-medium">
                {program.actual_audience_number ?? "-"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Director Verification (MASTER only) */}
      {isMaster && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-yellow-500" />
              Director Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${
                  program.is_verified_by_director
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
              <span className="text-sm font-medium">
                {program.is_verified_by_director
                  ? "Verified by Director"
                  : "Not yet verified"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Submitted By</span>
            <span className="text-sm font-medium">
              {submittedBy?.name || submittedBy?.email || "-"}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Created At</span>
            <span className="text-sm font-medium">
              {formatDate(program.created_at)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Last Updated</span>
            <span className="text-sm font-medium">
              {formatDate(program.updated_at)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
