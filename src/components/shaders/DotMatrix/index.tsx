import { useEffect, useRef, useState } from "react";
import GlslRenderer from "@/utils/glsl-canvas";
import RangeInput from "@/components/controls/RangeInput";
import frag from "./sketch.frag?raw";
import s from "./style.module.css";

function DotMatrix() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<GlslRenderer | null>(null);

  const [grid, setGrid] = useState(5);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const gl = new GlslRenderer(container, frag, {
      u_grid: { type: "float", value: 5 },
    });

    glRef.current = gl;

    return () => gl.destroy();
  }, []);

  useEffect(() => {
    glRef.current?.setUniform("u_grid", {
      type: "float",
      value: grid,
    });
  }, [grid]);

  return (
    <>
      <section ref={containerRef} className={s.section} />
      <div className={s.controls}>
        <label>
          Grid Size
          <RangeInput value={grid} onChange={setGrid} min={2} max={20} />
        </label>
      </div>
    </>
  );
}

export default DotMatrix;
