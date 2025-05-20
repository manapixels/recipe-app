import { createPortal } from 'react-dom';
import { Dispatch, HTMLAttributes, SetStateAction, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import FocusLock from 'react-focus-lock';

const effect = {
  hidden: {
    opacity: 0,
    scale: 0.7,
  },
  visible: {
    opacity: 1,
    transition: {
      ease: 'easeInOut',
      duration: 0.15,
    },
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
  },
};

const Backdrop = ({ children, handleClose }: BackdropProps) => (
  <motion.div
    className="
    z-50 fixed inset-0
    bg-black bg-opacity-70 backdrop-filter backdrop-blur-sm
    overflow-y-auto p-4
    "
    onClick={handleClose}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {children}
  </motion.div>
);

const ModalContent = ({ className, children, handleClose, ariaLabel }: ModalContentProps) => (
  <motion.div
    tabIndex={-1}
    role="dialog"
    aria-modal={true}
    aria-label={ariaLabel}
    className={`relative m-auto overflow-y-auto max-w-2xl ${className || 'max-h-full px-5 pt-5 pb-2 bg-white rounded-lg shadow-lg'}`}
    variants={effect}
    initial="hidden"
    animate="visible"
    exit="exit"
    onClick={event => event.stopPropagation()}
  >
    {children}
    {handleClose && (
      <button
        type="button"
        onClick={handleClose}
        className="absolute text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white top-6 right-6"
        aria-label={`Close ${ariaLabel || 'dialog'}`}
      >
        <svg
          className="w-3 h-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
          />
        </svg>
        <span className="sr-only">Close modal</span>
      </button>
    )}
  </motion.div>
);

export const Modal = ({
  children,
  className,
  isOpen,
  handleClose,
  hideCloseButton,
  backdropDismiss = true,
  onExitComplete,
  ariaLabel,
}: ModalProps) => {
  const [isBrowser, setIsBrowser] = useState(false);
  const [trigger, setTrigger] = onExitComplete ?? [undefined, undefined];

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen || event.key !== 'Escape') return;
      handleClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  if (!isBrowser) return <></>;

  return createPortal(
    <AnimatePresence
      initial={false}
      mode="wait"
      onExitComplete={() => setTrigger && trigger === 'fired' && setTrigger('completed')}
    >
      {isOpen && (
        <Backdrop handleClose={backdropDismiss ? handleClose : undefined}>
          <FocusLock>
            <ModalContent
              className={className}
              handleClose={hideCloseButton ? undefined : handleClose}
              ariaLabel={ariaLabel}
            >
              {children}
            </ModalContent>
          </FocusLock>
        </Backdrop>
      )}
    </AnimatePresence>,
    document.getElementById('modal-portal')!
  );
};

type ModalProps = HTMLAttributes<HTMLDivElement> & {
  isOpen: boolean;
  handleClose: () => void;
  hideCloseButton?: boolean;
  backdropDismiss?: boolean;
  onExitComplete?: [string, Dispatch<SetStateAction<string>>];
  ariaLabel?: string;
};

type ModalContentProps = HTMLAttributes<HTMLDivElement> & {
  handleClose?: () => void;
  ariaLabel?: string;
};

type BackdropProps = HTMLAttributes<HTMLDivElement> & {
  handleClose?: () => void;
};
