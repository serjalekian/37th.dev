"use client";

import { useState, useEffect } from "react";
import { NoiseSettings } from "@/types/noise";

interface NoiseControlsProps {
  initialSettings: NoiseSettings;
  onChange: (settings: NoiseSettings) => void;
}

export default function NoiseControls({
  initialSettings,
  onChange,
}: NoiseControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<NoiseSettings>(initialSettings);

  // Update parent component when settings change
  useEffect(() => {
    onChange(settings);
  }, [settings, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);

    setSettings((prev) => ({
      ...prev,
      [name]: numValue,
    }));
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const resetToDefaults = () => {
    setSettings(initialSettings);
  };

  return (
    <div className="fixed bottom-4 right-4 z-10">
      <button
        onClick={togglePanel}
        className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md shadow-lg flex items-center"
      >
        <span>{isOpen ? "Hide" : "Show"} Noise Controls</span>
      </button>

      {isOpen && (
        <div className="mt-4 bg-gray-800 bg-opacity-90 p-4 rounded-md shadow-lg text-white max-w-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Noise Settings</h3>
            <button
              onClick={resetToDefaults}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
            >
              Reset
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">
                Intensity: {settings.intensity.toFixed(3)}
              </label>
              <input
                type="range"
                name="intensity"
                min="0"
                max="1.0"
                step="0.001"
                value={settings.intensity}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Scale: {settings.scale.toFixed(1)}
              </label>
              <input
                type="range"
                name="scale"
                min="1"
                max="200"
                step="0.5"
                value={settings.scale}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Speed: {settings.speed.toFixed(2)}
              </label>
              <input
                type="range"
                name="speed"
                min="0"
                max="10"
                step="0.01"
                value={settings.speed}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Distortion: {settings.distortion.toFixed(3)}
              </label>
              <input
                type="range"
                name="distortion"
                min="0"
                max="10"
                step="0.01"
                value={settings.distortion}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
