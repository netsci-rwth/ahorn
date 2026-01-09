export default function MultiRangeSlider({
  min,
  max,
  value,
  minGap = 10,
  onChange,
}: {
  min: number;
  max: number;
  value: { min: number; max: number };
  minGap?: number;
  onChange: (value: { min: number; max: number }) => void;
}) {
  const handleMinSubmit = (inputValue: string) => {
    const newMin = parseInt(inputValue, 10);
    const clampedMin = isNaN(newMin)
      ? min
      : Math.max(min, Math.min(newMin, value.max - minGap));
    onChange({ min: clampedMin, max: value.max });
  };

  const handleMaxSubmit = (inputValue: string) => {
    const newMax = parseInt(inputValue, 10);
    const clampedMax = isNaN(newMax)
      ? max
      : Math.min(max, Math.max(newMax, value.min + minGap));
    onChange({ min: value.min, max: clampedMax });
  };

  const range = max - min;
  const minPercent = ((value.min - min) / range) * 100;
  const maxPercent = 100 - ((value.max - min) / range) * 100;
  const rangeSize = [minPercent + "%", maxPercent + "%"];

  return (
    <>
      <div className="relative mt-4 h-6">
        {/* custom range inputs */}
        <input
          type="range"
          min={min}
          max={max}
          value={value.min}
          className="pointer-events-none absolute z-2 h-full w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-100 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-100"
          onChange={(event) => {
            const newMin = Math.min(
              parseInt(event.target.value, 10),
              value.max - minGap,
            );
            onChange({ min: newMin, max: value.max });
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value.max}
          className="pointer-events-none absolute z-2 h-full w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-100 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-100"
          onChange={(event) => {
            const newMax = Math.max(
              parseInt(event.currentTarget.value, 10),
              value.min + minGap,
            );
            onChange({ min: value.min, max: newMax });
          }}
        />

        {/* custom track */}
        <div className="relative top-2 h-2 w-full rounded-md bg-gray-200 dark:bg-gray-700">
          <div
            className="absolute h-2 rounded-md bg-primary"
            style={{ left: rangeSize[0], right: rangeSize[1] }}
          ></div>
        </div>
      </div>
      <div className="mt-3 flex justify-between gap-4 text-gray-600 dark:text-gray-400">
        <div className="flex flex-col gap-1">
          <label htmlFor="range-min" className="text-xs">
            Min:
          </label>
          <input
            id="range-min"
            type="number"
            min={min}
            max={value.max - minGap}
            defaultValue={value.min}
            key={`min-${value.min}`}
            onBlur={(e) => handleMinSubmit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleMinSubmit(e.currentTarget.value);
                e.currentTarget.blur();
              }
            }}
            className="w-28 rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="range-max" className="text-xs">
            Max:
          </label>
          <input
            id="range-max"
            type="number"
            min={value.min + minGap}
            max={max}
            defaultValue={value.max}
            key={`max-${value.max}`}
            onBlur={(e) => handleMaxSubmit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleMaxSubmit(e.currentTarget.value);
                e.currentTarget.blur();
              }
            }}
            className="w-28 rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
      </div>
    </>
  );
}
