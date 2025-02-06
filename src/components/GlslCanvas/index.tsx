import { useEffect, useRef } from "react";
import GlslRenderer from "@/utils/glsl-canvas";
import s from "./style.module.css";

interface Props {
  frag: string;
}

function GlslCanvas({ frag }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<GlslRenderer | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const gl = new GlslRenderer(container, frag);

    glRef.current = gl;

    return () => gl.destroy();
  }, [frag]);

  return <section ref={containerRef} className={s.section} />;
}

export default GlslCanvas;
