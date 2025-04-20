import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, Clock } from 'lucide-react';
import { Project as ProjectType } from '../types';
import { useProjectContext } from '../context/ProjectContext';
import MainTask from './MainTask';
import ProgressBar from './ProgressBar';
import { calculateProjectProgress, calculateProjectTime, formatTime } from '../utils/calculations';

interface ProjectProps {
  project: ProjectType;
}

const Project: React.FC<ProjectProps> = ({ project }) => {
  const { dispatch } = useProjectContext();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all');

  const progress = calculateProjectProgress(project);
  const totalTime = calculateProjectTime(project);

  const toggleExpand = () => {
    dispatch({ type: 'TOGGLE_PROJECT_EXPAND', payload: project.id });
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_PROJECT', payload: project.id });
  };

  const handleEdit = () => setIsEditing(true);

  const handleSave = () => {
    if (title.trim() !== '') {
      dispatch({ type: 'UPDATE_PROJECT', payload: { id: project.id, title } });
      setIsEditing(false);
    }
  };

  const startAddTask = () => setIsAddingTask(true);

  const handleAddTask = () => {
    if (newTaskTitle.trim() !== '') {
      dispatch({ type: 'ADD_MAIN_TASK', payload: { projectId: project.id, title: newTaskTitle } });
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  const cancelAddTask = () => {
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  return (
    <div className="mb-6 bg-slate-800 p-5 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="flex items-start gap-2 mb-3">
        <button
          onClick={toggleExpand}
          className="p-1 rounded-full hover:bg-slate-700 transition-colors"
        >
          {project.isExpanded ? (
            <ChevronDown size={20} className="text-slate-400" />
          ) : (
            <ChevronRight size={20} className="text-slate-400" />
          )}
        </button>

        {isEditing ? (
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 bg-slate-700 text-slate-200 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setTitle(project.title);
                setIsEditing(false);
              }}
              className="px-3 py-1 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex-1 space-y-3">
            <h1 className="text-xl md:text-3xl font-bold text-white">{project.title}</h1>

            <div className="flex flex-col sm:flex-row gap-6 text-sm text-zinc-400">
              <div>
                <p className="text-xs mb-1">Total Estimated Time</p>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-blue-400" />
                  <span className="text-blue-400 font-extrabold text-2xl">{formatTime(totalTime)}</span>
                </div>
              </div>

              <div>
                <p className="text-xs mb-1">Project Completion</p>
                <span className="text-green-400 font-extrabold text-2xl">{progress}%</span>
              </div>

              <div className="flex items-center gap-2 sm:ml-auto">
                <button onClick={handleEdit} className="p-2 rounded hover:bg-zinc-600 transition">
                  <Edit size={18} className="text-zinc-400" />
                </button>
                <button onClick={handleDelete} className="p-2 rounded hover:bg-zinc-600 transition">
                  <Trash2 size={18} className="text-red-400" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ProgressBar percentage={progress} size="lg" className="mb-4" />

      {project.isExpanded && (
        <>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-slate-400">Filter tasks:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'completed' | 'incomplete')}
              className="bg-slate-700 text-white px-3 py-1 rounded-md"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>

          <div className="space-y-3 mt-4">
            {project.mainTasks
              .filter((task) => {
                if (filter === 'all') return true;
                const isComplete =
                  task.subtasks.length > 0 && task.subtasks.every((s) => s.completed);
                return filter === 'completed' ? isComplete : !isComplete;
              })
              .map((task) => (
                <MainTask key={task.id} task={task} projectId={project.id} filter={filter} />
              ))}

            {isAddingTask ? (
              <div className="flex items-center gap-2 p-3 bg-slate-700 rounded-lg">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task name"
                  className="flex-1 bg-slate-600 text-slate-200 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={handleAddTask}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={cancelAddTask}
                  className="px-3 py-1 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={startAddTask}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors p-2"
              >
                <Plus size={18} />
                <span>Add Main Task</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Project;
