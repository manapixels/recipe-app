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
  DEFAULT_COMPONENTS,
  RecipeComponent,
  MEASUREMENT_UNITS,
  ALL_INGREDIENTS,
  RecipeStatus,
  NutritionalInfo,
  NutrientValue,
} from '@/types/recipe';
import Spinner from '@/_components/ui/Spinner';
import { CustomSelect } from '@/_components/ui/Select';
import { RecipePreview } from './RecipePreview';

// Difficulty options for UI
const DIFFICULTY_OPTIONS = [
  { value: '1', label: '⭐ Level 1 - Easy' },
  { value: '2', label: '⭐⭐ Level 2 - Medium' },
  { value: '3', label: '⭐⭐⭐ Level 3 - Hard' },
] as const;

// Type for form inputs using components structure
export type RecipeFormInputs = {
  name: string;
  category: RecipeCategory;
  subcategory: RecipeSubcategory;
  description: string;
  components: RecipeComponent[];
  instructions: { step?: number; content: string }[];
  total_time: string;
  servings: string;
  difficulty: string;
  image_thumbnail_url: string;
  image_banner_url: string;
  // Nutritional Information string inputs for the form
  calories_input?: string;
  carbohydrateContent_input?: string;
  cholesterolContent_input?: string;
  fatContent_input?: string;
  fiberContent_input?: string;
  proteinContent_input?: string;
  saturatedFatContent_input?: string;
  sodiumContent_input?: string;
  sugarContent_input?: string;
  transFatContent_input?: string;
  unsaturatedFatContent_input?: string;
  // Input for the recipe's overall serving size (optional)
  recipeServingSize_input?: string;
};

interface RecipeFormProps {
  mode: 'create' | 'edit';
  initialData?: Recipe;
  onSuccess?: (recipe: Recipe) => void;
  onCancel?: () => void;
}

// Helper function to format NutrientValue for form input
const formatNutrientValueForInput = (nutrient?: NutrientValue): string => {
  if (!nutrient || typeof nutrient.value === 'undefined') return '';
  if (nutrient.unit) {
    return `${nutrient.value} ${nutrient.unit}`;
  }
  return String(nutrient.value);
};

// Helper function to parse string input (e.g., "250 kcal" or "250") into NutrientValue
const parseNutrientInput = (
  inputString?: string,
  defaultUnit?: string
): NutrientValue | undefined => {
  if (!inputString || inputString.trim() === '') return undefined;
  const trimmedValue = inputString.trim();

  // Regex to capture value and optional unit
  const match = trimmedValue.match(/^(\d*\.?\d+)\s*([a-zA-Zμg]+)?$/);

  if (match && match[1]) {
    const value = parseFloat(match[1]);
    let unit = match[2] ? match[2].toLowerCase() : defaultUnit;

    if (isNaN(value)) return undefined;
    if (!unit && defaultUnit) unit = defaultUnit;
    if (!unit) return undefined;

    return { value, unit };
  }
  return undefined;
};

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
      components: DEFAULT_COMPONENTS[CATEGORY_OPTIONS[0].value],
      instructions: [{ content: '' }],
      total_time: '30',
      servings: '4',
      difficulty: '1',
      image_thumbnail_url: '',
      image_banner_url: '',
      // Nutritional Information defaults
      calories_input: '',
      carbohydrateContent_input: '',
      cholesterolContent_input: '',
      fatContent_input: '',
      fiberContent_input: '',
      proteinContent_input: '',
      saturatedFatContent_input: '',
      sodiumContent_input: '',
      sugarContent_input: '',
      transFatContent_input: '',
      unsaturatedFatContent_input: '',
      recipeServingSize_input: '',
    }),
    []
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<RecipeFormInputs>({
    defaultValues: initialData
      ? {
          name: initialData.name,
          category: initialData.category,
          subcategory: initialData.subcategory,
          description: initialData.description || '',
          components: initialData.components?.length
            ? initialData.components.map(comp => ({
                ...comp,
                ingredients: comp.ingredients.map(ing => ({
                  ...ing,
                  amount: String(ing.amount),
                  is_flour: ing.is_flour || false,
                })),
              }))
            : DEFAULT_COMPONENTS[initialData.category],
          instructions: initialData.instructions?.length
            ? initialData.instructions.map(instr => ({ content: instr.content }))
            : [{ content: '' }],
          total_time: String(initialData.total_time || '0'),
          servings: String(initialData.servings || '1'),
          difficulty: String(initialData.difficulty || '1'),
          image_thumbnail_url: initialData.image_thumbnail_url || '',
          image_banner_url: initialData.image_banner_url || '',
          // Nutritional Information from initialData
          calories_input: formatNutrientValueForInput(initialData.nutrition_info?.calories),
          carbohydrateContent_input: formatNutrientValueForInput(
            initialData.nutrition_info?.carbohydrateContent
          ),
          cholesterolContent_input: formatNutrientValueForInput(
            initialData.nutrition_info?.cholesterolContent
          ),
          fatContent_input: formatNutrientValueForInput(initialData.nutrition_info?.fatContent),
          fiberContent_input: formatNutrientValueForInput(initialData.nutrition_info?.fiberContent),
          proteinContent_input: formatNutrientValueForInput(
            initialData.nutrition_info?.proteinContent
          ),
          saturatedFatContent_input: formatNutrientValueForInput(
            initialData.nutrition_info?.saturatedFatContent
          ),
          sodiumContent_input: formatNutrientValueForInput(
            initialData.nutrition_info?.sodiumContent
          ),
          sugarContent_input: formatNutrientValueForInput(initialData.nutrition_info?.sugarContent),
          transFatContent_input: formatNutrientValueForInput(
            initialData.nutrition_info?.transFatContent
          ),
          unsaturatedFatContent_input: formatNutrientValueForInput(
            initialData.nutrition_info?.unsaturatedFatContent
          ),
          recipeServingSize_input: initialData.nutrition_info?.servingSize || '',
        }
      : defaultFormValues,
  });

  const {
    fields: componentFields,
    append: appendComponent,
    remove: removeComponent,
  } = useFieldArray({
    control,
    name: 'components',
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

  // Load template components when category changes
  const loadTemplateComponents = useCallback(
    (category: RecipeCategory) => {
      if (DEFAULT_COMPONENTS[category]) {
        setValue('components', DEFAULT_COMPONENTS[category]);
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
          loadTemplateComponents(watchCategory);
        } else {
          loadTemplateComponents(watchCategory);
        }
      } else {
        setValue('subcategory', '' as RecipeSubcategory, { shouldValidate: true });
      }
    }
  }, [watchCategory, setValue, loadTemplateComponents, watch]);

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
    if (currentErrors.length > 0) {
      setShowErrorSummary(true);
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors highlighted in red above.',
        variant: 'destructive',
      });
      console.error('Form validation errors:', errors);
      // Scroll to the error summary
      const errorSummary = document.querySelector('[data-error-summary]');
      if (errorSummary) {
        errorSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    // Validate that we have at least one component with ingredients
    const validComponents = data.components.filter(comp =>
      comp.ingredients.some(ing => ing.name && ing.name.trim() !== '')
    );
    if (validComponents.length === 0) {
      setShowErrorSummary(true);
      toast({
        title: 'Validation Error',
        description: 'Please add at least one component with ingredients.',
        variant: 'destructive',
      });
      return;
    }

    // Validate that we have at least one instruction
    const validInstructions = data.instructions.filter(
      instr => instr.content && instr.content.trim() !== ''
    );
    if (validInstructions.length === 0) {
      setShowErrorSummary(true);
      toast({
        title: 'Validation Error',
        description: 'Please add at least one instruction step.',
        variant: 'destructive',
      });
      return;
    }

    // Clear error summary if no errors
    setShowErrorSummary(false);

    setIsLoading(true);

    // Build nutrition data from form inputs
    const nutritionDataInput: Partial<NutritionalInfo> = {
      calories: parseNutrientInput(data.calories_input, 'kcal'),
      carbohydrateContent: parseNutrientInput(data.carbohydrateContent_input, 'g'),
      cholesterolContent: parseNutrientInput(data.cholesterolContent_input, 'mg'),
      fatContent: parseNutrientInput(data.fatContent_input, 'g'),
      fiberContent: parseNutrientInput(data.fiberContent_input, 'g'),
      proteinContent: parseNutrientInput(data.proteinContent_input, 'g'),
      saturatedFatContent: parseNutrientInput(data.saturatedFatContent_input, 'g'),
      sodiumContent: parseNutrientInput(data.sodiumContent_input, 'mg'),
      sugarContent: parseNutrientInput(data.sugarContent_input, 'g'),
      transFatContent: parseNutrientInput(data.transFatContent_input, 'g'),
      unsaturatedFatContent: parseNutrientInput(data.unsaturatedFatContent_input, 'g'),
      servingSize: data.recipeServingSize_input?.trim() || undefined,
    };

    // Build final nutrition info object
    const finalNutritionData: Partial<NutritionalInfo> = {};
    let hasNutritionData = false;

    for (const key in nutritionDataInput) {
      if (Object.prototype.hasOwnProperty.call(nutritionDataInput, key)) {
        const typedKey = key as keyof NutritionalInfo;
        const value = nutritionDataInput[typedKey];
        if (typedKey === 'servingSize') {
          if (value && typeof value === 'string' && value.trim() !== '') {
            finalNutritionData[typedKey] = value;
            hasNutritionData = true;
          }
        } else if (
          value &&
          typeof value === 'object' &&
          typeof (value as NutrientValue).value === 'number'
        ) {
          finalNutritionData[typedKey] = value as NutrientValue;
          hasNutritionData = true;
        }
      }
    }

    const recipePayload = {
      name: data.name,
      description: data.description || null,
      category: data.category,
      subcategory: data.subcategory,
      components: data.components
        .filter(comp => comp.ingredients.some(ing => ing.name && ing.name.trim() !== ''))
        .map(comp => ({
          ...comp,
          ingredients: comp.ingredients
            .filter(ing => ing.name && ing.name.trim() !== '')
            .map(ing => ({ ...ing, amount: String(ing.amount) })),
        })),
      instructions: data.instructions
        .filter(instr => instr.content && instr.content.trim() !== '')
        .map((instruction, index) => ({ step: index + 1, content: instruction.content! })),
      total_time: Number(data.total_time),
      servings: Number(data.servings),
      image_thumbnail_url: data.image_thumbnail_url || null,
      image_banner_url: data.image_banner_url || null,
      status: submitAction,
      difficulty: Number(data.difficulty),
      created_by: profile.id,
      ...(hasNutritionData && { nutrition_info: finalNutritionData }),
    };

    try {
      let result: Recipe;
      if (isEditMode && initialData?.id) {
        result = (await updateRecipe({ id: initialData.id, ...recipePayload })) as Recipe;
        toast({
          title: 'Success',
          description: 'Recipe updated successfully!',
          variant: 'default',
        });
      } else {
        result = (await addRecipe(recipePayload)) as Recipe;
        toast({
          title: 'Success',
          description: 'Recipe created successfully!',
          variant: 'default',
        });
      }

      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push(`/recipes/${result.slug}`);
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
      components: currentValues.components,
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

  return (
    <>
      <form onSubmit={handleSubmit(onSubmitHandler)} className="pb-24">
        {/* Error Summary */}
        {showErrorSummary && Object.keys(errors).length > 0 && (
          <div
            data-error-summary
            className="mx-2 md:mx-4 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Please fix the following errors:
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <ul className="list-disc list-inside space-y-1">
                    {errors.name && <li>Recipe name: {errors.name.message}</li>}
                    {errors.category && <li>Category: {errors.category.message}</li>}
                    {errors.subcategory && <li>Subcategory: {errors.subcategory.message}</li>}
                    {errors.total_time && <li>Total time: {errors.total_time.message}</li>}
                    {errors.servings && <li>Servings: {errors.servings.message}</li>}
                    {errors.difficulty && <li>Difficulty: {errors.difficulty.message}</li>}
                    {errors.components && (
                      <li>Components: Please check component names and ingredients</li>
                    )}
                    {errors.instructions && (
                      <li>Instructions: Please fill in all instruction steps</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6 px-2 md:px-4 py-6">
          {/* Basic Recipe Information */}
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Recipe Name *
              </label>
              <input
                {...register('name', { required: 'Recipe name is required.' })}
                type="text"
                className={`bg-white border text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                }`}
                placeholder="Enter recipe name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Category *
                </label>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: 'Category is required.' }}
                  render={({ field }) => (
                    <CustomSelect
                      options={[...CATEGORY_OPTIONS]}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select category"
                      error={!!errors.category}
                    />
                  )}
                />
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Subcategory *
                </label>
                <Controller
                  name="subcategory"
                  control={control}
                  rules={{ required: 'Subcategory is required.' }}
                  render={({ field }) => (
                    <CustomSelect
                      options={[...(SUBCATEGORY_OPTIONS[selectedCategory] || [])]}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select subcategory"
                      error={!!errors.subcategory}
                    />
                  )}
                />
                {errors.subcategory && (
                  <p className="mt-1 text-sm text-red-600">{errors.subcategory.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Total Time (minutes) *
                </label>
                <input
                  {...register('total_time', {
                    required: 'Total time is required.',
                    min: { value: 1, message: 'Time must be at least 1 minute' },
                  })}
                  type="number"
                  min="1"
                  className={`bg-white border text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white ${
                    errors.total_time ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                  }`}
                  placeholder="30"
                />
                {errors.total_time && (
                  <p className="mt-1 text-sm text-red-600">{errors.total_time.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Servings *
                </label>
                <input
                  {...register('servings', {
                    required: 'Servings is required.',
                    min: { value: 1, message: 'Servings must be at least 1' },
                  })}
                  type="number"
                  min="1"
                  className={`bg-white border text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white ${
                    errors.servings ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                  }`}
                  placeholder="4"
                />
                {errors.servings && (
                  <p className="mt-1 text-sm text-red-600">{errors.servings.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Difficulty Level *
                </label>
                <Controller
                  name="difficulty"
                  control={control}
                  rules={{ required: 'Difficulty level is required.' }}
                  render={({ field }) => (
                    <CustomSelect
                      options={[...DIFFICULTY_OPTIONS]}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select difficulty"
                      error={!!errors.difficulty}
                    />
                  )}
                />
                {errors.difficulty && (
                  <p className="mt-1 text-sm text-red-600">{errors.difficulty.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                placeholder="Describe your recipe..."
              />
            </div>

            {/* Recipe Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Thumbnail Image
                </label>
                <FileUpload
                  className="w-full h-40"
                  currValue={watch('image_thumbnail_url')}
                  userId={profile?.id}
                  bucketId="recipe_thumbnails"
                  label="Thumbnail"
                  onUploadComplete={handleThumbnailUpload}
                  register={register}
                  validationSchema={{}}
                  name="image_thumbnail_url"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Banner Image
                </label>
                <FileUpload
                  className="w-full h-40"
                  currValue={watch('image_banner_url')}
                  userId={profile?.id}
                  bucketId="recipe_banners"
                  label="Banner"
                  onUploadComplete={handleBannerUpload}
                  register={register}
                  validationSchema={{}}
                  name="image_banner_url"
                />
              </div>
            </div>
          </div>

          <hr className="h-px bg-gray-200 border-0 dark:bg-gray-700 my-8" />

          {/* Recipe Components */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Components</h3>
              <button
                type="button"
                onClick={() =>
                  appendComponent({
                    id: `component_${Date.now()}`,
                    name: 'New Component',
                    description: '',
                    order: componentFields.length + 1,
                    ingredients: [{ name: '', amount: '', unit: 'g', is_flour: false }],
                  })
                }
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-base-600 rounded-lg hover:bg-base-700 dark:bg-base-500 dark:hover:bg-base-600"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Component
              </button>
            </div>

            {/* Baker's Percentage Guidance for Bread Recipes */}
            {selectedCategory === 'breads' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-700">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Baker&apos;s Percentage:</strong> For accurate percentage calculations,
                  mark flour ingredients with &quot;Flour for %&quot; and use consistent weight
                  units (grams recommended) for all ingredients, especially flours and liquids.
                </p>
              </div>
            )}

            <div className="space-y-6">
              {componentFields.map((componentField, componentIndex) => (
                <ComponentEditor
                  key={componentField.id}
                  componentIndex={componentIndex}
                  register={register}
                  control={control}
                  errors={errors}
                  removeComponent={removeComponent}
                  selectedCategory={selectedCategory}
                  canRemove={componentFields.length > 1}
                />
              ))}
            </div>
          </div>

          <hr className="h-px bg-gray-200 border-0 dark:bg-gray-700 my-8" />

          {/* Instructions */}
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
                    field={item as any}
                    index={index}
                    moveInstruction={(dragIndex: number, hoverIndex: number) =>
                      moveInstruction(dragIndex, hoverIndex)
                    }
                    register={register}
                    removeInstruction={removeInstructionField}
                    errors={errors}
                  />
                ))}
              </div>
            </DndProvider>
          </div>
        </div>

        {/* Nutrition Information */}
        <div className="space-y-4">
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Nutrition Information (Optional)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Add nutritional values per serving. If left blank, values will be automatically
              estimated from ingredients.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Calories */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Calories
                </label>
                <input
                  {...register('calories_input')}
                  type="text"
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  placeholder="e.g., 250 kcal"
                />
              </div>

              {/* Carbohydrates */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Carbohydrates
                </label>
                <input
                  {...register('carbohydrateContent_input')}
                  type="text"
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  placeholder="e.g., 30g"
                />
              </div>

              {/* Protein */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Protein
                </label>
                <input
                  {...register('proteinContent_input')}
                  type="text"
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  placeholder="e.g., 8g"
                />
              </div>

              {/* Total Fat */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Total Fat
                </label>
                <input
                  {...register('fatContent_input')}
                  type="text"
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  placeholder="e.g., 12g"
                />
              </div>

              {/* Saturated Fat */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Saturated Fat
                </label>
                <input
                  {...register('saturatedFatContent_input')}
                  type="text"
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  placeholder="e.g., 3g"
                />
              </div>

              {/* Fiber */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Dietary Fiber
                </label>
                <input
                  {...register('fiberContent_input')}
                  type="text"
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  placeholder="e.g., 4g"
                />
              </div>

              {/* Sugar */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Sugar
                </label>
                <input
                  {...register('sugarContent_input')}
                  type="text"
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  placeholder="e.g., 15g"
                />
              </div>

              {/* Sodium */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Sodium
                </label>
                <input
                  {...register('sodiumContent_input')}
                  type="text"
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  placeholder="e.g., 200mg"
                />
              </div>

              {/* Cholesterol */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Cholesterol
                </label>
                <input
                  {...register('cholesterolContent_input')}
                  type="text"
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  placeholder="e.g., 25mg"
                />
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                💡 Pro Tip
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                Include units in your input (e.g., &ldquo;250 kcal&rdquo;, &ldquo;30g&rdquo;,
                &ldquo;200mg&rdquo;). If no unit is specified, defaults will be used (g for most
                nutrients, kcal for calories, mg for sodium/cholesterol).
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-10">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center max-w-4xl mx-auto">
            <button
              type="button"
              onClick={handlePreview}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={() => handleFormSubmit('draft')}
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-700"
              >
                {isLoading && submitAction === 'draft' && <Spinner className="w-4 h-4 mr-2" />}
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleFormSubmit('published')}
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-base-600 rounded-lg hover:bg-base-700 disabled:opacity-50 dark:bg-base-500 dark:hover:bg-base-600"
              >
                {isLoading && submitAction === 'published' && <Spinner className="w-4 h-4 mr-2" />}
                {isEditMode ? 'Update Recipe' : 'Publish Recipe'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      <RecipePreview
        recipeData={previewData}
        onClose={() => setIsPreviewVisible(false)}
        isVisible={isPreviewVisible}
      />
    </>
  );
};

// Component Editor Component
const ComponentEditor: React.FC<{
  componentIndex: number;
  register: any;
  control: any;
  errors: any;
  removeComponent: (index: number) => void;
  selectedCategory: RecipeCategory;
  canRemove: boolean;
}> = ({
  componentIndex,
  register,
  control,
  errors,
  removeComponent,
  selectedCategory,
  canRemove,
}) => {
  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: `components.${componentIndex}.ingredients` as const,
  });

  const [searchTerms, setSearchTerms] = useState<Record<number, string>>({});
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const handleIngredientSearch = (index: number, value: string) => {
    setSearchTerms(prev => ({ ...prev, [index]: value }));
    setOpenDropdown(index);
  };

  const handleIngredientSelect = (index: number, ingredientName: string) => {
    register(`components.${componentIndex}.ingredients.${index}.name`).onChange({
      target: {
        value: ingredientName,
        name: `components.${componentIndex}.ingredients.${index}.name`,
      },
    });
    setSearchTerms(prev => ({ ...prev, [index]: ingredientName }));
    setOpenDropdown(null);
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
      {/* Component Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <input
            {...register(`components.${componentIndex}.name`, {
              required: 'Component name is required',
            })}
            type="text"
            placeholder="Component name (e.g., Poolish, Final Dough)"
            className={`bg-white border text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white ${
              errors?.components?.[componentIndex]?.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors?.components?.[componentIndex]?.name && (
            <p className="mt-1 text-sm text-red-600">
              {errors.components[componentIndex].name.message}
            </p>
          )}
        </div>
        <div className="flex-1">
          <input
            {...register(`components.${componentIndex}.description`)}
            type="text"
            placeholder="Description (optional)"
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
          />
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={() => removeComponent(componentIndex)}
            className="p-2 text-gray-500 hover:text-red-500 shrink-0"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Ingredients */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Ingredients</h4>
          <button
            type="button"
            onClick={() => appendIngredient({ name: '', amount: '', unit: 'g', is_flour: false })}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-base-600 rounded hover:bg-base-700"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </button>
        </div>

        {ingredientFields.map((field, ingredientIndex) => {
          const searchTerm = searchTerms[ingredientIndex] || '';
          const isDropdownOpen = openDropdown === ingredientIndex;
          const filteredIngredients = ALL_INGREDIENTS.filter(ing =>
            ing.toLowerCase().includes(searchTerm.toLowerCase())
          ).slice(0, 10);

          return (
            <div
              key={field.id}
              className="flex flex-col sm:flex-row gap-2 items-start p-3 bg-white rounded-lg border border-gray-200 dark:bg-gray-600 dark:border-gray-500"
            >
              <div className="flex-1 w-full sm:w-auto relative">
                <div className="flex items-center">
                  <input
                    value={searchTerm}
                    onChange={e => handleIngredientSearch(ingredientIndex, e.target.value)}
                    onFocus={() => setOpenDropdown(ingredientIndex)}
                    placeholder="Search ingredient"
                    className={`bg-white border text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white ${
                      errors?.components?.[componentIndex]?.ingredients?.[ingredientIndex]?.name
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {errors?.components?.[componentIndex]?.ingredients?.[ingredientIndex]?.name && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.components[componentIndex].ingredients[ingredientIndex].name.message}
                  </p>
                )}
                {isDropdownOpen && searchTerm && filteredIngredients.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto dark:bg-gray-700 dark:border-gray-600">
                    {filteredIngredients.map((ingredientItem, i) => (
                      <button
                        key={`${ingredientItem}-${i}`}
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm text-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        onClick={() => handleIngredientSelect(ingredientIndex, ingredientItem)}
                      >
                        {ingredientItem}
                      </button>
                    ))}
                  </div>
                )}
                <input
                  type="hidden"
                  {...register(`components.${componentIndex}.ingredients.${ingredientIndex}.name`, {
                    required: 'Ingredient name required',
                  })}
                />
              </div>

              <div className="w-full sm:w-28">
                <input
                  {...register(
                    `components.${componentIndex}.ingredients.${ingredientIndex}.amount`,
                    {
                      required: 'Amount required',
                      pattern: { value: /^[0-9]*\.?[0-9]+$/, message: 'Invalid number' },
                    }
                  )}
                  placeholder="Amount"
                  type="text"
                  inputMode="decimal"
                  className={`bg-white border text-gray-900 text-sm rounded-lg focus:ring-base-600 focus:border-base-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white ${
                    errors?.components?.[componentIndex]?.ingredients?.[ingredientIndex]?.amount
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {errors?.components?.[componentIndex]?.ingredients?.[ingredientIndex]?.amount && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.components[componentIndex].ingredients[ingredientIndex].amount.message}
                  </p>
                )}
              </div>

              <div className="w-full sm:w-32">
                <Controller
                  name={`components.${componentIndex}.ingredients.${ingredientIndex}.unit`}
                  control={control}
                  rules={{ required: 'Unit required' }}
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
                    />
                  )}
                />
              </div>

              {/* Baker's Percentage Checkbox (only for bread recipes) */}
              {selectedCategory === 'breads' && (
                <div className="flex items-center">
                  <label className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
                    <input
                      type="checkbox"
                      {...register(
                        `components.${componentIndex}.ingredients.${ingredientIndex}.is_flour`
                      )}
                      className="w-4 h-4 text-base-600 bg-gray-100 border-gray-300 rounded focus:ring-base-500 dark:focus:ring-base-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span>Flour for %</span>
                  </label>
                </div>
              )}

              <button
                type="button"
                onClick={() => removeIngredient(ingredientIndex)}
                className="p-2 text-gray-500 hover:text-red-500 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// DraggableInstruction Component
const DraggableInstruction = ({
  index,
  moveInstruction,
  register,
  removeInstruction,
  errors,
}: {
  field: any;
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
      } dark:bg-gray-700 dark:border-gray-600`}
    >
      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-lg shrink-0">
        <span className="text-gray-600 dark:text-gray-300 font-medium">{index + 1}</span>
      </div>
      <div className="flex-1">
        <textarea
          {...register(`instructions.${index}.content`, {
            required: 'Instruction content is required.',
          })}
          rows={2}
          className={`block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border focus:ring-base-500 focus:border-base-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white ${
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
        className="p-2 text-gray-500 hover:text-red-500 shrink-0 dark:text-gray-400"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};
