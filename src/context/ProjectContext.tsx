import React, { createContext, useReducer, useContext, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Project, ActionType } from "../types";
import { supabase } from "../lib/supabase";

interface ProjectContextType {
  projects: Project[];
  dispatch: React.Dispatch<ActionType>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const projectReducer = (state: Project[], action: ActionType): Project[] => {
  switch (action.type) {
    case "INIT_PROJECTS":
      return action.payload;

    case "ADD_PROJECT":
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

      return [...state, newProject];

    case "UPDATE_PROJECT":
      supabase
        .from("projects")
        .update({ title: action.payload.title })
        .eq("id", action.payload.id)
        .then(({ error }) => {
          if (error) console.error("Error updating project:", error);
        });

      return state.map((project) =>
        project.id === action.payload.id
          ? { ...project, title: action.payload.title }
          : project
      );

    case "DELETE_PROJECT":
      supabase
        .from("projects")
        .delete()
        .eq("id", action.payload)
        .then(({ error }) => {
          if (error) console.error("Error deleting project:", error);
        });

      return state.filter((project) => project.id !== action.payload);

    case "TOGGLE_PROJECT_EXPAND":
      return state.map((project) =>
        project.id === action.payload
          ? { ...project, isExpanded: !project.isExpanded }
          : project
      );

    case "ADD_MAIN_TASK":
      const newTask = {
        id: uuidv4(),
        title: action.payload.title,
        subtasks: [],
        isExpanded: true,
      };

      supabase
        .from("tasks")
        .insert([
          {
            id: newTask.id,
            title: newTask.title,
            project_id: action.payload.projectId,
          },
        ])
        .then(({ error }) => {
          if (error) console.error("Error adding task:", error);
        });

      return state.map((project) =>
        project.id === action.payload.projectId
          ? {
              ...project,
              mainTasks: [...project.mainTasks, newTask],
            }
          : project
      );

    case "UPDATE_MAIN_TASK":
      return state.map((project) =>
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
      );

    case "DELETE_MAIN_TASK":
      return state.map((project) =>
        project.id === action.payload.projectId
          ? {
              ...project,
              mainTasks: project.mainTasks.filter(
                (task) => task.id !== action.payload.taskId
              ),
            }
          : project
      );

    case "TOGGLE_MAIN_TASK_EXPAND":
      return state.map((project) =>
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
      );

    case "ADD_SUBTASK":
      const newSubtask = {
        id: uuidv4(),
        title: action.payload.title,
        estimated_time: action.payload.estimatedTime,
        completed: false,
        parent_task: action.payload.taskId,
        project_id: action.payload.projectId,
        user_id: null, // or set a static string like 'guest' if needed
      };

      supabase
        .from("tasks")
        .insert([newSubtask])
        .then(({ error }) => {
          if (error) console.error("Error adding subtask:", error);
        });

      return state.map((project) =>
        project.id === action.payload.projectId
          ? {
              ...project,
              mainTasks: project.mainTasks.map((task) =>
                task.id === action.payload.taskId
                  ? {
                      ...task,
                      subtasks: [
                        ...task.subtasks,
                        {
                          id: newSubtask.id,
                          title: newSubtask.title,
                          completed: false,
                          estimatedTime: newSubtask.estimated_time,
                        },
                      ],
                    }
                  : task
              ),
            }
          : project
      );

    case "UPDATE_SUBTASK":
      return state.map((project) =>
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
      );

    case "DELETE_SUBTASK":
      return state.map((project) =>
        project.id === action.payload.projectId
          ? {
              ...project,
              mainTasks: project.mainTasks.map((task) =>
                task.id === action.payload.taskId
                  ? {
                      ...task,
                      subtasks: task.subtasks.filter(
                        (subtask) => subtask.id !== action.payload.subtaskId
                      ),
                    }
                  : task
              ),
            }
          : project
      );

      case "TOGGLE_SUBTASK_COMPLETE": {
        let updatedCompletion: boolean | undefined;
      
        const newState = state.map((project) =>
          project.id === action.payload.projectId
            ? {
                ...project,
                mainTasks: project.mainTasks.map((task) =>
                  task.id === action.payload.taskId
                    ? {
                        ...task,
                        subtasks: task.subtasks.map((subtask) => {
                          if (subtask.id === action.payload.subtaskId) {
                            updatedCompletion = !subtask.completed;
                            return { ...subtask, completed: updatedCompletion };
                          }
                          return subtask;
                        }),
                      }
                    : task
                ),
              }
            : project
        );
      
        if (updatedCompletion !== undefined) {
          supabase
            .from("tasks")
            .update({ completed: updatedCompletion })
            .eq("id", action.payload.subtaskId)
            .then(({ error }) => {
              if (error) console.error("Error updating subtask completion:", error);
            });
        }
      
        return newState;
      }
      
      case "DUPLICATE_MAIN_TASK": {
        const { projectId, task } = action.payload;
        const newTaskId = uuidv4();
      
        const newSubtasks = task.subtasks.map((sub) => ({
          id: uuidv4(),
          title: sub.title,
          completed: false,
          estimated_time: sub.estimatedTime,
          parent_task: newTaskId,
          project_id: projectId,
          user_id: null,
        }));
      
        supabase
          .from("tasks")
          .insert([
            { id: newTaskId, title: `${task.title} (copy)`, project_id: projectId },
            ...newSubtasks,
          ])
          .then(({ error }) => {
            if (error) console.error("Error duplicating task & subtasks:", error);
          });
      
        return state.map((project) =>
          project.id === projectId
            ? {
                ...project,
                mainTasks: [
                  ...project.mainTasks,
                  {
                    id: newTaskId,
                    title: `${task.title} (copy)`,
                    isExpanded: true,
                    subtasks: newSubtasks.map((s) => ({
                      id: s.id,
                      title: s.title,
                      completed: false,
                      estimatedTime: s.estimated_time,
                    })),
                  },
                ],
              }
            : project
        );
      }
      
    default:
      return state;
  }
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [projects, dispatch] = useReducer(projectReducer, []);

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
    <ProjectContext.Provider value={{ projects, dispatch }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjectContext must be used within a ProjectProvider");
  }
  return context;
};
