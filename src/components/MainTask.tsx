import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Clock,
  Copy,
} from "lucide-react";
import { MainTask as MainTaskType } from "../types";
import { useProjectContext } from "../context/ProjectContext";
import Subtask from "./Subtask";
import ProgressBar from "./ProgressBar";
import {
  calculateMainTaskProgress,
  calculateMainTaskTime,
  formatTime,
} from "../utils/calculations";
import { supabase } from "../lib/supabase";
import { v4 as uuidv4 } from "uuid";

interface MainTaskProps {
  task: MainTaskType;
  projectId: string;
  filter?: "all" | "completed" | "incomplete";
}

const MainTask: React.FC<MainTaskProps> = ({ task, projectId, filter = "all" }) => {
  const { dispatch } = useProjectContext();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newSubtaskTime, setNewSubtaskTime] = useState(30);

  const progress = isNaN(calculateMainTaskProgress(task))
    ? 0
    : calculateMainTaskProgress(task);
  const totalTime = calculateMainTaskTime(task);

  const toggleExpand = () => {
    dispatch({
      type: "TOGGLE_MAIN_TASK_EXPAND",
      payload: { projectId, taskId: task.id },
    });
  };

  const handleDelete = async () => {
    await supabase.from("tasks").delete().eq("id", task.id);
    dispatch({
      type: "DELETE_MAIN_TASK",
      payload: { projectId, taskId: task.id },
    });
  };

  const handleEdit = () => setIsEditing(true);

  const handleSave = () => {
    if (title.trim() !== "") {
      dispatch({
        type: "UPDATE_MAIN_TASK",
        payload: { projectId, taskId: task.id, title },
      });
      setIsEditing(false);
    }
  };

  const startAddSubtask = () => setIsAddingSubtask(true);

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim() !== "") {
      dispatch({
        type: "ADD_SUBTASK",
        payload: {
          projectId,
          taskId: task.id,
          title: newSubtaskTitle,
          estimatedTime: newSubtaskTime,
        },
      });
      setNewSubtaskTitle("");
      setNewSubtaskTime(30);
      setIsAddingSubtask(false);
    }
  };

  const cancelAddSubtask = () => {
    setNewSubtaskTitle("");
    setNewSubtaskTime(30);
    setIsAddingSubtask(false);
  };

  const handleDuplicate = async () => {
    const newTaskId = uuidv4();
    const duplicatedSubtasks = task.subtasks.map((s) => ({
      id: uuidv4(),
      title: s.title,
      estimated_time: s.estimatedTime,
      completed: false,
      parent_task: newTaskId,
      project_id: projectId,
      user_id: null,
    }));

    await supabase
      .from("tasks")
      .insert([
        { id: newTaskId, title: `${task.title} (copy)`, project_id: projectId },
        ...duplicatedSubtasks,
      ]);

    dispatch({
      type: "DUPLICATE_MAIN_TASK",
      payload: {
        projectId,
        task,
      },
    });
  };

  return (
    <div className="mb-3 bg-slate-800 rounded-lg p-4 shadow-md transition-all hover:shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={toggleExpand}
          className="p-1 rounded-full hover:bg-slate-700 transition-colors"
        >
          {task.isExpanded ? (
            <ChevronDown size={18} className="text-slate-400" />
          ) : (
            <ChevronRight size={18} className="text-slate-400" />
          )}
        </button>

        {isEditing ? (
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
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
                setTitle(task.title);
                setIsEditing(false);
              }}
              className="px-3 py-1 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-medium flex-1">{task.title}</h3>
            <div className="flex items-center gap-2 text-slate-400">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span className="text-xs">{formatTime(totalTime)}</span>
              </div>
              <span className="text-sm font-medium">{progress}%</span>
              <button
                onClick={handleDuplicate}
                className="p-1 rounded hover:bg-slate-700 hover:text-slate-200 transition-colors"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={handleEdit}
                className="p-1 rounded hover:bg-slate-700 hover:text-slate-200 transition-colors"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 rounded hover:bg-slate-700 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      <ProgressBar percentage={progress} className="mb-3" />

      {task.isExpanded && (
        <div className="ml-5 mt-3 space-y-2">
          {task.subtasks
            .filter((subtask) => {
              if (filter === "completed") return subtask.completed;
              if (filter === "incomplete") return !subtask.completed;
              return true;
            })
            .map((subtask) => (
              <Subtask
                key={subtask.id}
                subtask={subtask}
                projectId={projectId}
                taskId={task.id}
              />
            ))}

          {isAddingSubtask ? (
            <div className="pl-4 py-2 flex items-center gap-2 bg-slate-800 bg-opacity-50 rounded-md mt-2 transition-all">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                placeholder="Subtask name"
                className="flex-1 bg-slate-700 text-slate-200 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-slate-400" />
                <input
                  type="number"
                  value={newSubtaskTime}
                  onChange={(e) =>
                    setNewSubtaskTime(parseInt(e.target.value, 10) || 0)
                  }
                  className="w-16 bg-slate-700 text-slate-200 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="0"
                />
                <span className="text-xs text-slate-400">min</span>
              </div>
              <button
                onClick={handleAddSubtask}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
              <button
                onClick={cancelAddSubtask}
                className="px-3 py-1 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={startAddSubtask}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors ml-4 mt-2"
            >
              <Plus size={16} />
              <span>Add Subtask</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MainTask;
