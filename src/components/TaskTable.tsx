
import { useState } from 'react';
import { Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task, Priority } from '@/types/task';
import { formatDate } from '@/utils/dateFormatter';

interface TaskTableProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskTable = ({ tasks, onUpdateTask, onDeleteTask }: TaskTableProps) => {
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Task>>({});

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'P1': return 'bg-red-100 text-red-800 border-red-200';
      case 'P2': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'P3': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'P4': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask(task.id);
    setEditValues({
      taskName: task.taskName,
      assignee: task.assignee,
      dueDate: task.dueDate,
      priority: task.priority,
    });
  };

  const saveEditing = () => {
    if (editingTask) {
      onUpdateTask(editingTask, editValues);
      setEditingTask(null);
      setEditValues({});
    }
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setEditValues({});
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Task</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Assigned To</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Due Date/Time</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Priority</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                {editingTask === task.id ? (
                  <Input
                    value={editValues.taskName || ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, taskName: e.target.value }))}
                    className="w-full"
                  />
                ) : (
                  <div className="font-medium text-slate-900">{task.taskName}</div>
                )}
              </td>
              <td className="px-6 py-4">
                {editingTask === task.id ? (
                  <Input
                    value={editValues.assignee || ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, assignee: e.target.value }))}
                    className="w-full"
                  />
                ) : (
                  <div className="text-slate-700">{task.assignee || 'Unassigned'}</div>
                )}
              </td>
              <td className="px-6 py-4">
                {editingTask === task.id ? (
                  <Input
                    type="datetime-local"
                    value={editValues.dueDate || ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full"
                  />
                ) : (
                  <div className="text-slate-700">
                    {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                {editingTask === task.id ? (
                  <Select
                    value={editValues.priority || task.priority}
                    onValueChange={(value) => setEditValues(prev => ({ ...prev, priority: value as Priority }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="P1">P1 - Critical</SelectItem>
                      <SelectItem value="P2">P2 - High</SelectItem>
                      <SelectItem value="P3">P3 - Medium</SelectItem>
                      <SelectItem value="P4">P4 - Low</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                {editingTask === task.id ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEditing} className="bg-green-600 hover:bg-green-700">
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEditing}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEditing(task)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onDeleteTask(task.id)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
