export function getContext(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl");

  if (!gl) throw new Error("WebGL not supported");

  return gl;
}
