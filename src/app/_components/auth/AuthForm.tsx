'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { Modal } from '@/_components/ui/Modal';
import Spinner from '@/_components/ui/Spinner';
import { useToast } from '@/_components/ui/Toasts/useToast';
import { useUser } from '@/_contexts/UserContext';
import { useAuthModal } from '@/_contexts/AuthContext';
import { signInWithEmail, signUpNewUser } from '@/api/auth';

interface AuthFormInput {
  email: string;
  password: string;
  birthyear: number;
  birthmonth: number;
  name: string;
}

export default function AuthForm() {
  const [state, setState] = useState('login'); // ['login', 'register']
  const [showPassword, setShowPassword] = useState(false);
  const { showModal, setShowModal } = useAuthModal();
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();
  const { setUser } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormInput>({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const onSubmit: SubmitHandler<AuthFormInput> = async data => {
    if (state === 'login') {
      const resp = await signInWithEmail(data.email, data.password);
      if ('user' in resp) {
        setUser(resp.user);
        toast({
          title: "You're logged in",
          description: 'Welcome back!',
          className: 'bg-green-700 text-white border-transparent',
        });
      }
      router.refresh();
    } else {
      await signUpNewUser(data.email, data.password);
      router.refresh();
    }
  };

  const toggleModal = () => setShowModal(!showModal);

  const btn = (
    <button
      type="button"
      onClick={toggleModal}
      className="text-white bg-black hover:bg-gray-900 focus:ring-4 focus:ring-base-200 font-medium rounded-full text-md px-7 py-2.5 dark:bg-base-600 dark:hover:bg-base-700 focus:outline-none dark:focus:ring-base-800"
    >
      Log in <span aria-hidden="true">&rarr;</span>
    </button>
  );

  return (
    <div>
      {btn}

      <Modal isOpen={showModal} handleClose={toggleModal} backdropDismiss={true}>
        {/* Modal header */}
        <div className="flex items-center justify-between max-w-lg mx-auto px-5 md:px-10 py-5 border-b rounded-t dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Welcome to <i>recipe-app</i>
          </h3>
        </div>

        <form className="max-w-lg mx-auto p-5 md:p-10" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-5 w-full">
            <input
              type="email"
              id="email"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-4 md:py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required
              placeholder="Email"
              {...register('email', {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              })}
              aria-invalid={errors.email ? 'true' : 'false'}
            />
            {errors.email?.type === 'required' && <p role="alert">Please enter your email</p>}
            {errors.email?.type === 'pattern' && <p role="alert">Please enter a valid email</p>}
          </div>
          <div className="mb-4 md:mb-5 w-full">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-4 md:py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
                placeholder="Password"
                {...register('password', { required: true })}
                aria-invalid={errors.password ? 'true' : 'false'}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                <svg
                  onClick={() => setShowPassword(!showPassword)}
                  className={`h-6 text-gray-700 ${showPassword ? 'hidden' : 'block'}`}
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 24 24"
                  height="30px"
                  width="30px"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="none"
                    strokeWidth="2"
                    d="M12,17 C9.27272727,17 6,14.2222222 6,12 C6,9.77777778 9.27272727,7 12,7 C14.7272727,7 18,9.77777778 18,12 C18,14.2222222 14.7272727,17 12,17 Z M11,12 C11,12.55225 11.44775,13 12,13 C12.55225,13 13,12.55225 13,12 C13,11.44775 12.55225,11 12,11 C11.44775,11 11,11.44775 11,12 Z"
                  ></path>
                </svg>
                <svg
                  onClick={() => setShowPassword(!showPassword)}
                  className={`h-6 text-gray-700 ${showPassword ? 'block' : 'hidden'}`}
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 24 24"
                  height="200px"
                  width="200px"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="none"
                    strokeWidth="2"
                    d="M3,12 L6,12 C6.5,14.5 9.27272727,17 12,17 C14.7272727,17 17.5,14.5 18,12 L21,12 M12,17 L12,20 M7.5,15.5 L5.5,17.5 M16.5,15.5 L18.5,17.5"
                  ></path>
                </svg>
                {errors.password?.type === 'required' && (
                  <p role="alert">Please enter your password</p>
                )}
              </div>
            </div>
          </div>
          {state === 'login' && (
            <div className="flex flex-col md:flex-row justify-between mb-5">
              <div className="flex items-center order-2 md:order-1">
                <div className="flex items-center h-5">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-base-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-base-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 accent-base-500"
                  />
                </div>
                <label
                  htmlFor="remember"
                  className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Keep me logged in
                </label>
              </div>
              <a
                className="text-sm text-gray-400 font-medium text-foreground mb-4 md:mb-0 md:ml-4 order-1 md:order-2"
                href="/forgot-password"
              >
                Forgot password?
              </a>
            </div>
          )}
          <button
            type="submit"
            className={`text-black text-sm bg-base-100 hover:bg-base-200 focus:ring-4 focus:outline-none focus:ring-base-300 font-bold block w-full px-5 py-4 md:py-2.5 text-center dark:bg-base-600 dark:hover:bg-base-700 dark:focus:ring-base-800 ${isSubmitting ? 'disabled:opacity-50' : ''} rounded-full`}
            disabled={isSubmitting}
          >
            {isSubmitting && <Spinner className="mr-1.5" />}
            {state === 'login' ? 'Log in' : 'Sign up'}
          </button>

          {state === 'login' && (
            <div className="text-sm text-gray-500 text-center mt-4">
              No account yet?{' '}
              <button
                onClick={() => setState('register')}
                className="text-gray-900"
                disabled={isSubmitting}
              >
                Sign up
              </button>
            </div>
          )}
          {state === 'register' && (
            <div className="text-xs text-gray-500 text-center mt-4">
              Already have an account?{' '}
              <button onClick={() => setState('login')} className="text-gray-900">
                Log in
              </button>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
