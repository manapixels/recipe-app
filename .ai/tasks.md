# Recipe App Tasks Breakdown

## Priority 1: Essential Core Enhancements & Key Engagement Feature

### 1. Detailed Recipe View Enhancements (Phase 1.1)

- **Goal:** Create a rich, user-friendly recipe detail page.
- **Tasks:**
  - **Frontend:**
    - [ ] Design and implement layout for `src/app/recipes/[slug]/page.tsx`.
    - [ ] Display recipe name, description, author (link to profile).
    - [ ] Display high-quality banner and thumbnail images.
    - [ ] Clearly sectioned ingredients list component (handles `Ingredient[]` objects: name, amount, unit).
    - [ ] Clearly sectioned, step-by-step instructions component (handles `Instruction[]` objects: step, content).
    - [ ] Prominently display `total_time`, servings, difficulty (using new emoji labels from `src/types/recipe.ts`).
    - [ ] Ensure responsive design for recipe detail page.
  - **Backend (Supabase & API):**
    - [ ] Ensure `fetchRecipe` in `src/api/recipe.ts` returns data with `ingredients` and `instructions` parsed from JSON into `Ingredient[]` and `Instruction[]` respectively, and includes `total_time`.
  - **Types:**
    - [ ] Verify `Recipe` type in `src/types/recipe.ts` (including `Ingredient`, `Instruction` nested types) aligns with data fetched and displayed.
    - [ ] Ensure `total_time` is present in the `Recipe` type (likely via `Tables<'recipes'>`).

### 2. Recipe Listing & Filtering/Sorting Enhancements (Phase 1.2)

- **Goal:** Improve recipe discoverability on the `/recipes` page.
- **Tasks:**
  - **Frontend:**
    - [ ] Implement UI component for filtering options (category, subcategory - using new emoji labels; difficulty - using new emoji labels).
    - [ ] Implement UI component for sorting options (creation date; later: rating, popularity).
    - [ ] Update `src/app/recipes/page.tsx` to integrate filter/sort components, manage state, and re-fetch data.
    - [ ] Create or modify recipe card component (`src/app/_components/RecipeCard.tsx`) to display key info (including `total_time` if desired) and link to detail page.
  - **Backend (Supabase & API):**
    - [ ] Modify `fetchRecipes` in `src/api/recipe.ts` to accept filter and sort parameters (ensure it fetches `total_time`).
    - [ ] Update Supabase query in `fetchRecipes` to apply these filters and sorting.
  - **Types:**
    - [ ] No major type changes anticipated, confirm `Recipe` type used in lists contains necessary fields.

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
    - [ ] Update `Recipe` type (or extended type for detail view) to include optional `isFavorited` boolean.

### 5. User Profile Page Enhancements (Phase 1.3)

- **Goal:** Display user information, their created recipes, and their saved/favorited recipes.
- **Tasks:**
  - **Frontend:**
    - [ ] Design/Refine UI for user profile pages (`src/app/profiles/[username]/page.tsx`).
    - [ ] Display user's avatar, username, name, bio (if profile schema supports bio).
    - [ ] Implement tabbed interface or sections for "Created Recipes" and "Favorited Recipes".
    - [ ] List created recipes and favorited recipes using the `RecipeCard` component.
  - **Backend (API):**
    - [ ] Ensure `fetchUserProfileWithRecipes` in `src/api/profile.ts` provides data for created recipes.
    - [ ] Ensure `fetchUserFavoriteRecipes` is available for "Favorited Recipes" tab.
  - **Types:**
    - [ ] Verify/Update `ProfileWithRecipes` in `src/types/profile.ts` to support both created and favorited recipes lists.

## Priority 2: Important UX and Community Features

### 1. Search Functionality for Recipes (New feature within Phase 1.2)

- **Goal:** Allow users to search for recipes by name or ingredients.
- **Tasks:**
  - **Frontend:**
    - [ ] Add a search bar component.
    - [ ] Handle search input state and trigger API call.
    - [ ] Display search results.
  - **Backend (API & Supabase):**
    - [ ] Create `searchRecipes(searchTerm)` function in `src/api/recipe.ts`.
    - [ ] Implement Supabase query: For ingredients, this will need to search within the JSONB column if ingredients are stored as JSON. This can be complex (e.g., using `->>` or `@>`). Consider if a simpler search on name/description is MVP.
    - [ ] _Advanced:_ Set up Full-Text Search on relevant columns. For JSONB ingredients, this might involve creating a generated column that unnests ingredients into a searchable text format.
  - **Types:**
    - [ ] No major type changes anticipated.

### 2. User Ratings and Reviews for Recipes (New feature within Phase 1.1)

- **Goal:** Allow users to rate and review recipes.
- **Tasks:**
  - **Backend (Supabase & API):**
    - [ ] **Database:** Define/create `recipe_reviews` table (`id`, `recipe_id FK`, `user_id FK`, `rating (1-5)`, `review_text`, `created_at`).
    - [ ] **API:** `addRecipeReview(recipeId, userId, rating, reviewText)`.
    - [ ] **API:** `fetchRecipeReviews(recipeId)` (with pagination).
    - [ ] **API:** `updateRecipeReview(reviewId, rating, reviewText)` (user owns review).
    - [ ] **API:** `deleteRecipeReview(reviewId)` (user owns review / admin).
    - [ ] **API:** Modify `fetchRecipe` to include average rating and review count.
    - [ ] _Optional:_ DB triggers to auto-update `average_rating`, `review_count` on `recipes` table.
  - **Frontend:**
    - **Recipe Detail Page:**
      - [ ] Display average rating (star component).
      - [ ] Display number of reviews.
      - [ ] Component to list existing reviews.
      - [ ] Form for logged-in users to submit/edit their rating & review.
  - **Types:**
    - [ ] New `RecipeReview` type.
    - [ ] Update `Recipe` type to include `average_rating`, `review_count`.

### 3. Social Sharing (Phase 2.2 - UI Implementation)

- **Goal:** Implement UI for sharing recipes.
- **Tasks:**
  - **Frontend:**
    - [ ] Add social share button/component to recipe detail page.
    - [ ] Implement logic for share options (SDKs, URL construction, Copy Link).
    - [ ] _Clarification:_ Re-evaluate relevance of `postRecipeToSocial` API vs. client-side sharing.
  - **Backend (API):**
    - [ ] Adapt/remove `postRecipeToSocial` if client-side sharing is preferred and API isn't adding value (e.g. tracking shares).
  - **Types:**
    - [ ] No changes anticipated unless `postRecipeToSocial` interaction changes.

### 4. Commenting on Recipes (Phase 2.3)

- **Goal:** Allow users to leave comments on recipes.
- **Tasks:**
  - **Backend (Supabase & API):**
    - [ ] **Database:** Define/create `recipe_comments` table (`id`, `recipe_id FK`, `user_id FK`, `parent_comment_id FK nullable`, `comment_text`, `created_at`).
    - [ ] **API:** `addRecipeComment(...)`.
    - [ ] **API:** `fetchRecipeComments(...)` (pagination, sorting).
    - [ ] **API:** `updateRecipeComment(...)` (user owns comment).
    - [ ] **API:** `deleteRecipeComment(...)` (user owns comment / admin; soft delete).
  - **Frontend:**
    - **Recipe Detail Page:**
      - [ ] Component to display comments (threading if implemented).
      - [ ] Form for new comments.
      - [ ] UI for replying, editing/deleting own comments.
  - **Types:**
    - [ ] New `RecipeComment` type.
    - [ ] Update `Recipe` type if comment count is denormalized.

---

This breakdown should give you a solid foundation for planning your development sprints. Remember that technical considerations like error handling, loading states, accessibility, and testing should be incorporated into each relevant task. Also, the removal of the explicit role system means permission handling (e.g. for editing/deleting content, admin actions) needs to be clearly defined based on user ID or the existing `AppPermission` type.
