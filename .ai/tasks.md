# Recipe App Tasks Breakdown

## Priority 1: Essential Core Enhancements & Key Engagement Feature

### 1. Detailed Recipe View Enhancements (Phase 1.1)

- **Goal:** Create a rich, user-friendly recipe detail page.
- **Tasks:**
  - **Frontend:**
    - [x] Design and implement layout for `src/app/recipes/[slug]/page.tsx`.
    - [x] Display recipe name, description, author (link to profile).
    - [x] Display high-quality banner and thumbnail images.
    - [x] Clearly sectioned ingredients list component (handles `Ingredient[]` objects: name, amount, unit).
    - [x] Clearly sectioned, step-by-step instructions component (handles `Instruction[]` objects: step, content).
    - [x] Prominently display `total_time`, servings, difficulty (using new emoji labels from `src/types/recipe.ts`).
    - [x] Ensure responsive design for recipe detail page.
  - **Backend (Supabase & API):**
    - [x] Ensure `fetchRecipe` in `src/api/recipe.ts` returns data with `ingredients` and `instructions` parsed from JSON into `Ingredient[]` and `Instruction[]` respectively, and includes `total_time`.
  - **Types:**
    - [x] Verify `Recipe` type in `src/types/recipe.ts` (including `Ingredient`, `Instruction` nested types) aligns with data fetched and displayed.
    - [x] Ensure `total_time` is present in the `Recipe` type (likely via `Tables<'recipes'>`).

### 2. Recipe Listing & Filtering/Sorting Enhancements (Phase 1.2)

- **Goal:** Improve recipe discoverability on the `/recipes` page.
- **Tasks:**
  - **Frontend:**
    - [x] Implement UI component for filtering options (category, subcategory - using new emoji labels; difficulty - using new emoji labels).
    - [x] Implement UI component for sorting options (creation date; later: rating, popularity).
    - [x] Update `src/app/recipes/page.tsx` to integrate filter/sort components, manage state, and re-fetch data.
    - [x] Create or modify recipe card component (`src/app/_components/RecipeCard.tsx`) to display key info (including `total_time` if desired) and link to detail page.
  - **Backend (Supabase & API):**
    - [x] Modify `fetchRecipes` in `src/api/recipe.ts` to accept filter and sort parameters (ensure it fetches `total_time`).
    - [x] Update Supabase query in `fetchRecipes` to apply these filters and sorting.
  - **Types:**
    - [x] No major type changes anticipated, confirm `Recipe` type used in lists contains necessary fields.

### 3. User Profile Page Enhancements (Phase 1.3)

- **Goal:** Display user information, their created recipes, and their saved/favorited recipes.
- **Tasks:**
  - **Frontend:**
    - [x] Design/Refine UI for user profile pages (`src/app/profiles/[username]/page.tsx`).
    - [x] Display user's avatar, username, name, bio (if profile schema supports bio).
    - [x] Implement tabbed interface or sections for "Created Recipes" and "Favorited Recipes".
    - [x] List created recipes using the `RecipeListItemInProfile` component (display of favorited recipes is part of Phase 2.1).
  - **Backend (API):**
    - [x] Ensure `fetchUserProfileWithRecipes` in `src/api/profile.ts` provides data for created recipes.
    - [ ] Ensure `fetchUserFavoriteRecipes` is available for "Favorited Recipes" tab (dependency on Phase 2.1 tasks).
  - **Types:**
    - [x] Verify/Update `ProfileWithRecipes` in `src/types/profile.ts` to support bio and created recipes list (support for favorited recipes list to be added in Phase 2.1).

### 4. Recipe Creation & Editing Enhancements (Focus: Intuitive Form)

- **Goal**: Implement a comprehensive and user-friendly form for adding and editing recipes, including draft saving and preview capabilities.
- **Tasks**:
  - **Frontend - Unified Recipe Form (`RecipeForm.tsx`)**:
    - [x] Analyze `CreateRecipeForm.tsx` and `EditRecipeForm.tsx` for existing functionalities.
    - [x] Design a reusable `RecipeForm.tsx` component to handle both creation and editing.
      - [x] Accept `initialData` prop for editing mode.
      - [x] Use `react-hook-form` with `defaultValues` based on `initialData` or new recipe defaults.
      - [x] Dynamically call `addRecipe` or `updateRecipe` API functions.
      - [x] Include dynamic fields for ingredients (name, amount, unit) with add/remove.
      - [x] Include dynamic, reorderable fields for instructions (content, step) with add/remove/drag-and-drop.
      - [x] Integrate image uploads for thumbnail and banner.
      - [x] Implement form validation for all fields (name, category, subcategory, description, ingredients, instructions, time, servings, difficulty).
    - [x] Implement "Save Draft" and "Publish" buttons.
      - [x] Logic to pass `status: 'draft'` or `status: 'published'` to API.
    - [x] Delete `src/app/recipes/create/_components/CreateRecipeForm.tsx`.
    - [x] Delete `src/app/recipes/edit/_components/EditRecipeForm.tsx` (if it existed at the expected path).
  - **Frontend - Pages**:
    - [x] Update `src/app/recipes/create/page.tsx` to use the unified `RecipeForm.tsx` in `'create'` mode.
    - [x] Create/Update `src/app/recipes/[slug]/edit/page.tsx` to fetch recipe data and use `RecipeForm.tsx` in `'edit'` mode with `initialData`.
  - **Backend (API)**:
    - [x] Review/Enhance `addRecipe` to correctly handle `total_time` (numeric) and `status` (draft/published).
    - [x] Review/Enhance `updateRecipe` to correctly handle partial updates, `total_time` (numeric), and `status` (draft/published), ensuring `created_by` is not updatable.
  - **Preview Functionality**:
    - [x] Design a simple modal or separate page to display a non-editable preview of the recipe being created/edited. (`RecipePreview.tsx` in a modal)
    - [x] Add a "Preview" button to `RecipeForm.tsx`.
    - [x] Populate preview with current form data (consider unsaved changes).

### 5. Recipe Saving/Favorites (Phase 2.1 - Essential New Feature)

- **Goal:** Allow users to save or "favorite" recipes.
- **Tasks:**
  - **Backend (Supabase & API):**
    - [x] **Database:** Define and create `user_favorite_recipes` table in Supabase (`user_id FK to profiles.id`, `recipe_id FK to recipes.id`, `created_at`).
    - [x] **API:** Create `addFavoriteRecipe(userId, recipeId)` function.
    - [x] **API:** Create `removeFavoriteRecipe(userId, recipeId)` function.
    - [x] **API:** Create `fetchUserFavoriteRecipes(userId)` function.
    - [x] **API:** Modify `fetchRecipe` to include a boolean `isFavorited` by current user (requires joining/checking `user_favorite_recipes`).
  - **Frontend:**
    - [x] Add "Favorite/Unfavorite" button component.
    - [x] Integrate button into recipe detail page and recipe cards.
    - [x] Ensure button state reflects if recipe is favorited and calls correct API.
    - [x] Display list of favorited recipes on user's profile page.
  - **Types:**
    - [x] Create `UserFavoriteRecipe` interface/type.
    - [x] Update `ProfileWithRecipes` to include an array of favorited `Recipe` objects or IDs.
    - [x] Update `Recipe` type (or extended type for detail view) to include optional `is_favorited`.
