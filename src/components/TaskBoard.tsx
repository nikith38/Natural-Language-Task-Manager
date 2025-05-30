
import { Task } from '@/types/task';
import TaskTable from './TaskTable';

interface TaskBoardProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskBoard = ({ tasks, onUpdateTask, onDeleteTask }: TaskBoardProps) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            Tasks ({tasks.length})
          </h2>
        </div>
        
        {tasks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-slate-400 text-lg mb-2">No tasks yet</div>
            <div className="text-slate-500">Add your first task using natural language above</div>
          </div>
        ) : (
          <TaskTable 
            tasks={tasks}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />
        )}
      </div>
    </div>
  );
};

export default TaskBoard;
