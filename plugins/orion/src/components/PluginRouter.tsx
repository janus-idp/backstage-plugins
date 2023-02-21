import React from 'react';
import { Routes, Route} from 'react-router-dom';
import { ProjectAssessmentPage } from './ProjectAssessmentPage';

export const PluginRouter = () => (
    <Routes>
      <Route path="/" element={<ProjectAssessmentPage />} />
      <Route path="/projects" element={<ProjectAssessmentPage />} />
  
      {/* TODO: change following to NewProjectPage */}
      <Route path="/newproject" element={<ProjectAssessmentPage />} />
    </Routes>
  );