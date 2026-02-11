import React from 'react';
import TasksPage from '../pages/tasks/TasksPage';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import DeletedTasksPage from '../pages/tasks/DeletedTasksPage';

/*
  This file defines all frontend pages and the URL path for each page.
  It redirects the base path to `/tasks` so users always start on the main task list.
*/
// App routes kept small on purpose.
const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/tasks" replace />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/deleted" element={<DeletedTasksPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
