# Pattern Design Studio

## Overview

This is a professional pattern design application built with React and Express.js. The application provides a collaborative design environment where users can create, edit, and manage design patterns with features like AI pattern generation, color palette management, and real-time canvas editing. The system uses a monorepo structure with shared TypeScript schemas and provides both web interface and API endpoints for pattern and design management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Canvas Library**: Fabric.js for interactive design canvas

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **API Design**: RESTful API with JSON responses
- **Development**: Hot reload with Vite middleware integration

### Authentication & Storage
- **Authentication**: Firebase Auth integration (configured but not fully implemented)
- **File Storage**: Firebase Storage for asset management
- **Firestore**: Additional NoSQL storage option available

## Key Components

### Design Canvas System
- **DesignCanvas**: Core Fabric.js canvas wrapper with grid system, zoom controls, and object manipulation
- **ElementProperties**: Dynamic property editor for selected canvas objects
- **ColorPalette**: Advanced color management with palette selection and color replacement tools
- **ImageUploader**: Drag-and-drop image upload with file validation

### Pattern Management
- **PatternLibrary**: Browsable library of design patterns with category filtering
- **AIPatternGenerator**: AI-powered pattern generation from text prompts
- **Pattern Storage**: Database-backed pattern storage with public/private visibility

### User Interface
- **ThemeProvider**: Dark/light mode toggle with system preference detection
- **Navigation**: Clean routing between home dashboard and design studio
- **Toast System**: User feedback with success/error notifications

## Data Flow

### Design Creation Flow
1. User accesses Design Studio page with streamlined interface
2. PatternLibrary loads with unified "Upload Design (Auto Vectorize)" button
3. User clicks button, selects image file, system automatically vectorizes with configurable color count (6-12)
4. Vectorized image appears centered on canvas at optimal size with clickable color regions
5. ElementProperties panel allows real-time color changes and object manipulation
6. Design saved via POST `/api/designs` with complete canvas data

### Pattern Management Flow
1. Patterns loaded from database through storage abstraction layer
2. Public patterns available to all users
3. User-specific patterns filtered by userId
4. AI generation creates SVG patterns via `/api/patterns/generate`
5. Generated patterns can be saved to user's private collection

### Recent Changes - January 27, 2025
- **Streamlined Auto-Vectorize Workflow**: Unified all upload buttons into single "Upload Design (Auto Vectorize)" button
- **Eliminated Duplicates**: Removed multiple button options and sidebar rendering - only final vectorized result appears on canvas
- **Enhanced User Experience**: Users upload once, optionally adjust color count (6-12), get full-size vectorized image directly
- **Canvas-Centered Design**: All vectorized images automatically center and scale to fit canvas bounds while maintaining aspect ratio
- **Simplified UI**: Removed complex sidebar interfaces in favor of streamlined upload-to-vector workflow
- **Optimized Performance**: Direct vectorization pipeline with timeout protection and error handling
- **Fixed All Import Errors**: Resolved TypeScript issues and component integration problems
- **Removed Legacy Features**: Eliminated "Vectorize This" overlays and separate upload/vectorize steps
- **FROZEN BASELINE**: Auto-vectorization flow locked as working baseline - DO NOT MODIFY core logic, placement, scaling, or color pipeline
- **Smart Refinement Added**: "Refine Vector" toggle appears after vectorization to remove dust/noise and small artifacts without affecting core workflow

### Unified Vectorization Architecture - January 28, 2025
- **Created Vectorization Utility**: New `/utils/vectorization.ts` module containing reusable vectorization functions
- **Unified All Upload Flows**: RugUploadRefiner, FinalRugUploader, and RugUploader now use same vectorization logic
- **Consistent SVG Generation**: All upload paths now use ImageTracer with identical configuration and fallback handling
- **Centralized Color Extraction**: Single function for extracting dominant colors from images (6-12 colors)
- **Standardized Canvas Placement**: All vectorized objects use same scaling and centering algorithm
- **Enhanced Error Handling**: Comprehensive error handling with toast notifications and image fallback
- **Shape Processing Integration**: Maintained shape masking (round, square, rectangle, runner) with vectorization
- **Real-time Color Recoloring**: All vectorized objects support interactive color region editing
- **Performance Optimization**: Consistent timeout protection and processing size limits across all flows

### Theme Update - January 27, 2025
- **Purple Theme Implementation**: Completely replaced blue theme with professional purple/dark design
- **Hero Section Redesign**: Integrated new HeroSection component with retro grid animation and purple gradients
- **Component Updates**: Updated all buttons, gradients, and accent colors from blue to purple across the application
- **Landing Page Enhancement**: New hero section with animated grid background, purple color scheme, and modern design
- **CSS Variables Updated**: Changed primary colors from blue (217, 91%, 60%) to purple (262, 83%, 58%) in both light and dark modes
- **Animation Integration**: Added grid animation keyframes and animate-grid CSS class for smooth visual effects

### Latest Updates - January 27, 2025
- **Complete Color Extraction & Replacement System**: Implemented clickable color swatches with real-time replacement functionality
- **Performance Optimizations**: Added debounced color updates (150ms), canvas.requestRenderAll() for efficiency, loading states
- **Background Removal**: Smart background detection and removal based on color frequency analysis
- **Color Reset Functionality**: Store original color state and allow full reset to initial vectorized colors
- **AI Palette Suggestions**: Curated rug-themed color palettes (Earthy Mughal, Pastel Nordic, Desert Rose, Ocean Blues, Forest Earth)
- **Enhanced UX**: Visual feedback with loading spinners, disabled states during updates, highlight boxes for selected colors
- **Stability AI Integration**: Fixed endpoint issues and form data structure for AI image refinement

### Final Updates - January 27, 2025
- **Cleaned Left Sidebar**: Removed trending designs, kept only essential features (Upload Design, Generate with AI, My Uploads, Saved Patterns)
- **Shuffle Colors Feature**: Added button to randomly reassign extracted colors across vectorized designs with instant preview
- **Complete Undo/Redo System**: Implemented comprehensive history tracking with 50-state buffer for all actions
- **Action Tracking**: All operations now save to history - color changes, vector refinement, background removal, shuffle, object updates
- **UI Polish**: Added undo/redo buttons in top toolbar with proper disabled states and tooltips
- **Debounced Performance**: All color operations use 150ms debouncing to prevent lag during rapid interactions

### Color Reduction & Management Updates - January 27, 2025
- **Color Reduction with "×" Buttons**: Each extracted color swatch displays red "×" icon on hover for individual color removal
- **Smart Color Merging**: Uses Euclidean RGB distance formula to merge removed color regions to nearest remaining color
- **Color Count Selector**: Range slider (4-10 colors, default 7) controls extraction quantity during vectorization
- **Minimum Color Protection**: Prevents removal when only 2 colors remain to maintain design integrity
- **Performance Optimizations**: Debounced updates (150ms), loading states, smooth animations
- **Saved Patterns Removal**: Removed "Saved Patterns" feature from left sidebar per user request

### Final Upload Workflow Implementation - January 27, 2025
- **FinalRugUploader Component**: Streamlined modal-based upload interface with three focused sections
- **Section 1 - Shape & Size**: Rectangle, Square, Round, Runner with auto-lock aspect for square/round
- **Smart Size Controls**: Round shape shows only diameter input, square auto-locks height to width
- **Section 2 - Color Extraction**: Simple dropdown with Auto mode and 3-10 color options
- **Section 3 - Upload Interface**: Professional drag-and-drop with file type validation (.jpg, .png, .webp)
- **Modal Interface**: Clean dialog overlay with organized sections and instant processing
- **Canvas Resizing**: Automatically adjusts canvas dimensions to match rug size in real-time
- **Shape Masking**: Applies proper clipping paths for round and runner shapes during vectorization
- **Fallback Handling**: Graceful error recovery with direct image placement if vectorization fails
- **Single Button Design**: One main "Upload Rug Design (Auto Vectorize + Refine)" button replaces all upload options

### UI Enhancement Updates - January 27, 2025
- **SplashCursor Component**: Added interactive particle effect to landing page background
- **Canvas-Based Animation**: Real-time mouse tracking with particle generation and physics simulation
- **Click Effects**: Enhanced splash animations on click events with larger particle bursts
- **Performance Optimized**: Efficient rendering loop with particle lifecycle management
- **Visual Integration**: Subtle blend mode and opacity for professional appearance
- **Responsive Design**: Auto-adjusts to window resize events and maintains full-screen coverage

### Landing Page Implementation - January 27, 2025
- **New Landing Page**: Created professional landing page with hero section, features, and social proof
- **Google Auth Modal**: Integrated Google authentication with proper demo mode
- **Click-Outside Behavior**: Modal closes when clicking outside or pressing close button
- **Loading States**: Animated loading spinner during authentication process
- **Gradient Design**: Modern gradient backgrounds with backdrop blur effects
- **Interactive Elements**: Call-to-action buttons, feature cards, and stats sections
- **Badge Components**: Added shadcn badge component for feature highlights
- **Google Authentication Modal**: Real Google sign-in integration with Firebase Auth
- **Click-Outside Modal Close**: Modal closes when clicking outside or pressing X button
- **Loading States**: Animated loading spinner during authentication process
- **Demo Access**: Clear path for users to try features without signing up
- **Routing Updates**: Set landing page as root route ("/"), moved dashboard to "/home"
- **SplashCursor Integration**: Full-screen interactive background effect on landing page
- **Feature Showcase**: Highlighted auto-vectorization, AI generation, and color tools
- **Body Scroll Lock**: Prevents background scrolling when modal is open

### Enhanced Rug Upload Pipeline - January 27, 2025
- **Unit Conversion System**: Toggle between cm/ft with automatic value conversion using precise formulas
- **Smart Shape Selection**: Animated pill selector with auto-locking width=height for square/round shapes
- **Canvas Binding**: Real-time canvas size updates matching selected rug dimensions
- **Figma-like Animations**: Smooth transitions, hover effects, and slide-in animations throughout
- **Image Preview**: Thumbnail preview with slide-in animation after upload
- **Let's Go Button**: Prominent CTA button with loading states and scale hover effects
- **Click-Outside Close**: Modal closes when clicking outside for better UX
- **Comprehensive Validation**: Prevents proceeding without image and proper dimensions
- **Enhanced File Upload**: Drag-and-drop with scale animation and visual feedback
- **Professional Polish**: Loading spinners, disabled states, and smooth micro-interactions

### Texture Overlay System Implementation - January 28, 2025
- **TextureOverlay Component**: Advanced texture mapping system with default and custom texture support
- **Default Texture Options**: Wool (matte dots), Viscose (shiny vertical lines), Jute (cross-hatch) patterns
- **Custom Texture Upload**: Support for user-uploaded texture images (.jpg, .png, .webp, .bmp up to 5MB)
- **Smart Blending**: Uses globalCompositeOperation (multiply/overlay) for realistic fabric texture effects
- **Shape-Aware Textures**: Textures automatically scale and respect rug shape masks (round, square, runner)
- **Canvas Integration**: Seamless integration with Fabric.js canvas system, textures placed behind design elements
- **Performance Optimization**: Texture caching system and efficient SVG pattern generation for default textures
- **History Integration**: Full undo/redo support for texture application and removal actions
- **User Interface**: Clean modal dialog with texture previews, apply/remove functionality in ColorPalette sidebar
- **File Format Support Extended**: All upload components now support .bmp format in addition to existing formats

### Major UI Layout Restructuring - January 28, 2025
- **Three-Panel Layout**: Left collapsible Pattern Library, center canvas, right Color Palette for optimal workflow
- **Collapsible Left Navigation**: Pattern Library with smooth animations and positioned arrow toggle button
- **Right Color Panel**: Moved Color Palette to dedicated right sidebar for easy access during design work
- **Removed Element Properties**: Eliminated Element Properties panel to simplify interface and focus on core features
- **Canvas-Centered Design**: Central canvas with flanking panels maximizes creative workspace
- **Toggle Animation**: Smooth 300ms transition animations for left panel collapse/expand
- **Blue Theme Implementation**: Completely changed all purple color references to blue across components
- **CSS Variables Updated**: Changed primary colors from purple (hsl(262, 83%, 58%)) to blue (hsl(217, 91%, 60%)) in both light and dark modes
- **Component Theme Updates**: Updated FinalRugUploader, RugUploader, and TextureOverlay purple references to blue
- **Optimized User Flow**: Pattern upload on left, design on center, color editing on right for natural left-to-right workflow

### Data Persistence
- **Designs**: Stored with canvas JSON data, thumbnails, and metadata
- **Patterns**: SVG data with categorization and visibility settings
- **Users**: Firebase Auth integration for Google sign-in
- **Sessions**: In-memory storage with planned Firebase Firestore integration

## External Dependencies

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Fabric.js**: Canvas manipulation and drawing
- **Lucide React**: Consistent icon library

### Data Management
- **Drizzle ORM**: Type-safe database queries with PostgreSQL
- **TanStack Query**: Server state management and caching
- **Zod**: Runtime type validation and schema validation

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Vite**: Fast build tool with HMR
- **ESBuild**: Production bundling for server code

### Firebase Integration
- **Firebase Auth**: User authentication (configured)
- **Firebase Storage**: File and image storage
- **Firestore**: Additional document storage option

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured with runtime error overlay and cartographer plugin
- **Hot Reload**: Vite middleware integrated with Express server
- **Database**: Neon serverless PostgreSQL with connection pooling

### Production Build
- **Frontend**: Vite builds to `dist/public` directory
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend assets
- **Database Migrations**: Drizzle migrations in `migrations/` directory

### Environment Configuration
- **Database**: PostgreSQL connection via `DATABASE_URL` environment variable
- **Firebase**: Project configuration through environment variables
- **Development**: NODE_ENV-based configuration switching

The application is designed for scalability with a clean separation between frontend and backend, type-safe data handling, and modern development practices. The storage layer uses an abstraction interface allowing for easy database provider switching, and the component architecture supports both development and production deployments.