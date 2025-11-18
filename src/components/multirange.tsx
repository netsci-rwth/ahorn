import { formatNumber } from "@/utils/format";

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
      <div className="mt-3 flex justify-between text-gray-600 dark:text-gray-400">
        <span>Min: {formatNumber(value.min)}</span>
        <span>Max: {formatNumber(value.max)}</span>
      </div>
    </>
  );
}
