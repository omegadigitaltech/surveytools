import React from 'react'

function RadioOption({ name, value, label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 accent-sky-600 cursor-pointer"
      />
      {label}
    </label>
  );
}

export default RadioOption