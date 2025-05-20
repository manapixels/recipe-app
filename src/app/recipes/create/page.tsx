import { Metadata } from 'next';
import { RecipeForm } from '../_components/RecipeForm';

export const metadata: Metadata = {
  title: 'recipe-app | Create recipe',
};

export default async function CreateRecipePage() {
  return (
    <section className="bg-white dark:bg-gray-900 max-w-4xl px-4 py-8 mx-auto lg:py-12">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create a New Recipe</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Share your culinary creations with the world.
        </p>
      </div>
      <RecipeForm mode="create" />
    </section>
  );
}
