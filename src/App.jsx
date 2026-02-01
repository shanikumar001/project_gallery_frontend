import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import AuthCallback from './pages/AuthCallback';
import Chat from './pages/Chat';
import UploadProject from './components/UploadProject';
import ProjectGallery from './components/ProjectGallery';

const queryClient = new QueryClient();

function ProfileOrUserProfile() {
  const { userId } = useParams();
  const { user } = useAuth();
  if (user?.id === userId) return <Profile />;
  return <UserProfile userId={userId} />;
}

function HomeContent() {
  const { user } = useAuth();

  return (
    <main className="container px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {user && <UploadProject />}
        <ProjectGallery />
      </div>
    </main>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Header />
              <Routes>
                <Route path="/" element={<HomeContent />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:userId" element={<ProfileOrUserProfile />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:userId" element={<Chat />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Toaster />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
