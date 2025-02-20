import { useEffect, useRef } from "react";
import GlslRenderer from "@/utils/glsl";
import type { UniformConfig } from "@/utils/glsl/types";
import s from "./style.module.css";

interface Props {
  frag: string;
  uniforms?: UniformConfig;
}

function GlslVideoCanvas({ frag, uniforms }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<GlslRenderer | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let gl: GlslRenderer;

    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      gl = new GlslRenderer(container, frag, uniforms);
      glRef.current = gl;
    };

    init();

    return () => {
      gl?.destroy();
      container.innerHTML = "";
    };
  }, [frag, uniforms]);

  return <section ref={containerRef} className={s.section} />;
}

export default GlslVideoCanvas;
