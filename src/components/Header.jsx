import { Link } from 'react-router-dom';
import { Moon, Sun, Upload, LogIn, UserPlus, MessageSquare } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUnreadCount } from '../hooks/useQueries';
import ProfileDropdown from './ProfileDropdown';

function UnreadBadge() {
  const { data } = useUnreadCount();
  const count = data?.count ?? 0;
  if (count === 0) return null;
  return (
    <span className="absolute -top-0.5 -right-1 h-4 min-w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center px-1">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Upload className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
            Project Gallery
          </h1>
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="relative pr-2">
                <Link to="/chat" className="relative inline-flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Messages
                  <UnreadBadge />
                </Link>
              </Button>
              <ProfileDropdown user={user} logout={logout} theme={theme} setTheme={setTheme} />
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">
                  <LogIn className="h-4 w-4 mr-1" />
                  Log In
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Sign Up
                </Link>
              </Button>
            </>
          )}
          {mounted && !user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
