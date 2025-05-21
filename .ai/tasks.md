## Project Context & Conventions

This document outlines tasks for the Recipe App. Below are key technical details and conventions to keep in mind:

- **Framework & Core Stack:**
  - Next.js (App Router)
  - React (Server Components and Client Components using `'use client';`)
  - TypeScript
  - Tailwind CSS for styling.
  - Supabase for backend (database, authentication, storage).
- **Styling & UI:**
  - **Iconography**: `lucide-react` is the chosen library for UI icons. Please use icons from this library for consistency.
  - **Class Name Composition**: The `cn` utility function (from `src/utils/cn.ts`, using `clsx` and `tailwind-merge`) should be used for conditional and merged Tailwind CSS class names.
  - **Theming**: Tailwind CSS `globals.css` contains base styles and CSS variables for light/dark mode theming.
  - **Toasts**: Custom `Toaster` and `URLToaster` components are located in `src/app/_components/ui/Toasts/`.
  - **Tooltips**: Tippy.js is used for tooltips (CSS imported in `layout.tsx`).
  - **Modals**: A modal portal (`<div id="modal-portal"></div>`) is set up in `layout.tsx`.
- **State Management:**
  - Global state is primarily managed using React Context API. Key contexts include `UserContext` (for user session and profile) and `AuthContext` (for authentication state), found in `src/app/_contexts/`.
- **Data Fetching & API:**
  - Backend interactions are handled via Supabase. Separate Supabase clients are used for server-side (`@/utils/supabase/server`) and client-side (`@/utils/supabase/client`) logic.
  - API logic is primarily implemented as Next.js Server Actions (marked with `'use server';`) located in `src/api/`.
  - Complex data types like `ingredients` and `instructions` are stored as JSON in Supabase and parsed into typed arrays within the application code (e.g., in `fetchRecipe`).
- **Forms:**
  - `react-hook-form` is used for form management (as noted in `RecipeForm.tsx` tasks).
- **Types:**
  - Supabase-generated types are in `src/types/definitions.ts`.
  - Application-specific custom types are defined in files like `src/types/recipe.ts` and `src/types/profile.ts`.
- **Constants:**
  - Project-wide constants, such as `BUCKET_URL` for Supabase storage, are defined in `src/constants.tsx`.
- **Helpers & Utilities:**
  - General utility functions can be found in `src/utils/`, `src/helpers/text.ts`, and `src/helpers/misc.ts`.
- **Routing & Structure:**
  - The project follows standard Next.js App Router file-based routing.
  - Reusable UI components are generally located in `src/app/_components/`.
  - Context providers are in `src/app/_contexts/`.

---

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

### 6. Advanced Recipe Detail Enhancements (Phase 2.2)

- **Goal:** Further enrich the recipe detail page with advanced features for better usability, SEO, and personalization.
- **Tasks:**

  - **Feature: Print-Friendly Version**

    - **Frontend:**
      - [x] Create a new print-specific CSS stylesheet or utility classes to hide non-essential UI elements (header, footer, sidebars, buttons).
      - [x] Add a "Print Recipe" button to `src/app/recipes/[slug]/page.tsx`.
      - [x] Implement JavaScript logic (if needed) to trigger browser's print dialog and apply print styles.
      - [x] Ensure recipe content (title, ingredients, instructions, images) is clearly legible and well-formatted for printing.

  - **Feature: Unit Conversion (Metric/Imperial)**

    - **Frontend - Recipe Page:**
      - [ ] Design and implement a UI toggle/dropdown on `src/app/recipes/[slug]/page.tsx` for users to select their preferred unit system.
      - [ ] Develop utility functions to convert common cooking units (e.g., grams to oz, ml to cups, Celsius to Fahrenheit) for display purposes.
      - [ ] Update ingredient display logic to use converted values based on user selection.
    - **Frontend - App-wide Setting (Header/User Settings):**
      - [ ] Design UI element in `Header.tsx` or a new user settings page for selecting a default unit preference.
      - [ ] Use `UserContext` or a similar state management solution to store and retrieve this preference.
      - [ ] Ensure the recipe page respects this global setting as the default, while still allowing per-page override.
    - **Backend (Supabase & API):**
      - [ ] Consider adding a `preferred_unit_system` (e.g., 'metric', 'imperial') field to the `profiles` table in Supabase to persist user preference.
      - [ ] Update API for fetching user profile to include this preference.
      - [ ] Update API for updating user profile to allow changing this preference.
    - **Types:**
      - [ ] Add `preferred_unit_system` to relevant profile types.

  - **Feature: Equipment List**

    - **Frontend:**
      - [ ] Design and implement a new section/component on `src/app/recipes/[slug]/page.tsx` to display `equipment_list`.
      - [ ] Update `RecipeForm.tsx` to include a field for inputting `equipment_list` (e.g., a text area or dynamic list of items).
    - **Backend (Supabase & API):**
      - [ ] Add an `equipment_list: text[]` (array of strings) or `equipment_list: jsonb` field to the `recipes` table in Supabase.
      - [ ] Ensure `fetchRecipe` returns `equipment_list`.
      - [ ] Modify `addRecipe` and `updateRecipe` to handle saving `equipment_list`.
    - **Types:**
      - [ ] Add `equipment_list` to the `Recipe` type in `src/types/recipe.ts`.

  - **Feature: Author's Notes/Story**

    - **Frontend:**
      - [ ] Design and implement a section on `src/app/recipes/[slug]/page.tsx` to display `authors_notes`.
      - [ ] Update `RecipeForm.tsx` to include a rich text editor or textarea for `authors_notes`.
    - **Backend (Supabase & API):**
      - [ ] Add an `authors_notes: text` field to the `recipes` table.
      - [ ] Ensure `fetchRecipe` returns `authors_notes`.
      - [ ] Modify `addRecipe` and `updateRecipe` to handle saving `authors_notes`.
    - **Types:**
      - [ ] Add `authors_notes` to the `Recipe` type.

  - **Feature: Clearer Nutritional Information Display**

    - **Frontend:**
      - [ ] Design and implement a section/component on `src/app/recipes/[slug]/page.tsx` to display nutritional information (e.g., calories, protein, carbs, fat).
      - [ ] Update `RecipeForm.tsx` if nutritional info is to be manually entered (or integrate with an API for estimation if desired in future).
    - **Backend (Supabase & API):**
      - [ ] Add fields for nutritional data to `recipes` table (e.g., `calories: int`, `protein_g: int`, etc., or a `nutrition_info: jsonb` field).
      - [ ] Ensure `fetchRecipe` returns nutritional data.
      - [ ] Modify `addRecipe` and `updateRecipe` to handle saving nutritional data.
    - **Types:**
      - [ ] Add nutritional fields to the `Recipe` type.

  - **Feature: Baker's Percentage Display for Bread Recipes (Category-Specific)**

    - **Goal:** Allow authors to mark flour ingredients for bread recipes, enabling an optional and accurate baker's percentage view for users.
    - **Frontend (`RecipeForm.tsx`):**
      - [ ] If recipe category is 'bread' (or similar), add a checkbox for each ingredient: "Mark as flour (for Baker's Percentage calculation)". This sets `ingredient.is_flour`.
      - [ ] Provide clear UI guidance to the recipe creator that when marking ingredients as flour, all ingredient amounts (especially flours and liquids) should be in consistent weight units (e.g., grams) for accurate percentage calculation.
    - **Frontend (`/recipes/[slug]/page.tsx`):**
      - [ ] If `recipe.category` is 'bread' (or similar) AND at least one `ingredient.is_flour === true` in `recipe.ingredients`:
        - [ ] Display a "Show/Hide Baker's Percentages" toggle button.
      - [ ] When toggled "on":
        - [ ] Implement logic to calculate total flour weight: sum the `amount` of all ingredients where `ingredient.is_flour === true`. (Ensure robust handling if amounts are not purely numeric or units are inconsistent, though primary reliance is on author inputting correct data as per form guidance).
        - [ ] For each ingredient, calculate its percentage: (`ingredient.amount` / Total Flour Weight) \* 100.
        - [ ] Display the calculated percentage alongside the ingredient's existing amount and unit (e.g., "Water: 350g (70%)").
        - [ ] Clearly indicate that percentages are relative to total flour weight.
    - **Backend (Supabase & API):**
      - (No specific new top-level fields on `recipes` table needed. `addRecipe` and `updateRecipe` already handle the `ingredients` JSONB which will now contain the optional `is_flour` flags within each ingredient object.)
    - **Types (`src/types/recipe.ts`):**
      - [ ] Add `is_flour?: boolean` to the `Ingredient` type (nested within `Recipe`).
    - **Data Considerations:**
      - [ ] Existing bread recipes will not have `is_flour` flags; the baker's percentage toggle will not appear for them by default, which is the correct behavior.

  - **Feature: Structured Data (Schema.org for SEO)**

    - **Frontend:**
      - [ ] Implement JSON-LD script in `src/app/recipes/[slug]/page.tsx` to output `Recipe` schema.
      - [ ] Ensure all relevant recipe data (name, image, ingredients, instructions, times, author, etc.) is correctly mapped to schema properties.
    - **Types:**
      - [ ] Review `Recipe` type in `src/types/recipe.ts` to ensure all necessary fields for schema.org are available and correctly typed.
