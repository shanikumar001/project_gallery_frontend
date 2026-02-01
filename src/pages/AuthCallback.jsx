import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    if (!token) {
      toast.error('Sign-in failed: no token received');
      navigate('/login', { replace: true });
      return;
    }
    let user = null;
    try {
      if (userParam) user = JSON.parse(decodeURIComponent(userParam));
    } catch {
      // ignore
    }
    if (!user || !user.id) {
      toast.error('Sign-in failed: invalid user data');
      navigate('/login', { replace: true });
      return;
    }
    login(token, user);
    toast.success('Signed in successfully!');
    navigate('/', { replace: true });
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-muted-foreground">Completing sign-in...</p>
    </div>
  );
}
