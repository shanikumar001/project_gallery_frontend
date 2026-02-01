import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  useUserProfile,
  useFollowUser,
  useFollowStatus,
} from '../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProjectCard from '../components/ProjectCard';
import { MessageSquare, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function UserProfile({ userId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading, error } = useUserProfile(userId);
  const followMutation = useFollowUser();
  const { data: followStatus = { following: false, requested: false } } = useFollowStatus(userId);
  const { following, requested } = followStatus;

  const isMe = user?.id === userId;

  const getInitials = (name) =>
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';

  const photoUrl = profile?.profilePhoto?.startsWith('/')
    ? `${window.location.origin}${profile.profilePhoto}`
    : profile?.profilePhoto;

  const handleMessage = () => {
    if (!user) {
      toast.error('Please log in to message');
      navigate('/login');
      return;
    }
    navigate(`/chat/${userId}`);
  };

  const handleFollow = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to follow');
      navigate('/login');
      return;
    }
    followMutation.mutate(
      { userId, following, requested },
      {
        onSuccess: (_, vars) =>
          toast.success(vars.requested || vars.following ? 'Request sent!' : 'Unfollowed'),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  if (isLoading) {
    return (
      <main className="container px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="aspect-video rounded-xl" />
            <Skeleton className="aspect-video rounded-xl" />
            <Skeleton className="aspect-video rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="container px-4 py-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-muted-foreground">User not found.</p>
          <Link to="/" className="text-primary hover:underline mt-2 inline-block">
            Back to gallery
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container px-4 py-8" id="user-profile">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="border-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={photoUrl} />
                <AvatarFallback className="text-2xl">{getInitials(profile.name)}</AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left flex-1">
                <CardTitle className="text-2xl">{profile.name}</CardTitle>
                {profile.username && (
                  <p className="text-muted-foreground">@{profile.username}</p>
                )}
                {profile.bio && (
                  <p className="mt-2 text-sm max-w-lg">{profile.bio}</p>
                )}
                <div className="flex flex-wrap gap-6 mt-4 justify-center sm:justify-start items-center">
                  <span className="font-semibold">{profile.followerCount ?? 0}</span>
                  <span className="text-muted-foreground text-sm">Followers</span>
                  <span className="font-semibold">{profile.followingCount ?? 0}</span>
                  <span className="text-muted-foreground text-sm">Following</span>
                  <span className="font-semibold">{profile.projects?.length ?? 0}</span>
                  <span className="text-muted-foreground text-sm">Projects</span>
                </div>
                {user && !isMe && (
                  <div className="flex gap-2 mt-4 justify-center sm:justify-start">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={handleMessage}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Message
                    </Button>
                    <Button
                      variant={following ? 'secondary' : requested ? 'outline' : 'default'}
                      size="sm"
                      className="gap-1"
                      onClick={handleFollow}
                      disabled={followMutation.isPending}
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      {requested ? 'Requested' : following ? 'Following' : 'Follow'}
                    </Button>
                  </div>
                )}
                {!user && (
                  <p className="text-sm text-muted-foreground mt-4">
                    <Link to="/login" className="text-primary hover:underline">Log in</Link> to follow or message.
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <section>
          <h2 className="text-2xl font-bold mb-4">Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.projects?.length > 0 ? (
              profile.projects.map((project) => (
                <ProjectCard key={project.id} project={project} showActions />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No projects yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
