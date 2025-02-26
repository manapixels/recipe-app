import { Metadata } from 'next';
import { CreateRecipeForm } from './_components/CreateRecipeForm';

export const metadata: Metadata = {
  title: 'recipe-app | Create recipe',
};

export default async function CreateRecipePage() {
  return (
    <section className="bg-white dark:bg-gray-900 max-w-2xl py-4 mx-auto lg:py-8">
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Create new recipe</h2>
      <CreateRecipeForm />
    </section>
  );
}
