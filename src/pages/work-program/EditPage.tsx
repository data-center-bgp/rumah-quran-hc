import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import {
  type WorkProgramSubmission,
  type RumahQuran,
} from "../../types/database";
import { api } from "../../utils/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

const statusOptions = [
  { value: "submitted", label: "SUBMITTED" },
  { value: "revised", label: "REVISED" },
  { value: "approved", label: "APPROVED" },
  { value: "rejected", label: "REJECTED" },
  { value: "completed", label: "COMPLETED" },
];

export default function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const isMaster = userProfile?.user_roles === "MASTER";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rumahQuranList, setRumahQuranList] = useState<RumahQuran[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    rumah_quran_id: "",
    submitted_start_date: "",
    submitted_end_date: "",
    actual_start_date: "",
    actual_end_date: "",
    submitted_cost: "",
    approved_cost: "",
    estimated_audience_number: "",
    actual_audience_number: "",
    submission_status: "submitted",
    is_verified_by_director: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [programRes, rumahQuranRes] = await Promise.all([
          api.get<WorkProgramSubmission[]>("work_program_submission", {
            select: "*",
            filter: { id: `eq.${id}`, deleted_at: "is.null" },
          }),
          api.get<RumahQuran[]>("rumah_quran", {
            select: "*",
            filter: { deleted_at: "is.null" },
            order: { column: "name", ascending: true },
          }),
        ]);

        if (programRes.error) throw programRes.error;
        setRumahQuranList(rumahQuranRes.data || []);

        const program = programRes.data?.[0];
        if (!program) {
          setError("Work program not found");
          return;
        }

        setFormData({
          name: program.name || "",
          type: program.type || "",
          description: program.description || "",
          rumah_quran_id: program.rumah_quran_id?.toString() || "",
          submitted_start_date: program.submitted_start_date || "",
          submitted_end_date: program.submitted_end_date || "",
          actual_start_date: program.actual_start_date || "",
          actual_end_date: program.actual_end_date || "",
          submitted_cost: program.submitted_cost?.toString() || "",
          approved_cost: program.approved_cost?.toString() || "",
          estimated_audience_number:
            program.estimated_audience_number?.toString() || "",
          actual_audience_number:
            program.actual_audience_number?.toString() || "",
          submission_status: program.submission_status || "submitted",
          is_verified_by_director: program.is_verified_by_director || false,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
    setSaving(true);
    setError(null);

    try {
      const submittedDuration = calculateDuration(
        formData.submitted_start_date,
        formData.submitted_end_date,
      );
      const actualDuration = calculateDuration(
        formData.actual_start_date,
        formData.actual_end_date,
      );

      const updateData: Record<string, any> = {
        name: formData.name,
        type: formData.type,
        description: formData.description || null,
        rumah_quran_id: formData.rumah_quran_id
          ? parseInt(formData.rumah_quran_id)
          : null,
        submitted_start_date: formData.submitted_start_date || null,
        submitted_end_date: formData.submitted_end_date || null,
        submitted_duration: submittedDuration || null,
        actual_start_date: formData.actual_start_date || null,
        actual_end_date: formData.actual_end_date || null,
        actual_duration: actualDuration || null,
        submitted_cost: formData.submitted_cost
          ? parseFloat(formData.submitted_cost)
          : null,
        estimated_audience_number: formData.estimated_audience_number
          ? parseInt(formData.estimated_audience_number)
          : null,
        actual_audience_number: formData.actual_audience_number
          ? parseInt(formData.actual_audience_number)
          : null,
        submission_status: formData.submission_status,
      };

      if (isMaster) {
        updateData.approved_cost = formData.approved_cost
          ? parseFloat(formData.approved_cost)
          : null;
        updateData.is_verified_by_director = formData.is_verified_by_director;
      }

      const { error } = await api.update(
        "work_program_submission",
        updateData,
        {
          id: `eq.${id}`,
        },
      );

      if (error) throw error;
      navigate("/work-program");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Edit Work Program
          </h2>
          <p className="text-gray-500 mt-1">
            Update submission details and status
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
        {/* Program Info */}
        <Card>
          <CardHeader>
            <CardTitle>Program Information</CardTitle>
            <CardDescription>Update the work program details</CardDescription>
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
              <Label htmlFor="rumah_quran_id">Rumah Quran</Label>
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
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submission_status">Status</Label>
              <Select
                value={formData.submission_status}
                onValueChange={(v) =>
                  setFormData({ ...formData, submission_status: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submitted Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Submitted Schedule & Budget</CardTitle>
            <CardDescription>
              Original proposed timeline and budget
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
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actual Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Actual Schedule & Audience</CardTitle>
            <CardDescription>Record the actual execution data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="actual_start_date">Actual Start Date</Label>
                <Input
                  id="actual_start_date"
                  name="actual_start_date"
                  type="date"
                  value={formData.actual_start_date}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actual_end_date">Actual End Date</Label>
                <Input
                  id="actual_end_date"
                  name="actual_end_date"
                  type="date"
                  value={formData.actual_end_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            {formData.actual_start_date && formData.actual_end_date && (
              <p className="text-sm text-gray-500">
                Duration:{" "}
                <span className="font-medium text-gray-900">
                  {calculateDuration(
                    formData.actual_start_date,
                    formData.actual_end_date,
                  )}{" "}
                  days
                </span>
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="actual_audience_number">
                Actual Audience Number
              </Label>
              <Input
                id="actual_audience_number"
                name="actual_audience_number"
                type="number"
                min="0"
                value={formData.actual_audience_number}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Director Verification (MASTER only) */}
        {isMaster && (
          <Card>
            <CardHeader>
              <CardTitle>Director Verification</CardTitle>
              <CardDescription>
                Approve budget and verify the submission
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="approved_cost">Approved Budget (IDR)</Label>
                <Input
                  id="approved_cost"
                  name="approved_cost"
                  type="number"
                  min="0"
                  value={formData.approved_cost}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="is_verified_by_director"
                  checked={formData.is_verified_by_director}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      is_verified_by_director: checked,
                    })
                  }
                />
                <Label
                  htmlFor="is_verified_by_director"
                  className="cursor-pointer"
                >
                  Verified by Director
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
