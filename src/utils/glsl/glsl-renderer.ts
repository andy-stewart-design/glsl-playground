import { UniformConfig } from "./types";
import GlslAssetManager from "./glsl-asset-manager";
import GlslCanvas, { DEFAULT_VERTICES } from "./glsl-canvas";

export default class GlslRenderer extends GlslCanvas {
  private mousePosition = [0, 0];
  readonly assets: GlslAssetManager;
  private controller = new AbortController();

  constructor(
    container: HTMLElement,
    frag?: string,
    initialUniforms: UniformConfig = {}
  ) {
    super(container, frag);
    this.assets = new GlslAssetManager(this.gl, this.program, initialUniforms);

    this.handleResize();
    this.addEventListeners();
    requestAnimationFrame((t) => this.render(t));
  }

  private render(time: number) {
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Pass uniforms
    const uTime = this.assets.uniforms.get("u_time") ?? null;
    this.gl.uniform1f(uTime, time * 0.001); // Time in seconds
    const uMouse = this.assets.uniforms.get("u_mouse") ?? null;
    this.gl.uniform2f(uMouse, this.mousePosition[0], this.mousePosition[1]);

    this.assets.textures.forEach((texture, unit) => {
      this.gl.activeTexture(this.gl.TEXTURE0 + unit);
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    });

    // Draw
    this.gl.drawArrays(this.gl.TRIANGLES, 0, DEFAULT_VERTICES.length / 2);

    requestAnimationFrame((t) => this.render(t));
  }

  private handleResize() {
    super.resizeCanvas();

    const uRes = this.assets.uniforms.get("u_resolution") ?? null;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.uniform2f(uRes, this.canvas.width, this.canvas.height);
  }

  private addEventListeners() {
    const { signal } = this.controller;

    this.canvas.addEventListener(
      "mousemove",
      (event) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePosition[0] = event.clientX - rect.left;
        this.mousePosition[1] = rect.height - (event.clientY - rect.top); // Flip Y-axis
      },
      { signal }
    );

    window.addEventListener("resize", () => this.handleResize(), { signal });
  }

  public destroy() {
    super.destroy();
    this.assets.destroy();
    this.controller.abort();
  }
}
