// Form primitives shared by the KYC steps. Styling is the same markup the
// individual pages used before they were wired to the API.
import { CheckCircle2, Circle, Check } from "lucide-react";

export function Field({ label, children, required, full, error, htmlFor }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-slate-900 mb-2"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Plain text-like input bound to form[name]
export function TextField({ label, name, form, setField, errors = {}, required, full, ...rest }) {
  return (
    <Field label={label} required={required} full={full} error={errors[name]} htmlFor={name}>
      <input
        id={name}
        className="input"
        value={form[name] ?? ""}
        onChange={(e) => setField(name, e.target.value)}
        aria-invalid={Boolean(errors[name])}
        {...rest}
      />
    </Field>
  );
}

// <select>; options are strings or { label, value }
export function SelectField({ label, name, form, setField, options, errors = {}, required, full, placeholder = "Select Option" }) {
  return (
    <Field label={label} required={required} full={full} error={errors[name]} htmlFor={name}>
      <select
        id={name}
        className="input"
        value={form[name] ?? ""}
        onChange={(e) => setField(name, e.target.value)}
        aria-invalid={Boolean(errors[name])}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => {
          const { label: text, value } =
            typeof option === "string" ? { label: option, value: option } : option;
          return (
            <option key={text} value={value}>
              {text}
            </option>
          );
        })}
      </select>
    </Field>
  );
}

export function PillOption({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs transition-colors ${
        selected
          ? "border-sky-600 bg-sky-50 text-sky-700"
          : "border-slate-200 text-slate-600 hover:border-slate-300"
      }`}
    >
      {selected ? (
        <CheckCircle2 className="w-3.5 h-3.5 " strokeWidth={2} />
      ) : (
        <Circle className="w-3.5 h-3.5 text-slate-300" strokeWidth={2} />
      )}
      {label}
    </button>
  );
}

export function OptionCard({ label, selected, onClick, full }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
        full ? "sm:col-span-2" : ""
      } ${
        selected
          ? "border-sky-600 bg-sky-50 text-sky-700"
          : "border-slate-200 text-slate-700 hover:border-slate-300"
      }`}
    >
      {label}
    </button>
  );
}

export function ConfirmCheckbox({ checked, onClick, label }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onClick}
      className="group flex items-center gap-3 text-left w-full"
    >
      <span
        className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
          checked
            ? "border-sky-600 bg-sky-600"
            : "border-slate-300 bg-white group-hover:border-slate-400"
        }`}
      >
        <Check
          className={`!w-3.5 !h-3.5 text-white transition-opacity ${
            checked ? "opacity-100" : "opacity-0"
          }`}
          strokeWidth={3}
        />
      </span>

      <span className="text-sm text-slate-900">{label}</span>
    </button>
  );
}
