import { useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { AnimatePresence, motion } from 'framer-motion';

import { useToast } from '@/_components/ui/Toasts/useToast';
import { Recipe } from '@/types/recipe';
import { postRecipeToSocial } from '@/api/recipe';
import { useUser } from '@/_contexts/UserContext';
import Spinner from '@/_components/ui/Spinner';
import { Profile } from '@/types/profile';

export default function PostToSocial({ recipe }: { recipe: Recipe }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useUser();

  const ref = useRef(null);
  useOnClickOutside(ref, () => setIsOpen(false));

  const handleConfirm = async () => {
    if (recipe?.id && profile?.id) {
      try {
        setIsLoading(true);
        // Create a Profile object with required fields
        const profileData: Profile = {
          id: profile.id,
          name: profile.name || '',
          username: profile.username || '',
          avatar_url: profile.avatar_url || null,
          birthmonth: profile.birthmonth || null,
          birthyear: profile.birthyear || null,
          stripe_customer_id: null,
          billing_address: null,
          payment_method: null,
        };
        await postRecipeToSocial(recipe.id, profileData);
        toast({
          title: 'Success!',
          description: 'Recipe shared on social media',
          className: 'bg-green-700 text-white border-transparent',
        });
      } catch (error) {
        toast({
          title: 'Error!',
          description: 'Failed to share recipe',
          className: 'bg-red-700 text-white border-transparent',
        });
      } finally {
        setIsLoading(false);
        setIsOpen(false);
      }
    }
  };

  return (
    <AnimatePresence initial={false} mode="wait">
      <div>
        <button className="" onClick={() => setIsOpen(true)}>
          <svg
            width="32px"
            height="32px"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            color="#000000"
            className="fill-white"
          >
            <path
              d="M20 12l-6.4-7v3.5c-3.5.9-6.7 3.5-8.6 7 1.9-2.5 4.4-3.8 8.6-3.8v3.3l6.4-7z"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </button>
        <motion.div
          ref={ref}
          className={`origin-top-left absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
          initial={{ opacity: 0 }}
          animate={isOpen ? 'open' : 'closed'}
          variants={{
            open: { opacity: 1 },
            closed: { opacity: 0 },
          }}
          tabIndex={-1}
        >
          <button className="px-4 py-2" onClick={handleConfirm}>
            {isLoading && <Spinner className="mr-1.5" />}
            {isLoading ? 'Sharing...' : 'Share Recipe'}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
