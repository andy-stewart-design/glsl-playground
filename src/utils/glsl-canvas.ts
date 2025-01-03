import { fragmentShaderSource, vertexShaderSource } from "../shaders/defaults";
import { getContext } from "./get-context";

export default class GlslCanvas {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private mousePosition = [0, 0];
  private controller = new AbortController();

  private vertices: Float32Array<ArrayBuffer>;
  private u_Time: WebGLUniformLocation | null;
  private u_Resolution: WebGLUniformLocation | null;
  private u_Mouse: WebGLUniformLocation | null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.canvas = document.createElement("canvas");
    this.canvas.style.display = "block";

    this.gl = getContext(this.canvas);

    const vertexShader = this.compileShader(
      this.gl.VERTEX_SHADER,
      vertexShaderSource
    );
    const fragmentShader = this.compileShader(
      this.gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    const program = this.createProgram(vertexShader, fragmentShader);
    this.gl.useProgram(program);

    this.vertices = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);

    this.createBuffer(this.vertices);

    const a_Position = this.gl.getAttribLocation(program, "a_position");
    this.gl.enableVertexAttribArray(a_Position);
    this.gl.vertexAttribPointer(a_Position, 2, this.gl.FLOAT, false, 0, 0);

    // Uniform locations
    this.u_Time = this.gl.getUniformLocation(program, "u_time");
    this.u_Resolution = this.gl.getUniformLocation(program, "u_resolution");
    this.u_Mouse = this.gl.getUniformLocation(program, "u_mouse");

    this.handleResize();
    this.addEventListeners();
    this.container.appendChild(this.canvas);
    requestAnimationFrame((t) => this.render(t));
  }

  compileShader(type: number, source: string) {
    const shader = this.gl.createShader(type);
    if (!shader) throw new Error("Shader creation failed");

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      this.gl.deleteShader(shader);
      throw new Error(
        `Shader compilation error: ${this.gl.getShaderInfoLog(shader)}`
      );
    }

    return shader;
  }

  createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      throw new Error(
        `Program linking error: ${this.gl.getProgramInfoLog(program)}`
      );
    }
    return program;
  }

  createBuffer(data: Float32Array) {
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
    return buffer;
  }

  render(time: number) {
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Pass uniforms
    this.gl.uniform1f(this.u_Time, time * 0.001); // Time in seconds
    this.gl.uniform2f(
      this.u_Mouse,
      this.mousePosition[0],
      this.mousePosition[1]
    );

    // Draw
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length / 2);

    requestAnimationFrame((t) => this.render(t));
  }

  handleResize() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.uniform2f(this.u_Resolution, this.canvas.width, this.canvas.height);
  }

  addEventListeners() {
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

  destroy() {
    this.controller.abort();
  }
}
