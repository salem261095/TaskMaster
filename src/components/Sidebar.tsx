import React from 'react';
import { useProjectContext } from '../context/ProjectContext';
import { calculateProjectProgress } from '../utils/calculations';
import ProgressBar from './ProgressBar';

interface SidebarProps {
  onProjectClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onProjectClick }) => {
  const { projects } = useProjectContext();

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-slate-200">Projects Overview</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {projects.length === 0 ? (
          <p className="text-slate-400 text-sm">No projects yet</p>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => {
              const progress = calculateProjectProgress(project);
              return (
                <div
                  key={project.id}
                  className="p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
                  onClick={onProjectClick}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-slate-200 truncate">
                      {project.title}
                    </h3>
                    <span className="text-sm text-slate-300">{progress}%</span>
                  </div>
                  <ProgressBar percentage={progress} size="sm" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;