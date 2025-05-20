# Recipe App Development Plan

## Current App State:

- **Framework:** Next.js
- **Backend:** Supabase
- **Core Functionality:**
  - User authentication (robust `src/api/auth.ts` with functions for sign-up, sign-in, sign-out, email/password updates; `AuthProvider` and `UserProvider` in layout).
  - Recipe management:
    - Creating, viewing, updating, and deleting recipes.
    - Recipes have properties like name, description, category (sweets, breads), subcategory, `total_time` (replacing separate prep/cook times), servings, difficulty, status (draft, published, archived), and images.
    - `ingredients` are stored as an array of objects (`{name, amount, unit}`).
    - `instructions` are stored as an array of objects (`{step, content}`).
    - Fetching recipes (all, by slug, by user). API calls now directly query `recipes` table and join `profiles` for author data.
  - User profiles:
    - Viewing user profiles.
    - The previous explicit role system (e.g., host, participant) seems to have been removed or simplified. An `AppPermission` type still exists.
    - Profiles are associated with the recipes they created.
  - Basic UI structure with a header (including a "+ Create recipe" link), footer, and toaster notifications.
  - Routing: Home page redirects to `/recipes`.
- **Interesting Find:** A function `postRecipeToSocial` exists in `src/api/recipe.ts`.
- **Directory Structure:** Well-organized. `src/types/definitions.ts` contains Supabase-generated types. `src/types/recipe.ts` includes helper constants for ingredient units, common ingredients, and default ingredient templates.

## Suggested Development Plan:

**Phase 1: Solidify Core & Enhance User Experience**

1.  **Detailed Recipe View:**
    - **Enhancement:** Create a rich recipe detail page. Display all recipe information in a user-friendly format: name, description, author, high-quality images (banner/thumbnail), structured ingredients (name, amount, unit), structured instructions (step, content), `total_time`, servings, difficulty.
    - **Further Enhancements (General):**
      - Implement `Recipe` schema markup (JSON-LD) for improved SEO and rich snippets.
      - Add a print-friendly version of the recipe page.
      - Implement unit conversion (e.g., metric/imperial), potentially with an app-wide setting changeable in the header/user settings.
      - Include an "Equipment List" section.
      - Add a section for "Author's Notes/Story" to personalize recipes.
      - Display clearer nutritional information (if data is collected).
    - **Category-Specific Enhancements:**
      - Add Baker's Percentage display for bread recipes (requires authors to mark flour ingredients and use weight-based units).
    - **New Feature:** User ratings and reviews for recipes.
2.  **Recipe Listing & Filtering:**
    - **Current:** `fetchRecipes` exists.
    - **Enhancement:** Implement robust filtering (category, subcategory, difficulty, potentially ingredients) and sorting (creation date, rating, popularity) on `/recipes`.
    - **New Feature:** Search functionality for recipes (by name, ingredients).
3.  **User Profile Pages:**
    - **Current:** `fetchUserProfileWithRecipes` exists.
    - **Enhancement:** Develop dedicated user profile pages (`/profiles/[username]`) displaying user info, their created recipes, and saved/favorited recipes.
4.  **Recipe Creation/Editing Flow:**
    - **Current:** `addRecipe` and `updateRecipe` API functions exist.
    - **Enhancement:** Ensure a highly intuitive UI for creating/editing recipes. This should handle structured ingredients (leveraging new helper constants for common ingredients/units) and instructions.
    - **New Feature:** Robust "Save Draft" functionality and recipe preview.

**Phase 2: Community & Engagement Features**

1.  **Recipe Saving/Favorites:**
    - **New Feature (Essential):** Allow users to save or "favorite" recipes.
2.  **Social Sharing:**
    - **Current:** `postRecipeToSocial` function exists.
    - **Action:** Implement UI for easy social sharing (clarify function of `postRecipeToSocial` vs. client-side sharing).
3.  **Commenting on Recipes:**
    - **New Feature:** Allow users to comment on recipes.
4.  **Following Users:**
    - **New Feature:** Allow users to follow other recipe creators.

**Phase 3: Advanced Features & Monetization (Optional)**

1.  **Meal Planning**
2.  **Shopping Lists** (generated from structured ingredients)
3.  **Nutritional Information**
4.  **Recipe Collections/Cookbooks**
5.  **Stripe Integration:**
    - **Observation:** `src/utils/stripe` directory was not observed in the latest review. If monetization is planned, this needs to be (re-)established.
    - **Action/Consideration:** Define monetization strategy.
6.  **Expanding Categories**

**Technical Considerations & Refinements:**

- **Image Handling:** Robust uploading, storage, optimization.
- **Data Parsing/Serialization:** Manage conversion between JSON (in DB for ingredients/instructions) and structured objects (in TypeScript/frontend).
- **Error Handling & Loading States**
- **Accessibility (a11y)**
- **Testing**
- **Admin Panel:**
  - **Enhancement:** Develop an admin dashboard. How admin privileges are determined needs to be clarified with the updated auth/permission structure. The `AppPermission` enum included `events.create` and `events.delete` in `definitions.ts` which might be relevant or a remnant.

## Next Steps:

1.  **Review updated Plan and Tasks.**
2.  **Prioritize features.**
3.  **Begin implementation.**
