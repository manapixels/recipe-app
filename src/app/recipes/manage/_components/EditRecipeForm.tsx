'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm, SubmitHandler, Controller, useFieldArray } from 'react-hook-form';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

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
import { CustomSelect } from '@/_components/ui/Select';

type Inputs = {
  name: string;
  category: RecipeCategory;
  subcategory: RecipeSubcategory;
  description: string;
  ingredients: Ingredient[];
  instructions: { step: number; content: string }[];
  total_time: number;
  servings: number;
  difficulty: DifficultyLevel;
  image_thumbnail_url: string;
  image_banner_url: string;
};

type InstructionItem = {
  id: string;
  step: number;
  content: string;
};

interface EditRecipeFormProps {
  recipe: Recipe;
  onSuccess: (recipe: Recipe) => void;
  closeModal: () => void;
}

const DraggableInstruction = ({
  index,
  moveInstruction,
  register,
  removeInstruction,
}: {
  instruction: InstructionItem;
  index: number;
  moveInstruction: (dragIndex: number, hoverIndex: number) => void;
  register: any;
  removeInstruction: (index: number) => void;
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'instruction',
    item: { index },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'instruction',
    hover(item: { index: number }) {
      if (item.index === index) return;
      moveInstruction(item.index, index);
      item.index = index;
    },
  });

  return (
    <div
      ref={node => drag(drop(node))}
      className={`flex gap-2 items-start bg-white p-3 rounded-lg border cursor-move ${
        isDragging ? 'border-base-500 bg-base-200 shadow-lg' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
        <span className="text-gray-600 font-medium">{index + 1}</span>
      </div>
      <div className="flex-1">
        <textarea
          {...register(`instructions.${index}.content` as const, {
            required: true,
          })}
          rows={2}
          className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-base-500 focus:border-base-500"
          placeholder={`Step ${index + 1} instructions...`}
        />
      </div>
      <button
        type="button"
        onClick={() => removeInstruction(index)}
        className="p-2 text-gray-500 hover:text-red-500"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};

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
      description: recipe.description ?? undefined,
      ingredients: recipe.ingredients,
      instructions: Array.isArray(recipe.instructions)
        ? recipe.instructions.map((instruction, index) => ({
            step: index + 1,
            content: typeof instruction === 'string' ? instruction : instruction.content,
          }))
        : [],
      total_time: recipe.total_time,
      servings: recipe.servings,
      difficulty: String(recipe.difficulty) as DifficultyLevel,
      image_thumbnail_url: recipe.image_thumbnail_url ?? undefined,
      image_banner_url: recipe.image_banner_url ?? undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
    move: moveInstruction,
  } = useFieldArray({
    control,
    name: 'instructions',
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
        total_time: data.total_time,
        servings: data.servings,
        difficulty: parseInt(data.difficulty),
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

  const moveInstructionItem = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      moveInstruction(dragIndex, hoverIndex);

      // Update step numbers after reordering
      const instructions = watch('instructions');
      instructions.forEach((_, index) => {
        setValue(`instructions.${index}.step`, index + 1);
      });
    },
    [moveInstruction, watch, setValue]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4 px-2">
        <h2 className="text-xl font-bold mb-4">Edit Recipe</h2>

        {/* Name */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Recipe Name
          </label>
          <input
            type="text"
            {...register('name', { required: true })}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5"
            placeholder="Enter recipe name"
          />
          {errors.name && <p className="mt-2 text-sm text-red-600">Recipe name is required</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Category
          </label>
          <Controller
            control={control}
            name="category"
            rules={{ required: true }}
            render={({ field }) => (
              <CustomSelect
                options={[...CATEGORY_OPTIONS]}
                value={field.value}
                onChange={field.onChange}
                error={!!errors.category}
                placeholder="Select category"
              />
            )}
          />
          {errors.category && <p className="mt-2 text-sm text-red-600">Category is required</p>}
        </div>

        {/* Subcategory */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Subcategory
          </label>
          <Controller
            control={control}
            name="subcategory"
            rules={{ required: true }}
            render={({ field }) => (
              <CustomSelect
                options={[...SUBCATEGORY_OPTIONS[selectedCategory]]}
                value={field.value}
                onChange={field.onChange}
                error={!!errors.subcategory}
                placeholder="Select subcategory"
              />
            )}
          />
          {errors.subcategory && (
            <p className="mt-2 text-sm text-red-600">Subcategory is required</p>
          )}
        </div>

        {/* Times, Servings, Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Total Time (minutes)
            </label>
            <input
              type="number"
              {...register('total_time', { required: true, min: 0 })}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5"
            />
            {errors.total_time && (
              <p className="mt-2 text-sm text-red-600">Valid total time is required</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Servings
            </label>
            <input
              type="number"
              {...register('servings', { required: true, min: 1 })}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5"
            />
            {errors.servings && (
              <p className="mt-2 text-sm text-red-600">Valid number of servings is required</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Difficulty Level
            </label>
            <div className="inline-flex rounded-md shadow-sm">
              {Object.entries(DIFFICULTY_LEVELS).map(([value, emoji], idx, arr) => (
                <label
                  key={value}
                  className={`
                    relative inline-flex items-center cursor-pointer justify-center px-4 py-2 text-sm font-medium
                    ${idx === 0 ? 'rounded-l-lg' : ''} 
                    ${idx === arr.length - 1 ? 'rounded-r-lg' : ''}
                    ${idx !== arr.length - 1 ? 'border-r' : ''}
                    border border-gray-200
                    ${
                      String(watch('difficulty')) === String(value)
                        ? 'bg-base-600 text-white hover:bg-base-700 z-10'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                    }
                    focus:z-10
                  `}
                >
                  <input
                    type="radio"
                    {...register('difficulty', { required: true })}
                    value={value}
                    className="sr-only"
                  />
                  <span>{emoji}</span>
                </label>
              ))}
            </div>
            {errors.difficulty && (
              <p className="mt-2 text-sm text-red-600">Difficulty level is required</p>
            )}
          </div>
        </div>

        {/* Ingredients */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              Ingredients
            </label>
            <button
              type="button"
              onClick={() => append({ name: '', amount: '', unit: 'g' })}
              className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-base-600 rounded-lg hover:bg-base-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </button>
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => {
              const searchTerm = searchTerms[index] || '';
              const isDropdownOpen = openDropdown === index;
              const filteredIngredients = ALL_INGREDIENTS.filter(ing =>
                ing.toLowerCase().includes(searchTerm.toLowerCase())
              );
              return (
                <div key={field.id} className="flex gap-2 items-start">
                  <div className="flex-1 relative">
                    <div className="flex items-center">
                      <input
                        value={searchTerms[index] || field.name || ''}
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
                  <div className="w-12 sm:w-32">
                    <input
                      {...register(`ingredients.${index}.amount` as const, { required: true })}
                      placeholder="Amount"
                      type="number"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    />
                  </div>
                  <div className="w-14 sm:w-32">
                    {/* For larger screens */}
                    <div className="hidden sm:inline-flex rounded-md shadow-sm">
                      {Object.entries(MEASUREMENT_UNITS).map(([value, label], idx, arr) => (
                        <label
                          key={value}
                          className={`
                            relative inline-flex items-center cursor-pointer justify-center px-2.5 py-2 text-sm font-medium
                            ${idx === 0 ? 'rounded-l-lg' : ''} 
                            ${idx === arr.length - 1 ? 'rounded-r-lg' : ''}
                            ${idx !== arr.length - 1 ? 'border-r' : ''}
                            border border-gray-200
                            ${
                              watch(`ingredients.${index}.unit`) === value
                                ? 'bg-base-600 text-white hover:bg-base-700 z-10'
                                : 'bg-white text-gray-900 hover:bg-gray-50'
                            }
                            focus:z-10
                          `}
                        >
                          <input
                            type="radio"
                            {...register(`ingredients.${index}.unit` as const, { required: true })}
                            value={value}
                            className="sr-only"
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>

                    {/* For mobile screens */}
                    <Controller
                      name={`ingredients.${index}.unit` as const}
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <div className="sm:hidden">
                          <CustomSelect
                            options={Object.entries(MEASUREMENT_UNITS).map(([value, label]) => ({
                              value,
                              label,
                            }))}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select unit"
                          />
                        </div>
                      )}
                    />
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
        </div>

        {/* Instructions */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              Instructions
            </label>
            <button
              type="button"
              onClick={() => appendInstruction({ step: instructionFields.length + 1, content: '' })}
              className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-base-600 rounded-lg hover:bg-base-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Step
            </button>
          </div>

          <DndProvider
            backend={
              typeof window !== 'undefined' && 'ontouchstart' in window
                ? TouchBackend
                : HTML5Backend
            }
          >
            <div className="space-y-2">
              {instructionFields.map((field, index) => (
                <DraggableInstruction
                  key={field.id}
                  instruction={field as InstructionItem}
                  index={index}
                  moveInstruction={moveInstructionItem}
                  register={register}
                  removeInstruction={removeInstruction}
                />
              ))}
            </div>
          </DndProvider>

          {errors.instructions && (
            <p className="mt-2 text-sm text-red-600">All instruction steps are required</p>
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
        <div className="flex justify-end sticky bottom-0 bg-white py-2 border-t border-gray-200 z-10">
          <button
            type="button"
            onClick={closeModal}
            className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-base-700 rounded-lg focus:ring-4 focus:ring-base-200 dark:focus:ring-base-900 hover:bg-base-800"
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
      </div>
    </form>
  );
};
