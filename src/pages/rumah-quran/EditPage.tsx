import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { type RumahQuran, type RumahQuranUpdate } from "../../types/database";
import { api } from "../../utils/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<RumahQuranUpdate, "id">>({
    code: "",
    name: "",
    address: "",
    location: "",
    is_active: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await api.get<RumahQuran>("rumah_quran", {
          select: "*",
          filter: { id: `eq.${id}` },
          single: true,
        });

        if (error) throw error;

        if (data) {
          setFormData({
            code: data.code,
            name: data.name,
            address: data.address,
            location: data.location,
            is_active: data.is_active,
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await api.update<RumahQuran>(
        "rumah_quran",
        { id: `eq.${id}` },
        {
          ...formData,
          updated_at: new Date().toISOString(),
        },
      );

      if (error) throw error;
      navigate("/rumah-quran");
    } catch (err: any) {
      setError(err.message || "Failed to update Rumah Quran");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/rumah-quran")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Edit Rumah Quran
          </h2>
          <p className="text-gray-500 mt-1">Update Rumah Quran information</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code || ""}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Code cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  required
                  placeholder="Enter name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                rows={3}
                placeholder="Enter full address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">City / Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                placeholder="e.g., Jakarta, Bandung, Surabaya"
              />
              <p className="text-xs text-gray-500">
                Enter the city where this Rumah Quran is located
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <p className="text-xs text-gray-500">
                  {formData.is_active
                    ? "This Rumah Quran is currently active"
                    : "This Rumah Quran is currently inactive"}
                </p>
              </div>
              <Switch
                checked={formData.is_active || false}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_active: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/rumah-quran")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
