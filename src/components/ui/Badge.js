import { clsx } from 'clsx';

/**
 * @param {Object} props
 * @param {string} [props.color]
 * @param {boolean} [props.outline]
 * @param {'sm'|'md'} [props.size]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function Badge({
  color = '#6b7280',
  outline = false,
  size = 'sm',
  className,
  children,
}) {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        sizeStyles[size],
        className
      )}
      style={outline ? { color, border: `1px solid ${color}` } : { backgroundColor: `${color}15`, color }}
    >
      {children}
    </span>
  );
}
