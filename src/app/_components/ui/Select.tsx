import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { forwardRef } from 'react';

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  name?: string;
  error?: boolean;
  disabled?: boolean;
};

export const CustomSelect = forwardRef<HTMLButtonElement, SelectProps>(
  ({ options, value, onChange, placeholder = 'Select...', name, error, disabled }, ref) => {
    return (
      <Select.Root value={value} onValueChange={onChange} name={name}>
        <Select.Trigger
          ref={ref}
          className={`inline-flex items-center justify-between rounded-lg p-2.5 text-sm gap-3 w-auto bg-gray-50 border focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            error
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 text-gray-900 focus:border-base-500 focus:ring-base-500'
          }`}
          disabled={disabled}
        >
          <Select.Value placeholder={placeholder} />
          <Select.Icon>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            className="overflow-hidden bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg z-50"
            position="popper"
            sideOffset={4}
          >
            <Select.Viewport className="p-1">
              {options.map(option => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex items-center px-6 py-2 text-sm rounded-md cursor-pointer select-none hover:bg-base-100 dark:hover:bg-gray-600 focus:bg-base-100 dark:focus:bg-gray-600 focus:outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-gray-900 dark:text-gray-200"
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator className="absolute left-1 inline-flex items-center">
                    <Check className="h-4 w-4" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    );
  }
);

CustomSelect.displayName = 'CustomSelect';
