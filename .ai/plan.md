# Recipe App Development Plan

## Current App State:

*   **Framework:** Next.js
*   **Backend:** Supabase
*   **Core Functionality:**
    *   User authentication (likely via Supabase Auth, given `AuthProvider` and `UserProvider`).
    *   Recipe management:
        *   Creating, viewing, updating, and deleting recipes.
        *   Recipes have properties like name, description, category (sweets, breads), subcategory, ingredients, instructions, prep time, cook time, servings, difficulty, status (draft, published, archived), and images.
        *   Fetching recipes (all, by slug, by user).
    *   User profiles:
        *   Viewing user profiles.
        *   Profiles can have roles (admin, host, participant) and associated permissions (create/delete recipes).
        *   Profiles can be associated with the recipes they created.
    *   Basic UI structure with a header, footer, and toaster notifications.
    *   Routing seems to be set up, with the home page redirecting to `/recipes`.
*   **Interesting Find:** A function `postRecipeToSocial` exists in `src/api/recipe.ts`, suggesting a potential future or existing feature for sharing recipes on social media.
*   **Directory Structure:** Well-organized with clear separation for API logic, components, contexts, helpers, types, and utils.

## Suggested Development Plan:

**Phase 1: Solidify Core & Enhance User Experience**

1.  **Detailed Recipe View:**
    *   **Current:** Likely a basic display.
    *   **Enhancement:** Create a rich recipe detail page. Display all recipe information in a user-friendly format. Show high-quality images (banner and thumbnail). Clearly separate ingredients and instructions. Display prep time, cook time, servings, and difficulty prominently.
    *   **New Feature:** User ratings and reviews for recipes.
2.  **Recipe Listing & Filtering:**
    *   **Current:** `fetchRecipes` exists.
    *   **Enhancement:** Implement robust filtering and sorting options on the `/recipes` page. Allow users to filter by category, subcategory, difficulty, and potentially ingredients. Allow sorting by creation date, rating, popularity.
    *   **New Feature:** Search functionality for recipes (by name, ingredients).
3.  **User Profile Pages:**
    *   **Current:** `fetchUserProfileWithRecipes` exists.
    *   **Enhancement:** Develop dedicated user profile pages (`/profiles/[username]`) that display user information, their created recipes, and potentially their saved/favorited recipes.
4.  **Recipe Creation/Editing Flow:**
    *   **Current:** `addRecipe` and `updateRecipe` API functions exist.
    *   **Enhancement:** Ensure the UI for creating and editing recipes is intuitive. Consider a multi-step form or a well-organized single-page form. Provide clear feedback and validation.
    *   **New Feature:** "Save Draft" functionality should be robust. Allow users to preview their recipe before publishing.

**Phase 2: Community & Engagement Features**

1.  **Recipe Saving/Favorites:**
    *   **New Feature (Essential):** Allow users to save or "favorite" recipes they like.
2.  **Social Sharing:**
    *   **Current:** `postRecipeToSocial` function exists.
    *   **Action:** Implement the UI for this. Allow users to easily share recipes.
3.  **Commenting on Recipes:**
    *   **New Feature:** Allow users to comment on recipes.
4.  **Following Users:**
    *   **New Feature:** Allow users to follow other recipe creators.

**Phase 3: Advanced Features & Monetization (Optional)**

1.  **Meal Planning:**
    *   **New Feature:** Allow users to create meal plans.
2.  **Shopping Lists:**
    *   **New Feature:** Generate shopping lists from recipes/meal plans.
3.  **Nutritional Information:**
    *   **New Feature:** Integrate with an API for nutritional data.
4.  **Recipe Collections/Cookbooks:**
    *   **New Feature:** Allow users to create recipe collections.
5.  **Stripe Integration (from `src/utils/stripe`):**
    *   **Observation:** `stripe` directory exists.
    *   **Action/Consideration:** Define monetization strategy (e.g., premium features, subscriptions).
6.  **Expanding Categories:**
    *   **Current:** Categories are "sweets" and "breads".
    *   **Enhancement:** Add more categories as the app grows (e.g., "main courses," "appetizers").

**Technical Considerations & Refinements:**

*   **Image Handling:** Robust uploading, storage, and optimization. Consider multiple images per recipe.
*   **Error Handling & Loading States:** Implement comprehensively.
*   **Accessibility (a11y):** Follow best practices.
*   **Testing:** Unit and integration tests.
*   **Admin Panel:**
    *   **Current:** "admin" role exists.
    *   **Enhancement:** Develop an admin dashboard for managing users, recipes, etc.

## Next Steps:

1.  **Prioritize features.**
2.  **Break down features into tasks.**
3.  **Begin implementation.** 