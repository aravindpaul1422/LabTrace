import React from 'react';
import { Phone, CheckCircle2, AlertCircle } from 'lucide-react';

interface Phone10BlockInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  helperText?: string;
  className?: string;
}

export const Phone10BlockInput: React.FC<Phone10BlockInputProps> = ({
  id = 'primary-phone-input',
  value,
  onChange,
  label = 'Primary Phone',
  required = true,
  disabled = false,
  error,
  placeholder = '98765 43210',
  helperText,
  className = '',
}) => {
  // Strip non-digits and cap strictly at 10 digits
  const cleanDigits = (value || '').replace(/\D/g, '').slice(0, 10);
  const isValid = cleanDigits.length === 10;
  const isTouched = cleanDigits.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    onChange(raw);
  };

  // Format visually: 5 digits - space - 5 digits (e.g. 98765 43210)
  const displayValue = cleanDigits.length > 5
    ? `${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)}`
    : cleanDigits;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <label htmlFor={id} className="flex items-center gap-1">
            <span>{label}</span>
            {required && <span className="text-rose-400 font-bold">*</span>}
          </label>
          <span className={`text-[11px] font-mono font-medium ${isValid ? 'text-emerald-400' : 'text-slate-400'}`}>
            {cleanDigits.length}/10 digits
          </span>
        </div>
      )}

      <div className="relative flex items-center">
        {/* Country Code Block */}
        <div className="absolute left-0 inset-y-0 flex items-center pl-3 pr-2.5 bg-slate-800/80 border-r border-slate-700/80 rounded-l-lg text-slate-300 text-xs font-mono font-semibold select-none pointer-events-none">
          <span className="text-cyan-400 mr-1">🇮🇳</span> +91
        </div>

        {/* 10-Digit Block Input */}
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={displayValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={11} // 10 digits + 1 space
          className={`w-full pl-22 pr-10 py-2.5 bg-slate-900/90 border rounded-lg text-sm text-slate-100 font-mono tracking-widest placeholder:text-slate-600 focus:outline-none transition-all duration-150 ${
            error
              ? 'border-rose-500/80 focus:ring-2 focus:ring-rose-500/30'
              : isValid
              ? 'border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/30 bg-emerald-950/10'
              : isTouched
              ? 'border-amber-500/60 focus:ring-2 focus:ring-cyan-500/30'
              : 'border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        />

        {/* Status Indicator Icon */}
        <div className="absolute right-3 inset-y-0 flex items-center pointer-events-none">
          {isValid ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : isTouched ? (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {10 - cleanDigits.length} left
            </span>
          ) : (
            <Phone className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </div>

      {/* Validation Message */}
      {error ? (
        <p className="flex items-center gap-1 text-[11px] text-rose-400 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      ) : isTouched && !isValid ? (
        <p className="text-[11px] text-amber-400/90">
          Must be exactly 10 digits mobile number (Block format)
        </p>
      ) : null}
    </div>
  );
};
