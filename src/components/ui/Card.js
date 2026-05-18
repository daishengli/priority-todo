import { clsx } from 'clsx';

/**
 * @param {Object} props
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function Card({ className, children }) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl shadow-sm border border-gray-100',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * @param {Object} props
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function CardHeader({ className, children }) {
  return (
    <div className={clsx('px-4 py-3 border-b border-gray-100', className)}>
      {children}
    </div>
  );
}

/**
 * @param {Object} props
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function CardBody({ className, children }) {
  return <div className={clsx('p-4', className)}>{children}</div>;
}
