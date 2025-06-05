# Recipe App: Core Vision & Strategy

## 1. Core Mission & Purpose

To empower home cooks of all levels to discover, create, and share delicious recipes, fostering a vibrant and supportive culinary community. The app aims to be an intuitive and enjoyable platform for managing personal recipes, exploring new dishes, and connecting with fellow food enthusiasts.

## 2. Target Audience

- **Home Cooks:** Individuals who enjoy cooking at home, ranging from beginners looking for simple recipes to experienced cooks seeking new inspiration.
- **Food Enthusiasts:** People passionate about food, interested in exploring different cuisines, techniques, and ingredients.
- **Recipe Creators:** Users who want to document, organize, and share their own recipes with a wider audience or a private circle.
- **Health-Conscious Individuals:** Users looking for recipes that fit specific dietary needs or health goals (a potential future focus).

# Recipe App Development Plan

## Technical Stack & Architecture

### Core Framework & Technologies

- **Frontend Framework:** Next.js 14.1.0 (App Router with Server Components and Client Components)
- **Runtime:** React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom CSS variables for theming
- **Backend:** Supabase (PostgreSQL database, authentication, file storage)
- **State Management:** React Context API (`UserContext`, `AuthContext`)
- **Form Management:** React Hook Form
- **Deployment:** Configured for modern web standards

### Key Dependencies & Libraries

- **Icons:** `lucide-react` (consistent iconography throughout the app)
- **UI Components:**
  - Custom components built with Tailwind CSS
  - Radix UI components (`@radix-ui/react-*` for accessible primitives)
  - Custom modal system with portal mounting
- **Animations:** Framer Motion for smooth transitions
- **Interactions:**
  - `react-dnd` with HTML5 and touch backends for drag-and-drop functionality
  - `@tippyjs/react` for tooltips
  - `react-dropzone` for file uploads
- **Utilities:**
  - `clsx` and `tailwind-merge` (combined via `cn` utility function)
  - `date-fns` for date formatting
  - `pluralize` for text formatting
  - `usehooks-ts` for additional React hooks
  - `class-variance-authority` for component variant management
- **Payment Processing:** Stripe integration (`@stripe/stripe-js`, `stripe`)
- **Development Tools:**
  - `ts-node` for TypeScript execution
  - `dotenv` for environment variable management

### Development Workflow & Documentation

- **Task Tracking:** `_TASKS.md` - Comprehensive task breakdown with priority levels and detailed implementation requirements
- **Progress Monitoring:** Tasks are marked with checkboxes to track completion status
- **Planning Documentation:** `_PLAN.md` - This file serves as the comprehensive technical reference and strategic roadmap
- **Code Quality:** ESLint, Prettier, Husky pre-commit hooks, and TypeScript strict mode
- **Database Management:** Supabase CLI for migrations, type generation, and local development
- **Package Management:** npm with lockfile for consistent dependency versions
- **Scripts:** Custom npm scripts for development, building, linting, and Supabase operations

### Database Schema & Data Models

**Core Tables:**

- `profiles` - User profiles with preferences (including `preferred_unit_system`)
- `recipes` - Recipe data with JSONB fields for `ingredients` and `instructions`
- `user_favorite_recipes` - Many-to-many relationship for recipe favoriting

**Key Enums:**

- `recipe_categories`: 'sweets', 'breads'
- `recipe_subcategories`: Detailed subcategories for each main category
- `recipe_status`: 'draft', 'published', 'archived'
- `unit_system`: 'metric', 'imperial'

### Authentication & Security

- Supabase Auth with email/password authentication
- Row Level Security (RLS) policies
- Protected routes using `ProtectedWrapper` component
- Server-side and client-side Supabase clients for appropriate contexts

### File Storage & Media Management

- Supabase Storage with organized buckets:
  - `avatars` - User profile images
  - `recipe_thumbnails` - Recipe thumbnail images
  - `recipe_banners` - Recipe banner images
- Image upload utilities with automatic file naming and validation

## Current Implementation Status

### ✅ Completed Core Features

**1. User Authentication & Profiles**

- Complete authentication system (sign-up, sign-in, sign-out, password/email updates)
- User profiles with avatars, usernames, names, and unit preferences
- Profile viewing and editing functionality
- Account settings page with security controls

**2. Recipe Management System**

- Full CRUD operations for recipes
- Rich recipe data model with structured ingredients and instructions
- Draft/publish workflow with status management
- Recipe slugs for SEO-friendly URLs
- Image uploads for thumbnails and banners
- Recipe creation and editing with unified `RecipeForm` component

**3. Recipe Discovery & Interaction**

- Recipe listing with filtering (category, subcategory, difficulty)
- Sorting options (creation date, name, total time)
- Recipe detail pages with complete information display
- Favorites system allowing users to save/unsave recipes
- Recipe cards with hover effects and interaction states

**4. Advanced UI Features**

- Responsive design with mobile-first approach
- Dark/light mode theming via CSS variables
- Print-friendly recipe pages with custom CSS
- Loading states and skeletons
- Toast notifications system with URL-based messaging
- Modal system with backdrop dismiss and accessibility

**5. User Experience Enhancements**

- Unit conversion system (metric/imperial) with user preferences
- Recipe preview functionality during creation/editing
- Drag-and-drop instruction reordering
- Dynamic ingredient and instruction management
- Real-time form validation with react-hook-form

**6. Performance & SEO**

- Server-side rendering with Next.js App Router
- Optimized image loading with Next.js Image component
- Semantic HTML structure
- Accessibility considerations with ARIA labels

### 🚧 Partially Implemented Features

**1. Nutritional Information System**

- Backend support for storing nutrition data in recipes table
- Frontend form inputs for nutritional values
- Data structure for `NutritionalInfo` type
- **Missing:** Automatic nutrition estimation from ingredients
- **Missing:** Comprehensive nutrition database (`ingredientNutritionData.json` exists but needs population)

**2. Social Features**

- Recipe favoriting system fully functional
- User profiles show created and favorited recipes
- **Missing:** User following/followers system
- **Missing:** Recipe commenting system
- **Missing:** Enhanced social sharing (`postRecipeToSocial` exists as placeholder)

### 📋 Priority Development Areas

**Phase 1: Core Enhancement & Quality (Immediate)**

1. **Complete Nutritional Information System**

   - Populate `ingredientNutritionData.json` with comprehensive ingredient data
   - Implement `estimateRecipeNutrition` utility function
   - Add nutrition estimation display when creator data is missing
   - Implement baker's percentage for bread recipes

2. **Advanced Recipe Features**

   - Equipment list functionality
   - Author's notes/story sections
   - Structured data (Schema.org) for SEO
   - Enhanced print layouts

3. **User Experience Polish**
   - Search functionality for recipes
   - Recipe rating and review system
   - Improved error handling and loading states
   - Enhanced accessibility features

**Phase 2: Community & Engagement**

1. **Social Features**

   - User following system
   - Recipe comments and reviews
   - Enhanced social sharing integration
   - Recipe collections/cookbooks

2. **Discovery Features**
   - Advanced search with filters
   - Recipe recommendations
   - Trending recipes
   - Category-specific features

**Phase 3: Advanced Platform Features**

1. **Meal Planning & Shopping**

   - Meal planning calendar
   - Shopping list generation from recipes
   - Inventory management

2. **Monetization & Premium Features**
   - Stripe integration enhancement
   - Premium recipe collections
   - Advanced analytics for recipe creators

## Development Guidelines & Best Practices

### Code Organization

- **Components:** Organized by feature in `src/app/_components/`
- **API Logic:** Server Actions in `src/api/` with `'use server'` directive
- **Types:** Supabase-generated types in `src/types/definitions.ts`, custom types in feature-specific files
- **Utils:** General utilities in `src/utils/`, helpers in `src/helpers/`
- **Constants:** Project-wide constants in `src/constants.tsx`

### Styling Conventions

- **Primary Styling:** Tailwind CSS with custom utility classes
- **Component Composition:** Use `cn()` utility for conditional class merging
- **Icons:** Exclusively use `lucide-react` for consistency
- **Responsive Design:** Mobile-first approach with Tailwind breakpoints
- **Theme Support:** CSS variables for light/dark mode compatibility

### Data Flow Patterns

- **Server Components:** For initial data fetching and SEO
- **Client Components:** For interactive features (marked with `'use client'`)
- **Server Actions:** For all database mutations and server-side logic
- **Context Providers:** For global state (user session, auth modals)
- **Type Safety:** Strict TypeScript with proper type definitions

### Quality Assurance

- **Code Quality:** ESLint + Prettier with pre-commit hooks using Husky and lint-staged
- **Type Checking:** Strict TypeScript configuration with `tsc --noEmit` checks
- **Testing Strategy:** (To be implemented)
- **Performance:** Next.js optimizations, image optimization, Server Components for SSR
- **Accessibility:** ARIA labels, semantic HTML, keyboard navigation, focus management
- **Bundle Analysis:** Next.js built-in bundle analyzer capabilities
- **Linting:** Custom ESLint configuration with Next.js and TypeScript rules

### Development Workflow Guidelines

- **Development Server:** Developers typically run `npm run dev` once and keep it running throughout the development session
- **Hot Reloading:** Next.js automatically detects changes and reloads the browser - no need to restart the dev server
- **AI Development Assistance:** When making code changes during development sessions, **DO NOT** run `npm run dev` again as it's likely already running
- **Testing Changes:** Changes can be verified by checking the browser since hot reloading handles updates automatically
- **When to Restart:** Only restart the dev server if there are configuration changes (e.g., environment variables, next.config.js changes) or if there are server errors

### Deployment & Operations

- **Database:** Supabase hosted PostgreSQL
- **File Storage:** Supabase Storage with organized bucket structure
- **Environment Management:** Separate configurations for development and production
- **Monitoring:** (To be implemented)

## Next Steps

1. **Review and prioritize current task list in `_TASKS.md`**
2. **Complete nutritional information system implementation**
3. **Enhance user experience with search and rating features**
4. **Implement comprehensive testing strategy**
5. **Plan Phase 2 social features based on user feedback**

This plan serves as both a technical reference and strategic roadmap for continued development of the Recipe App platform.
