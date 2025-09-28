/**
* AddActivityButton.jsx
* Simple accessible button component.
* to open a modal dialog to add a new activity.
*/

export default function AddActivityButton({ open = false, onOpen }) {
return (
<button
type="button"
onClick={onOpen}
aria-haspopup="dialog"
aria-expanded={open}
className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
>
+ Add Activity
</button>
);
}