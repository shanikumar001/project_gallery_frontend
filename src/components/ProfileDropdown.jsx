import { Link } from "react-router-dom";
import { User, LogOut, FolderOpen, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "../hooks/useQueries";

export default function ProfileDropdown({ user, logout }) {
  const { data: profile } = useUserProfile(user?.id);
  const { theme, setTheme } = useTheme();

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    );
  };

  const photoUrl = user?.profilePhoto?.startsWith("/")
    ? `${window.location.origin}${user.profilePhoto}`
    : user?.profilePhoto;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          <Avatar className="h-9 w-9">
            <AvatarImage src={photoUrl} alt={user?.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={photoUrl} />
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            {profile && (
              <div className="flex gap-4 pt-2 border-t">
                <div className="text-center">
                  <p className="text-sm font-semibold">
                    {profile.followerCount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">
                    {profile.followingCount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">
                    {profile.projects?.length || profile.projectCount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <User className="mr-2 h-4 w-4" />
            My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile#projects">
            <FolderOpen className="mr-2 h-4 w-4" />
            My Projects
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
        {user && (
          <DropdownMenuItem className="flex items-center justify-between  ">
            <span className="">Dark Mode</span>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300
              ${theme === "dark" ? "bg-gray-700" : "bg-gray-300"}
              `}
            >
              <span
                className={`absolute top-[2px] left-1 w-5 h-5 rounded-full bg-white transition-transform duration-300
                ${theme === "dark" ? "translate-x-4" : ""}
                `}
              />
            </button>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
