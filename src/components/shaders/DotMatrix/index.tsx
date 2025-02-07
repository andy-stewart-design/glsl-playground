import { useEffect, useRef, useState } from "react";
import GlslRenderer from "@/utils/glsl-canvas";
import RangeInput from "@/components/controls/RangeInput";
import frag from "./sketch.frag?raw";
import s from "./style.module.css";

const U_DEFAULTS = {
  grid: 5,
  speed: 1,
};

function DotMatrix() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<GlslRenderer | null>(null);

  const [grid, setGrid] = useState(U_DEFAULTS.grid);
  const [speed, setSpeed] = useState(U_DEFAULTS.speed);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const gl = new GlslRenderer(container, frag, {
      u_grid: { type: "float", value: U_DEFAULTS.grid },
      u_speed: { type: "float", value: U_DEFAULTS.speed },
    });

    glRef.current = gl;

    return () => gl.destroy();
  }, []);

  useEffect(() => {
    glRef.current?.setUniform("u_grid", {
      type: "float",
      value: grid,
    });
    glRef.current?.setUniform("u_speed", {
      type: "float",
      value: speed,
    });
  }, [grid, speed]);

  return (
    <>
      <section ref={containerRef} className={s.section} />
      <div className={s.controls}>
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
      </div>
    </>
  );
}

export default DotMatrix;
