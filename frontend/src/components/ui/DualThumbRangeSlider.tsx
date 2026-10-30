"use client";

import React, { useRef, useCallback, useEffect } from "react";
import { formatVnd } from "@/lib/formatters";

interface DualThumbRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
  formatValue?: (val: number) => string;
}

export default function DualThumbRangeSlider({
  min,
  max,
  step = 1000000,
  minValue,
  maxValue,
  onChange,
  formatValue = formatVnd,
}: DualThumbRangeSliderProps) {
  const minValRef = useRef(minValue);
  const maxValRef = useRef(maxValue);
  const rangeRef = useRef<HTMLDivElement>(null);

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minValue);
    const maxPercent = getPercent(maxValRef.current);

    if (rangeRef.current) {
      rangeRef.current.style.left = `${minPercent}%`;
      rangeRef.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minValue, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxValue);

    if (rangeRef.current) {
      rangeRef.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxValue, getPercent]);

  return (
    <div className="w-full">
      {/* Slider Track and Dual Inputs Container */}
      <div className="relative py-4 flex items-center">
        {/* Underline Base Track */}
        <div className="absolute w-full h-2 bg-slate-200 rounded-full" />

        {/* Highlighted active range bar */}
        <div
          ref={rangeRef}
          className="absolute h-2 bg-blue-600 rounded-full transition-all duration-75 pointer-events-none"
        />

        {/* Min Thumb input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={(event) => {
            const val = Math.min(Number(event.target.value), maxValue - step);
            minValRef.current = val;
            onChange(val, maxValue);
          }}
          className="thumb thumb-left absolute w-full h-0 pointer-events-none appearance-none z-30"
          style={{
            zIndex: minValue > max - 100 ? 50 : 30,
          }}
        />

        {/* Max Thumb input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={(event) => {
            const val = Math.max(Number(event.target.value), minValue + step);
            maxValRef.current = val;
            onChange(minValue, val);
          }}
          className="thumb thumb-right absolute w-full h-0 pointer-events-none appearance-none z-40"
        />
      </div>

      {/* Ticks and Guide labels */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold px-0.5">
        <span>0 ₫ (Không giới hạn)</span>
        <span>15 tr ₫</span>
        <span>30 tr ₫</span>
        <span>50 tr ₫</span>
      </div>

      <style jsx>{`
        /* Custom Dual Thumb Styling */
        .thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          pointer-events: auto;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background-color: #ffffff;
          border: 3px solid #2563eb;
          box-shadow: 0 1px 4px rgba(37, 99, 235, 0.3);
          cursor: grab;
          transition: transform 0.1s ease, box-shadow 0.1s ease;
        }

        .thumb::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
        }

        .thumb::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.2);
          border-color: #1d4ed8;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
        }

        .thumb::-moz-range-thumb {
          pointer-events: auto;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background-color: #ffffff;
          border: 3px solid #2563eb;
          box-shadow: 0 1px 4px rgba(37, 99, 235, 0.3);
          cursor: grab;
        }

        .thumb::-moz-range-thumb:hover {
          transform: scale(1.15);
        }
      `}</style>
    </div>
  );
}
