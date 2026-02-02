import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Calendar, Users, DollarSign } from "lucide-react";
import {
  type WorkProgramSubmission,
  type RumahQuran,
  type Profile,
} from "../../types/database";
import { api } from "../../utils/supabase";
import { useAuth } from "../../contexts/AuthContext";

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

export default function ViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<WorkProgramSubmission | null>(null);
  const [rumahQuran, setRumahQuran] = useState<RumahQuran | null>(null);
  const [submittedBy, setSubmittedBy] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch work program
        const { data: program, error: programError } =
          await api.get<WorkProgramSubmission>("work_program_submission", {
            select: "*",
            filter: { id: `eq.${id}` },
            single: true,
          });

        if (programError) throw programError;
        setData(program);

        // Fetch related Rumah Quran
        if (program?.rumah_quran_id) {
          const { data: rq } = await api.get<RumahQuran>("rumah_quran", {
            select: "*",
            filter: { id: `eq.${program.rumah_quran_id}` },
            single: true,
          });
          setRumahQuran(rq);
        }

        // Fetch submitter profile
        if (program?.submitted_by) {
          const { data: profile } = await api.get<Profile>("profiles", {
            select: "*",
            filter: { id: `eq.${program.submitted_by}` },
            single: true,
          });
          setSubmittedBy(profile);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
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
    if (amount === null) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error || "Program not found"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/work-program")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Work Program Details
            </h2>
            <p className="text-gray-600 mt-1">
              View complete program information
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/work-program/edit/${id}`)}
          className="inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
        >
          <Edit className="w-5 h-5 mr-2" />
          Edit
        </button>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
            statusColors[data.submission_status || "submitted"] ||
            statusColors.submitted
          }`}
        >
          {statusLabels[data.submission_status || "submitted"] || "SUBMITTED"}
        </span>
        {data.is_verified_by_director && (
          <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
            ✓ Director Verified
          </span>
        )}
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Program Name
            </label>
            <p className="text-base text-gray-900">{data.name || "-"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Program Type
            </label>
            <p className="text-base text-gray-900">{data.type || "-"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Rumah Quran
            </label>
            <p className="text-base text-gray-900">
              {rumahQuran ? `${rumahQuran.code} - ${rumahQuran.name}` : "-"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Submitted By
            </label>
            <p className="text-base text-gray-900">
              {submittedBy?.name || submittedBy?.email || "-"}
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Description
            </label>
            <p className="text-base text-gray-900 whitespace-pre-wrap">
              {data.description || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Proposed Schedule */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Proposed Schedule
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Start Date
              </label>
              <p className="text-base text-gray-900">
                {formatDate(data.submitted_start_date)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                End Date
              </label>
              <p className="text-base text-gray-900">
                {formatDate(data.submitted_end_date)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Duration
              </label>
              <p className="text-base text-gray-900">
                {data.submitted_duration
                  ? `${data.submitted_duration} days`
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Actual Schedule */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Actual Schedule
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Start Date
              </label>
              <p className="text-base text-gray-900">
                {formatDate(data.actual_start_date)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                End Date
              </label>
              <p className="text-base text-gray-900">
                {formatDate(data.actual_end_date)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Duration
              </label>
              <p className="text-base text-gray-900">
                {data.actual_duration ? `${data.actual_duration} days` : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget & Audience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Budget</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Proposed Budget
              </label>
              <p className="text-base text-gray-900">
                {formatCurrency(data.submitted_cost)}
              </p>
            </div>
            {userProfile?.user_roles === "MASTER" && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Approved Budget
                </label>
                <p className="text-base text-gray-900 font-semibold">
                  {formatCurrency(data.approved_cost)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Audience */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Audience</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Estimated Audience
              </label>
              <p className="text-base text-gray-900">
                {data.estimated_audience_number
                  ? `${data.estimated_audience_number} people`
                  : "-"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Actual Audience
              </label>
              <p className="text-base text-gray-900">
                {data.actual_audience_number
                  ? `${data.actual_audience_number} people`
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Created At
            </label>
            <p className="text-base text-gray-900">
              {formatDate(data.created_at)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Last Updated
            </label>
            <p className="text-base text-gray-900">
              {formatDate(data.updated_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
