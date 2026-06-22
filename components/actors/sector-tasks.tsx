'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  CheckCircle,
  Circle,
  Clock,
  Trash2,
  ChevronRight,
  AlertCircle,
  User,
  Calendar,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Task {
  id: string;
  title: string;
  description: string;
  sector: string;
  actorId?: string;
  actorName?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  dueDate?: string;
  type: 'collecte' | 'visite' | 'saisie' | 'validation' | 'formation' | 'autre';
  createdAt: string;
  assignedTo?: string;
}

interface SectorTasksProps {
  sector: string;
  color: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<Task['type'], string> = {
  collecte: 'Collecte de données',
  visite: 'Visite terrain',
  saisie: 'Saisie',
  validation: 'Validation',
  formation: 'Formation',
  autre: 'Autre',
};

const PRIORITY_LABELS: Record<Task['priority'], string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Haute',
};

const STATUS_LABELS: Record<Task['status'], string> = {
  todo: 'À faire',
  in_progress: 'En cours',
  done: 'Terminé',
};

const FILTER_OPTIONS: Array<{ value: 'all' | Task['status']; label: string }> = [
  { value: 'all', label: 'Toutes' },
  { value: 'todo', label: 'À faire' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'done', label: 'Terminé' },
];

// ─── Helper utilities ─────────────────────────────────────────────────────────

function generateId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function isOverdue(dueDate: string | undefined): boolean {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  due.setHours(23, 59, 59, 999);
  return due < new Date();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: Task['priority'] }) {
  const variantMap: Record<Task['priority'], 'danger' | 'warning' | 'outline'> = {
    high: 'danger',
    medium: 'warning',
    low: 'outline',
  };
  return (
    <Badge variant={variantMap[priority]} className="text-[10px] px-1.5 py-0">
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}

function TypeBadge({ type }: { type: Task['type'] }) {
  return (
    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
      {TYPE_LABELS[type]}
    </Badge>
  );
}

function StatusIcon({ status }: { status: Task['status'] }) {
  if (status === 'done') return <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />;
  if (status === 'in_progress') return <Clock className="h-4 w-4 text-blue-500 shrink-0" />;
  return <Circle className="h-4 w-4 text-muted-foreground shrink-0" />;
}

interface TaskCardProps {
  task: Task;
  onMove: (id: string, status: Task['status']) => void;
  onDelete: (id: string) => void;
}

function TaskCard({ task, onMove, onDelete }: TaskCardProps) {
  const overdue = isOverdue(task.dueDate) && task.status !== 'done';

  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-3 space-y-2">
        {/* Header row */}
        <div className="flex items-start gap-2">
          <StatusIcon status={task.status} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight line-clamp-2">{task.title}</p>
          </div>
          <button
            onClick={() => onDelete(task.id)}
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Supprimer la tâche"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 pl-6">{task.description}</p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-1 pl-6">
          <TypeBadge type={task.type} />
          <PriorityBadge priority={task.priority} />
        </div>

        {/* Meta info */}
        <div className="pl-6 space-y-1">
          {task.actorName && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <User className="h-3 w-3 shrink-0" />
              <span className="truncate">{task.actorName}</span>
            </div>
          )}
          {task.assignedTo && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <User className="h-3 w-3 shrink-0 text-blue-400" />
              <span className="truncate">Assigné : {task.assignedTo}</span>
            </div>
          )}
          {task.dueDate && (
            <div
              className={`flex items-center gap-1 text-[11px] ${
                overdue ? 'text-red-500 font-medium' : 'text-muted-foreground'
              }`}
            >
              {overdue ? (
                <AlertCircle className="h-3 w-3 shrink-0" />
              ) : (
                <Calendar className="h-3 w-3 shrink-0" />
              )}
              <span>{formatDate(task.dueDate)}{overdue ? ' — En retard' : ''}</span>
            </div>
          )}
        </div>

        {/* Move actions */}
        <div className="flex gap-1 pt-1 pl-6 flex-wrap">
          {task.status === 'todo' && (
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-[11px] px-2 gap-1 border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/30"
              onClick={() => onMove(task.id, 'in_progress')}
            >
              <ChevronRight className="h-3 w-3" />
              Démarrer
            </Button>
          )}
          {task.status === 'in_progress' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-[11px] px-2 gap-1 border-green-300 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/30"
                onClick={() => onMove(task.id, 'done')}
              >
                <CheckCircle className="h-3 w-3" />
                Terminer
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-[11px] px-2 gap-1 text-muted-foreground hover:text-foreground"
                onClick={() => onMove(task.id, 'todo')}
              >
                <Circle className="h-3 w-3" />
                Réouvrir
              </Button>
            </>
          )}
          {task.status === 'done' && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-[11px] px-2 gap-1 text-muted-foreground hover:text-foreground"
              onClick={() => onMove(task.id, 'todo')}
            >
              <Circle className="h-3 w-3" />
              Réouvrir
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Kanban column ─────────────────────────────────────────────────────────────

interface KanbanColumnProps {
  status: Task['status'];
  tasks: Task[];
  color: string;
  onMove: (id: string, status: Task['status']) => void;
  onDelete: (id: string) => void;
}

function KanbanColumn({ status, tasks, color: _color, onMove, onDelete }: KanbanColumnProps) {
  const headerColors: Record<Task['status'], string> = {
    todo: 'border-l-gray-400 bg-gray-50/50 dark:bg-gray-900/20',
    in_progress: 'border-l-blue-400 bg-blue-50/30 dark:bg-blue-950/10',
    done: 'border-l-green-500 bg-green-50/30 dark:bg-green-950/10',
  };

  const countColors: Record<Task['status'], string> = {
    todo: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    done: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  };

  return (
    <div className="flex flex-col gap-3 min-w-0">
      {/* Column header */}
      <div className={`flex items-center gap-2 rounded-lg border-l-4 px-3 py-2 ${headerColors[status]}`}>
        <StatusIcon status={status} />
        <span className="text-sm font-semibold flex-1">{STATUS_LABELS[status]}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${countColors[status]}`}>
          {tasks.length}
        </span>
      </div>

      {/* Task cards */}
      <div className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/50 px-4 py-6 text-center">
            <p className="text-xs text-muted-foreground">Aucune tâche</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onMove={onMove} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── New task form (inside Dialog) ────────────────────────────────────────────

interface TaskFormData {
  title: string;
  description: string;
  type: Task['type'];
  priority: Task['priority'];
  dueDate: string;
  assignedTo: string;
  actorName: string;
}

const DEFAULT_FORM: TaskFormData = {
  title: '',
  description: '',
  type: 'autre',
  priority: 'medium',
  dueDate: '',
  assignedTo: '',
  actorName: '',
};

interface NewTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
}

function NewTaskDialog({ open, onClose, onSubmit }: NewTaskDialogProps) {
  const [form, setForm] = useState<TaskFormData>(DEFAULT_FORM);
  const [errors, setErrors] = useState<{ title?: string }>({});

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setForm(DEFAULT_FORM);
      setErrors({});
    }
  }, [open]);

  function handleField<K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'title' && value) setErrors((prev) => ({ ...prev, title: undefined }));
  }

  function handleSubmit() {
    if (!form.title.trim()) {
      setErrors({ title: 'Le titre est requis' });
      return;
    }
    onSubmit(form);
    onClose();
  }

  const priorityPreviewColors: Record<Task['priority'], string> = {
    high: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400',
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle tâche
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Titre */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Titre <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Ex : Collecte données semaine 25"
              value={form.title}
              onChange={(e) => handleField('title', e.target.value)}
              className={errors.title ? 'border-red-400 focus-visible:ring-red-400' : ''}
            />
            {errors.title && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Détails de la tâche…"
              rows={3}
              value={form.description}
              onChange={(e) => handleField('description', e.target.value)}
              className="resize-none"
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Type</label>
            <Select
              value={form.type}
              onValueChange={(v) => handleField('type', v as Task['type'])}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="collecte">Collecte de données</SelectItem>
                <SelectItem value="visite">Visite terrain</SelectItem>
                <SelectItem value="saisie">Saisie</SelectItem>
                <SelectItem value="validation">Validation</SelectItem>
                <SelectItem value="formation">Formation</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priorité + preview badge */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Priorité</label>
            <div className="flex items-center gap-3">
              <Select
                value={form.priority}
                onValueChange={(v) => handleField('priority', v as Task['priority'])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir une priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                </SelectContent>
              </Select>
              <span
                className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${priorityPreviewColors[form.priority]}`}
              >
                {PRIORITY_LABELS[form.priority]}
              </span>
            </div>
          </div>

          {/* Date d'échéance */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Date d&apos;échéance</label>
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) => handleField('dueDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Assigné à */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Assigné à</label>
            <Input
              placeholder="Nom de la personne responsable (optionnel)"
              value={form.assignedTo}
              onChange={(e) => handleField('assignedTo', e.target.value)}
            />
          </div>

          {/* Acteur concerné */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Acteur concerné</label>
            <Input
              placeholder="Nom de l&apos;acteur lié (optionnel)"
              value={form.actorName}
              onChange={(e) => handleField('actorName', e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} className="gap-1">
            <Plus className="h-4 w-4" />
            Créer la tâche
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export function SectorTasks({ sector, color }: SectorTasksProps) {
  const storageKey = `agriintel_tasks_${sector}`;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | Task['status']>('all');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Task[];
        if (Array.isArray(parsed)) setTasks(parsed);
      }
    } catch {
      // Silently ignore parse errors
    }
  }, [storageKey]);

  // Persist on every change
  const persist = useCallback(
    (next: Task[]) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Storage quota exceeded — ignore
      }
    },
    [storageKey]
  );

  const handleCreate = useCallback(
    (data: TaskFormData) => {
      const newTask: Task = {
        id: generateId(),
        title: data.title.trim(),
        description: data.description.trim(),
        sector,
        actorName: data.actorName.trim() || undefined,
        priority: data.priority,
        status: 'todo',
        dueDate: data.dueDate || undefined,
        type: data.type,
        createdAt: new Date().toISOString(),
        assignedTo: data.assignedTo.trim() || undefined,
      };
      setTasks((prev) => {
        const next = [newTask, ...prev];
        persist(next);
        return next;
      });
    },
    [sector, persist]
  );

  const handleMove = useCallback(
    (id: string, status: Task['status']) => {
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, status } : t));
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const handleDelete = useCallback(
    (id: string) => {
      setTasks((prev) => {
        const next = prev.filter((t) => t.id !== id);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  // Derived counts
  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  // Filtered list for flat view
  const filteredTasks =
    filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  // Grouped for kanban columns
  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  return (
    <div className="space-y-5">
      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Stats chips */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-gray-800/60 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400">
            <Circle className="h-3 w-3" />
            {todoCount} à faire
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
            <Clock className="h-3 w-3" />
            {inProgressCount} en cours
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400">
            <CheckCircle className="h-3 w-3" />
            {doneCount} terminées
          </span>
        </div>

        <Button
          size="sm"
          className="gap-1.5 shrink-0"
          style={{ backgroundColor: color, borderColor: color }}
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nouvelle tâche
        </Button>
      </div>

      {/* ── Filter tabs ────────────────────────────────────────────────────── */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList className="h-8">
          {FILTER_OPTIONS.map((opt) => (
            <TabsTrigger key={opt.value} value={opt.value} className="text-xs px-3 py-1">
              {opt.label}
              {opt.value !== 'all' && (
                <span className="ml-1.5 rounded-full bg-muted-foreground/20 px-1.5 py-0 text-[10px] font-bold">
                  {opt.value === 'todo'
                    ? todoCount
                    : opt.value === 'in_progress'
                    ? inProgressCount
                    : doneCount}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      {filter === 'all' ? (
        /* Kanban board */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KanbanColumn
            status="todo"
            tasks={todoTasks}
            color={color}
            onMove={handleMove}
            onDelete={handleDelete}
          />
          <KanbanColumn
            status="in_progress"
            tasks={inProgressTasks}
            color={color}
            onMove={handleMove}
            onDelete={handleDelete}
          />
          <KanbanColumn
            status="done"
            tasks={doneTasks}
            color={color}
            onMove={handleMove}
            onDelete={handleDelete}
          />
        </div>
      ) : (
        /* Flat filtered list */
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <Card className="border-dashed border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-10 gap-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Aucune tâche dans cette catégorie
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-1 gap-1"
                  onClick={() => setDialogOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Créer une tâche
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onMove={handleMove}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}

      {/* ── New task dialog ─────────────────────────────────────────────────── */}
      <NewTaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
