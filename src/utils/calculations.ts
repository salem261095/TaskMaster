import { Project, MainTask } from '../types';

export const calculateMainTaskProgress = (mainTask: MainTask): number => {
  const { subtasks } = mainTask;
  if (subtasks.length === 0) return 0;
  const completedSubtasks = subtasks.filter((subtask) => subtask.completed).length;
  return Math.round((completedSubtasks / subtasks.length) * 100);
};

export const calculateMainTaskTime = (mainTask: MainTask): number => {
  return mainTask.subtasks.reduce((total, subtask) => total + subtask.estimatedTime, 0);
};

export const calculateProjectProgress = (project: Project): number => {
  const { mainTasks } = project;
  if (mainTasks.length === 0) return 0;
  const totalProgress = mainTasks.reduce(
    (sum, task) => sum + calculateMainTaskProgress(task),
    0
  );
  return Math.round(totalProgress / mainTasks.length);
};

export const calculateProjectTime = (project: Project): number => {
  return project.mainTasks.reduce(
    (total, mainTask) => total + calculateMainTaskTime(mainTask),
    0
  );
};

export const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
};
