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

    default:
      return state;
  }
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
