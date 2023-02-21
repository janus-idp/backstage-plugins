import React from 'react';
import {Route, Routes} from 'react-router-dom';
import {ProjectOverviewPage} from './projectOverview';
import {Workflow} from "./workflow";
import {Notification} from "./notification";
import {Training} from "./training";

export const PluginRouter = () => (
    <Routes>
        <Route path="/" element={<ProjectOverviewPage/>}/>
        <Route path="/project-overview" element={<ProjectOverviewPage/>}/>
        <Route path="/workflow" element={<Workflow/>}/>
        <Route path="/notification" element={<Notification/>}/>
        <Route path="/training" element={<Training/>}/>
    </Routes>
);