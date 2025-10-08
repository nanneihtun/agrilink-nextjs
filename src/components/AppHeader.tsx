"use client";

import { Button } from "./ui/button";
import { UserMenuWithSupport } from "./UserMenuWithSupport";
import { Leaf, LogIn, UserPlus } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface AppHeaderProps {
  currentUser?: any;
  onLogout?: () => void;
}

export function AppHeader({ currentUser, onLogout }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Helper function to determine if a navigation button should be active
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const handleBackToMarketplace = () => {
    router.push("/");
  };

  const handleGoToLogin = () => {
    router.push("/login");
  };

  const handleGoToRegister = () => {
    router.push("/register");
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  const handleViewMessages = () => {
    router.push("/messages");
  };

  const handleViewProfile = () => {
    router.push("/profile");
  };

  const handleEditProfile = () => {
    router.push("/profile?edit=true");
  };

  const handleShowVerification = () => {
    router.push("/verify");
  };

  const handleViewStorefront = (sellerId: string) => {
    router.push(`/seller/${sellerId}`);
  };

  const handleShowAdminVerification = () => {
    router.push("/admin");
  };


  const handleUpdateUser = (updates: any) => {
    // This would typically update the user context
    console.log("Update user:", updates);
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-card">
      <div className="w-full max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToMarketplace}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <Leaf className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-lg md:text-xl font-semibold">
                AgriLink
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                Linking agriculture to opportunity
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile Navigation - Compact */}
            <div className="flex md:hidden items-center gap-1">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                onClick={handleBackToMarketplace}
                className="px-2 h-8 text-sm"
              >
                Home
              </Button>
              {currentUser && (
                <Button
                  variant={isActive("/dashboard") ? "default" : "ghost"}
                  onClick={handleGoToDashboard}
                  className="px-2 h-8 text-sm"
                >
                  Dashboard
                </Button>
              )}
            </div>

            {/* Desktop Navigation - Full labels */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                className="h-9 px-4 text-sm"
                onClick={handleBackToMarketplace}
              >
                Marketplace
              </Button>

              {/* User-specific navigation when logged in */}
              {currentUser && (
                <>
                  {(currentUser.userType === "farmer" ||
                    currentUser.userType === "trader" ||
                    currentUser.userType === "buyer") && (
                    <Button
                      variant={isActive("/dashboard") ? "default" : "ghost"}
                      className="h-9 px-4 text-sm"
                      onClick={handleGoToDashboard}
                    >
                      Dashboard
                    </Button>
                  )}
                  {currentUser.userType === "admin" && (
                    <Button
                      variant={isActive("/dashboard") ? "default" : "ghost"}
                      className="h-9 px-4 text-sm"
                      onClick={handleGoToDashboard}
                    >
                      Admin Panel
                    </Button>
                  )}
                </>
              )}

            </div>

            {/* Authentication Buttons */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden lg:inline font-medium">
                  Welcome, {currentUser.name.split(" ")[0]}
                </span>
                <UserMenuWithSupport
                  user={currentUser}
                  onLogout={onLogout}
                  onViewStorefront={handleViewStorefront}
                  onUpdateUser={handleUpdateUser}
                  onGoToDashboard={handleGoToDashboard}
                  onShowVerification={handleShowVerification}
                  onEditProfile={handleEditProfile}
                  onViewProfile={handleViewProfile}
                  onViewMessages={handleViewMessages}
                  onShowAdminVerification={handleShowAdminVerification}
                />
              </div>
            ) : (
              // Always show auth buttons
              <div className="flex items-center gap-1 md:gap-2">
                {/* Mobile: Icon only buttons */}
                <Button
                  variant="outline"
                  onClick={handleGoToLogin}
                  className="md:hidden px-2 h-8"
                >
                  <LogIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGoToRegister}
                  className="md:hidden px-2 h-8"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>

                {/* Desktop: Full label buttons */}
                <Button
                  variant="outline"
                  onClick={handleGoToLogin}
                  className="hidden md:flex h-9 px-4 text-sm"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGoToRegister}
                  className="hidden md:flex h-9 px-4 text-sm"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}