import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import {
  type WorkProgramSubmission,
  type WorkProgramSubmissionUpdate,
  type RumahQuran,
} from "../../types/database";
import { api } from "../../utils/supabase";
import { useAuth } from "../../contexts/AuthContext";

const programTypes = [
  "Kajian Rutin",
  "Kajian Umum",
  "Tahsin",
  "Tahfidz",
  "Kegiatan Sosial",
  "Pelatihan",
  "Seminar",
  "Workshop",
  "Lainnya",
];

const statusOptions = [
  { value: "submitted", label: "Submitted" },
  { value: "revised", label: "Revised" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
];

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rumahQuranList, setRumahQuranList] = useState<RumahQuran[]>([]);

  const [formData, setFormData] = useState<
    Omit<WorkProgramSubmissionUpdate, "id">
  >({
    name: "",
    type: "",
    description: "",
    rumah_quran_id: null,
    estimated_audience_number: null,
    actual_audience_number: null,
    submitted_start_date: "",
    submitted_end_date: "",
    actual_start_date: null,
    actual_end_date: null,
    submitted_duration: null,
    actual_duration: null,
    submitted_cost: null,
    approved_cost: null,
    submission_status: "submitted",
    is_verified_by_director: false,
  });

  // Fetch Rumah Quran list
  useEffect(() => {
    const fetchRumahQuran = async () => {
      try {
        const { data, error } = await api.get<RumahQuran[]>("rumah_quran", {
          select: "*",
          filter: { deleted_at: "is.null", is_active: "eq.true" },
          order: { column: "name", ascending: true },
        });

        if (error) throw error;
        setRumahQuranList(data || []);
      } catch (err) {
        console.error("Error fetching Rumah Quran:", err);
      }
    };

    fetchRumahQuran();
  }, []);

  // Fetch existing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await api.get<WorkProgramSubmission>(
          "work_program_submission",
          {
            select: "*",
            filter: { id: `eq.${id}` },
            single: true,
          },
        );

        if (error) throw error;

        if (data) {
          setFormData({
            name: data.name,
            type: data.type,
            description: data.description,
            rumah_quran_id: data.rumah_quran_id,
            estimated_audience_number: data.estimated_audience_number,
            actual_audience_number: data.actual_audience_number,
            submitted_start_date: data.submitted_start_date
              ? data.submitted_start_date.split("T")[0]
              : "",
            submitted_end_date: data.submitted_end_date
              ? data.submitted_end_date.split("T")[0]
              : "",
            actual_start_date: data.actual_start_date
              ? data.actual_start_date.split("T")[0]
              : null,
            actual_end_date: data.actual_end_date
              ? data.actual_end_date.split("T")[0]
              : null,
            submitted_duration: data.submitted_duration,
            actual_duration: data.actual_duration,
            submitted_cost: data.submitted_cost,
            approved_cost: data.approved_cost,
            submission_status: data.submission_status,
            is_verified_by_director: data.is_verified_by_director,
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setLoadingData(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? value === ""
            ? null
            : Number(value)
          : value || null,
    }));
  };

  const handleToggle = (
    field: keyof Omit<WorkProgramSubmissionUpdate, "id">,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Calculate duration if dates are provided
      let submitted_duration = formData.submitted_duration;
      if (formData.submitted_start_date && formData.submitted_end_date) {
        const start = new Date(formData.submitted_start_date);
        const end = new Date(formData.submitted_end_date);
        submitted_duration =
          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
          1;
      }

      let actual_duration = formData.actual_duration;
      if (formData.actual_start_date && formData.actual_end_date) {
        const start = new Date(formData.actual_start_date);
        const end = new Date(formData.actual_end_date);
        actual_duration =
          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
          1;
      }

      const { error } = await api.update(
        "work_program_submission",
        { id: `eq.${id}` },
        {
          ...formData,
          submitted_duration,
          actual_duration,
          updated_at: new Date().toISOString(),
        },
      );

      if (error) throw error;

      navigate("/work-program");
    } catch (err: any) {
      setError(err.message || "Failed to update work program");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/work-program")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Edit Work Program
          </h2>
          <p className="text-gray-600 mt-1">Update work program details</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-6 space-y-6"
      >
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Program Name */}
            <div className="md:col-span-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Program Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Enter program name"
              />
            </div>

            {/* Type */}
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Program Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="">Select type</option>
                {programTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Rumah Quran */}
            <div>
              <label
                htmlFor="rumah_quran_id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Rumah Quran <span className="text-red-500">*</span>
              </label>
              <select
                id="rumah_quran_id"
                name="rumah_quran_id"
                value={formData.rumah_quran_id || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="">Select Rumah Quran</option>
                {rumahQuranList.map((rq) => (
                  <option key={rq.id} value={rq.id}>
                    {rq.code} - {rq.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Describe the work program..."
              />
            </div>
          </div>
        </div>

        {/* Submitted Schedule */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Proposed Schedule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="submitted_start_date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="submitted_start_date"
                name="submitted_start_date"
                value={formData.submitted_start_date || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            <div>
              <label
                htmlFor="submitted_end_date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="submitted_end_date"
                name="submitted_end_date"
                value={formData.submitted_end_date || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Actual Schedule (for completed programs) */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Actual Schedule
            <span className="ml-2 text-sm font-normal text-gray-500">
              (Fill after program completion)
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="actual_start_date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Actual Start Date
              </label>
              <input
                type="date"
                id="actual_start_date"
                name="actual_start_date"
                value={formData.actual_start_date || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            <div>
              <label
                htmlFor="actual_end_date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Actual End Date
              </label>
              <input
                type="date"
                id="actual_end_date"
                name="actual_end_date"
                value={formData.actual_end_date || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Budget & Audience */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Budget & Audience
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="estimated_audience_number"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Estimated Audience
              </label>
              <input
                type="number"
                id="estimated_audience_number"
                name="estimated_audience_number"
                value={formData.estimated_audience_number || ""}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Expected attendees"
              />
            </div>

            <div>
              <label
                htmlFor="actual_audience_number"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Actual Audience
              </label>
              <input
                type="number"
                id="actual_audience_number"
                name="actual_audience_number"
                value={formData.actual_audience_number || ""}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Actual attendees"
              />
            </div>

            <div>
              <label
                htmlFor="submitted_cost"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Proposed Budget (IDR)
              </label>
              <input
                type="number"
                id="submitted_cost"
                name="submitted_cost"
                value={formData.submitted_cost || ""}
                onChange={handleChange}
                min="0"
                step="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Proposed amount"
              />
            </div>

            {userProfile?.user_roles === "MASTER" && (
              <div>
                <label
                  htmlFor="approved_cost"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Approved Budget (IDR)
                </label>
                <input
                  type="number"
                  id="approved_cost"
                  name="approved_cost"
                  value={formData.approved_cost || ""}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Approved amount"
                />
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="submission_status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Submission Status
              </label>
              <select
                id="submission_status"
                name="submission_status"
                value={formData.submission_status || "submitted"}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Director Verification Toggle */}
            {userProfile?.user_roles === "MASTER" && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Director Verification
                  </label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formData.is_verified_by_director
                      ? "Verified by director"
                      : "Not yet verified"}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.is_verified_by_director || false}
                  onClick={() => handleToggle("is_verified_by_director")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                    formData.is_verified_by_director
                      ? "bg-yellow-500"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                      formData.is_verified_by_director
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate("/work-program")}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
