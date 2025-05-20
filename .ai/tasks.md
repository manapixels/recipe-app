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
    - [ ] Ensure responsive design for recipe detail page.
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

### 3. Recipe Creation/Editing Flow Enhancements (Phase 1.4)

- **Goal:** Make creating and editing recipes intuitive and robust, handling new structured data.
- **Tasks:**
  - **Frontend - Form Structure & Basic Fields:**
    - [ ] Design/Refine UI for recipe creation/edit form (e.g., `/recipes/manage` or `/recipes/create`, `/recipes/[slug]/edit`).
    - [ ] Implement input field for recipe name.
    - [ ] Implement textarea for recipe description.
    - [ ] Implement input field for `total_time` (numeric, perhaps in minutes).
    - [ ] Implement input field for servings (numeric).
    - [ ] Implement selection for difficulty level (using `DIFFICULTY_LEVELS` from `src/types/recipe.ts`).
    - [ ] Implement selection for category and subcategory (using `CATEGORY_OPTIONS`, `SUBCATEGORY_OPTIONS` from `src/types/recipe.ts`, with dynamic subcategories).
  - **Frontend - Dynamic Ingredient & Instruction Fields:**
    - [ ] Implement component for dynamically adding/removing/editing `Ingredient` objects:
      - Input for `name` (perhaps suggest from `COMMON_INGREDIENTS`).
      - Input for `amount` (string/number).
      - Select for `unit` (using `MEASUREMENT_UNITS`).
      - (Optional) Input for `image_url`.
    - [ ] Implement component for dynamically adding/removing/editing `Instruction` objects (textarea for `content`, auto-number `step`).
  - **Frontend - Image Handling:**
    - [ ] Implement UI for image thumbnail upload.
    - [ ] Implement UI for image banner upload.
    - [ ] Integrate with `src/api/file.ts` for upload process & state management.
    - [ ] Display image previews.
  - **Frontend - Form Actions & Validation:**
    - [ ] Implement client-side validation for all inputs (including structured ingredients/instructions).
    - [ ] Implement "Save Draft" button (connects to API, sets status to 'draft').
    - [ ] Implement "Publish" button (connects to API, sets status to 'published').
    - [ ] Implement "Preview" button/link.
  - **Backend (API):**
    - [ ] Review/enhance `addRecipe`, `updateRecipe` in `src/api/recipe.ts` to correctly handle `total_time`.
    - [ ] Ensure `addRecipe` and `updateRecipe` expect `Ingredient[]` and `Instruction[]` and serialize them to JSON before saving to Supabase.
    - [ ] Ensure proper error handling for new structured data.
  - **Types:**
    - [ ] Confirm `Recipe` type (and nested `Ingredient`, `Instruction`) and API function parameters accurately reflect form data and DB structure (JSON for ingredients/instructions in DB, objects in TS).

### 4. Recipe Saving/Favorites (Phase 2.1 - Essential New Feature)

- **Goal:** Allow users to save or "favorite" recipes.
- **Tasks:**
  - **Backend (Supabase & API):**
    - [ ] **Database:** Define and create `user_favorite_recipes` table in Supabase (`user_id FK to profiles.id`, `recipe_id FK to recipes.id`, `created_at`).
    - [ ] **API:** Create `addFavoriteRecipe(userId, recipeId)` function.
    - [ ] **API:** Create `removeFavoriteRecipe(userId, recipeId)` function.
    - [ ] **API:** Create `fetchUserFavoriteRecipes(userId)` function.
    - [ ] **API:** Modify `fetchRecipe` to include a boolean `isFavorited` by current user (requires joining/checking `user_favorite_recipes`).
  - **Frontend:**
    - [ ] Add "Favorite/Unfavorite" button component.
    - [ ] Integrate button into recipe detail page and recipe cards.
    - [ ] Ensure button state reflects if recipe is favorited and calls correct API.
    - [ ] Display list of favorited recipes on user's profile page.
  - **Types:**
    - [ ] Create `UserFavoriteRecipe` interface/type.
    - [ ] Update `ProfileWithRecipes` to include an array of favorited `Recipe` objects or IDs.
    - [ ] Update `Recipe` type (or extended type for detail view) to include optional `
