import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { LogIn, LogOut, User, Loader2 } from "lucide-react";

export function SignInButton() {
  const { user, signIn, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signIn();
      toast({
        title: "Signed In",
        description: "Welcome to DesignStudio Pro!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: error.message || "Failed to sign in. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: error.message || "Failed to sign out. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || "User"} 
                className="w-full h-full rounded-full"
              />
            ) : (
              <User className="h-4 w-4 text-white" />
            )}
          </div>
          <span className="text-slate-700 dark:text-slate-300 max-w-24 truncate">
            {user.displayName || user.email}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          disabled={loading}
          data-testid="button-sign-out"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignIn}
      disabled={loading}
      data-testid="button-sign-in"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <LogIn className="h-4 w-4 mr-2" />
      )}
      Sign In with Google
    </Button>
  );
}