# Recipe App Tasks Breakdown

## Priority 1: Essential Core Enhancements & Key Engagement Feature

### 1. Detailed Recipe View Enhancements (Phase 1.1)
*   **Goal:** Create a rich, user-friendly recipe detail page.
*   **Tasks:**
    *   **Frontend:**
        *   [ ] Design and implement layout for `src/app/recipes/[slug]/page.tsx`.
        *   [ ] Display recipe name, description, author (link to profile).
        *   [ ] Display high-quality banner and thumbnail images.
        *   [ ] Clearly sectioned ingredients list component.
        *   [ ] Clearly sectioned, step-by-step instructions component.
        *   [ ] Prominently display prep time, cook time, servings, difficulty.
        *   [ ] Ensure responsive design for recipe detail page.
    *   **Backend (Supabase):**
        *   [ ] Ensure `fetchRecipe` (in `src/api/recipe.ts`) provides all necessary data. No changes likely needed if `recipes_with_author_data` view is comprehensive.
    *   **Types:**
        *   [ ] Verify `Recipe` type in `src/types/recipe.ts` includes all displayed fields.

### 2. Recipe Listing & Filtering/Sorting Enhancements (Phase 1.2)
*   **Goal:** Improve recipe discoverability on the `/recipes` page.
*   **Tasks:**
    *   **Frontend:**
        *   [ ] Implement UI component for filtering options (e.g., dropdowns, checkboxes for category, subcategory, difficulty).
        *   [ ] Implement UI component for sorting options (e.g., dropdown for creation date, (later: rating, popularity)).
        *   [ ] Update `src/app/recipes/page.tsx` to integrate filter/sort components, manage state, and re-fetch data.
        *   [ ] Create or modify recipe card component (`src/app/_components/RecipeCard.tsx`) to display key info and link to detail page.
    *   **Backend (Supabase & API):**
        *   [ ] Modify `fetchRecipes` in `src/api/recipe.ts` to accept filter and sort parameters.
        *   [ ] Update Supabase query in `fetchRecipes` to apply these filters (e.g., `eq` for category, `order` for sorting).
    *   **Types:**
        *   [ ] No major type changes anticipated initially, unless new specific filter types are needed.

### 3. Recipe Creation/Editing Flow Enhancements (Phase 1.4)
*   **Goal:** Make creating and editing recipes intuitive and robust.
*   **Tasks:**
    *   **Frontend - Form Structure & Basic Fields:**
        *   [ ] Design/Refine UI for recipe creation/edit form (e.g., using a route like `/recipes/manage` handling both new and edit based on slug presence).
        *   [ ] Implement input field for recipe name.
        *   [ ] Implement textarea for recipe description.
        *   [ ] Implement input fields for prep time, cook time, servings.
        *   [ ] Implement selection for difficulty level.
        *   [ ] Implement selection for category and subcategory (dynamic based on category).
    *   **Frontend - Dynamic Ingredient & Instruction Fields:**
        *   [ ] Implement component for dynamically adding/removing/editing ingredient inputs (text field per ingredient).
        *   [ ] Implement component for dynamically adding/removing/editing instruction steps (textarea per step).
    *   **Frontend - Image Handling:**
        *   [ ] Implement UI for image thumbnail upload.
        *   [ ] Implement UI for image banner upload.
        *   [ ] Integrate with `src/api/file.ts` or client-side logic for actual upload process & state management (loading, error, success).
        *   [ ] Display image previews after upload.
    *   **Frontend - Form Actions & Validation:**
        *   [ ] Implement client-side validation for all inputs.
        *   [ ] Implement "Save Draft" button and connect to API.
        *   [ ] Implement "Publish" button and connect to API (sets status to 'published').
        *   [ ] Implement "Preview" button/link (may navigate to a read-only view of the current form data or the draft recipe page).
    *   **Backend (API):**
        *   [ ] Review and enhance `addRecipe` and `updateRecipe` in `src/api/recipe.ts` to handle all fields, including status ('draft', 'published').
        *   [ ] Ensure proper error handling and return values from API functions.
    *   **Types:**
        *   [ ] Ensure `Recipe` type and API function parameters in `src/api/recipe.ts` are comprehensive for all form fields and statuses.

### 4. Recipe Saving/Favorites (Phase 2.1 - Essential New Feature)
*   **Goal:** Allow users to save or "favorite" recipes.
*   **Tasks:**
    *   **Backend (Supabase & API):**
        *   [ ] **Database:** Define and create `user_favorite_recipes` table in Supabase (`user_id FK`, `recipe_id FK`, `created_at`).
        *   [ ] **API:** Create `addFavoriteRecipe(userId, recipeId)` function.
        *   [ ] **API:** Create `removeFavoriteRecipe(userId, recipeId)` function.
        *   [ ] **API:** Create `fetchUserFavoriteRecipes(userId)` function (to list all favorites for a user).
        *   [ ] **API:** Modify `fetchRecipe` (or create variant) to include a boolean `isFavorited` by current user.
    *   **Frontend:**
        *   [ ] Add "Favorite/Unfavorite" button component (e.g., a heart icon).
        *   [ ] Integrate button into recipe detail page (`src/app/recipes/[slug]/page.tsx`).
        *   [ ] Integrate button into recipe cards (`src/app/_components/RecipeCard.tsx`).
        *   [ ] Ensure button state reflects if the recipe is favorited and calls correct API on click.
        *   [ ] Display list of favorited recipes on user's profile page.
    *   **Types:**
        *   [ ] Create `UserFavoriteRecipe` interface/type.
        *   [ ] Update `ProfileWithRecipes` or create a new type (e.g., `ProfileWithFavorites`) to include favorited recipes.
        *   [ ] Update `Recipe` type (or extended type for detail view) to include `isFavorited` boolean.

### 5. User Profile Page Enhancements (Phase 1.3)
*   **Goal:** Display user information, their created recipes, and their saved/favorited recipes.
*   **Tasks:**
    *   **Frontend:**
        *   [ ] Design/Refine UI for user profile pages (`src/app/profiles/[username]/page.tsx`).
        *   [ ] Display user's avatar, username, name, bio (if applicable, requires profile fields).
        *   [ ] Implement tabbed interface or distinct sections for "Created Recipes" and "Favorited Recipes".
        *   [ ] List created recipes using the `RecipeCard` component.
        *   [ ] List favorited recipes using the `RecipeCard` component (requires data from `fetchUserFavoriteRecipes`).
    *   **Backend (API):**
        *   [ ] Ensure `fetchUserProfileWithRecipes` in `src/api/profile.ts` is sufficient for "Created Recipes" tab.
        *   [ ] Ensure `fetchUserFavoriteRecipes` is available and integrated for "Favorited Recipes" tab.
    *   **Types:**
        *   [ ] Verify/Update `ProfileWithRecipes` in `src/types/profile.ts` to support display of created and favorited recipes list.


## Priority 2: Important UX and Community Features

### 1. Search Functionality for Recipes (New feature within Phase 1.2)
*   **Goal:** Allow users to search for recipes by name or ingredients.
*   **Tasks:**
    *   **Frontend:**
        *   [ ] Add a search bar component (consider placing in `Header` or on `/recipes` page).
        *   [ ] Handle search input state and trigger API call (e.g., on submit or debounced input).
        *   [ ] Display search results (e.g., navigate to a search results page or update current list on `/recipes`).
    *   **Backend (API & Supabase):**
        *   [ ] Create `searchRecipes(searchTerm)` function in `src/api/recipe.ts`.
        *   [ ] Implement Supabase query in `searchRecipes` using `textSearch` or `ilike` (for `name`, `description`, `ingredients`).
        *   [ ] *Advanced:* Plan and set up Full-Text Search on relevant columns in Supabase for better performance.
    *   **Types:**
        *   [ ] No major type changes anticipated.

### 2. User Ratings and Reviews for Recipes (New feature within Phase 1.1)
*   **Goal:** Allow users to rate and review recipes.
*   **Tasks:**
    *   **Backend (Supabase & API):**
        *   [ ] **Database:** Define and create `recipe_reviews` table (`id`, `recipe_id FK`, `user_id FK`, `rating (1-5)`, `review_text`, `created_at`).
        *   [ ] **API:** `addRecipeReview(recipeId, userId, rating, reviewText)`.
        *   [ ] **API:** `fetchRecipeReviews(recipeId)` (with pagination).
        *   [ ] **API:** `updateRecipeReview(reviewId, rating, reviewText)` (ensure user owns review).
        *   [ ] **API:** `deleteRecipeReview(reviewId)` (ensure user owns review or is admin).
        *   [ ] **API:** Modify `fetchRecipe` to include average rating and review count (or create a separate query).
        *   [ ] *Optional:* Consider Supabase database functions/triggers to automatically update `average_rating` and `review_count` on `recipes` table.
    *   **Frontend:**
        *   **Recipe Detail Page:**
            *   [ ] Display average rating (e.g., star component).
            *   [ ] Display number of reviews.
            *   [ ] Component to list existing reviews (with author, date, rating, text).
            *   [ ] Form for logged-in users to submit/edit their rating & review.
    *   **Types:**
        *   [ ] New `RecipeReview` type/interface.
        *   [ ] Update `Recipe` type (or extended type) to include `average_rating` and `review_count`.

### 3. Social Sharing (Phase 2.2 - UI Implementation)
*   **Goal:** Implement UI for sharing recipes.
*   **Tasks:**
    *   **Frontend:**
        *   [ ] Add social share button/component (e.g., for Facebook, Twitter, Pinterest, Copy Link) to the recipe detail page.
        *   [ ] Implement logic for each share option:
            *   For direct SDKs (e.g., Facebook): Integrate SDK and call appropriate share dialog.
            *   For URL sharing (e.g., Twitter, Pinterest): Construct share URLs with recipe title and link.
            *   For "Copy Link": Copy recipe URL to clipboard.
        *   [ ] *Clarification:* Determine if `postRecipeToSocial(recipe_id: string, profile: Profile)` is still relevant or if client-side sharing is preferred. If used, understand its exact function.
    *   **Backend (API):**
        *   [ ] Potentially no changes if client-side sharing is adopted. If `postRecipeToSocial` is used, ensure it's fit for purpose or adapt/remove.
    *   **Types:**
        *   [ ] No changes anticipated unless `postRecipeToSocial` interaction requires new types.

### 4. Commenting on Recipes (Phase 2.3)
*   **Goal:** Allow users to leave comments on recipes.
*   **Tasks:**
    *   **Backend (Supabase & API):**
        *   [ ] **Database:** Define and create `recipe_comments` table (`id`, `recipe_id FK`, `user_id FK`, `parent_comment_id FK nullable`, `comment_text`, `created_at`).
        *   [ ] **API:** `addRecipeComment(recipeId, userId, commentText, parentCommentId?)`.
        *   [ ] **API:** `fetchRecipeComments(recipeId)` (support pagination and sorting, e.g., newest/oldest).
        *   [ ] **API:** `updateRecipeComment(commentId, commentText)` (ensure user owns comment).
        *   [ ] **API:** `deleteRecipeComment(commentId)` (ensure user owns comment or is admin; consider soft delete).
    *   **Frontend:**
        *   **Recipe Detail Page:**
            *   [ ] Component to display existing comments (show author, date, text; support basic threading if `parent_comment_id` is used).
            *   [ ] Form for logged-in users to submit new comments.
            *   [ ] UI for replying to comments (sets `parent_comment_id`).
            *   [ ] UI for users to edit/delete their own comments.
    *   **Types:**
        *   [ ] New `RecipeComment` type/interface.
        *   [ ] Update `Recipe` type if comment count is denormalized and displayed on cards/lists.

---

This breakdown should give you a solid foundation for planning your development sprints. Remember that technical considerations like error handling, loading states, accessibility, and testing should be incorporated into each relevant task. 