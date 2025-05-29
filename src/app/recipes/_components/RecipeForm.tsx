'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm, SubmitHandler, Controller, useFieldArray } from 'react-hook-form';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Search, Eye } from 'lucide-react';

import { FileUpload } from '@/_components/ui/FileUpload';
import { useToast } from '@/_components/ui/Toasts/useToast';
import { useUser } from '@/_contexts/UserContext';
import { addRecipe, updateRecipe } from '@/api/recipe';
import {
  Recipe,
  RecipeCategory,
  RecipeSubcategory,
  CATEGORY_OPTIONS,
  SUBCATEGORY_OPTIONS,
  DEFAULT_INGREDIENTS,
  Ingredient,
  MEASUREMENT_UNITS,
  ALL_INGREDIENTS,
  RecipeStatus,
  DifficultyLevel,
} from '@/types/recipe';
import Spinner from '@/_components/ui/Spinner';
import { CustomSelect } from '@/_components/ui/Select';
import { RecipePreview } from './RecipePreview';
import DifficultyDisplay from '../../_components/ui/DifficultyDisplay';

// Type for the instruction item, used by DraggableInstruction
type DraggableInstructionItem = {
  id: string;
  step?: number;
  content: string;
};

// DraggableInstruction Component
const DraggableInstruction = ({
  index,
  moveInstruction,
  register,
  removeInstruction,
  errors,
}: {
  field: DraggableInstructionItem;
  index: number;
  moveInstruction: (dragIndex: number, hoverIndex: number) => void;
  register: any;
  removeInstruction: (index: number) => void;
  errors: any;
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
      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg shrink-0">
        <span className="text-gray-600 font-medium">{index + 1}</span>
      </div>
      <div className="flex-1">
        <textarea
          {...register(`instructions.${index}.content` as const, {
            required: 'Instruction content is required.',
          })}
          rows={2}
          className={`block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border focus:ring-base-500 focus:border-base-500 ${
            errors?.instructions?.[index]?.content ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={`Step ${index + 1} instructions...`}
        />
        {errors?.instructions?.[index]?.content && (
          <p className="mt-1 text-xs text-red-500">
            {(errors.instructions as any)[index].content.message}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => removeInstruction(index)}
        className="p-2 text-gray-500 hover:text-red-500 shrink-0"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};

export type RecipeFormInputs = {
  name: string;
  category: RecipeCategory;
  subcategory: RecipeSubcategory;
  description: string;
  ingredients: Ingredient[];
  instructions: { step?: number; content: string }[];
  total_time: string;
  servings: string;
  difficulty: string;
  image_thumbnail_url: string;
  image_banner_url: string;
};

interface RecipeFormProps {
  mode: 'create' | 'edit';
  initialData?: Recipe;
  onSuccess?: (recipe: Recipe) => void;
  onCancel?: () => void;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({
  mode,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { profile } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submitAction, setSubmitAction] = useState<RecipeStatus>('published');
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory>(
    initialData?.category || CATEGORY_OPTIONS[0].value
  );
  const [searchTerms, setSearchTerms] = useState<Record<number, string>>({});
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState<Partial<Recipe>>({});

  const isEditMode = mode === 'edit';

  const defaultFormValues: RecipeFormInputs = useMemo(
    () => ({
      name: '',
      category: CATEGORY_OPTIONS[0].value,
      subcategory:
        SUBCATEGORY_OPTIONS[CATEGORY_OPTIONS[0].value]?.[0]?.value || ('' as RecipeSubcategory),
      description: '',
      ingredients: [{ name: '', amount: '', unit: 'g' }],
      instructions: [{ content: '' }],
      total_time: '30',
      servings: '4',
      difficulty: '1',
      image_thumbnail_url: '',
      image_banner_url: '',
    }),
    []
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RecipeFormInputs>({
    defaultValues: initialData
      ? {
          name: initialData.name,
          category: initialData.category,
          subcategory: initialData.subcategory,
          description: initialData.description || '',
          ingredients: initialData.ingredients?.length
            ? initialData.ingredients.map(ing => ({ ...ing, amount: String(ing.amount) }))
            : [{ name: '', amount: '', unit: 'g' }],
          instructions: initialData.instructions?.length
            ? initialData.instructions.map(instr => ({ content: instr.content }))
            : [{ content: '' }],
          total_time: String(initialData.total_time || '0'),
          servings: String(initialData.servings || '1'),
          difficulty: String(initialData.difficulty || '1'),
          image_thumbnail_url: initialData.image_thumbnail_url || '',
          image_banner_url: initialData.image_banner_url || '',
        }
      : defaultFormValues,
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstructionField,
    move: moveInstruction,
  } = useFieldArray({
    control,
    name: 'instructions',
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        category: initialData.category,
        subcategory: initialData.subcategory,
        description: initialData.description || '',
        ingredients: initialData.ingredients?.length
          ? initialData.ingredients.map(ing => ({ ...ing, amount: String(ing.amount) }))
          : [{ name: '', amount: '', unit: 'g' }],
        instructions: initialData.instructions?.length
          ? initialData.instructions.map(instr => ({ content: instr.content }))
          : [{ content: '' }],
        total_time: String(initialData.total_time || '0'),
        servings: String(initialData.servings || '1'),
        difficulty: String(initialData.difficulty || '1'),
        image_thumbnail_url: initialData.image_thumbnail_url || '',
        image_banner_url: initialData.image_banner_url || '',
      });
      setSelectedCategory(initialData.category);
    } else {
      reset(defaultFormValues);
      setSelectedCategory(CATEGORY_OPTIONS[0].value);
    }
  }, [initialData, reset, defaultFormValues]);

  const loadTemplateIngredients = useCallback(
    (category: RecipeCategory) => {
      if (DEFAULT_INGREDIENTS[category]) {
        setValue(
          'ingredients',
          DEFAULT_INGREDIENTS[category]!.map(ing => ({ ...ing, amount: String(ing.amount) }))
        );
      }
    },
    [setValue]
  );

  const watchCategory = watch('category');

  useEffect(() => {
    if (watchCategory) {
      setSelectedCategory(watchCategory);
      const subcatOptions = SUBCATEGORY_OPTIONS[watchCategory];
      if (subcatOptions && subcatOptions.length > 0) {
        const currentSubcategory = watch('subcategory');
        if (!subcatOptions.find(opt => opt.value === currentSubcategory)) {
          setValue('subcategory', subcatOptions[0].value as RecipeSubcategory, {
            shouldValidate: true,
          });
          loadTemplateIngredients(watchCategory);
        } else {
          loadTemplateIngredients(watchCategory);
        }
      } else {
        setValue('subcategory', '' as RecipeSubcategory, { shouldValidate: true });
      }
    }
  }, [watchCategory, setValue, loadTemplateIngredients, watch]);

  const onSubmitHandler: SubmitHandler<RecipeFormInputs> = async data => {
    if (!profile?.id) {
      toast({
        title: 'Error',
        description: 'User profile not found. Please log in.',
        variant: 'destructive',
      });
      setShowErrorSummary(true);
      return;
    }

    const currentErrors = Object.keys(errors);
    setShowErrorSummary(currentErrors.length > 0);
    if (currentErrors.length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Please check the form for errors.',
        variant: 'destructive',
      });
      console.error('Form validation errors:', errors);
      return;
    }

    setIsLoading(true);

    const commonRecipeData = {
      name: data.name,
      description: data.description || null,
      category: data.category,
      subcategory: data.subcategory,
      ingredients: data.ingredients
        .filter(ing => ing.name && ing.name.trim() !== '')
        .map(ing => ({ ...ing, amount: String(ing.amount) })),
      instructions: data.instructions
        .filter(instr => instr.content && instr.content.trim() !== '')
        .map((instruction, index) => ({ step: index + 1, content: instruction.content! })),
      total_time: Number(data.total_time),
      servings: Number(data.servings),
      image_thumbnail_url: data.image_thumbnail_url || null,
      image_banner_url: data.image_banner_url || null,
      status: submitAction,
      difficulty: Number(data.difficulty),
    };

    try {
      let result: Recipe | Error | null = null;

      if (isEditMode) {
        if (!initialData?.id) {
          throw new Error('Recipe ID is missing for update.');
        }
        const recipeDataToUpdate = {
          id: initialData.id,
          ...commonRecipeData,
          difficulty: commonRecipeData.difficulty as any,
        };
        result = await updateRecipe(recipeDataToUpdate as Parameters<typeof updateRecipe>[0]);
      } else {
        const recipeDataToAdd = {
          ...commonRecipeData,
          created_by: profile.id,
          difficulty: commonRecipeData.difficulty as any,
        };
        const addRecipeResult = await addRecipe(recipeDataToAdd as Parameters<typeof addRecipe>[0]);
        if (
          addRecipeResult &&
          !(addRecipeResult instanceof Error) &&
          Array.isArray(addRecipeResult)
        ) {
          result = addRecipeResult[0] || null;
        } else if (addRecipeResult instanceof Error) {
          result = addRecipeResult;
        } else {
          result = null;
        }
      }

      if (result && !(result instanceof Error)) {
        toast({
          description: `Recipe ${submitAction === 'draft' ? (isEditMode ? 'draft updated' : 'saved as draft') : isEditMode ? 'updated successfully' : 'created successfully'}.`,
          className: 'bg-green-700 text-white border-transparent',
        });
        if (onSuccess) {
          onSuccess(result as Recipe);
        } else {
          router.push(isEditMode && result.slug ? `/recipes/${result.slug}` : '/recipes/manage');
        }
        reset(isEditMode ? undefined : defaultFormValues);
      } else {
        const errorMessage = result instanceof Error ? result.message : 'API operation failed';
        console.error('API Error:', result);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast({
        title: 'Error',
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} recipe.`,
        variant: 'destructive',
      });
      setShowErrorSummary(true);
    }
    setIsLoading(false);
  };

  const handleFormSubmit = (action: RecipeStatus) => {
    setSubmitAction(action);
    handleSubmit(onSubmitHandler)();
  };

  const handlePreview = () => {
    const currentValues = getValues();
    const transformedPreviewData: Partial<Recipe> = {
      ...currentValues,
      name: currentValues.name || 'Untitled Recipe',
      total_time: Number(currentValues.total_time),
      servings: Number(currentValues.servings),
      difficulty: Number(currentValues.difficulty),
      ingredients: currentValues.ingredients.map(ing => ({ ...ing, amount: String(ing.amount) })),
      instructions: currentValues.instructions.map((instr, idx) => ({
        ...instr,
        step: instr.step || idx + 1,
      })),
    };
    setPreviewData(transformedPreviewData);
    setIsPreviewVisible(true);
  };

  const handleThumbnailUpload = (uploadResult: string) => {
    setValue('image_thumbnail_url', uploadResult, { shouldValidate: true });
  };

  const handleBannerUpload = (uploadResult: string) => {
    setValue('image_banner_url', uploadResult, { shouldValidate: true });
  };

  const handleIngredientSearch = (index: number, value: string) => {
    setSearchTerms(prev => ({ ...prev, [index]: value }));
    setOpenDropdown(index);
  };

  const handleIngredientSelect = (index: number, ingredientName: string) => {
    setValue(`ingredients.${index}.name`, ingredientName, { shouldValidate: true });
    setSearchTerms(prev => ({ ...prev, [index]: ingredientName }));
    setOpenDropdown(null);
  };

  const moveInstructionItem = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      moveInstruction(dragIndex, hoverIndex);
    },
    [moveInstruction]
  );

  const watchDifficulty = watch('difficulty');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown !== null) {
        const dropdownElement = document.getElementById(`ingredient-dropdown-${openDropdown}`);
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          const currentSearchTerm = searchTerms[openDropdown];
          const currentFieldValue = watch(`ingredients.${openDropdown}.name`);
          if (currentSearchTerm && currentFieldValue !== currentSearchTerm) {
            setValue(`ingredients.${openDropdown}.name`, currentSearchTerm, {
              shouldValidate: true,
            });
          }
          setOpenDropdown(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown, searchTerms, watch, setValue]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmitHandler)} className="pb-24">
        <div className="space-y-6 px-2 md:px-4 py-6">
          {showErrorSummary && Object.keys(errors).length > 0 && (
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900 dark:text-red-300">
              <p className="font-medium">Please correct the following errors:</p>
              <ul className="mt-1.5 list-disc list-inside">
                {errors.name && <li>Recipe Name: {errors.name.message || 'is required'}</li>}
                {errors.category && <li>Category: {errors.category.message || 'is required'}</li>}
                {errors.subcategory && (
                  <li>Subcategory: {errors.subcategory.message || 'is required'}</li>
                )}
                {errors.total_time && (
                  <li>Total Time: {errors.total_time.message || 'is required'}</li>
                )}
                {errors.servings && <li>Servings: {errors.servings.message || 'is required'}</li>}
                {errors.difficulty && (
                  <li>Difficulty: {errors.difficulty.message || 'is required'}</li>
                )}
                {errors.ingredients &&
                  (Array.isArray(errors.ingredients) && errors.ingredients.some(e => e) ? (
                    <li>Ingredients: Some ingredient fields are invalid or missing.</li>
                  ) : typeof errors.ingredients === 'object' &&
                    (errors.ingredients as any).message ? (
                    <li>Ingredients: {(errors.ingredients as any).message}</li>
                  ) : (
                    <li>Ingredients: Check ingredient fields.</li>
                  ))}
                {errors.instructions &&
                  (Array.isArray(errors.instructions) && errors.instructions.some(e => e) ? (
                    <li>Instructions: Some instruction fields are invalid or missing.</li>
                  ) : typeof errors.instructions === 'object' &&
                    (errors.instructions as any).message ? (
                    <li>Instructions: {(errors.instructions as any).message}</li>
                  ) : (
                    <li>Instructions: Check instruction fields.</li>
                  ))}
              </ul>
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Recipe Name
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Recipe name is required.' })}
              className={`bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter recipe name"
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="category"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Category
              </label>
              <Controller
                control={control}
                name="category"
                rules={{ required: 'Category is required.' }}
                render={({ field }) => (
                  <CustomSelect
                    options={[...CATEGORY_OPTIONS]}
                    value={field.value}
                    onChange={val => field.onChange(val)}
                    error={!!errors.category}
                    placeholder="Select category"
                  />
                )}
              />
              {errors.category && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.category.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="subcategory"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Subcategory
              </label>
              <Controller
                control={control}
                name="subcategory"
                rules={{ required: 'Subcategory is required.' }}
                render={({ field }) => (
                  <CustomSelect
                    options={selectedCategory ? [...SUBCATEGORY_OPTIONS[selectedCategory]] : []}
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.subcategory}
                    placeholder="Select subcategory"
                    disabled={!selectedCategory || !SUBCATEGORY_OPTIONS[selectedCategory]?.length}
                  />
                )}
              />
              {errors.subcategory && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.subcategory.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Description
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={4}
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-base-500 focus:border-base-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Write your recipe description here..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="total_time"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Total Time (min)
              </label>
              <input
                id="total_time"
                type="number"
                {...register('total_time', {
                  required: 'Total time is required.',
                  min: { value: 0, message: 'Time must be positive' },
                })}
                className={`bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ${errors.total_time ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.total_time && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.total_time.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="servings"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Servings
              </label>
              <input
                id="servings"
                type="number"
                {...register('servings', {
                  required: 'Servings are required.',
                  min: { value: 1, message: 'Must serve at least 1' },
                })}
                className={`bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ${errors.servings ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.servings && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.servings.message}
                </p>
              )}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Difficulty Level
              </label>
              <div className="inline-flex rounded-md shadow-sm w-full">
                {([1, 2, 3] as DifficultyLevel[]).map((level, idx, arr) => (
                  <label
                    key={level}
                    className={`
                        relative inline-flex items-center cursor-pointer justify-center px-3 py-2 text-sm font-medium flex-1 text-center
                        ${idx === 0 ? 'rounded-l-lg' : ''} 
                        ${idx === arr.length - 1 ? 'rounded-r-lg' : ''}
                        ${idx !== arr.length - 1 ? 'border-r-0' : ''}
                        border border-gray-300 dark:border-gray-600
                        ${
                          String(watchDifficulty) === String(level)
                            ? 'bg-base-600 text-white hover:bg-base-700 z-10 border-base-600 dark:border-base-500'
                            : 'bg-white text-gray-900 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }
                        focus-within:z-10 
                      `}
                  >
                    <input
                      type="radio"
                      {...register('difficulty', {
                        required: 'Difficulty level is required.',
                      })}
                      value={String(level)}
                      className="sr-only"
                    />
                    <DifficultyDisplay difficulty={level} iconSize={16} showText={false} />
                  </label>
                ))}
              </div>
              {errors.difficulty && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.difficulty.message}
                </p>
              )}
            </div>
          </div>

          <hr className="h-px bg-gray-200 border-0 dark:bg-gray-700 my-8" />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ingredients</h3>
              <button
                type="button"
                onClick={() => appendIngredient({ name: '', amount: '', unit: 'g' })}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-base-600 rounded-lg hover:bg-base-700 dark:bg-base-500 dark:hover:bg-base-600"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Ingredient
              </button>
            </div>
            <div className="space-y-3">
              {ingredientFields.map((field, index) => {
                const searchTerm = searchTerms[index] || watch(`ingredients.${index}.name`) || '';
                const isDropdownOpen = openDropdown === index;
                const filteredIngredients = ALL_INGREDIENTS.filter(ing =>
                  ing.toLowerCase().includes(searchTerm.toLowerCase())
                ).slice(0, 10);

                return (
                  <div
                    key={field.id}
                    className="flex flex-col sm:flex-row gap-2 items-start p-3 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <div className="flex-1 w-full sm:w-auto relative">
                      <label htmlFor={`ingredient-name-${index}`} className="sr-only">
                        Ingredient Name
                      </label>
                      <div className="flex items-center">
                        <input
                          id={`ingredient-name-${index}`}
                          value={searchTerm}
                          onChange={e => handleIngredientSearch(index, e.target.value)}
                          onFocus={() => setOpenDropdown(index)}
                          placeholder="Search ingredient (e.g., Flour)"
                          className={`bg-white border text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white ${errors.ingredients?.[index]?.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'}`}
                        />
                        <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                      {isDropdownOpen && searchTerm && filteredIngredients.length > 0 && (
                        <div
                          id={`ingredient-dropdown-${index}`}
                          className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto dark:bg-gray-700 dark:border-gray-600"
                        >
                          {filteredIngredients.map((ingredientItem, i) => (
                            <button
                              key={`${ingredientItem}-${i}`}
                              type="button"
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm text-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                              onClick={() => handleIngredientSelect(index, ingredientItem)}
                            >
                              {ingredientItem}
                            </button>
                          ))}
                        </div>
                      )}
                      <input
                        type="hidden"
                        {...register(`ingredients.${index}.name` as const, {
                          required: "Ingredient name can't be empty.",
                        })}
                      />
                      {errors.ingredients?.[index]?.name && (
                        <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                          {(errors.ingredients as any)[index].name.message}
                        </p>
                      )}
                    </div>
                    <div className="w-full sm:w-28">
                      <label htmlFor={`ingredient-amount-${index}`} className="sr-only">
                        Amount
                      </label>
                      <input
                        id={`ingredient-amount-${index}`}
                        {...register(`ingredients.${index}.amount` as const, {
                          required: 'Amount required.',
                          pattern: { value: /^[0-9]*\.?[0-9]+$/, message: 'Invalid num' },
                        })}
                        placeholder="Amount"
                        type="text"
                        inputMode="decimal"
                        className={`bg-white border text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white ${errors.ingredients?.[index]?.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'}`}
                      />
                      {errors.ingredients?.[index]?.amount && (
                        <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                          {(errors.ingredients as any)[index].amount.message}
                        </p>
                      )}
                    </div>
                    <div className="w-full sm:w-32">
                      <label htmlFor={`ingredient-unit-${index}`} className="sr-only">
                        Unit
                      </label>
                      <Controller
                        name={`ingredients.${index}.unit` as const}
                        control={control}
                        rules={{ required: 'Unit required.' }}
                        defaultValue="g"
                        render={({ field }) => (
                          <CustomSelect
                            options={Object.entries(MEASUREMENT_UNITS).map(([value, label]) => ({
                              value,
                              label,
                            }))}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Unit"
                            error={!!errors.ingredients?.[index]?.unit}
                          />
                        )}
                      />
                      {errors.ingredients?.[index]?.unit && (
                        <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                          {(errors.ingredients as any)[index].unit.message}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-2.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 self-center sm:self-auto mt-2 sm:mt-0"
                      aria-label="Remove ingredient"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
            {errors.ingredients &&
              typeof errors.ingredients === 'object' &&
              !Array.isArray(errors.ingredients) &&
              (errors.ingredients as any).message && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {(errors.ingredients as any).message}
                </p>
              )}
          </div>

          <hr className="h-px bg-gray-200 border-0 dark:bg-gray-700 my-8" />

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Instructions</h3>
              <button
                type="button"
                onClick={() => appendInstruction({ content: '' })}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-base-600 rounded-lg hover:bg-base-700 dark:bg-base-500 dark:hover:bg-base-600"
              >
                <Plus className="w-4 h-4 mr-1.5" />
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
              <div className="space-y-3">
                {instructionFields.map((item, index) => (
                  <DraggableInstruction
                    key={item.id}
                    field={item as DraggableInstructionItem}
                    index={index}
                    moveInstruction={moveInstructionItem}
                    register={register}
                    removeInstruction={removeInstructionField}
                    errors={errors}
                  />
                ))}
              </div>
            </DndProvider>
            {instructionFields.length === 0 && (
              <div className="text-center py-4 px-3 bg-gray-50 rounded-lg border border-dashed border-gray-300 dark:bg-gray-700 dark:border-gray-600">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No instructions yet. Add some steps!
                </p>
              </div>
            )}
            {errors.instructions &&
              typeof errors.instructions === 'object' &&
              !Array.isArray(errors.instructions) &&
              (errors.instructions as any).message && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {(errors.instructions as any).message}
                </p>
              )}
          </div>

          <hr className="h-px bg-gray-200 border-0 dark:bg-gray-700 my-8" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Thumbnail Image (Optional)
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
                    name="image_thumbnail_url"
                    label="Recommended: 400x300px"
                    register={() => {}}
                    validationSchema={{}}
                  />
                )}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Banner Image (Optional)
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
                    name="image_banner_url"
                    label="Recommended: 1200x400px"
                    register={() => {}}
                    validationSchema={{}}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 sticky bottom-0 bg-white dark:bg-gray-800 py-4 px-6 border-t border-gray-200 dark:border-gray-700 z-20">
          {showErrorSummary && Object.keys(errors).length > 0 && (
            <div className="text-sm text-red-600 dark:text-red-400 mr-auto">
              <p>Please review and fix the highlighted errors.</p>
            </div>
          )}
          <button
            type="button"
            onClick={onCancel || (() => router.back())}
            disabled={isLoading || isSubmitting}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-base-500 disabled:opacity-50 order-last sm:order-first mt-2 sm:mt-0"
          >
            {isEditMode ? 'Cancel' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handlePreview}
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-center text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-base-500 disabled:opacity-50"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </button>
          <button
            type="button"
            onClick={() => handleFormSubmit('draft')}
            disabled={isLoading || isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-center text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-base-500 disabled:opacity-50"
          >
            {isLoading && submitAction === 'draft' ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Saving...
              </>
            ) : isEditMode ? (
              'Update Draft'
            ) : (
              'Save Draft'
            )}
          </button>
          <button
            type="button"
            onClick={() => handleFormSubmit('published')}
            disabled={isLoading || isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-center text-white bg-base-600 rounded-lg hover:bg-base-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-base-500 disabled:opacity-50"
          >
            {isLoading && submitAction === 'published' ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                {isEditMode ? 'Updating Recipe...' : 'Publishing Recipe...'}
              </>
            ) : isEditMode ? (
              'Update Recipe'
            ) : (
              'Publish Recipe'
            )}
          </button>
        </div>
      </form>

      <RecipePreview
        isVisible={isPreviewVisible}
        onClose={() => setIsPreviewVisible(false)}
        recipeData={previewData}
      />
    </>
  );
};
