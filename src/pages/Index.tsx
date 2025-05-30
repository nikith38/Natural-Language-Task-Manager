
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TaskBoard from '@/components/TaskBoard';
import { parseNaturalLanguageTask } from '@/utils/taskParser';
import { Task } from '@/types/task';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');

  const handleAddTask = () => {
    if (!inputValue.trim()) return;
    
    const parsedTask = parseNaturalLanguageTask(inputValue);
    const newTask: Task = {
      id: Date.now().toString(),
      ...parsedTask,
    };
    
    setTasks(prev => [...prev, newTask]);
    setInputValue('');
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Natural Language Task Manager
          </h1>
          <p className="text-slate-600 text-lg">
            Transform your thoughts into organized tasks with AI-powered parsing
          </p>
        </div>

        {/* Task Input */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Add a new task
            </label>
            <div className="flex gap-3">
              <Input
                placeholder='Try: "Finish landing page Aman by 11pm 20th June" or "Call client Rajeev tomorrow 5pm"'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                className="flex-1 h-12 text-base"
              />
              <Button 
                onClick={handleAddTask}
                className="h-12 px-6 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
            <div className="mt-3 text-sm text-slate-500">
              <strong>Examples:</strong> "Review proposal John by Friday 3pm P1" • "Team meeting tomorrow 2pm" • "Send invoice by end of day P2"
            </div>
          </div>
        </div>

        {/* Task Board */}
        <TaskBoard 
          tasks={tasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      </div>
    </div>
  );
};

export default Index;
