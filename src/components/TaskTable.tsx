
import { useState } from 'react';
import { Edit, Check, X, Calendar, User, Flag } from 'lucide-react';
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
      case 'P1': return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300 shadow-red-100';
      case 'P2': return 'bg-gradient-to-r from-yellow-100 to-orange-200 text-orange-800 border-orange-300 shadow-orange-100';
      case 'P3': return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 shadow-blue-100';
      case 'P4': return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300 shadow-gray-100';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300 shadow-gray-100';
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
        <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
          <tr>
            <th className="px-8 py-5 text-left text-sm font-bold text-slate-700 flex items-center gap-2">
              <Edit className="w-4 h-4 text-purple-500" />
              Task
            </th>
            <th className="px-8 py-5 text-left text-sm font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                Assigned To
              </div>
            </th>
            <th className="px-8 py-5 text-left text-sm font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-500" />
                Due Date/Time
              </div>
            </th>
            <th className="px-8 py-5 text-left text-sm font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-orange-500" />
                Priority
              </div>
            </th>
            <th className="px-8 py-5 text-left text-sm font-bold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {tasks.map((task, index) => (
            <tr key={task.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-300 group">
              <td className="px-8 py-6">
                {editingTask === task.id ? (
                  <Input
                    value={editValues.taskName || ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, taskName: e.target.value }))}
                    className="w-full border-2 border-purple-200 focus:border-purple-400 rounded-lg"
                  />
                ) : (
                  <div className="font-semibold text-slate-900 group-hover:text-purple-700 transition-colors duration-200">
                    {task.taskName}
                  </div>
                )}
              </td>
              <td className="px-8 py-6">
                {editingTask === task.id ? (
                  <Input
                    value={editValues.assignee || ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, assignee: e.target.value }))}
                    className="w-full border-2 border-blue-200 focus:border-blue-400 rounded-lg"
                  />
                ) : (
                  <div className="text-slate-700 flex items-center gap-2">
                    {task.assignee ? (
                      <>
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {task.assignee.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{task.assignee}</span>
                      </>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </div>
                )}
              </td>
              <td className="px-8 py-6">
                {editingTask === task.id ? (
                  <Input
                    type="datetime-local"
                    value={editValues.dueDate || ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full border-2 border-green-200 focus:border-green-400 rounded-lg"
                  />
                ) : (
                  <div className="text-slate-700 font-medium">
                    {task.dueDate ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        {formatDate(task.dueDate)}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        No due date
                      </span>
                    )}
                  </div>
                )}
              </td>
              <td className="px-8 py-6">
                {editingTask === task.id ? (
                  <Select
                    value={editValues.priority || task.priority}
                    onValueChange={(value) => setEditValues(prev => ({ ...prev, priority: value as Priority }))}
                  >
                    <SelectTrigger className="w-full border-2 border-orange-200 focus:border-orange-400 rounded-lg">
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
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border-2 shadow-lg transition-all duration-200 hover:scale-105 ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                )}
              </td>
              <td className="px-8 py-6">
                {editingTask === task.id ? (
                  <div className="flex gap-3">
                    <Button 
                      size="sm" 
                      onClick={saveEditing} 
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={cancelEditing}
                      className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => startEditing(task)}
                      className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 hover:scale-105 shadow-md"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onDeleteTask(task.id)}
                      className="border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-200 hover:scale-105 shadow-md"
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
