import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  useUserProfile,
  useUpdateProfile,
  useFollowRequests,
  useAcceptFollowRequest,
  useDeclineFollowRequest,
  useFollowersList,
  useFollowingList,
  useDeleteProject,
} from '../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import ProjectCard from '../components/ProjectCard';
import { Navigate } from 'react-router-dom';
import { getMediaUrl } from '../lib/utils';
import { Camera, UserCheck, X, Users, Pencil } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { data: profile, isLoading, refetch } = useUserProfile(user?.id);
  const updateProfile = useUpdateProfile();
  const deleteProject = useDeleteProject();
  const fileInputRef = useRef(null);
  const [listModal, setListModal] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const { data: followRequests = [] } = useFollowRequests();
  const acceptRequest = useAcceptFollowRequest();
  const declineRequest = useDeclineFollowRequest();
  const { data: followersList = [] } = useFollowersList(user?.id);
  const { data: followingList = [] } = useFollowingList(user?.id);

  if (!user) return <Navigate to="/login" replace />;

  const getInitials = (name) =>
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  const photoUrl = getMediaUrl(user?.profilePhoto);

  const startEditing = () => {
    setEditName(user?.name ?? '');
    setEditUsername(user?.username ?? profile?.username ?? (user?.email && user.email.split('@')[0]) ?? '');
    setEditBio(profile?.bio ?? user?.bio ?? '');
    setEditingProfile(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const name = editName?.trim();
    const username = editUsername?.trim().toLowerCase();
    if (!name) {
      toast.error('Name is required');
      return;
    }
    if (username && username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }
    if (username && !/^[a-z0-9_.]+$/.test(username)) {
      toast.error('Username can only contain letters, numbers, dots and underscores');
      return;
    }
    updateProfile.mutate(
      { name, username: username || undefined, bio: editBio ?? '' },
      {
        onSuccess: (data) => {
          if (data.user) updateUser(data.user);
          refetch();
          setEditingProfile(false);
          toast.success('Profile updated');
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please select a valid image (JPEG, PNG, WebP)');
      return;
    }
    updateProfile.mutate(
      { profilePhoto: file },
      {
        onSuccess: (data) => {
          if (data.user) updateUser(data.user);
          refetch();
          toast.success('Profile photo updated');
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleDeleteProject = (projectId) => {
    deleteProject.mutate(projectId, {
      onSuccess: () => {
        refetch();
        toast.success('Project deleted');
      },
      onError: (err) => toast.error(err.message),
    });
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

  const displayUsername = user?.username ?? profile?.username ?? (user?.email && user.email.split('@')[0]) ?? '';
  const displayBio = profile?.bio ?? user?.bio ?? '';

  return (
    <main className="container px-4 py-8" id="profile">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="border-2">
          <CardHeader>
            {editingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={photoUrl} />
                      <AvatarFallback className="text-2xl">{getInitials(editName || user?.name)}</AvatarFallback>
                    </Avatar>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={updateProfile.isPending}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 w-full space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Name</Label>
                      <Input
                        id="edit-name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Your name"
                        disabled={updateProfile.isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-username">Username</Label>
                      <Input
                        id="edit-username"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                        placeholder="username (letters, numbers, _ .)"
                        disabled={updateProfile.isPending}
                      />
                      <p className="text-xs text-muted-foreground">At least 3 characters. Used to log in and in profile URL.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-bio">Bio</Label>
                      <Textarea
                        id="edit-bio"
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value.slice(0, 500))}
                        placeholder="Tell others about yourself..."
                        rows={3}
                        maxLength={500}
                        disabled={updateProfile.isPending}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">{editBio.length}/500</p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={updateProfile.isPending}>
                        {updateProfile.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingProfile(false)}
                        disabled={updateProfile.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={photoUrl} />
                    <AvatarFallback className="text-2xl">{getInitials(user?.name)}</AvatarFallback>
                  </Avatar>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={updateProfile.isPending}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-center sm:text-left flex-1">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <CardTitle className="text-2xl">{user?.name}</CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={startEditing} title="Edit profile">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                  {displayUsername && (
                    <p className="text-muted-foreground">@{displayUsername}</p>
                  )}
                  <p className="text-muted-foreground text-sm">{user?.email}</p>
                  {displayBio && (
                    <p className="mt-2 text-sm max-w-lg">{displayBio}</p>
                  )}
                  <div className="flex flex-wrap gap-6 mt-4 justify-center sm:justify-start items-center">
                    <button
                      type="button"
                      onClick={() => setListModal('followers')}
                      className="hover:underline"
                    >
                      <span className="font-semibold">{profile?.followerCount ?? followersList.length ?? 0}</span>
                      <span className="text-muted-foreground text-sm ml-1">Followers</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setListModal('following')}
                      className="hover:underline"
                    >
                      <span className="font-semibold">{profile?.followingCount ?? followingList.length ?? 0}</span>
                      <span className="text-muted-foreground text-sm ml-1">Following</span>
                    </button>
                    <div>
                      <span className="font-semibold">{profile?.projects?.length || 0}</span>
                      <span className="text-muted-foreground text-sm ml-1">Projects</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
        </Card>

        {followRequests.length > 0 && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Follow requests ({followRequests.length})
              </CardTitle>
            </CardHeader>
            <div className="px-6 pb-6 space-y-3">
              {followRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg border bg-muted/30"
                >
                  <Link
                    to={`/profile`}
                    className="flex items-center gap-3 min-w-0"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={getMediaUrl(req.fromUser?.profilePhoto)} />
                      <AvatarFallback>
                        {(req.fromUser?.name || 'U').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium truncate">{req.fromUser?.name}</span>
                  </Link>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() =>
                        acceptRequest.mutate(req.id, {
                          onSuccess: () => toast.success('Request accepted'),
                          onError: () => toast.error('Failed to accept'),
                        })
                      }
                      disabled={acceptRequest.isPending}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        declineRequest.mutate(req.id, {
                          onSuccess: () => toast.success('Request declined'),
                        })
                      }
                      disabled={declineRequest.isPending}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {listModal && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setListModal(null)}
          >
            <div
              className="bg-card border rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {listModal === 'followers' ? 'Followers' : 'Following'}
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setListModal(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="overflow-y-auto p-4 space-y-2">
                {(listModal === 'followers' ? followersList : followingList).map((u) => (
                  <Link
                    key={u.id}
                    to={`/profile`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                    onClick={() => setListModal(null)}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={getMediaUrl(u.profilePhoto)} />
                      <AvatarFallback>{(u.name || 'U').slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{u.name}</span>
                  </Link>
                ))}
                {(listModal === 'followers' ? followersList : followingList).length === 0 && (
                  <p className="text-muted-foreground text-sm py-4 text-center">No one yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        <section id="projects">
          <h2 className="text-2xl font-bold mb-4">My Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile?.projects?.length > 0 ? (
              profile.projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  showActions
                  showDeleteButton
                  onDelete={handleDeleteProject}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No projects yet. Upload your first project from the home page!
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
