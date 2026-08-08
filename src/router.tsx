import { createHashRouter } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { PracticePage } from './pages/PracticePage';
import { WorkspacePage } from './pages/WorkspacePage';
import { VocabularyPage } from './pages/VocabularyPage';

// Hash routing keeps the app deployable as static files with no server rewrites.
export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <PracticePage /> },
      { path: 'workspace', element: <WorkspacePage /> },
      { path: 'vocab', element: <VocabularyPage /> },
    ],
  },
]);
