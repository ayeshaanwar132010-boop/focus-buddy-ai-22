import { Badge } from "@/components/ui/badge";
import {
  priorityLabels,
  statusLabels,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/study-data";

export function StatusBadge({ status }: { status: TaskStatus }) {
  const variant =
    status === "completed" ? "success" : status === "in-progress" ? "info" : "outline";
  return <Badge variant={variant as never}>{statusLabels[status]}</Badge>;
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const variant = priority === "high" ? "danger" : priority === "medium" ? "warning" : "secondary";
  return <Badge variant={variant as never}>{priorityLabels[priority]}</Badge>;
}
