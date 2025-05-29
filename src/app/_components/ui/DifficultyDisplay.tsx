import { Circle } from 'lucide-react';

interface DifficultyDisplayProps {
  difficulty: number; // Expecting 1, 2, or 3
  maxDifficulty?: number;
  iconSize?: number;
  className?: string;
  showText?: boolean;
}

const DifficultyDisplay: React.FC<DifficultyDisplayProps> = ({
  difficulty,
  maxDifficulty = 3,
  iconSize = 20,
  className = 'flex items-center gap-1',
  showText = true,
}) => {
  // Ensure difficulty is within bounds
  const normalizedDifficulty = Math.max(1, Math.min(difficulty, maxDifficulty));

  const difficultyTextMap: { [key: number]: string } = {
    1: 'Easy',
    2: 'Medium',
    3: 'Hard',
  };

  const textLabel = difficultyTextMap[normalizedDifficulty] || '';

  return (
    <div className={className}>
      <div className="flex items-center gap-1">
        {' '}
        {Array.from({ length: maxDifficulty }).map((_, index) => (
          <Circle
            key={index}
            size={iconSize}
            className={
              index < normalizedDifficulty
                ? 'text-gray-600 fill-gray-600'
                : 'text-gray-300 dark:text-gray-600'
            }
          />
        ))}
      </div>
      {showText && textLabel && <span className="text-sm ml-1">{textLabel}</span>}
    </div>
  );
};

export default DifficultyDisplay;
