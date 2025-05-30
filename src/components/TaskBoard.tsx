import { Task } from '@/types/task';
import TaskTable from './TaskTable';
import { ListTodo, Zap, BrainCircuit } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  isLoading?: boolean;
}

const TaskBoard = ({ tasks, onUpdateTask, onDeleteTask, isLoading = false }: TaskBoardProps) => {
  return (
    <div className="max-w-full mx-auto px-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 overflow-hidden hover:shadow-3xl transition-all duration-300">
        <div className="px-8 py-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <ListTodo className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">
              Your Tasks
            </h2>
            <div className="flex items-center gap-2 ml-auto">
              <Zap className="w-5 h-5" />
              <span className="text-lg font-semibold bg-white/20 px-3 py-1 rounded-full">
                {tasks.length}
              </span>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-16 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <BrainCircuit className="w-12 h-12 text-purple-400 animate-spin duration-3000" />
              </div>
            </div>
            <div className="text-slate-600 text-xl mb-2 font-medium">Processing your task...</div>
            <div className="text-slate-500 text-lg">Using AI to understand your request ✨</div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
                <ListTodo className="w-12 h-12 text-purple-400" />
              </div>
            </div>
            <div className="text-slate-400 text-xl mb-2 font-medium">No tasks yet</div>
            <div className="text-slate-500 text-lg">Add your first task using natural language above ✨</div>
            <div className="mt-6 flex justify-center">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
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
