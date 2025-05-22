'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/_contexts/UserContext';
import { CustomSelect } from '@/_components/ui/Select';

export default function Footer() {
  const { profile, updateUserPreferredUnitSystem, loading: userLoading } = useUser();

  const unitOptions = [
    { label: 'Metric', value: 'metric' },
    { label: 'Imperial', value: 'imperial' },
  ];
  const [displayUnitSystem, setDisplayUnitSystem] = useState<'metric' | 'imperial'>('metric');

  useEffect(() => {
    if (!userLoading && profile && profile.preferred_unit_system) {
      if (
        profile.preferred_unit_system === 'metric' ||
        profile.preferred_unit_system === 'imperial'
      ) {
        setDisplayUnitSystem(profile.preferred_unit_system);
      } else {
        setDisplayUnitSystem('metric');
      }
    } else if (!userLoading && !profile) {
      setDisplayUnitSystem('metric');
    }
  }, [profile, userLoading]);

  const handleUnitSystemChange = async (value: string) => {
    const newSystem = value as 'metric' | 'imperial';
    setDisplayUnitSystem(newSystem);

    if (profile && updateUserPreferredUnitSystem) {
      try {
        await updateUserPreferredUnitSystem(newSystem);
      } catch (error) {
        console.error('Failed to update unit system:', error);
      }
    }
  };

  return (
    <footer className="max-w-7xl w-full mx-auto bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} recipe-app
        </div>
        <CustomSelect
          options={unitOptions}
          value={displayUnitSystem}
          onChange={handleUnitSystemChange}
        />
      </div>
    </footer>
  );
}
