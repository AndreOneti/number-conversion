import React, { useState, useCallback, useEffect } from 'react';
import { Calculator, RefreshCw, Copy, Check, Sun, Moon } from 'lucide-react';

type Base = 'decimal' | 'octal' | 'hexadecimal';
type Theme = 'light' | 'dark';

interface NumberState {
  decimal: string;
  octal: string;
  hexadecimal: string;
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [numbers, setNumbers] = useState<NumberState>({
    decimal: '',
    octal: '',
    hexadecimal: '',
  });
  const [copiedField, setCopiedField] = useState<Base | null>(null);
  const [activeInput, setActiveInput] = useState<Base | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const convertFromDecimal = useCallback(
    (decimalValue: string): NumberState => {
      if (!decimalValue) {
        return { decimal: '', octal: '', hexadecimal: '' };
      }

      const num = parseInt(decimalValue, 10);
      if (isNaN(num)) {
        return {
          decimal: decimalValue,
          octal: 'Inválido',
          hexadecimal: 'Inválido',
        };
      }

      return {
        decimal: decimalValue,
        octal: num.toString(8),
        hexadecimal: num.toString(16).toUpperCase(),
      };
    },
    [],
  );

  const convertFromOctal = useCallback((octalValue: string): NumberState => {
    if (!octalValue) {
      return { decimal: '', octal: '', hexadecimal: '' };
    }

    const num = parseInt(octalValue, 8);
    if (isNaN(num)) {
      return {
        decimal: 'Inválido',
        octal: octalValue,
        hexadecimal: 'Inválido',
      };
    }

    return {
      decimal: num.toString(10),
      octal: octalValue,
      hexadecimal: num.toString(16).toUpperCase(),
    };
  }, []);

  const convertFromHexadecimal = useCallback(
    (hexValue: string): NumberState => {
      if (!hexValue) {
        return { decimal: '', octal: '', hexadecimal: '' };
      }

      const num = parseInt(hexValue, 16);
      if (isNaN(num)) {
        return {
          decimal: 'Inválido',
          octal: 'Inválido',
          hexadecimal: hexValue,
        };
      }

      return {
        decimal: num.toString(10),
        octal: num.toString(8),
        hexadecimal: hexValue.toUpperCase(),
      };
    },
    [],
  );

  const handleInputChange = (base: Base, value: string) => {
    const cleanValue = value.replace(/\s/g, '');
    let result: NumberState;

    switch (base) {
      case 'decimal':
        result = convertFromDecimal(cleanValue);
        break;
      case 'octal':
        result = convertFromOctal(cleanValue);
        break;
      case 'hexadecimal':
        result = convertFromHexadecimal(cleanValue);
        break;
    }

    setNumbers(result);
    setActiveInput(base);
  };

  const handleClear = () => {
    setNumbers({ decimal: '', octal: '', hexadecimal: '' });
    setActiveInput(null);
  };

  const handleCopy = async (base: Base) => {
    const value = numbers[base];
    if (value) {
      await navigator.clipboard.writeText(value);
      setCopiedField(base);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handlePaste = async (base: Base) => {
    try {
      const text = await navigator.clipboard.readText();
      handleInputChange(base, text);
    } catch {
      // Clipboard access denied
    }
  };

  const bases: {
    key: Base;
    label: string;
    placeholder: string;
    prefix: string;
  }[] = [
    { key: 'decimal', label: 'Decimal', placeholder: '0-9', prefix: '' },
    { key: 'octal', label: 'Octal', placeholder: '0-7', prefix: '0o' },
    {
      key: 'hexadecimal',
      label: 'Hexadecimal',
      placeholder: '0-9, A-F',
      prefix: '0x',
    },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-500'>
      <div className='w-full max-w-xl'>
        {/* Theme Toggle */}
        <div className='flex justify-end mb-4'>
          <button
            onClick={toggleTheme}
            aria-label='Alternar tema'
            className='flex items-center justify-center w-10 h-10 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-white transition-all duration-300 shadow-sm'
          >
            {theme === 'dark' ? (
              <Sun className='w-5 h-5' />
            ) : (
              <Moon className='w-5 h-5' />
            )}
          </button>
        </div>

        {/* Header */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 mb-4'>
            <Calculator className='w-8 h-8 text-white' />
          </div>
          <h1 className='text-3xl font-bold text-slate-800 dark:text-white mb-2'>
            Conversor Numérico
          </h1>
          <p className='text-slate-500 dark:text-slate-400'>
            Converta entre sistemas Decimal, Octal e Hexadecimal
          </p>
        </div>

        {/* Main Card */}
        <div className='bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-2xl overflow-hidden transition-colors duration-500'>
          {/* Input Fields */}
          <div className='p-6 space-y-4'>
            {bases.map(({ key, label, placeholder, prefix }) => (
              <div
                key={key}
                className={`relative rounded-2xl transition-all duration-300 ${
                  activeInput === key
                    ? 'bg-slate-100 dark:bg-slate-700/50 ring-2 ring-emerald-500/50'
                    : 'bg-slate-100/60 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/40'
                }`}
              >
                <div className='p-4'>
                  <div className='flex items-center justify-between mb-3'>
                    <label className='text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider'>
                      {label}
                    </label>
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => handlePaste(key)}
                        className='text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors px-2 py-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-600/50'
                      >
                        Colar
                      </button>
                      <button
                        onClick={() => handleCopy(key)}
                        disabled={!numbers[key]}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-all ${
                          numbers[key]
                            ? 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10'
                            : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        {copiedField === key ? (
                          <>
                            <Check className='w-3 h-3' />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className='w-3 h-3' />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {prefix && (
                      <span className='text-slate-400 dark:text-slate-500 font-mono text-lg select-none'>
                        {prefix}
                      </span>
                    )}
                    <input
                      type='text'
                      value={numbers[key]}
                      onChange={e => handleInputChange(key, e.target.value)}
                      onFocus={() => setActiveInput(key)}
                      onBlur={() => setActiveInput(null)}
                      placeholder={placeholder}
                      className='w-full bg-transparent text-2xl font-mono text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none'
                      spellCheck={false}
                      autoComplete='off'
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions Footer */}
          <div className='px-6 pb-6'>
            <div className='flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700/50'>
              <div className='text-sm text-slate-400 dark:text-slate-500'>
                {numbers.decimal && (
                  <span>
                    Valor:{' '}
                    <span className='text-slate-600 dark:text-slate-400 font-mono'>
                      {parseInt(numbers.decimal) || 0}
                    </span>
                  </span>
                )}
              </div>
              <button
                onClick={handleClear}
                className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all'
              >
                <RefreshCw className='w-4 h-4' />
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className='mt-6 grid grid-cols-3 gap-4'>
          {[
            { base: 'Decimal', chars: '0-9', example: '255' },
            { base: 'Octal', chars: '0-7', example: '377' },
            { base: 'Hex', chars: '0-9, A-F', example: 'FF' },
          ].map(({ base, chars, example }) => (
            <div
              key={base}
              className='bg-white/50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-200 dark:border-slate-700/30 transition-colors duration-500'
            >
              <div className='text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2'>
                {base}
              </div>
              <div className='text-slate-400 dark:text-slate-500 text-xs mb-1'>
                Dígitos:{' '}
                <span className='text-slate-600 dark:text-slate-400'>
                  {chars}
                </span>
              </div>
              <div className='text-slate-400 dark:text-slate-500 text-xs'>
                Exemplo:{' '}
                <span className='font-mono text-emerald-600 dark:text-emerald-400'>
                  {example}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className='mt-6 text-center'>
          <p className='text-xs text-slate-400 dark:text-slate-600 mb-1'>
            Digite em qualquer campo para converter automaticamente
          </p>
          <p className='text-xs text-slate-400 dark:text-slate-500'>
            Copyright &copy; 2026 - Andre Oneti.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
