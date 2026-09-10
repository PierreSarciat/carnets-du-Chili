import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import Layout from '@components/Layout/Layout.jsx';
import Region from '@pages/region/Region.jsx';
import NotFound from '@pages/notfound/NotFound.jsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            { index: true, element: <App /> },
            {
                path: 'region/:regionId', // ✅ Route dynamique
                element: <Region />,
            },
            { path: '*', element: <NotFound /> } // ✅ Page 404
        ]
    },
],
    { basename: "/carnets-du-Chili", }
);

export default function Router() {
    return <RouterProvider router={router} />;
}