import React, { createContext, useReducer, useContext, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Project, ActionType } from "../types";
import { supabase } from "../lib/supabase";

interface ProjectContextType {
  projects: Project[];
  selectedProjectId: string | null;
  dispatch: React.Dispatch<ActionType>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const initialState = {
  projects: [] as Project[],
  selectedProjectId: null as string | null,
};

type StateType = typeof initialState;

const projectReducer = (state: StateType, action: ActionType): StateType => {
  switch (action.type) {
    case "INIT_PROJECTS":
      return { ...state, projects: action.payload };

    case "SET_SELECTED_PROJECT":
      return { ...state, selectedProjectId: action.payload };

    case "ADD_PROJECT": {
      const newProject = {
        id: uuidv4(),
        title: action.payload.title,
        mainTasks: [],
        isExpanded: true,
      };

      supabase
        .from("projects")
        .insert([{ id: newProject.id, title: newProject.title }])
        .then(({ error }) => {
          if (error) console.error("Error adding project:", error);
        });

      return {
        ...state,
        projects: [...state.projects, newProject],
        selectedProjectId: newProject.id,
      };
    }

    case "DELETE_PROJECT": {
      supabase
        .from("projects")
        .delete()
        .eq("id", action.payload)
        .then(({ error }) => {
          if (error) console.error("Error deleting project:", error);
        });

      const updated = state.projects.filter((p) => p.id !== action.payload);
      const stillExists = updated.some((p) => p.id === state.selectedProjectId);

      return {
        ...state,
        projects: updated,
        selectedProjectId: stillExists ? state.selectedProjectId : null,
      };
    }

    case "UPDATE_PROJECT": {
      supabase
        .from("projects")
        .update({ title: action.payload.title })
        .eq("id", action.payload.id)
        .then(({ error }) => {
          if (error) console.error("Error updating project:", error);
        });

      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.id
            ? { ...project, title: action.payload.title }
            : project
        ),
      };
    }

    case "TOGGLE_SUBTASK_COMPLETE": {
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.projectId
            ? {
                ...project,
                mainTasks: project.mainTasks.map((task) =>
                  task.id === action.payload.taskId
                    ? {
                        ...task,
                        subtasks: task.subtasks.map((subtask) =>
                          subtask.id === action.payload.subtaskId
                            ? { ...subtask, completed: !subtask.completed }
                            : subtask
                        ),
                      }
                    : task
                ),
              }
            : project
        ),
      };
    }
    case "ADD_SUBTASK": {
      const newSubtask = {
        id: uuidv4(),
        title: action.payload.title,
        estimatedTime: action.payload.estimatedTime,
        completed: false,
      };

      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.projectId
            ? {
                ...project,
                mainTasks: project.mainTasks.map((task) =>
                  task.id === action.payload.taskId
                    ? {
                        ...task,
                        subtasks: [...task.subtasks, newSubtask],
                      }
                    : task
                ),
              }
            : project
        ),
      };
    }
    case "UPDATE_SUBTASK": {
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.projectId
            ? {
                ...project,
                mainTasks: project.mainTasks.map((task) =>
                  task.id === action.payload.taskId
                    ? {
                        ...task,
                        subtasks: task.subtasks.map((subtask) =>
                          subtask.id === action.payload.subtaskId
                            ? {
                                ...subtask,
                                title: action.payload.title,
                                estimatedTime: action.payload.estimatedTime,
                              }
                            : subtask
                        ),
                      }
                    : task
                ),
              }
            : project
        ),
      };
    }
    case "DELETE_SUBTASK":
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.projectId
            ? {
                ...project,
                mainTasks: project.mainTasks.map((task) =>
                  task.id === action.payload.taskId
                    ? {
                        ...task,
                        subtasks: task.subtasks.filter(
                          (sub) => sub.id !== action.payload.subtaskId
                        ),
                      }
                    : task
                ),
              }
            : project
        ),
      };

    case "ADD_MAIN_TASK": {
      const newTask = {
        id: uuidv4(),
        title: action.payload.title,
        subtasks: [],
        isExpanded: true,
      };

      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.projectId
            ? {
                ...project,
                mainTasks: [...project.mainTasks, newTask],
              }
            : project
        ),
      };
    }

    case "UPDATE_MAIN_TASK":
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.projectId
            ? {
                ...project,
                mainTasks: project.mainTasks.map((task) =>
                  task.id === action.payload.taskId
                    ? { ...task, title: action.payload.title }
                    : task
                ),
              }
            : project
        ),
      };

    case "DELETE_MAIN_TASK":
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.projectId
            ? {
                ...project,
                mainTasks: project.mainTasks.filter(
                  (task) => task.id !== action.payload.taskId
                ),
              }
            : project
        ),
      };

    case "TOGGLE_MAIN_TASK_EXPAND":
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.projectId
            ? {
                ...project,
                mainTasks: project.mainTasks.map((task) =>
                  task.id === action.payload.taskId
                    ? { ...task, isExpanded: !task.isExpanded }
                    : task
                ),
              }
            : project
        ),
      };

    case "DUPLICATE_MAIN_TASK": {
      const { projectId, task } = action.payload;
      const newTaskId = uuidv4();

      const newSubtasks = task.subtasks.map((subtask) => ({
        ...subtask,
        id: uuidv4(),
        completed: false,
      }));

      const newTask = {
        id: newTaskId,
        title: `${task.title} (copy)`,
        subtasks: newSubtasks,
        isExpanded: true,
      };

      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                mainTasks: [...project.mainTasks, newTask],
              }
            : project
        ),
      };
    }

    default:
      return state;
  }
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*");

      if (projectsError) {
        console.error("Error fetching projects:", projectsError);
        return;
      }

      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*");

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
        return;
      }

      const transformedProjects = projectsData.map((project) => {
        const projectTasks = tasksData
          .filter((task) => task.project_id === project.id && !task.parent_task)
          .map((task) => ({
            id: task.id,
            title: task.title,
            subtasks: tasksData
              .filter((subtask) => subtask.parent_task === task.id)
              .map((subtask) => ({
                id: subtask.id,
                title: subtask.title,
                completed: subtask.completed,
                estimatedTime: subtask.estimated_time,
              })),
            isExpanded: true,
          }));

        return {
          id: project.id,
          title: project.title,
          mainTasks: projectTasks,
          isExpanded: true,
        };
      });

      dispatch({ type: "INIT_PROJECTS", payload: transformedProjects });
    };

    fetchProjects();
  }, []);

  return (
    <ProjectContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjectContext must be used within a ProjectProvider");
  }
  return context;
};
