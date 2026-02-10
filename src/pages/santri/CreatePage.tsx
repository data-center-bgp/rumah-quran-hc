import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { type RumahQuran } from "../../types/database";
import { api } from "../../utils/supabase";
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

const enrollmentStatusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "graduated", label: "Graduated" },
  { value: "dropped", label: "Dropped" },
];

const graduationStatusOptions = [
  { value: "not_graduated", label: "Not Graduated" },
  { value: "graduated", label: "Graduated" },
  { value: "dropped_out", label: "Dropped Out" },
];

export default function CreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rumahQuranList, setRumahQuranList] = useState<RumahQuran[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    birthdate: "",
    birthplace: "",
    address: "",
    rumah_quran_id: "",
    institution_origin: "",
    enrollment_status: "active",
    enrollment_date: "",
    graduation_status: "not_graduated",
    graduation_date: "",
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
      const { error } = await api.insert("santri", {
        name: formData.name,
        birthdate: formData.birthdate || null,
        birthplace: formData.birthplace || null,
        address: formData.address || null,
        rumah_quran_id: formData.rumah_quran_id
          ? parseInt(formData.rumah_quran_id)
          : null,
        institution_origin: formData.institution_origin || null,
        enrollment_status: formData.enrollment_status || null,
        enrollment_date: formData.enrollment_date || null,
        graduation_status: formData.graduation_status || null,
        graduation_date: formData.graduation_date || null,
      });

      if (error) throw error;
      navigate("/santri");
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
          <h2 className="text-2xl font-bold tracking-tight">Add New Santri</h2>
          <p className="text-gray-500 mt-1">Create a new student record</p>
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
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Santri personal details and current location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="birthplace">Place of Birth</Label>
                <Input
                  id="birthplace"
                  name="birthplace"
                  value={formData.birthplace}
                  onChange={handleChange}
                  placeholder="City/Region"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthdate">Date of Birth</Label>
                <Input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full address..."
                rows={3}
              />
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
          </CardContent>
        </Card>

        {/* Enrollment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Information</CardTitle>
            <CardDescription>
              Educational background and enrollment details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="institution_origin">Institution Origin</Label>
              <Input
                id="institution_origin"
                name="institution_origin"
                value={formData.institution_origin}
                onChange={handleChange}
                placeholder="Previous school/institution"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="enrollment_status">Enrollment Status</Label>
                <Select
                  value={formData.enrollment_status}
                  onValueChange={(v) =>
                    setFormData({ ...formData, enrollment_status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {enrollmentStatusOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="enrollment_date">Enrollment Date</Label>
                <Input
                  id="enrollment_date"
                  name="enrollment_date"
                  type="date"
                  value={formData.enrollment_date}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Graduation Information */}
        <Card>
          <CardHeader>
            <CardTitle>Graduation Information</CardTitle>
            <CardDescription>
              Graduation status and completion details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="graduation_status">Graduation Status</Label>
                <Select
                  value={formData.graduation_status}
                  onValueChange={(v) =>
                    setFormData({ ...formData, graduation_status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {graduationStatusOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="graduation_date">Graduation Date</Label>
                <Input
                  id="graduation_date"
                  name="graduation_date"
                  type="date"
                  value={formData.graduation_date}
                  onChange={handleChange}
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
            Save Santri
          </Button>
        </div>
      </form>
    </div>
  );
}
