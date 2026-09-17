import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAppData } from './hooks/useAppData';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { Toast } from './components/ui/Toast';
import './App.css';
import './styles/premium.css';

// Pages
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import ChatPage from './pages/ChatPage';
import StudyPlan from './pages/StudyPlan';
import Diagnostic from './pages/Diagnostic';
import QuizPage from './pages/QuizPage';
import DoubtSolver from './pages/DoubtSolver';
import KnowledgeMap from './pages/KnowledgeMap';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

export function App() {
  const data = useAppData();

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Toast message={data.toast} onClose={() => data.notify('')} />
        <Routes>
          {/* Onboarding is standalone without sidebar */}
          <Route path="/onboarding" element={<Onboarding data={data} />} />

          {/* Diagnostic wrapped in AppShell */}
          <Route
            path="/diagnostic"
            element={
              <AppShell profile={data.profile}>
                <Diagnostic data={data} />
              </AppShell>
            }
          />

          {/* All core workspace routes */}
          <Route
            path="*"
            element={
              <AppShell profile={data.profile}>
                <Routes>
                  <Route path="/" element={<Dashboard data={data} />} />
                  <Route path="/chat" element={<ChatPage data={data} />} />
                  <Route path="/study-plan" element={<StudyPlan data={data} />} />
                  <Route path="/quiz" element={<QuizPage data={data} />} />
                  <Route path="/doubt-solver" element={<DoubtSolver data={data} />} />
                  <Route path="/analytics" element={<Analytics data={data} />} />
                  <Route path="/knowledge-map" element={<KnowledgeMap data={data} />} />
                  <Route path="/settings" element={<Settings data={data} />} />
                </Routes>
              </AppShell>
            }
          />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
