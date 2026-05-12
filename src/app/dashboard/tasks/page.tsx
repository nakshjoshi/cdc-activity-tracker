import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { FilterBar } from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { TaskCreateButton } from "./task-actions";
import { TaskActionsRow, PriorityBadge, TaskStatusBadge } from "./task-status";
import Link from "next/link";
import { ClipboardCheck, Building2, Calendar } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tasks" };

interface SearchParams {
  tab?: string;
  status?: string;
  page?: string;
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const tab = params.tab ?? "my"; // my | assigned | all
  const statusFilter = params.status ?? "";
  const page = parseInt(params.page ?? "1");
  const pageSize = 20;

  // Build filter
  const where: any = {};

  // Tab filter
  if (tab === "my") {
    where.assignedToId = session.userId;
  } else if (tab === "assigned") {
    where.assignedById = session.userId;
  }
  // "all" tab = no user filter

  // Status filter
  if (statusFilter) {
    where.status = statusFilter;
  }

  const [tasks, total, users, companies] = await Promise.all([
    prisma.task.findMany({
      where,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: [{ status: "asc" }, { priority: "desc" }, { dueDate: "asc" }, { createdAt: "desc" }],
      include: {
        assignedTo: { select: { id: true, name: true } },
        assignedBy: { select: { id: true, name: true } },
        company: { select: { id: true, companyName: true } },
      },
    }),
    prisma.task.count({ where }),
    prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.company.findMany({
      where: { isDeleted: false },
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
      take: 200,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  // Count my pending for the badge
  const myPendingCount = tab === "my"
    ? tasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS").length
    : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Tasks</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {total} task{total !== 1 ? "s" : ""} ·
            Assign and track work across the team
          </p>
        </div>
        <TaskCreateButton users={users} companies={companies} />
      </div>

      {/* Tab filter: My Tasks / Assigned by Me / All */}
      <div className="flex flex-wrap items-center gap-4">
        <FilterBar
          paramKey="tab"
          baseUrl="/dashboard/tasks"
          activeClass="bg-blue-600 text-white"
          options={[
            { label: "My Tasks", value: "my" },
            { label: "Assigned by Me", value: "assigned" },
            { label: "All Tasks", value: "all" },
          ]}
        />
        <div className="h-5 w-px bg-zinc-800 hidden sm:block" />
        <FilterBar
          paramKey="status"
          baseUrl="/dashboard/tasks"
          options={[
            { label: "All", value: "" },
            { label: "Pending", value: "PENDING" },
            { label: "In Progress", value: "IN_PROGRESS" },
            { label: "Completed", value: "COMPLETED" },
          ]}
        />
      </div>

      {/* Tasks list */}
      {tasks.length === 0 ? (
        <Card className="py-12 text-center">
          <ClipboardCheck className="mx-auto h-10 w-10 text-zinc-600" />
          <p className="mt-2 text-sm text-zinc-500">No tasks found</p>
          <p className="text-xs text-zinc-600 mt-1">
            {tab === "my" ? "Nothing assigned to you yet" : "Use 'Assign Task' to create one"}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "COMPLETED" && task.status !== "CANCELLED";
            return (
              <Card key={task.id} className={`p-4 ${isOverdue ? "border-red-900/40" : ""}`}>
                <div className="flex items-start gap-3">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <PriorityBadge priority={task.priority} />
                      <TaskStatusBadge status={task.status} />
                      {isOverdue && (
                        <span className="rounded-full bg-red-950/30 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                          OVERDUE
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-medium ${task.status === "COMPLETED" ? "text-zinc-500 line-through" : "text-zinc-100"}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{task.description}</p>
                    )}

                    {/* Meta row */}
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                      {task.company && (
                        <Link
                          href={`/dashboard/companies/${task.company.id}`}
                          className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                        >
                          <Building2 className="h-3 w-3" />
                          {task.company.companyName}
                        </Link>
                      )}
                      {task.dueDate && (
                        <span className={`flex items-center gap-1 ${isOverdue ? "text-red-400" : ""}`}>
                          <Calendar className="h-3 w-3" />
                          Due {formatDate(task.dueDate)}
                        </span>
                      )}
                      <span>{task.assignedBy.name} → {task.assignedTo.name}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-2">
                      <TaskActionsRow
                        taskId={task.id}
                        currentStatus={task.status}
                        users={users}
                        currentUserId={session.userId}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} baseUrl="/dashboard/tasks" />
    </div>
  );
}
