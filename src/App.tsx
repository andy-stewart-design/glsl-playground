import { useEffect, useRef } from "react";
import GlslCanvas from "./utils/glsl-canvas";
import s from "./styles/app.module.css";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const gl = new GlslCanvas(container);
    return () => {
      container.innerHTML = "";
      gl.destroy();
    };
  }, []);

  return (
    <main>
      <section ref={containerRef} className={s.section} />
    </main>
  );
}

export default App;