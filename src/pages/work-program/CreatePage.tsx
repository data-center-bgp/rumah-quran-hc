import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import {
  type WorkProgramSubmissionInsert,
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

export default function CreatePage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rumahQuranList, setRumahQuranList] = useState<RumahQuran[]>([]);

  const [formData, setFormData] = useState<WorkProgramSubmissionInsert>({
    submitted_by: userProfile?.id || null,
    rumah_quran_id: userProfile?.rumah_quran_id || null,
    name: "",
    type: "",
    description: "",
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
    updated_at: null,
    deleted_at: null,
  });

  // Fetch Rumah Quran list for dropdown
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

  // Update submitted_by when userProfile loads
  useEffect(() => {
    if (userProfile?.id) {
      setFormData((prev) => ({
        ...prev,
        submitted_by: userProfile.id,
        rumah_quran_id: userProfile.rumah_quran_id || prev.rumah_quran_id,
      }));
    }
  }, [userProfile]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Calculate duration if dates are provided
      let duration = formData.submitted_duration;
      if (formData.submitted_start_date && formData.submitted_end_date) {
        const start = new Date(formData.submitted_start_date);
        const end = new Date(formData.submitted_end_date);
        duration =
          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
          1;
      }

      const { error } = await api.insert("work_program_submission", {
        ...formData,
        submitted_duration: duration,
      });

      if (error) throw error;

      navigate("/work-program");
    } catch (err: any) {
      setError(err.message || "Failed to create work program");
    } finally {
      setLoading(false);
    }
  };

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
            New Work Program Submission
          </h2>
          <p className="text-gray-600 mt-1">
            Submit a new work program proposal
          </p>
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

        {/* Schedule */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
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

            {/* End Date */}
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

        {/* Budget & Audience */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Budget & Audience
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Estimated Audience */}
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
                placeholder="Number of expected attendees"
              />
            </div>

            {/* Submitted Cost */}
            <div>
              <label
                htmlFor="submitted_cost"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Estimated Budget (IDR)
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
                placeholder="Enter budget amount"
              />
            </div>
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
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
