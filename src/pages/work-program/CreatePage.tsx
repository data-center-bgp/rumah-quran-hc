import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { type RumahQuran } from "../../types/database";
import { api } from "../../utils/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const programTypes = [
  "Tahfidz",
  "Tahsin",
  "Kajian",
  "Daurah",
  "Workshop",
  "Seminar",
  "Bakti Sosial",
  "Lainnya",
];

export default function CreatePage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rumahQuranList, setRumahQuranList] = useState<RumahQuran[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    rumah_quran_id: "",
    submitted_start_date: "",
    submitted_end_date: "",
    submitted_cost: "",
    estimated_audience_number: "",
  });

  useEffect(() => {
    const fetchRumahQuran = async () => {
      try {
        const { data } = await api.get<RumahQuran[]>("rumah_quran", {
          select: "*",
          filter: { deleted_at: "is.null", is_active: "eq.true" },
          order: { column: "name", ascending: true },
        });
        setRumahQuranList(data || []);
      } catch (err: any) {
        console.error("Failed to fetch Rumah Quran:", err);
      }
    };
    fetchRumahQuran();
  }, []);

  const calculateDuration = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submittedDuration = calculateDuration(
        formData.submitted_start_date,
        formData.submitted_end_date,
      );

      const { error } = await api.insert("work_program_submission", {
        name: formData.name,
        type: formData.type,
        description: formData.description || null,
        rumah_quran_id: formData.rumah_quran_id
          ? parseInt(formData.rumah_quran_id)
          : null,
        submitted_start_date: formData.submitted_start_date || null,
        submitted_end_date: formData.submitted_end_date || null,
        submitted_duration: submittedDuration || null,
        submitted_cost: formData.submitted_cost
          ? parseFloat(formData.submitted_cost)
          : null,
        estimated_audience_number: formData.estimated_audience_number
          ? parseInt(formData.estimated_audience_number)
          : null,
        submission_status: "submitted",
        submitted_by: userProfile?.id || null,
      });

      if (error) throw error;
      navigate("/work-program");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            New Work Program Submission
          </h2>
          <p className="text-gray-500 mt-1">
            Submit a new work program proposal
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Program Information</CardTitle>
            <CardDescription>
              Provide details about the work program
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Program Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter program name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Program Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {programTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rumah_quran_id">Rumah Quran *</Label>
              <Select
                value={formData.rumah_quran_id}
                onValueChange={(v) =>
                  setFormData({ ...formData, rumah_quran_id: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Rumah Quran" />
                </SelectTrigger>
                <SelectContent>
                  {rumahQuranList.map((rq) => (
                    <SelectItem key={rq.id} value={rq.id.toString()}>
                      {rq.code} - {rq.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the work program..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule & Budget</CardTitle>
            <CardDescription>
              Define the timeline and estimated costs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="submitted_start_date">Start Date</Label>
                <Input
                  id="submitted_start_date"
                  name="submitted_start_date"
                  type="date"
                  value={formData.submitted_start_date}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="submitted_end_date">End Date</Label>
                <Input
                  id="submitted_end_date"
                  name="submitted_end_date"
                  type="date"
                  value={formData.submitted_end_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            {formData.submitted_start_date && formData.submitted_end_date && (
              <p className="text-sm text-gray-500">
                Duration:{" "}
                <span className="font-medium text-gray-900">
                  {calculateDuration(
                    formData.submitted_start_date,
                    formData.submitted_end_date,
                  )}{" "}
                  days
                </span>
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="submitted_cost">Estimated Budget (IDR)</Label>
                <Input
                  id="submitted_cost"
                  name="submitted_cost"
                  type="number"
                  min="0"
                  value={formData.submitted_cost}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated_audience_number">
                  Estimated Audience
                </Label>
                <Input
                  id="estimated_audience_number"
                  name="estimated_audience_number"
                  type="number"
                  min="0"
                  value={formData.estimated_audience_number}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Submit Program
          </Button>
        </div>
      </form>
    </div>
  );
}
