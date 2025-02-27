'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm, SubmitHandler, Controller, useFieldArray } from 'react-hook-form';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

import { FileUpload } from '@/_components/ui/FileUpload';
import { useToast } from '@/_components/ui/Toasts/useToast';
import { useUser } from '@/_contexts/UserContext';
import { addRecipe } from '@/api/recipe';
import {
  RecipeCategory,
  RecipeSubcategory,
  CATEGORY_OPTIONS,
  SUBCATEGORY_OPTIONS,
  DEFAULT_INGREDIENTS,
  Ingredient,
  MEASUREMENT_UNITS,
  ALL_INGREDIENTS,
  DIFFICULTY_LEVELS,
} from '@/types/recipe';
import Spinner from '@/_components/ui/Spinner';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Search } from 'lucide-react';
import { CustomSelect } from '@/_components/ui/Select';

type Inputs = {
  name: string;
  category: RecipeCategory;
  subcategory: RecipeSubcategory;
  description: string;
  ingredients: Ingredient[];
  instructions: { step: number; content: string }[];
  total_time: string;
  servings: string;
  difficulty: string;
  image_thumbnail_url: string;
  image_banner_url: string;
};

// Add this type for the instruction item
type InstructionItem = {
  id: string;
  step: number;
  content: string;
};

// Add this component for draggable instruction
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

export const CreateRecipeForm = () => {
  const { profile } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory>('sweets');
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
      name: 'Rustic Sourdough Bread',
      category: 'breads',
      subcategory: 'sourdough',
      description: 'A classic artisanal sourdough bread with a crispy crust and chewy interior',
      ingredients: [
        {
          name: 'Bread flour',
          amount: '500',
          unit: 'g',
        },
        {
          name: 'Water',
          amount: '350',
          unit: 'ml',
        },
        {
          name: 'Sourdough starter',
          amount: '150',
          unit: 'g',
        },
        {
          name: 'Salt',
          amount: '10',
          unit: 'g',
        },
      ],
      instructions: [
        { step: 1, content: 'Mix flour and water, let rest for 30 minutes' },
        { step: 2, content: 'Add starter and salt, knead until smooth' },
        { step: 3, content: 'Bulk ferment for 4-6 hours' },
        { step: 4, content: 'Shape and proof overnight' },
        { step: 5, content: 'Bake in Dutch oven at 450°F' },
      ],
      total_time: '45',
      servings: '8',
      difficulty: '3',
      image_thumbnail_url: '',
      image_banner_url: '',
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
  } = useFieldArray<Inputs>({
    control,
    name: 'instructions',
  });

  const loadTemplateIngredients = useCallback(
    (category: RecipeCategory, subcategory?: RecipeSubcategory) => {
      if (subcategory && DEFAULT_INGREDIENTS[category]) {
        setValue('ingredients', DEFAULT_INGREDIENTS[category]!);
      }
    },
    [setValue]
  );

  const onSubmit: SubmitHandler<Inputs> = async data => {
    console.log(data, profile);
    setShowErrorSummary(false);

    if (profile?.id) {
      setIsLoading(true);
      const result = await addRecipe({
        name: data.name,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        ingredients: data.ingredients,
        instructions: data.instructions.map((instruction, index) => ({
          step: index + 1,
          content: instruction.content,
        })),
        total_time: Number(data.total_time),
        servings: Number(data.servings),
        difficulty: Number(data.difficulty),
        created_by: profile.id,
        image_thumbnail_url: data.image_thumbnail_url,
        image_banner_url: data.image_banner_url,
      });

      if (result) {
        console.log(result);
        router.push('/recipes/manage');
        toast({
          description: 'Recipe created successfully.',
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
  const watchDifficulty = watch('difficulty');

  useEffect(() => {
    if (watchCategory) {
      setSelectedCategory(watchCategory);
      const defaultSubcategory = SUBCATEGORY_OPTIONS[watchCategory][0].value as RecipeSubcategory;
      setValue('subcategory', defaultSubcategory);
      loadTemplateIngredients(watchCategory, defaultSubcategory);
    }
  }, [watchCategory, setValue, loadTemplateIngredients]);

  const handleIngredientSearch = (index: number, value: string) => {
    setSearchTerms(prev => ({ ...prev, [index]: value }));
    setValue(`ingredients.${index}.name`, value);
    setOpenDropdown(index);
  };

  const handleIngredientSelect = (index: number, ingredient: string) => {
    setValue(`ingredients.${index}.name`, ingredient);
    setSearchTerms(prev => ({ ...prev, [index]: ingredient }));
    setOpenDropdown(null);
  };

  const moveInstructionItem = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      moveInstruction(dragIndex, hoverIndex);
    },
    [moveInstruction]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4 px-2">
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
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-base-500 focus:border-base-500"
            placeholder="Write your recipe description here..."
          />
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
                  String(watchDifficulty) === String(value)
                    ? 'bg-base-600 text-white hover:bg-base-700 z-10'
                    : 'bg-white text-gray-900 hover:bg-gray-50'
                }
                focus:z-10
              `}
                >
                  <input
                    type="radio"
                    {...register('difficulty', {
                      required: true,
                    })}
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

        <div className="space-y-0">
          <hr className="h-px bg-gray-200 border-0 dark:bg-gray-700 my-12" />
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
                        value={watch(`ingredients.${index}.name`) || searchTerm}
                        onChange={e => handleIngredientSearch(index, e.target.value)}
                        onFocus={() => setOpenDropdown(index)}
                        placeholder="Search ingredient..."
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5"
                      />
                      <Search className="w-4 h-4 absolute right-3 text-gray-400" />
                    </div>
                    {isDropdownOpen && searchTerm && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {filteredIngredients.map((ingredient, i) => (
                          <button
                            key={`${ingredient}-${i}`}
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
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5"
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
                    className="py-2.5 px-1 sm:px-2.5 text-gray-500 hover:text-red-500"
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
      </div>
      {/* Submit Button */}
      <div className="flex justify-end sticky bottom-0 bg-white py-2 border-t border-gray-200 z-10">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-center text-white bg-base-700 rounded-lg focus:ring-4 focus:ring-base-200 dark:focus:ring-base-900 hover:bg-base-800"
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2" />
              Creating Recipe...
            </>
          ) : (
            'Create Recipe'
          )}
        </button>
        {showErrorSummary && (
          <div className="mt-2 text-sm text-red-600">Please fix the errors before creating.</div>
        )}
      </div>
    </form>
  );
};
