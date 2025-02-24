import { useEffect, useRef, useState } from "react";
import GlslRenderer from "@/utils/glsl";
import RangeInput from "@/components/controls/RangeInput";
import frag from "./sketch.frag?raw";
import { colorArray, isColor, colorObject, ColorOption } from "./color";
import s from "./style.module.css";

interface Defaults {
  grid: number;
  speed: number;
  color: ColorOption;
  inverted: boolean;
}

const U_DEFAULTS: Defaults = {
  grid: 5,
  speed: 1,
  color: "grayscale",
  inverted: true,
};

function DotMatrix() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<GlslRenderer | null>(null);

  const [grid, setGrid] = useState(U_DEFAULTS.grid);
  const [speed, setSpeed] = useState(U_DEFAULTS.speed);
  const [color, setColor] = useState<ColorOption>(U_DEFAULTS.color);
  const [inverted, setInverted] = useState(U_DEFAULTS.inverted);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const gl = new GlslRenderer(container, frag, {
      u_grid: { type: "float", value: U_DEFAULTS.grid },
      u_speed: { type: "float", value: U_DEFAULTS.speed },
      u_color: { type: "vec3", value: [0, 1, 1] },
      u_inverted: { type: "bool", value: U_DEFAULTS.inverted },
    });

    glRef.current = gl;

    return () => gl.destroy();
  }, []);

  useEffect(() => {
    glRef.current?.updateUniform("u_grid", {
      type: "float",
      value: grid,
    });
    glRef.current?.updateUniform("u_speed", {
      type: "float",
      value: speed,
    });
    glRef.current?.updateUniform("u_color", {
      type: "vec3",
      value: colorObject[color],
    });
    glRef.current?.updateUniform("u_inverted", {
      type: "bool",
      value: inverted,
    });
  }, [grid, speed, color, inverted]);

  return (
    <>
      <section ref={containerRef} className={s.section} />
      <div className={s.controls}>
        <label>
          Accent color
          <select
            name="color"
            value={color}
            onChange={(e) => {
              const value = isColor(e.target.value) && e.target.value;
              if (value) setColor(value);
            }}
          >
            {colorArray.map((color) => (
              <option key={color.value} value={color.value}>
                {color.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Grid size
          <RangeInput value={grid} onChange={setGrid} min={2} max={20} />
        </label>
        <label>
          Playback rate
          <RangeInput
            value={speed}
            onChange={setSpeed}
            min={0.25}
            max={4}
            step={0.1}
          />
        </label>
        <label>
          Invert colors
          <input
            type="checkbox"
            checked={inverted}
            onChange={(e) => setInverted(e.target.checked)}
          />
        </label>
      </div>
    </>
  );
}

export default DotMatrix;
