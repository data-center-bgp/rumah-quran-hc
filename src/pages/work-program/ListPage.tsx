import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Eye, Filter } from "lucide-react";
import {
  type WorkProgramSubmission,
  type RumahQuran,
} from "../../types/database";
import { api } from "../../utils/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const statusLabels: Record<string, string> = {
  submitted: "SUBMITTED",
  revised: "REVISED",
  approved: "APPROVED",
  rejected: "REJECTED",
  completed: "COMPLETED",
};

export default function ListPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const isMaster = userProfile?.user_roles === "MASTER";
  const [data, setData] = useState<WorkProgramSubmission[]>([]);
  const [rumahQuranList, setRumahQuranList] = useState<RumahQuran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rumahQuranFilter, setRumahQuranFilter] = useState<string>("all");

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const filter: Record<string, string> = { deleted_at: "is.null" };
      if (!isMaster && userProfile?.rumah_quran_id) {
        filter.rumah_quran_id = `eq.${userProfile.rumah_quran_id}`;
      }

      const { data: result, error } = await api.get<WorkProgramSubmission[]>(
        "work_program_submission",
        {
          select: "*",
          filter,
          order: { column: "created_at", ascending: false },
        },
      );

      if (error) throw error;
      setData(result || []);

      const { data: rumahQuranData } = await api.get<RumahQuran[]>(
        "rumah_quran",
        {
          select: "*",
          filter: { deleted_at: "is.null" },
          order: { column: "name", ascending: true },
        },
      );
      setRumahQuranList(rumahQuranData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const { error } = await api.softDelete("work_program_submission", {
        id: `eq.${id}`,
      });
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
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

  const getRumahQuranName = (id: number | null) => {
    if (!id) return "-";
    const rq = rumahQuranList.find((r) => r.id === id);
    return rq ? `${rq.code} - ${rq.name}` : "-";
  };

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.submission_status?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter && statusFilter !== "all"
        ? item.submission_status === statusFilter
        : true;

    const matchesRumahQuran =
      rumahQuranFilter && rumahQuranFilter !== "all"
        ? item.rumah_quran_id?.toString() === rumahQuranFilter
        : true;

    return matchesSearch && matchesStatus && matchesRumahQuran;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Work Program Submissions
          </h2>
          <p className="text-gray-500 mt-1">
            Manage work program proposals and submissions
          </p>
        </div>
        <Button onClick={() => navigate("/work-program/create")}>
          <Plus className="h-4 w-4 mr-2" />
          New Submission
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, type, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Filter className="h-4 w-4 text-gray-400 shrink-0" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">SUBMITTED</SelectItem>
              <SelectItem value="revised">REVISED</SelectItem>
              <SelectItem value="approved">APPROVED</SelectItem>
              <SelectItem value="rejected">REJECTED</SelectItem>
              <SelectItem value="completed">COMPLETED</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select value={rumahQuranFilter} onValueChange={setRumahQuranFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Rumah Quran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rumah Quran</SelectItem>
              {rumahQuranList.map((rq) => (
                <SelectItem key={rq.id} value={rq.id.toString()}>
                  {rq.code} - {rq.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program Name</TableHead>
                <TableHead>Rumah Quran</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-gray-500"
                  >
                    No work programs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name || "-"}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                          {item.description || "-"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {getRumahQuranName(item.rumah_quran_id)}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {item.type || "-"}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {formatDate(item.submitted_start_date)}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {formatCurrency(item.submitted_cost)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          (item.submission_status as
                            | "submitted"
                            | "revised"
                            | "approved"
                            | "rejected"
                            | "completed") || "submitted"
                        }
                      >
                        {statusLabels[item.submission_status || "submitted"] ||
                          "SUBMITTED"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            navigate(`/work-program/view/${item.id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-yellow-600 hover:text-yellow-700"
                          onClick={() =>
                            navigate(`/work-program/edit/${item.id}`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Work Program
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{item.name}"?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(item.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
