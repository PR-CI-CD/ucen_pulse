/**
 * Generic Action Button
 * Backward compatible: supports `onOpen` OR `onClick`.
 * Usage:
 *  - <AddActivityButton label="+ Add Activity" open={isAddOpen} onClick={() => setIsAddOpen(true)} />
 *  - <AddActivityButton label="+ Add Metrics"  open={isMetricsOpen} onClick={() => setIsMetricsOpen(true)} />
 */
export default function AddActivityButton({
  open = false,
  onOpen,         // legacy prop
  onClick,        // preferred prop
  label = '+ Add Activity',
}) {
  const handleClick = onClick || onOpen || (() => {});
  return (
<button
  type="button"
  onClick={handleClick}
  aria-haspopup="dialog"
  aria-expanded={open}
  className="rounded-md bg-button px-4 py-2 text-base md:text-base font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
>
  {label}
</button>
  );
}