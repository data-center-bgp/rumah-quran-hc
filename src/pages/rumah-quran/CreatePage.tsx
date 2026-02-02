import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { type RumahQuranInsert, type RumahQuran } from "../../types/database";
import { api } from "../../utils/supabase";
import { useAuth } from "../../contexts/AuthContext";

export default function CreatePage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingCode, setLoadingCode] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has MASTER role
  useEffect(() => {
    if (userProfile && userProfile.user_roles !== "MASTER") {
      navigate("/rumah-quran");
    }
  }, [userProfile, navigate]);

  const [formData, setFormData] = useState<RumahQuranInsert>({
    code: "",
    name: "",
    address: "",
    location: "",
    is_active: true,
    updated_at: null,
    deleted_at: null,
  });

  // Auto-generate code on mount
  useEffect(() => {
    const generateCode = async () => {
      try {
        const { data, error } = await api.get<RumahQuran[]>("rumah_quran", {
          select: "code",
          order: { column: "code", ascending: false },
          limit: 1,
        });

        if (error) throw error;

        let nextNumber = 1;
        if (data && data.length > 0 && data[0].code) {
          const match = data[0].code.match(/RQ-(\d+)/);
          if (match) {
            nextNumber = parseInt(match[1], 10) + 1;
          }
        }

        const newCode = `RQ-${String(nextNumber).padStart(3, "0")}`;
        setFormData((prev) => ({ ...prev, code: newCode }));
      } catch (err) {
        console.error("Error generating code:", err);
      } finally {
        setLoadingCode(false);
      }
    };

    generateCode();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggle = (field: keyof RumahQuranInsert) => {
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
      const { error } = await api.insert<RumahQuran>("rumah_quran", formData);

      if (error) throw error;

      navigate("/rumah-quran");
    } catch (err: any) {
      setError(err.message || "Failed to create Rumah Quran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/rumah-quran")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Add Rumah Quran</h2>
          <p className="text-gray-600 mt-1">
            Create a new Rumah Quran location
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Code */}
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Code
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={loadingCode ? "Generating..." : formData.code || ""}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              placeholder="Auto-generated"
            />
            <p className="mt-1 text-xs text-gray-500">
              Code is automatically generated
            </p>
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="Enter name"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            placeholder="Enter full address"
          />
        </div>

        {/* Location (City) */}
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            City / Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            placeholder="e.g., Jakarta, Bandung, Surabaya"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter the city where this Rumah Quran is located
          </p>
        </div>

        {/* Is Active - Toggle Slider */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <label
              htmlFor="is_active"
              className="text-sm font-medium text-gray-700"
            >
              Active Status
            </label>
            <p className="text-xs text-gray-500 mt-0.5">
              {formData.is_active
                ? "This Rumah Quran is currently active"
                : "This Rumah Quran is currently inactive"}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={formData.is_active || false}
            onClick={() => handleToggle("is_active")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
              formData.is_active ? "bg-yellow-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                formData.is_active ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate("/rumah-quran")}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || loadingCode}
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
