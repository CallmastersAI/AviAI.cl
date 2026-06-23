"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";
import type { Project, LogEntry, PipelineStage, DesignStyle, ProjectImage } from "@/lib/types";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface ProjectsState {
  projects: Project[];
  currentProjectId: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  currentProjectId: null,
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type ProjectsAction =
  | {
      type: "CREATE_PROJECT";
      payload: {
        id: string;
        name: string;
        style: DesignStyle;
        images: ProjectImage[];
      };
    }
  | {
      type: "UPDATE_PROJECT";
      payload: {
        id: string;
        updates: Partial<Omit<Project, "id">>;
      };
    }
  | {
      type: "ADD_LOG";
      payload: {
        projectId: string;
        entry: LogEntry;
      };
    }
  | {
      type: "SET_CURRENT_PROJECT";
      payload: string | null;
    };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function projectsReducer(
  state: ProjectsState,
  action: ProjectsAction
): ProjectsState {
  switch (action.type) {
    case "CREATE_PROJECT": {
      const { id, name, style, images } = action.payload;
      const newProject: Project = {
        id,
        name,
        style,
        images,
        status: "uploading",
        progress: 0,
        currentStep: 0,
        logs: [],
        videoUrl: null,
        thumbnailUrl: null,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };
      return {
        ...state,
        projects: [...state.projects, newProject],
        currentProjectId: id,
      };
    }

    case "UPDATE_PROJECT": {
      const { id, updates } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      };
    }

    case "ADD_LOG": {
      const { projectId, entry } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, logs: [...p.logs, entry] } : p
        ),
      };
    }

    case "SET_CURRENT_PROJECT": {
      return {
        ...state,
        currentProjectId: action.payload,
      };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ProjectsStateContext = createContext<ProjectsState | null>(null);
const ProjectsDispatchContext = createContext<Dispatch<ProjectsAction> | null>(
  null
);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(projectsReducer, initialState);

  return (
    <ProjectsStateContext.Provider value={state}>
      <ProjectsDispatchContext.Provider value={dispatch}>
        {children}
      </ProjectsDispatchContext.Provider>
    </ProjectsStateContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useProjects() {
  const state = useContext(ProjectsStateContext);
  const dispatch = useContext(ProjectsDispatchContext);

  if (state === null || dispatch === null) {
    throw new Error("useProjects must be used within a <ProjectProvider>");
  }

  const currentProject =
    state.projects.find((p) => p.id === state.currentProjectId) ?? null;

  return {
    projects: state.projects,
    currentProject,
    currentProjectId: state.currentProjectId,

    createProject(params: {
      id: string;
      name: string;
      style: DesignStyle;
      images: ProjectImage[];
    }) {
      dispatch({ type: "CREATE_PROJECT", payload: params });
    },

    updateProject(id: string, updates: Partial<Omit<Project, "id">>) {
      dispatch({ type: "UPDATE_PROJECT", payload: { id, updates } });
    },

    addLog(projectId: string, entry: LogEntry) {
      dispatch({ type: "ADD_LOG", payload: { projectId, entry } });
    },

    setCurrentProject(id: string | null) {
      dispatch({ type: "SET_CURRENT_PROJECT", payload: id });
    },

    dispatch,
  };
}
