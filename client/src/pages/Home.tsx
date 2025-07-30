import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SplashCursor } from "@/components/ui/splash-cursor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FolderOpen, Palette, Clock } from "lucide-react";
import { SignInButton } from "@/components/SignInButton";
import type { Design } from "@shared/schema";

export default function Home() {
  const [mockUserId] = useState("demo-user-id"); // In real app, get from auth

  const { data: designs = [], isLoading } = useQuery<Design[]>({
    queryKey: ["/api/designs", { userId: mockUserId }],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative" data-testid="home-page">
      {/* Splash Cursor Effect */}
      <SplashCursor 
        color="#3b82f6"
        size={15}
        duration={800}
      />
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-700 rounded-lg flex items-center justify-center">
                <Palette className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  DesignStudio Pro
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Professional Pattern Design Tool
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <SignInButton />
              <Link href="/studio">
                <Button className="bg-primary hover:bg-primary/90" data-testid="button-new-project">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" data-testid="card-new-design">
            <Link href="/studio">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Plus className="h-5 w-5 mr-2 text-primary" />
                  Create New Design
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Start with a blank canvas and create your masterpiece
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" data-testid="card-templates">
            <Link href="/studio">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <FolderOpen className="h-5 w-5 mr-2 text-emerald-500" />
                  Browse Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Choose from our collection of pre-made templates
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" data-testid="card-ai-generator">
            <Link href="/studio">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Palette className="h-5 w-5 mr-2 text-purple-500" />
                  AI Pattern Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Generate unique patterns using AI technology
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Designs */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Recent Designs
            </h2>
            <Button variant="ghost" size="sm" data-testid="button-view-all">
              View All
            </Button>
          </div>

          {designs.length === 0 ? (
            <Card className="py-12" data-testid="empty-state">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Palette className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                  No designs yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Create your first design to get started
                </p>
                <Link href="/studio">
                  <Button data-testid="button-create-first">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Design
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.slice(0, 6).map((design) => (
                <Card key={design.id} className="hover:shadow-lg transition-shadow cursor-pointer" data-testid={`design-card-${design.id}`}>
                  <CardHeader className="p-0">
                    <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-t-lg flex items-center justify-center">
                      {design.thumbnail ? (
                        <img 
                          src={design.thumbnail} 
                          alt={design.title}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      ) : (
                        <Palette className="h-8 w-8 text-slate-400" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1" data-testid={`design-title-${design.id}`}>
                      {design.title}
                    </h3>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {design.updatedAt ? new Date(design.updatedAt).toLocaleDateString() : 'No date'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
