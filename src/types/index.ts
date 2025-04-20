

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  estimatedTime: number; // in minutes
}

export interface MainTask {
  id: string;
  title: string;
  subtasks: Subtask[];
  isExpanded: boolean;
}

export interface Project {
  id: string;
  title: string;
  mainTasks: MainTask[];
  isExpanded: boolean;
}

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          title: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          user_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          user_id?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          estimated_time: number;
          completed: boolean;
          due_date: string | null;
          notes: string | null;
          parent_task: string | null;
          project_id: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          estimated_time?: number;
          completed?: boolean;
          due_date?: string | null;
          notes?: string | null;
          parent_task?: string | null;
          project_id: string;
          user_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          estimated_time?: number;
          completed?: boolean;
          due_date?: string | null;
          notes?: string | null;
          parent_task?: string | null;
          project_id?: string;
          user_id?: string;
        };
      };
    };
  };
}

export type ActionType =
  | { type: 'INIT_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Omit<Project, 'id' | 'mainTasks' | 'isExpanded'> }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; title: string } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'TOGGLE_PROJECT_EXPAND'; payload: string }
  | { type: 'ADD_MAIN_TASK'; payload: { projectId: string; title: string } }
  | { type: 'UPDATE_MAIN_TASK'; payload: { projectId: string; taskId: string; title: string } }
  | { type: 'DELETE_MAIN_TASK'; payload: { projectId: string; taskId: string } }
  | { type: 'TOGGLE_MAIN_TASK_EXPAND'; payload: { projectId: string; taskId: string } }
  | {
      type: 'ADD_SUBTASK';
      payload: { projectId: string; taskId: string; title: string; estimatedTime: number };
    }
  | {
      type: 'UPDATE_SUBTASK';
      payload: { projectId: string; taskId: string; subtaskId: string; title: string; estimatedTime: number };
    }
  | { type: 'DELETE_SUBTASK'; payload: { projectId: string; taskId: string; subtaskId: string } }
  | {
      type: 'TOGGLE_SUBTASK_COMPLETE';
      payload: { projectId: string; taskId: string; subtaskId: string };
    }
  | {
    type: 'DUPLICATE_MAIN_TASK';
    payload: { projectId: string; task: MainTask };
  }
| { type: 'SET_SELECTED_PROJECT'; payload: string };