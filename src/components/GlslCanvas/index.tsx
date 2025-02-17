import { useEffect, useRef } from "react";
import GlslRenderer, { UniformConfig } from "@/utils/glsl-canvas";
import s from "./style.module.css";

interface Props {
  frag: string;
  uniforms?: UniformConfig;
}

function GlslCanvas({ frag, uniforms }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<GlslRenderer | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const gl = new GlslRenderer(container, frag, uniforms);

    glRef.current = gl;

    return () => gl.destroy();
  }, [frag, uniforms]);

  return <section ref={containerRef} className={s.section} />;
}

export default GlslCanvas;
