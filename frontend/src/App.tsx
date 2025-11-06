import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Components
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import Calendar from './components/Calendar/Calendar';
import Timer from './components/Timer/Timer';
import Analytics from './components/Analytics/Analytics';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Store
import { useAuthStore } from './store/authStore';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Login />} />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </Router>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/timer" element={<Timer />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
          <Toaster position="top-right" />
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
