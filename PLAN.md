# Recipe App Development Plan

**A collaborative recipe platform with Git-like versioning, cooking diaries, and community-driven recipe improvements.**

## 📊 Current Status: Feature-Complete Core App

### Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Frontend:** React 18, TypeScript, Tailwind CSS
- **State:** React Context API (UserContext, AuthContext)
- **Forms:** React Hook Form with drag-and-drop
- **UI:** Custom components with Radix UI, Lucide icons

### ✅ Fully Implemented Features

#### Authentication & Users

- Complete user auth (sign-up, sign-in, password reset)
- User profiles with avatar upload and bios
- Account management page
- Protected routes and row-level security

#### Recipe System

- **CRUD Operations:** Create, read, update, delete recipes
- **Rich Data Structure:** Ingredients (name, amount, unit), Instructions (numbered steps)
- **Categories:** Sweets/Breads with detailed subcategories
- **Status Management:** Draft/Published/Archived
- **Images:** Thumbnail and banner upload with Supabase storage
- **Filtering & Sorting:** Category, subcategory, difficulty
- **Preview System:** Modal preview during creation/editing

#### User Engagement

- **Favorites System:** Full implementation with database and UI
- **Profile Pages:** Created and favorited recipes tabs
- **Rich UI Components:** Recipe cards, lists, forms, toasts, skeletons

#### Advanced Features (Backend Ready)

- **Unit Conversion:** Metric/Imperial utilities with user preferences
- **Nutrition Estimation:** Automated calculation from comprehensive ingredient database
- **Print Functionality:** PrintRecipeButton component
- **Social Sharing:** Basic postRecipeToSocial function

### 🚀 HIGH PRIORITY (Next Sprint)

#### 1. 🔄 Recipe Versioning & Diary System (NEW PRIORITY)

- **Status:** New feature - Game-changing addition
- **Concept:** Git-like recipe versioning with cooking diary entries
- **Tasks:**
  - Design database schema for recipe versions and diary entries
  - Implement recipe forking functionality
  - Create diary entry system for cooking notes
  - Build version tree visualization
  - Add change tracking and comparison views
- **Files:** New tables, `src/api/recipe-versions.ts`, `src/app/recipes/_components/VersionTree.tsx`
- **Impact:** Transforms app from static recipes to collaborative cooking platform

#### 2. Complete Nutrition Display

- **Status:** Backend ready, UI missing
- **Tasks:**
  - Add nutrition display section to recipe detail pages
  - Implement nutrition input fields in RecipeForm
  - Show estimated values when creator data missing
- **Files:** `src/app/recipes/[slug]/page.tsx`, `src/app/recipes/_components/RecipeForm.tsx`

#### 3. Unit Conversion UI

- **Status:** Utilities complete, UI missing
- **Tasks:**
  - Add toggle/dropdown on recipe detail pages
  - Implement header setting for global preference
  - Connect to existing conversion utilities
- **Files:** `src/app/recipes/[slug]/page.tsx`, `src/app/_components/Header.tsx`

#### 4. Recipe Search

- **Status:** Not implemented
- **Tasks:**
  - Add search API endpoint
  - Implement search UI on recipes page
  - Search by name, ingredients, description
- **Files:** `src/api/recipe.ts`, `src/app/recipes/page.tsx`

### 📋 MEDIUM PRIORITY (Future Sprints)

#### 1. Social Features

- **Recipe Comments:** Full commenting system
- **User Following:** Follow/unfollow users
- **Enhanced Social Sharing:** Better UI for sharing

#### 2. Recipe Enhancements

- **Baker's Percentage:** For bread recipes (mark flour ingredients)
- **Equipment Lists:** Required tools section
- **Author's Notes:** Personal stories/tips section
- **Recipe Ratings:** 5-star rating system

#### 3. Advanced Features

- **Recipe Collections:** User-created cookbooks
- **Meal Planning:** Weekly meal planning system
- **Shopping Lists:** Auto-generate from recipes

---

## 🔄 RECIPE VERSIONING & DIARY SYSTEM

### Core Concept

Transform the recipe app into a **collaborative cooking platform** where users can:

- **Fork recipes** like GitHub repositories
- **Track changes** with detailed reasoning
- **Document cooking experiences** with diary entries
- **Learn from iterations** and community improvements

### Pain Points Addressed

1. **Recipe Iteration:** Track what works and what doesn't
2. **Community Learning:** See how others improve recipes
3. **Personal Growth:** Document cooking journey over time
4. **Change Documentation:** Know why modifications were made
5. **Success Tracking:** Rate and compare different versions

### Database Schema

#### New Tables Required:

```sql
-- Recipe versioning and relationships
CREATE TABLE recipe_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_recipe_id UUID REFERENCES recipes(id),
  parent_version_id UUID REFERENCES recipe_versions(id),
  recipe_id UUID REFERENCES recipes(id), -- The actual recipe data
  version_number TEXT NOT NULL, -- "1.0", "1.1", "2.0"
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  change_summary TEXT,
  is_public BOOLEAN DEFAULT true,
  fork_count INTEGER DEFAULT 0,
  success_rating INTEGER CHECK (success_rating >= 1 AND success_rating <= 5)
);

-- Recipe diary entries
CREATE TABLE recipe_diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_version_id UUID REFERENCES recipe_versions(id),
  created_by UUID REFERENCES profiles(id),
  entry_type TEXT CHECK (entry_type IN ('pre_cooking', 'during_cooking', 'post_cooking', 'next_time')),
  content TEXT NOT NULL,
  cooking_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  images TEXT[] -- Array of image URLs
);

-- Track specific ingredient/instruction changes
CREATE TABLE recipe_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_version_id UUID REFERENCES recipe_versions(id),
  change_type TEXT CHECK (change_type IN ('ingredient_added', 'ingredient_removed', 'ingredient_modified', 'instruction_added', 'instruction_removed', 'instruction_modified')),
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Enhanced Recipe Structure:

```typescript
interface RecipeVersion {
  id: string;
  original_recipe_id: string;
  parent_version_id?: string;
  recipe_id: string;
  version_number: string;
  created_by: string;
  created_at: string;
  change_summary: string;
  is_public: boolean;
  fork_count: number;
  success_rating?: number;

  // Recipe data (from joined recipes table)
  recipe: Recipe;

  // Version-specific data
  changes_made: RecipeChange[];
  diary_entries: DiaryEntry[];
  children: RecipeVersion[]; // Forks from this version
}

interface DiaryEntry {
  id: string;
  recipe_version_id: string;
  created_by: string;
  entry_type: 'pre_cooking' | 'during_cooking' | 'post_cooking' | 'next_time';
  content: string;
  cooking_date?: string;
  created_at: string;
  images?: string[];
}

interface RecipeChange {
  id: string;
  recipe_version_id: string;
  change_type:
    | 'ingredient_added'
    | 'ingredient_removed'
    | 'ingredient_modified'
    | 'instruction_added'
    | 'instruction_removed'
    | 'instruction_modified';
  old_value?: any;
  new_value?: any;
  reason: string;
  created_at: string;
}
```

### Implementation Phases

#### Phase 1: Core Versioning (Sprint 1)

- **Database setup** - Create new tables and relationships
- **Fork functionality** - Clone recipes with version tracking
- **Basic version tree** - Display parent-child relationships
- **Change summary** - Track what was modified and why

#### Phase 2: Diary System (Sprint 2)

- **Diary entries** - Add cooking notes and observations
- **Entry types** - Pre/during/post cooking categorization
- **Timeline view** - Chronological display of diary entries
- **Success tracking** - Rate cooking attempts

#### Phase 3: Advanced Features (Sprint 3)

- **Visual diff** - Compare versions side-by-side
- **Change tracking** - Automatic detection of modifications
- **Merge suggestions** - Combine successful changes
- **Community features** - Popular forks, trending modifications

### User Experience Flow

#### Forking a Recipe:

```
Recipe Detail Page → "Fork Recipe" button →
Fork Modal (change summary) → Create new version →
Edit forked recipe → Save with changes documented
```

#### Diary Entry Flow:

```
Recipe Version → "Add Diary Entry" →
Select entry type → Write notes →
Optional: Add photos → Save entry
```

#### Version Tree Navigation:

```
Recipe Detail → "Version History" tab →
Tree visualization → Click version →
Compare changes → View diary entries
```

### Technical Implementation

#### API Endpoints:

```typescript
// Versioning
POST /api/recipes/:id/fork
GET /api/recipes/:id/versions
GET /api/recipes/:id/version-tree
GET /api/recipes/versions/:versionId

// Diary
POST /api/recipes/versions/:versionId/diary
GET /api/recipes/versions/:versionId/diary
PUT /api/recipes/versions/:versionId/diary/:entryId
DELETE /api/recipes/versions/:versionId/diary/:entryId

// Comparisons
GET /api/recipes/versions/compare/:version1/:version2
```

#### New Components:

```
src/app/recipes/_components/versioning/
├── RecipeFork.tsx              # Fork recipe modal
├── VersionTree.tsx             # Visual version tree
├── VersionHistory.tsx          # Version list with timeline
├── VersionComparison.tsx       # Side-by-side comparison
├── DiaryEntry.tsx              # Single diary entry
├── DiaryTimeline.tsx           # Timeline of entries
├── DiaryForm.tsx               # Add/edit diary entries
└── ChangeTracker.tsx           # Track and display changes
```

### UI Enhancements

#### Recipe Detail Page:

```
┌─────────────────────────────────────────────────────┐
│ Recipe Title v1.2 (forked from @chef_mike's v1.0)   │
│ [Fork Recipe] [Add Diary Entry] [Version History]   │
├─────────────────────────────────────────────────────┤
│ Ingredients (★★★★☆)    │ Recent Diary Entries      │
│ ├─ Flour 300g          │ ├─ "Reduced sugar today"  │
│ ├─ Sugar 150g → 100g   │ ├─ "Texture much better" │
│ └─ [+ more...]         │ └─ "Will try honey next"  │
├─────────────────────────────────────────────────────┤
│ Instructions           │ Change Summary            │
│ ├─ Step 1...           │ ├─ Reduced sugar 33%     │
│ ├─ Step 2...           │ ├─ Added vanilla extract │
│ └─ [+ more...]         │ └─ Increased bake time   │
└─────────────────────────────────────────────────────┘
```

#### Version Tree Visualization:

```
Original Recipe (★4.5) - @chef_mike
├── My Version v1.1 (★4.8) - "Less sweet"
│   ├── My Version v1.2 (★5.0) - "Perfect balance!"
│   └── My Version v1.3 (★4.2) - "Tried gluten-free"
├── @baker_jane's Version (★4.7) - "Vegan option"
│   └── @baker_jane's v1.2 (★4.9) - "Better texture"
└── @home_cook's Version (★4.3) - "Double chocolate"
```

This system will revolutionize how users interact with recipes, turning cooking into a collaborative, iterative learning process!

### 🔮 FUTURE CONSIDERATIONS

#### 1. SEO & Performance

- **Schema.org:** JSON-LD structured data
- **Performance:** Image optimization, caching
- **Analytics:** User engagement tracking

#### 2. Monetization (Optional)

- **Stripe Integration:** Premium features
- **Recipe Monetization:** Paid premium recipes
- **Subscription Model:** Advanced features

#### 3. Content Management

- **Admin Panel:** Content moderation
- **Recipe Approval:** Review system
- **User Management:** Admin controls

---

## 🛠️ Technical Reference

### Project Architecture

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **State Management:** React Context API (`UserContext`, `AuthContext`)
- **Forms:** React Hook Form with drag-and-drop
- **Styling:** Tailwind CSS with dark mode support
- **Icons:** Lucide React (use for consistency)
- **UI Components:** Custom components with Radix UI primitives

### File Structure

```
src/
├── api/                    # Server Actions
│   ├── auth.ts
│   ├── recipe.ts
│   └── profile.ts
├── app/
│   ├── _components/        # Reusable UI components
│   ├── _contexts/         # React Context providers
│   ├── recipes/           # Recipe-related pages
│   └── profiles/          # User profile pages
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── data/                  # Static data files
```

### Key Conventions

- **Server Actions:** Use `'use server'` directive for API functions
- **Client Components:** Use `'use client'` directive when needed
- **Styling:** Use `cn()` utility for conditional class names
- **Types:** Supabase types in `definitions.ts`, custom types in domain files
- **Constants:** Global constants in `src/constants.tsx`

### Database Schema

- **profiles:** User data with avatar, bio, unit preferences
- **recipes:** Full recipe data with JSON fields for ingredients/instructions
- **user_favorite_recipes:** User favorites junction table

### Development Guidelines

- **Always use existing types** - Don't create duplicate interfaces
- **Follow established patterns** - Check existing components for conventions
- **Test thoroughly** - Ensure all features work across the app
- **Maintain consistency** - Use established UI patterns and styling

---

## 📝 Detailed Task Breakdown

### ✅ COMPLETED FEATURES

All core functionality is implemented:

- ✅ Authentication system with profiles
- ✅ Recipe CRUD operations with rich forms
- ✅ User profiles with created/favorited recipes
- ✅ Recipe filtering and sorting
- ✅ Favorites system
- ✅ Print functionality
- ✅ Unit conversion utilities
- ✅ Nutrition estimation system
- ✅ Image upload and storage
- ✅ Responsive design
- ✅ Draft/publish workflow
- ✅ Recipe preview system

### 🔄 IN PROGRESS TASKS

#### Nutrition Display UI

- [ ] Add nutrition section to recipe detail page
- [ ] Implement nutrition input in RecipeForm
- [ ] Connect to existing estimation utilities
- **Files:** `src/app/recipes/[slug]/page.tsx`, `src/app/recipes/_components/RecipeForm.tsx`

#### Unit Conversion UI

- [ ] Add unit toggle to recipe detail pages
- [ ] Implement global unit preference in header
- [ ] Connect to existing conversion utilities
- **Files:** `src/app/recipes/[slug]/page.tsx`, `src/app/_components/Header.tsx`

### 🚀 NEXT FEATURES

#### Recipe Search

- [ ] Implement search API endpoint
- [ ] Add search UI to recipes page
- [ ] Search by name, ingredients, description

#### Recipe Enhancements

- [ ] Baker's percentage for bread recipes
- [ ] Equipment list section
- [ ] Author's notes section
- [ ] Recipe ratings system

#### Social Features

- [ ] Recipe commenting system
- [ ] User following functionality
- [ ] Enhanced social sharing

#### Advanced Features

- [ ] Recipe collections/cookbooks
- [ ] Meal planning system
- [ ] Shopping list generation
- [ ] Schema.org SEO markup
