/**
 * Icon wrapper component for consistent icon rendering
 */

import { Icons, ICON_SIZES, type IconSize } from '@/lib/icons';
import { LucideIcon } from 'lucide-react';

interface IconProps {
  name: keyof typeof Icons;
  size?: IconSize | number;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 'md', className = '', strokeWidth = 2 }: IconProps) {
  const IconComponent = Icons[name] as LucideIcon;
  const sizeInPx = typeof size === 'number' ? size : ICON_SIZES[size];

  return (
    <IconComponent
      size={sizeInPx}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
    />
  );
}

interface IconButtonProps {
  icon: keyof typeof Icons;
  label?: string;
  size?: IconSize;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function IconButton({
  icon,
  label,
  size = 'md',
  onClick,
  className = '',
  disabled = false,
  type = 'button',
}: IconButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label={label || `${icon} button`}
    >
      <Icon name={icon} size={size} />
      {label && <span>{label}</span>}
    </button>
  );
}

interface IconBadgeProps {
  icon: keyof typeof Icons;
  label: string;
  size?: IconSize;
  className?: string;
  iconClassName?: string;
}

export function IconBadge({
  icon,
  label,
  size = 'sm',
  className = '',
  iconClassName = '',
}: IconBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <Icon name={icon} size={size} className={iconClassName} />
      <span>{label}</span>
    </span>
  );
}

interface IconCardHeaderProps {
  icon: keyof typeof Icons;
  title: string;
  description?: string;
  iconClassName?: string;
  className?: string;
}

export function IconCardHeader({
  icon,
  title,
  description,
  iconClassName = 'text-indigo-600',
  className = '',
}: IconCardHeaderProps) {
  return (
    <div className={`flex items-start gap-4 ${className}`}>
      <div
        className={`flex-shrink-0 rounded-xl bg-gradient-to-br p-3 shadow-lg ${iconClassName}`}
      >
        <Icon name={icon} size="lg" className="text-white" strokeWidth={2.5} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
    </div>
  );
}
