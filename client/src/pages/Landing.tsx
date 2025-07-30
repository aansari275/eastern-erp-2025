import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeroSection } from "@/components/ui/hero-section-dark";
import { 
  Palette, 
  Zap, 
  Upload, 
  Sparkles, 
  ArrowRight, 
  Check,
  Star,
  Users,
  Globe,
  Shield,
  X
} from "lucide-react";

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowLogin(false);
      }
    };

    if (showLogin) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showLogin]);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // For demo purposes, simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Google sign-in demo completed');
      setShowLogin(false);
      // In production, use: const user = await signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowLogin(false);
    setIsSignUp(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Section with new dark theme */}
      <HeroSection 
        title="✨ AI-Powered Rug Design Studio"
        subtitle={{
          regular: "Transform your ideas into beautiful ",
          gradient: "rug designs with AI",
        }}
        description="Professional vectorization, color extraction, and AI pattern generation tools for designers and creators."
        ctaText="Start Designing Free"
        ctaHref="/home"
        bottomImage={{
          light: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
          dark: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80&brightness=0.7",
        }}
        gridOptions={{
          angle: 65,
          opacity: 0.3,
          cellSize: 50,
          lightLineColor: "#9333ea",
          darkLineColor: "#7c3aed",
        }}
      />

      {/* Navigation Header */}
      <header className="relative z-20 border-b border-white/20 backdrop-blur-md bg-white/10 dark:bg-slate-900/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                <Palette className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  RugStudio Pro
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  AI-Powered Design Platform
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => setShowLogin(true)}
                className="text-slate-700 dark:text-slate-300 hover:bg-white/20"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => { setIsSignUp(true); setShowLogin(true); }}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              ✨ New: AI Pattern Generation
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Design Beautiful
              <span className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                {" "}Rugs{" "}
              </span>
              with AI
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Transform your ideas into stunning rug designs with our professional AI-powered vectorization, 
              color extraction, and pattern generation tools.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg"
                onClick={() => { setIsSignUp(true); setShowLogin(true); }}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 text-lg"
              >
                <Zap className="h-5 w-5 mr-2" />
                Start Creating Free
              </Button>
              <Link href="/studio">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-slate-300 dark:border-slate-600 px-8 py-4 text-lg backdrop-blur-sm bg-white/50 dark:bg-slate-800/50"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Try Demo
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">10K+</div>
                <div className="text-slate-600 dark:text-slate-400">Designs Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">50+</div>
                <div className="text-slate-600 dark:text-slate-400">AI Models</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">99.9%</div>
                <div className="text-slate-600 dark:text-slate-400">Uptime</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Professional Tools for Every Designer
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Everything you need to create, edit, and perfect your rug designs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Auto Vectorization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Convert any image to editable vectors with smart color extraction and shape detection.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">JPG/PNG Support</Badge>
                  <Badge variant="secondary">3-10 Colors</Badge>
                  <Badge variant="secondary">Shape Masking</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">AI Pattern Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Generate unique patterns from text descriptions using advanced AI models.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Text to Pattern</Badge>
                  <Badge variant="secondary">Style Control</Badge>
                  <Badge variant="secondary">Instant Preview</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <Palette className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Advanced Color Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Professional color management with palettes, replacement, and optimization.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Color Palettes</Badge>
                  <Badge variant="secondary">Smart Replace</Badge>
                  <Badge variant="secondary">Undo/Redo</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Social Proof */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Trusted by Designers Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-slate-900 dark:text-white">5000+</div>
              <div className="text-slate-600 dark:text-slate-400">Active Users</div>
            </div>
            <div className="flex flex-col items-center">
              <Star className="h-8 w-8 text-yellow-500 mb-2" />
              <div className="text-2xl font-bold text-slate-900 dark:text-white">4.9/5</div>
              <div className="text-slate-600 dark:text-slate-400">User Rating</div>
            </div>
            <div className="flex flex-col items-center">
              <Globe className="h-8 w-8 text-emerald-600 mb-2" />
              <div className="text-2xl font-bold text-slate-900 dark:text-white">50+</div>
              <div className="text-slate-600 dark:text-slate-400">Countries</div>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="h-8 w-8 text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-slate-900 dark:text-white">100%</div>
              <div className="text-slate-600 dark:text-slate-400">Secure</div>
            </div>
          </div>
        </section>
      </main>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card ref={modalRef} className="w-full max-w-md mx-4 backdrop-blur-md bg-white/95 dark:bg-slate-800/95 relative">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors z-10"
            >
              <X className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </button>

            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Palette className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">
                Welcome to RugStudio Pro
              </CardTitle>
              <p className="text-slate-600 dark:text-slate-400">
                Sign in with Google to start designing beautiful rugs
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Google Sign In Button */}
              <Button 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 h-12 transition-all duration-200 hover:scale-[1.02]"
                data-testid="button-google-signin"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900 dark:border-white mr-3"></div>
                ) : (
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {isLoading ? "Signing in..." : "Continue with Google"}
              </Button>

              {/* Demo Access Button */}
              <Link to="/home">
                <Button 
                  variant="outline"
                  className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-200"
                  data-testid="button-demo-access"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Try Demo (No Sign-up Required)
                </Button>
              </Link>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-300 dark:border-slate-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">
                    Demo Mode
                  </span>
                </div>
              </div>

              {/* Demo Features */}
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Check className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-purple-700 dark:text-purple-300">
                    <strong>Try all features for free:</strong>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• Auto-vectorization with shape detection</li>
                      <li>• AI pattern generation</li>
                      <li>• Advanced color manipulation tools</li>
                      <li>• Export in multiple formats</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Guest Access */}
              <div className="text-center">
                <Link href="/studio">
                  <Button 
                    variant="ghost"
                    onClick={handleCloseModal}
                    className="text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  >
                    Continue as Guest
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}