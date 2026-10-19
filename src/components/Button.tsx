import type { ButtonHTMLAttributes } from 'react';
import { playSfx } from '../audio/sound';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'md' | 'lg' | 'xl';
  block?: boolean;
  /** Play the tap sound (default true). */
  sound?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  sound = true,
  className = '',
  onClick,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${block ? 'btn--block' : ''} ${className}`}
      onClick={(e) => {
        if (sound) playSfx('tap');
        onClick?.(e);
      }}
      {...rest}
    />
  );
}
