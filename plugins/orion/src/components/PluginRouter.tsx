import React from 'react';
import {Route, Routes} from 'react-router-dom';
import {ProjectsOverviewPage} from './projectsOverview';
import {NewProjectPage} from "./workFlow";
import {Training} from "./training";

export const PluginRouter = () => (
    <Routes>
        <Route path="/" element={<ProjectsOverviewPage/>}/>
        <Route path="/projects" element={<ProjectsOverviewPage/>}/>
        <Route path="/workflow" element={<NewProjectPage/>}/>
        <Route path="/training" element={<Training/>}/>
    </Routes>
);