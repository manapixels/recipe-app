'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler, Controller, useFieldArray } from 'react-hook-form';

import { FileUpload } from '@/_components/ui/FileUpload';
import { useToast } from '@/_components/ui/Toasts/useToast';
import { useUser } from '@/_contexts/UserContext';
import { updateRecipe } from '@/api/recipe';
import {
  Recipe,
  RecipeCategory,
  RecipeSubcategory,
  CATEGORY_OPTIONS,
  SUBCATEGORY_OPTIONS,
  DIFFICULTY_LEVELS,
  DifficultyLevel,
  Ingredient,
  MEASUREMENT_UNITS,
  ALL_INGREDIENTS,
} from '@/types/recipe';
import Spinner from '@/_components/ui/Spinner';
import { Plus, Trash2, Search } from 'lucide-react';

type Inputs = {
  name: string;
  category: RecipeCategory;
  subcategory: RecipeSubcategory;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: DifficultyLevel;
  image_thumbnail_url: string;
  image_banner_url: string;
};

interface EditRecipeFormProps {
  recipe: Recipe;
  onSuccess: (recipe: Recipe) => void;
  closeModal: () => void;
}

export const EditRecipeForm = ({ recipe, onSuccess, closeModal }: EditRecipeFormProps) => {
  const { profile } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory>(recipe.category);
  const [searchTerms, setSearchTerms] = useState<Record<number, string>>({});
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      name: recipe.name,
      category: recipe.category,
      subcategory: recipe.subcategory,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      prep_time: recipe.prep_time,
      cook_time: recipe.cook_time,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      image_thumbnail_url: recipe.image_thumbnail_url,
      image_banner_url: recipe.image_banner_url,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const handleIngredientSearch = (index: number, value: string) => {
    setSearchTerms(prev => ({ ...prev, [index]: value }));
    setOpenDropdown(index);
  };

  const handleIngredientSelect = (index: number, ingredient: string) => {
    setValue(`ingredients.${index}.name`, ingredient);
    setSearchTerms(prev => ({ ...prev, [index]: ingredient }));
    setOpenDropdown(null);
  };

  const onSubmit: SubmitHandler<Inputs> = async data => {
    console.log(data);
    setShowErrorSummary(false);

    if (profile?.id) {
      setIsLoading(true);
      const result = await updateRecipe({
        id: recipe.id,
        name: data.name,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        ingredients: data.ingredients,
        instructions: data.instructions,
        prep_time: data.prep_time,
        cook_time: data.cook_time,
        servings: data.servings,
        difficulty: data.difficulty,
        created_by: profile.id,
        image_thumbnail_url: data.image_thumbnail_url,
        image_banner_url: data.image_banner_url,
      });

      if (result) {
        console.log(result);
        onSuccess(result as Recipe);
        closeModal();
        toast({
          description: 'Recipe updated successfully.',
          className: 'bg-green-700 text-white border-transparent',
        });
        setIsLoading(false);
      }
    }
  };

  const handleThumbnailUpload = (uploadResult: string) => {
    setValue('image_thumbnail_url', uploadResult, { shouldValidate: true });
  };

  const handleBannerUpload = (uploadResult: string) => {
    setValue('image_banner_url', uploadResult, { shouldValidate: true });
  };

  const watchCategory = watch('category');

  useEffect(() => {
    if (watchCategory) {
      setSelectedCategory(watchCategory);
      // Reset subcategory when category changes
      setValue('subcategory', SUBCATEGORY_OPTIONS[watchCategory][0].value as RecipeSubcategory);
    }
  }, [watchCategory, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Edit Recipe</h2>

      {/* Name */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Recipe Name
        </label>
        <input
          type="text"
          {...register('name', { required: true })}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          placeholder="Enter recipe name"
        />
        {errors.name && <p className="mt-2 text-sm text-red-600">Recipe name is required</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Category
        </label>
        <select
          {...register('category', { required: true })}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
        >
          <option value="">Select category</option>
          {CATEGORY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-2 text-sm text-red-600">Category is required</p>}
      </div>

      {/* Subcategory */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Subcategory
        </label>
        <select
          {...register('subcategory', { required: true })}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
        >
          <option value="">Select subcategory</option>
          {SUBCATEGORY_OPTIONS[selectedCategory]?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.subcategory && <p className="mt-2 text-sm text-red-600">Subcategory is required</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Write your recipe description here..."
        />
      </div>

      {/* Ingredients */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-900 dark:text-white">
            Ingredients
          </label>
          <button
            type="button"
            onClick={() => append({ name: '', weight: '', unit: 'g' })}
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Ingredient
          </button>
        </div>

        <div className="space-y-2">
          {fields.map((field, index) => {
            const searchTerm = searchTerms[index] || field.name || '';
            const isDropdownOpen = openDropdown === index;
            const filteredIngredients = ALL_INGREDIENTS.filter(ing =>
              ing.toLowerCase().includes(searchTerm.toLowerCase())
            );

            return (
              <div key={field.id} className="flex gap-2 items-start">
                <div className="flex-1 relative">
                  <div className="flex items-center">
                    <input
                      value={searchTerm}
                      onChange={e => handleIngredientSearch(index, e.target.value)}
                      onFocus={() => setOpenDropdown(index)}
                      placeholder="Search ingredient..."
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    />
                    <Search className="w-4 h-4 absolute right-3 text-gray-400" />
                  </div>
                  {isDropdownOpen && searchTerm && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {filteredIngredients.map(ingredient => (
                        <button
                          key={ingredient}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                          onClick={() => handleIngredientSelect(index, ingredient)}
                        >
                          {ingredient}
                        </button>
                      ))}
                    </div>
                  )}
                  <input
                    type="hidden"
                    {...register(`ingredients.${index}.name` as const, { required: true })}
                  />
                </div>
                <div className="w-32">
                  <input
                    {...register(`ingredients.${index}.weight` as const, { required: true })}
                    placeholder="Amount"
                    type="number"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  />
                </div>
                <div className="w-32">
                  <select
                    {...register(`ingredients.${index}.unit` as const, { required: true })}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  >
                    {Object.entries(MEASUREMENT_UNITS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2.5 text-gray-500 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
        {errors.ingredients && (
          <p className="mt-2 text-sm text-red-600">All ingredient fields are required</p>
        )}
      </div>

      {/* Instructions */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Instructions (one step per line)
        </label>
        <textarea
          {...register('instructions', {
            required: true,
            setValueAs: v => v.split('\n').filter(Boolean),
          })}
          defaultValue={recipe.instructions.join('\n')}
          rows={4}
          className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter instructions, one step per line..."
        />
        {errors.instructions && (
          <p className="mt-2 text-sm text-red-600">At least one instruction step is required</p>
        )}
      </div>

      {/* Times and Servings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Prep Time (minutes)
          </label>
          <input
            type="number"
            {...register('prep_time', { required: true, min: 0 })}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          />
          {errors.prep_time && (
            <p className="mt-2 text-sm text-red-600">Valid prep time is required</p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Cook Time (minutes)
          </label>
          <input
            type="number"
            {...register('cook_time', { required: true, min: 0 })}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          />
          {errors.cook_time && (
            <p className="mt-2 text-sm text-red-600">Valid cook time is required</p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Servings
          </label>
          <input
            type="number"
            {...register('servings', { required: true, min: 1 })}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          />
          {errors.servings && (
            <p className="mt-2 text-sm text-red-600">Valid number of servings is required</p>
          )}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Difficulty Level
        </label>
        <select
          {...register('difficulty', { required: true })}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
        >
          <option value="">Select difficulty</option>
          {Object.entries(DIFFICULTY_LEVELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.difficulty && (
          <p className="mt-2 text-sm text-red-600">Difficulty level is required</p>
        )}
      </div>

      {/* Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Thumbnail Image
          </label>
          <Controller
            name="image_thumbnail_url"
            control={control}
            render={({ field }) => (
              <FileUpload
                bucketId="recipe_thumbnails"
                userId={profile?.id}
                currValue={field.value}
                onUploadComplete={handleThumbnailUpload}
                register={register}
                validationSchema={{ required: false }}
                name="image_thumbnail_url"
                label="Thumbnail Image"
              />
            )}
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Banner Image
          </label>
          <Controller
            name="image_banner_url"
            control={control}
            render={({ field }) => (
              <FileUpload
                bucketId="recipe_banners"
                userId={profile?.id}
                currValue={field.value}
                onUploadComplete={handleBannerUpload}
                register={register}
                validationSchema={{ required: false }}
                name="image_banner_url"
                label="Banner Image"
              />
            )}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={closeModal}
          className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-primary-700 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800"
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2" />
              Updating Recipe...
            </>
          ) : (
            'Update Recipe'
          )}
        </button>
      </div>
      {showErrorSummary && (
        <div className="mt-2 text-sm text-red-600">Please fix the errors before updating.</div>
      )}
    </form>
  );
};
