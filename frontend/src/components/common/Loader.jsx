export default function Loader({ size = 'md', center = false, className = '' }) {
  const sizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-[3px]',
  };

  const spinner = (
    <span
      className={`inline-block rounded-full border-primary-200 border-t-primary-600 animate-spin ${sizes[size] ?? sizes.md} ${className}`}
    />
  );

  if (center) {
    return (
      <div className="flex items-center justify-center py-12">
        {spinner}
      </div>
    );
  }

  return spinner;
}
