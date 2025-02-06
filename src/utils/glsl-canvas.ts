import { fragmentShaderSource, vertexShaderSource } from "../shaders/defaults";
import { getContext } from "./get-context";

interface UniformNumber {
  type: "float" | "int";
  value: number;
}

interface UniformVector {
  type: "vec2" | "vec3" | "vec4";
  value: number[];
}

interface UniformBoolean {
  type: "bool";
  value: boolean;
}

type UniformValue = UniformNumber | UniformVector | UniformBoolean;

interface UniformConfig {
  [key: string]: UniformValue;
}

export default class GlslCanvas {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private mousePosition = [0, 0];
  private controller = new AbortController();
  private program: WebGLProgram;
  private uniformLocations: Map<string, WebGLUniformLocation>;

  private vertices: Float32Array;
  private u_Time: WebGLUniformLocation | null;
  private u_Resolution: WebGLUniformLocation | null;
  private u_Mouse: WebGLUniformLocation | null;

  constructor(
    container: HTMLElement,
    frag?: string,
    initialUniforms: UniformConfig = {}
  ) {
    this.container = container;
    this.canvas = document.createElement("canvas");
    this.canvas.style.display = "block";
    this.uniformLocations = new Map();

    this.gl = getContext(this.canvas);

    const vertexShader = this.compileShader(
      this.gl.VERTEX_SHADER,
      vertexShaderSource
    );

    const fragmentShader = this.compileShader(
      this.gl.FRAGMENT_SHADER,
      frag ?? fragmentShaderSource
    );

    this.program = this.createProgram(vertexShader, fragmentShader);
    this.gl.useProgram(this.program);

    this.vertices = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);

    this.createBuffer(this.vertices);

    const a_Position = this.gl.getAttribLocation(this.program, "a_position");
    this.gl.enableVertexAttribArray(a_Position);
    this.gl.vertexAttribPointer(a_Position, 2, this.gl.FLOAT, false, 0, 0);

    // Built-in uniform locations
    this.u_Time = this.gl.getUniformLocation(this.program, "u_time");
    this.u_Resolution = this.gl.getUniformLocation(
      this.program,
      "u_resolution"
    );
    this.u_Mouse = this.gl.getUniformLocation(this.program, "u_mouse");

    // Initialize custom uniforms
    this.initializeUniforms(initialUniforms);

    this.handleResize();
    this.addEventListeners();
    this.container.appendChild(this.canvas);
    requestAnimationFrame((t) => this.render(t));
  }

  private compileShader(type: number, source: string) {
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

  private createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ) {
    const program = this.gl.createProgram();
    if (!program) {
      throw new Error(`Error creating WebGL Program`);
    }
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

  private createBuffer(data: Float32Array) {
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
    return buffer;
  }

  private initializeUniforms(uniforms: UniformConfig) {
    for (const [name, config] of Object.entries(uniforms)) {
      const location = this.gl.getUniformLocation(this.program, name);
      if (location) {
        this.uniformLocations.set(name, location);
        this.setUniform(name, config);
      }
    }
  }

  public setUniform(name: string, config: UniformValue) {
    const location = this.uniformLocations.get(name);

    if (!location) {
      console.warn(`Uniform ${name} not found`);
      return;
    }

    const { type, value } = config;

    switch (type) {
      case "float":
        this.gl.uniform1f(location, value);
        break;
      case "vec2":
        this.gl.uniform2fv(location, value);
        break;
      case "vec3":
        this.gl.uniform3fv(location, value);
        break;
      case "vec4":
        this.gl.uniform4fv(location, value);
        break;
      case "int":
        this.gl.uniform1i(location, value);
        break;
      case "bool":
        this.gl.uniform1i(location, value ? 1 : 0);
        break;
      default:
        console.warn(`Unsupported uniform type: ${type}`);
    }
  }

  private render(time: number) {
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

  private handleResize() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.uniform2f(this.u_Resolution, this.canvas.width, this.canvas.height);
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
    this.container.innerHTML = "";
    this.controller.abort();
  }
}
