"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── Create Task ──────────────────────────────────────────

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  assignedToId: z.string().min(1, "Must assign to someone"),
  companyId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().optional(),
});

export async function createTaskAction(input: z.infer<typeof createTaskSchema>) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const parsed = createTaskSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = parsed.data;

  try {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        assignedToId: data.assignedToId,
        assignedById: session.userId,
        companyId: data.companyId || null,
        priority: data.priority as never,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/tasks");
    if (data.companyId) revalidatePath(`/dashboard/companies/${data.companyId}`);

    return { taskId: task.id };
  } catch {
    return { error: "Failed to create task" };
  }
}

// ─── Update Task Status ───────────────────────────────────

const updateStatusSchema = z.object({
  taskId: z.string(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  completionNote: z.string().optional(),
});

export async function updateTaskStatusAction(input: z.infer<typeof updateStatusSchema>) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const task = await prisma.task.findUnique({
      where: { id: parsed.data.taskId },
      select: { assignedToId: true, assignedById: true, companyId: true },
    });

    if (!task) return { error: "Task not found" };

    // Only assignee, assigner, or admin can update
    const canUpdate =
      task.assignedToId === session.userId ||
      task.assignedById === session.userId ||
      session.role === "ADMIN";

    if (!canUpdate) return { error: "You don't have permission to update this task" };

    await prisma.task.update({
      where: { id: parsed.data.taskId },
      data: {
        status: parsed.data.status as never,
        completedAt: parsed.data.status === "COMPLETED" ? new Date() : null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/tasks");
    if (task.companyId) revalidatePath(`/dashboard/companies/${task.companyId}`);

    return { success: true };
  } catch {
    return { error: "Failed to update task" };
  }
}

// ─── Create Follow-up Task ────────────────────────────────
// Creates a new task linked to the same company, optionally assigned to self or someone else

const followUpTaskSchema = z.object({
  parentTaskId: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  assignedToId: z.string().min(1, "Must assign to someone"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().optional(),
});

export async function createFollowUpTaskAction(input: z.infer<typeof followUpTaskSchema>) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const parsed = followUpTaskSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    // Get parent task to inherit companyId
    const parent = await prisma.task.findUnique({
      where: { id: parsed.data.parentTaskId },
      select: { companyId: true, assignedToId: true, assignedById: true },
    });

    if (!parent) return { error: "Parent task not found" };

    // Only assignee, assigner, or admin can create follow-up
    const canCreate =
      parent.assignedToId === session.userId ||
      parent.assignedById === session.userId ||
      session.role === "ADMIN";

    if (!canCreate) return { error: "You don't have permission" };

    const data = parsed.data;

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        assignedToId: data.assignedToId,
        assignedById: session.userId,
        companyId: parent.companyId,
        priority: data.priority as never,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/tasks");
    if (parent.companyId) revalidatePath(`/dashboard/companies/${parent.companyId}`);

    return { taskId: task.id };
  } catch {
    return { error: "Failed to create follow-up task" };
  }
}
