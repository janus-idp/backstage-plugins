import React from 'react';
import { Routes, Route} from 'react-router-dom';
import { NewProjectPage } from './NewProjectPage';
import { ProjectAssessmentPage } from './ProjectAssessmentPage';

export const PluginRouter = () => (
    <Routes>
      <Route path="/" element={<ProjectAssessmentPage />} />
      <Route path="/projects" element={<ProjectAssessmentPage />} />
  
      <Route path="/newproject" element={<NewProjectPage />} />
    </Routes>
  );