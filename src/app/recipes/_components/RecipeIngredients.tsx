'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BUCKET_URL } from '@/constants';
import { Recipe } from '@/types/recipe';
import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';

interface RecipeIngredientsProps {
  recipe: Recipe;
}

export default function RecipeIngredients({ recipe }: RecipeIngredientsProps) {
  const [currentServings, setCurrentServings] = useState(recipe.servings);
  const servingsRatio = currentServings / recipe.servings;

  return (
    <div className="mb-8 -mx-4 py-8 bg-base-50">
      <div className="mb-4 px-4">
        <h3 className="text-xl font-bold mb-1">Ingredients</h3>
        <div className="flex items-center gap-2">
          <label htmlFor="servings" className="text-sm text-gray-600">
            Servings:
          </label>
          <input
            type="number"
            id="servings"
            min="1"
            value={currentServings}
            onChange={e => setCurrentServings(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 px-2 py-1 border rounded-md"
          />{' '}
          <span className="text-sm ">{recipe.name}</span>
        </div>
      </div>

      <ul className="border-t border-base-600">
        {recipe.ingredients.map((ingredient, index) => (
          <li key={index} className="flex items-center">
            <div className="px-4 py-2">
              <Checkbox.Root
                id={`ingredient-${index}`}
                className="w-5 h-5 bg-white border rounded data-[state=checked]:bg-base-600 data-[state=checked]:border-base-600"
              >
                <Checkbox.Indicator className="flex items-center justify-center text-white">
                  <CheckIcon className="w-5 h-5" />
                </Checkbox.Indicator>
              </Checkbox.Root>
            </div>
            <div className="flex flex-grow items-center gap-3 bg-white px-4 py-2">
              <label htmlFor={`ingredient-${index}`} className="flex-grow bg-white">
                {ingredient.name}
                <span className="mx-1">…</span>
                <span>
                  {ingredient.amount &&
                    `${(Number(ingredient.amount) * servingsRatio).toFixed(0)}${ingredient.unit || ''} `}
                </span>
              </label>
              <div className="w-12 h-12 flex-shrink-0">
                {ingredient.image_url ? (
                  <Image
                    src={`${BUCKET_URL}/ingredients/${ingredient.image_url}`}
                    alt={ingredient.name}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
