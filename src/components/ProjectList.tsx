import React, { useState } from 'react';
import { Plus, Undo2 } from 'lucide-react';
import { useProjectContext } from '../context/ProjectContext';
import Project from './Project';

const ProjectList: React.FC = () => {
  const { projects, selectedProjectId, dispatch } = useProjectContext();
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleAddProject = () => {
    if (newProjectTitle.trim() !== '') {
      dispatch({
        type: 'ADD_PROJECT',
        payload: { title: newProjectTitle },
      });
      setNewProjectTitle('');
      setIsAddingProject(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">
          {selectedProject ? selectedProject.title : 'Projects'}
        </h1>
        {!isAddingProject && (
          <button
            onClick={() => setIsAddingProject(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center sm:justify-start"
          >
            <Plus size={18} />
            <span>New Project</span>
          </button>
        )}
      </div>

      {isAddingProject && (
        <div className="mb-6 p-4 bg-slate-800 rounded-lg">
          <h2 className="text-lg font-medium mb-3">Create New Project</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
              placeholder="Project name"
              className="flex-1 bg-slate-700 text-slate-200 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddProject}
                className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setNewProjectTitle('');
                  setIsAddingProject(false);
                }}
                className="flex-1 sm:flex-none px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-16 bg-slate-800 rounded-lg">
          <p className="text-slate-400 mb-4">No projects yet</p>
          <button
            onClick={() => setIsAddingProject(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            <span>Create your first project</span>
          </button>
        </div>
      ) : selectedProject ? (
        <div className="space-y-6">
          <Project key={selectedProject.id} project={selectedProject} />
          <button
            onClick={() => dispatch({ type: 'SET_SELECTED_PROJECT', payload: '' })}
            className="mt-6 flex items-center gap-2 text-sm text-blue-400 hover:underline"
          >
            <Undo2 size={16} />
            Back to all projects
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => (
            <Project key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
