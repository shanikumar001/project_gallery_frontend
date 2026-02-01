import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Image as ImageIcon,
  Video,
  Heart,
  MessageCircle,
  Bookmark,
  ExternalLink,
  Code,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  useLikeProject,
  useSaveProject,
  useAddComment,
  useFollowUser,
  useFollowStatus,
} from "../hooks/useQueries";
import { toast } from "sonner";

export default function ProjectCard({ project, showActions = true, showDeleteButton = false, onDelete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const likeMutation = useLikeProject();
  const saveMutation = useSaveProject();
  const addCommentMutation = useAddComment();
  const followMutation = useFollowUser();
  const ownerId = project.user?.id;
  const isOwner = user?.id === ownerId;
  const { data: followStatus = { following: false, requested: false } } = useFollowStatus(ownerId);
  const { following, requested } = followStatus;

  const firstMedia = project.media?.[0];
  const mediaUrl = firstMedia?.url || null;
  const isVideo =
    mediaUrl &&
    (mediaUrl.includes(".mp4") ||
      mediaUrl.includes(".webm") ||
      (firstMedia?.filename || "").match(/\.(mp4|webm)$/));

  const liked = user && project.likes?.includes(user.id);
  const saved = user && project.savedBy?.includes(user.id);
  const likeCount = project.likeCount ?? project.likes?.length ?? 0;
  const commentCount = project.commentCount ?? project.comments?.length ?? 0;

  const handleLike = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to like");
      return;
    }
    likeMutation.mutate({ projectId: project.id, liked });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to save");
      return;
    }
    saveMutation.mutate({ projectId: project.id, saved });
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to comment");
      return;
    }
    if (!commentText.trim()) return;
    addCommentMutation.mutate(
      { projectId: project.id, text: commentText.trim() },
      {
        onSuccess: () => {
          setCommentText("");
        },
      },
    );
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const ownerPhotoUrl = project.user?.profilePhoto?.startsWith("/")
    ? `${window.location.origin}${project.user.profilePhoto}`
    : project.user?.profilePhoto;

  const handleMessage = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to message");
      return;
    }
    navigate(`/chat/${ownerId}`);
  };

  const handleFollow = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to follow");
      return;
    }
    if (isOwner) return;
    followMutation.mutate(
      { userId: ownerId, following, requested },
      {
        onSuccess: (_, vars) =>
          toast.success(vars.requested || vars.following ? "Request sent!" : "Unfollowed"),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <div>
      <Card className="group gap-2 overflow-hidden hover:shadow-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-card-scale ">
        
        <div className="relative aspect-video overflow-hidden mt-[-25] ">
          {mediaUrl ? (
            <>
              {isVideo ? (
                <div className="relative aspect-video overflow-hidden flex justify-center items-center">
                  <video
                    src={mediaUrl}
                    className="absolute z-[-1] blur-[25px]"
                  />
                  <video
                    src={mediaUrl}
                    className="h-[100%] cursor-pointer z-5"
                    controls
                    playsInline
                    preload="metadata"
                    muted
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenPreview(true);
                    }}
                  />
                </div>
              ) : (
                <img
                  src={mediaUrl}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onClick={() => setOpenPreview(true)}
                />
              )}
              <div className="absolute top-2 right-2 flex items-center gap-1">
                {showDeleteButton && isOwner && onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-md"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (window.confirm('Delete this project?')) onDelete(project.id);
                    }}
                    title="Delete project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <span className="bg-background/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1 text-xs">
                  {isVideo ? (
                    <>
                      <Video className="h-3 w-3" />
                      <span>Video</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-3 w-3" />
                      <span>Image</span>
                    </>
                  )}
                </span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-muted-foreground">No media</span>
            </div>
          )}
        </div>

        {project.user && (
          <div className="flex items-center justify-between gap-2 px-4 py-2 border-b bg-muted/30 mt-[-6]">
            <div className="flex items-center gap-2 min-w-0">
              <Link to={`/profile/${ownerId}`} className="flex items-center gap-2 min-w-0">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={ownerPhotoUrl} />
                  <AvatarFallback className="text-xs">
                    {getInitials(project.user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate">
                  {project.user.name}
                </span>
              </Link>
            </div>
            {user && !isOwner && (
              <div className="flex items-center gap-1 shrink-0">
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
                  variant={following ? "secondary" : requested ? "outline" : "default"}
                  size="sm"
                  onClick={handleFollow}
                  disabled={followMutation.isPending}
                >
                  {requested ? "Requested" : following ? "Following" : "Follow"}
                </Button>
              </div>
            )}
          </div>
        )}

        <CardHeader className="flex-1">
          <CardTitle className="line-clamp-1">{project.title}</CardTitle>
          <CardDescription className="line-clamp-3 max-h-10">
            {project.description}
          </CardDescription>
        </CardHeader>
        {showActions && (
          <CardContent className="space-y-3 pt-0">
            {(project.liveDemoUrl || project.codeUrl) && (
              <div className="flex gap-2 flex-wrap">
                {project.liveDemoUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={project.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Live Demo
                    </a>
                  </Button>
                )}
                {project.codeUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={project.codeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Code className="h-3.5 w-3.5 mr-1" />
                      Get Code
                    </a>
                  </Button>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1 ${liked ? "text-destructive" : ""}`}
                onClick={handleLike}
                disabled={!user || likeMutation.isPending}
              >
                <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                <span>{likeCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="h-4 w-4" />
                <span>{commentCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1 ml-auto ${saved ? "text-primary" : ""}`}
                onClick={handleSave}
                disabled={!user || saveMutation.isPending}
              >
                <Bookmark
                  className={`h-4 w-4 ${saved ? "fill-current" : ""}`}
                />
                Save
              </Button>
            </div>
            {showComments && (
              <div className="space-y-2 pt-2 border-t">
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {(project.comments || []).map((c) => (
                    <div key={c._id || c.id} className="text-sm">
                      <span className="font-medium">
                        {c.userName || "User"}:
                      </span>{" "}
                      <span className="text-muted-foreground">{c.text}</span>
                    </div>
                  ))}
                  {(!project.comments || project.comments.length === 0) && (
                    <p className="text-sm text-muted-foreground">
                      No comments yet
                    </p>
                  )}
                </div>
                {user && (
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1"
                      disabled={addCommentMutation.isPending}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={
                        !commentText.trim() || addCommentMutation.isPending
                      }
                    >
                      Post
                    </Button>
                  </form>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>
      {openPreview && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center p-10"
          onClick={() => setOpenPreview(false)}
        >
          {isVideo ? (
              <video
                src={mediaUrl}
                controls
                autoPlay
                muted
                className="absolute h-screen w-screen object-contain rounded-lg border-2 blur-[25px]"
              />
            ) : (
              <img
                src={mediaUrl}
                alt={project.title}
                className="absolute w-full max-h-screen object-contain rounded-lg border-2 blur-[25px]"
              />
            )}

          <div
            className="relative max-w-6xl w-full max-h-[85vh] p-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className="absolute top-3 right-3 text-white bg-black/60 rounded-full p-2 hover:bg-black"
              onClick={() => setOpenPreview(false)}
            >
              ✕
            </button>

            {/* Media */}
            {isVideo ? (
              <video
                src={mediaUrl}
                controls
                autoPlay
                className="w-full max-h-[80vh] object-contain rounded-lg shadow-sm shadow-black"
              />
            ) : (
              <img
                src={mediaUrl}
                alt={project.title}
                className="w-full max-h-[80vh] object-contain rounded-lg shadow-xl shadow-black"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
