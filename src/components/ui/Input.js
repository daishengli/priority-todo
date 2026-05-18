import { clsx } from 'clsx';

/**
 * @param {Object} props
 * @param {string} [props.className]
 * @param {string} [props.label]
 * @param {string} [props.placeholder]
 * @param {string} [props.value]
 * @param {Function} [props.onChange]
 * @param {boolean} [props.required]
 * @param {boolean} [props.disabled]
 * @param {string} [props.type]
 * @param {number} [props.maxLength]
 * @param {string} [props.min]
 * @param {string} [props.max]
 */
export function Input({
  className,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  type = 'text',
  maxLength,
  min,
  max,
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        min={min}
        max={max}
        className={clsx(
          'w-full px-3 py-2 border border-gray-300 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          'placeholder:text-gray-400',
          className
        )}
        {...props}
      />
      {maxLength && value !== undefined && (
        <div className="text-right text-xs text-gray-400 mt-1">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
}

/**
 * @param {Object} props
 * @param {string} [props.className]
 * @param {string} [props.label]
 * @param {string} [props.placeholder]
 * @param {string} [props.value]
 * @param {Function} [props.onChange]
 * @param {number} [props.rows]
 * @param {boolean} [props.required]
 */
export function Textarea({
  className,
  label,
  placeholder,
  value,
  onChange,
  rows = 3,
  required = false,
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={clsx(
          'w-full px-3 py-2 border border-gray-300 rounded-lg resize-none',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'placeholder:text-gray-400',
          className
        )}
        {...props}
      />
    </div>
  );
}
