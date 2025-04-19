import React, { useState } from 'react';
import { Subtask as SubtaskType } from '../types';
import { Check, X, Edit, Trash2, Clock } from 'lucide-react';
import { useProjectContext } from '../context/ProjectContext';
import { formatTime } from '../utils/calculations';

interface SubtaskProps {
  subtask: SubtaskType;
  projectId: string;
  taskId: string;
}

const Subtask: React.FC<SubtaskProps> = ({ subtask, projectId, taskId }) => {
  const { dispatch } = useProjectContext();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(subtask.title);
  const [estimatedTime, setEstimatedTime] = useState(subtask.estimatedTime);

  const handleToggleComplete = () => {
    dispatch({
      type: 'TOGGLE_SUBTASK_COMPLETE',
      payload: { projectId, taskId, subtaskId: subtask.id },
    });
  };

  const handleDelete = () => {
    dispatch({
      type: 'DELETE_SUBTASK',
      payload: { projectId, taskId, subtaskId: subtask.id },
    });
  };

  const handleEdit = () => setIsEditing(true);

  const handleSave = () => {
    if (title.trim() !== '') {
      dispatch({
        type: 'UPDATE_SUBTASK',
        payload: {
          projectId,
          taskId,
          subtaskId: subtask.id,
          title,
          estimatedTime,
        },
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTitle(subtask.title);
    setEstimatedTime(subtask.estimatedTime);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="pl-4 py-2 flex items-center gap-2 bg-slate-800 bg-opacity-50 rounded-md mb-1 transition-all hover:bg-slate-800">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="flex-1 bg-slate-700 text-slate-200 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          autoFocus
        />
        <div className="flex items-center gap-1">
          <Clock size={14} className="text-slate-400" />
          <input
            type="number"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(parseInt(e.target.value, 10) || 0)}
            className="w-16 bg-slate-700 text-slate-200 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            min="0"
          />
          <span className="text-xs text-slate-400">min</span>
        </div>
        <button
          onClick={handleSave}
          className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <Check size={16} />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="pl-4 py-2 flex items-center gap-3 bg-slate-800 bg-opacity-50 rounded-md mb-1 transition-all hover:bg-slate-800">
      <button
        onClick={handleToggleComplete}
        className={`p-0.5 border rounded transition-colors ${
          subtask.completed
            ? 'bg-green-500 border-green-600 text-white'
            : 'border-slate-500 text-transparent hover:border-slate-400'
        }`}
      >
        <Check size={14} className={subtask.completed ? 'opacity-100' : 'opacity-0'} />
      </button>
      
      <span 
        className={`flex-1 ${subtask.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}
      >
        {subtask.title}
      </span>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-slate-400">
          <Clock size={14} />
          <span className="text-xs">{formatTime(subtask.estimatedTime)}</span>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={handleEdit}
            className="p-1 text-slate-400 rounded hover:bg-slate-700 hover:text-slate-200 transition-colors"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-slate-400 rounded hover:bg-slate-700 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subtask;
