import { useState } from 'react';
import { Plus, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TaskBoard from '@/components/TaskBoard';
import { parseNaturalLanguageTask } from '@/utils/taskParser';
import { parseTaskWithAI } from '@/utils/aiTaskParser';
import { Task } from '@/types/task';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddTask = async () => {
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Use the AI parser with fallback to the regex parser
      let parsedTask;
      try {
        parsedTask = await parseTaskWithAI(inputValue);
      } catch (error) {
        console.error('AI parsing failed, falling back to regex parser:', error);
        parsedTask = parseNaturalLanguageTask(inputValue);
        
        toast({
          title: "Using fallback parser",
          description: "AI parsing unavailable. Using basic parser instead.",
          variant: "default"
        });
      }
      
      const newTask: Task = {
        id: Date.now().toString(),
        ...parsedTask,
      };
      
      setTasks(prev => [...prev, newTask]);
      setInputValue('');
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error adding task",
        description: "Something went wrong while adding your task.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-pink-200 to-yellow-200 rounded-full opacity-40 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-green-200 to-blue-200 rounded-full opacity-25 animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-1/3 w-20 h-20 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-35 animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-purple-600 animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Natural Language Task Manager
            </h1>
            <Sparkles className="w-10 h-10 text-blue-600 animate-pulse delay-500" />
          </div>
          <p className="text-slate-600 text-lg font-medium max-w-2xl mx-auto">
            Transform your thoughts into organized tasks with AI-powered parsing ✨
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>

        {/* Task Input */}
        <div className="max-w-full mx-auto mb-12 px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]">
            <label className="block text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
              Add a new task
            </label>
            <div className="flex gap-4">
              <Input
                placeholder='Try: "Finish landing page Aman by 11pm 20th June" or "Call client Rajeev tomorrow 5pm"'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleAddTask()}
                className="flex-1 h-14 text-base border-2 border-purple-200 focus:border-purple-400 rounded-xl shadow-lg focus:shadow-xl transition-all duration-300 bg-white/90"
                disabled={isLoading}
              />
              <Button 
                onClick={handleAddTask}
                className="h-14 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5 mr-2" />
                )}
                {isLoading ? 'Processing...' : 'Add Task'}
              </Button>
            </div>
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
              <div className="text-sm text-slate-600">
                <strong className="text-purple-700">✨ Examples:</strong> 
                <span className="ml-2">"Review proposal John by Friday 3pm P1" • "Team meeting tomorrow 2pm" • "Send invoice by end of day P2"</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                <strong className="text-blue-600">🧠 AI-Powered:</strong>
                <span className="ml-2">Advanced natural language understanding now enabled! Try complex phrases and casual language.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Task Board */}
        <TaskBoard 
          tasks={tasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Index;
