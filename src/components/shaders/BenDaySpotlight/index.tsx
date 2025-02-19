import { useEffect, useRef, useState } from "react";
import GlslRenderer from "@/utils/glsl";
import RangeInput from "@/components/controls/RangeInput";
import frag from "./sketch.frag?raw";
import s from "./style.module.css";

interface Defaults {
  grid: number;
  spread: number;
  blur: number;
  modulateSize: boolean;
}

const U_DEFAULTS: Defaults = {
  grid: 8,
  spread: 0.5,
  blur: 0.0,
  modulateSize: true,
};

function BenDaySpotlight() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<GlslRenderer | null>(null);

  const [grid, setGrid] = useState(U_DEFAULTS.grid);
  const [spread, setSpread] = useState(U_DEFAULTS.spread);
  const [blur, setBlur] = useState(U_DEFAULTS.blur);
  const [modulateSize, setModulateSize] = useState(U_DEFAULTS.modulateSize);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const gl = new GlslRenderer(container, frag, {
      u_grid: { type: "float", value: U_DEFAULTS.grid },
      u_spread: { type: "float", value: U_DEFAULTS.spread },
      u_blur: { type: "float", value: U_DEFAULTS.blur },
      u_modulateSize: { type: "bool", value: U_DEFAULTS.modulateSize },
    });

    glRef.current = gl;

    return () => gl.destroy();
  }, []);

  useEffect(() => {
    glRef.current?.updateUniform("u_grid", {
      type: "float",
      value: grid,
    });
    glRef.current?.updateUniform("u_spread", {
      type: "float",
      value: spread,
    });
    glRef.current?.updateUniform("u_blur", {
      type: "float",
      value: blur,
    });
    glRef.current?.updateUniform("u_modulateSize", {
      type: "bool",
      value: modulateSize,
    });
  }, [grid, spread, blur, modulateSize]);

  return (
    <>
      <section ref={containerRef} className={s.section} />
      <div className={s.controls}>
        <label>
          Grid size
          <RangeInput value={grid} onChange={setGrid} min={4} max={20} />
        </label>
        <label>
          Spread amount
          <RangeInput
            value={spread}
            onChange={setSpread}
            min={0}
            max={1}
            step={0.01}
          />
        </label>
        <label>
          Blur amount
          <RangeInput
            value={blur}
            onChange={setBlur}
            min={0}
            max={3}
            step={0.01}
          />
        </label>
        <label>
          Modulate size
          <input
            type="checkbox"
            checked={modulateSize}
            onChange={(e) => setModulateSize(e.target.checked)}
          />
        </label>
      </div>
    </>
  );
}

export default BenDaySpotlight;
