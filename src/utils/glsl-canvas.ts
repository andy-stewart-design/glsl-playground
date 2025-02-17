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

interface UniformTexture {
  type: "sampler2D";
  value: string; // URL of the texture
}

type UniformValue =
  | UniformNumber
  | UniformVector
  | UniformBoolean
  | UniformTexture;

export interface UniformConfig {
  [key: string]: UniformValue;
}

const DEFAULT_VERTICES = new Float32Array([
  -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
]);

class WebGLCanvas {
  public container: HTMLElement;
  public canvas: HTMLCanvasElement;
  public gl: WebGLRenderingContext;
  public program: WebGLProgram;

  constructor(container: HTMLElement, frag?: string) {
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
      frag ?? fragmentShaderSource
    );

    this.program = this.createProgram(vertexShader, fragmentShader);
    this.gl.useProgram(this.program);
    this.createBuffer(DEFAULT_VERTICES);

    const a_Position = this.gl.getAttribLocation(this.program, "a_position");
    this.gl.enableVertexAttribArray(a_Position);
    this.gl.vertexAttribPointer(a_Position, 2, this.gl.FLOAT, false, 0, 0);
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

  public destroy() {
    this.container.innerHTML = "";
  }
}

export default class GlslRenderer extends WebGLCanvas {
  private mousePosition = [0, 0];
  private uniforms: Map<string, WebGLUniformLocation | null> = new Map();
  private textures: Map<number, WebGLTexture> = new Map();
  private controller = new AbortController();

  constructor(
    container: HTMLElement,
    frag?: string,
    initialUniforms: UniformConfig = {}
  ) {
    super(container, frag);

    // Built-in uniform locations
    const uTime = this.gl.getUniformLocation(this.program, "u_time");
    this.uniforms.set("u_time", uTime);
    const uRes = this.gl.getUniformLocation(this.program, "u_resolution");
    this.uniforms.set("u_resolution", uRes);
    const uMouse = this.gl.getUniformLocation(this.program, "u_mouse");
    this.uniforms.set("u_mouse", uMouse);

    // Initialize custom uniforms
    this.initializeUniforms(initialUniforms);

    this.handleResize();
    this.addEventListeners();
    this.container.appendChild(this.canvas);
    requestAnimationFrame((t) => this.render(t));
  }

  private initializeUniforms(uniforms: UniformConfig) {
    for (const [name, config] of Object.entries(uniforms)) {
      const location = this.gl.getUniformLocation(this.program, name);
      if (!location) continue;

      this.uniforms.set(name, location);
      this.setUniform(name, config);
    }
  }

  public setUniform(name: string, config: UniformValue) {
    const location = this.uniforms.get(name);

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
      case "sampler2D":
        this.loadTexture(name, value, this.textures.size);
        break;
      default:
        console.warn(`Unsupported uniform type: ${type}`);
    }
  }

  private loadTexture(name: string, url: string, textureUnit: number) {
    // Create a new texture
    const texture = this.gl.createTexture();
    if (!texture) {
      console.error("Failed to create texture");
      return;
    }

    // Use a placeholder pixel while the image loads
    this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      1,
      1,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255])
    );

    // Track the texture
    this.textures.set(textureUnit, texture);

    // Set the sampler uniform to use the correct texture unit
    const location = this.uniforms.get(name);
    if (location) {
      this.gl.uniform1i(location, textureUnit);
    }

    // Load the image
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const texture = this.textures.get(textureUnit);
      if (!texture) return;

      this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

      try {
        this.gl.texImage2D(
          this.gl.TEXTURE_2D,
          0,
          this.gl.RGBA,
          this.gl.RGBA,
          this.gl.UNSIGNED_BYTE,
          image
        );

        const sizeUniformName = `${name}_size`;
        const sizeLocation = this.gl.getUniformLocation(
          this.program,
          sizeUniformName
        );
        if (sizeLocation) {
          this.gl.uniform2f(sizeLocation, image.width, image.height);
          this.uniforms.set(sizeUniformName, sizeLocation);
        }

        // Check if power of 2
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
          this.gl.generateMipmap(this.gl.TEXTURE_2D);
        } else {
          // Set parameters for non-power-of-2 textures
          this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_WRAP_S,
            this.gl.CLAMP_TO_EDGE
          );
          this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_WRAP_T,
            this.gl.CLAMP_TO_EDGE
          );
          this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_MIN_FILTER,
            this.gl.LINEAR
          );
        }
      } catch (error) {
        console.error(`Error loading texture ${name}:`, error);
      }
    };

    image.onerror = () => {
      console.error(`Failed to load texture: ${url}`);
    };

    image.src = url;
  }

  private render(time: number) {
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Pass uniforms
    const uTime = this.uniforms.get("u_time") ?? null;
    this.gl.uniform1f(uTime, time * 0.001); // Time in seconds
    const uMouse = this.uniforms.get("u_mouse") ?? null;
    this.gl.uniform2f(uMouse, this.mousePosition[0], this.mousePosition[1]);

    this.textures.forEach((texture, unit) => {
      this.gl.activeTexture(this.gl.TEXTURE0 + unit);
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    });

    // Draw
    this.gl.drawArrays(this.gl.TRIANGLES, 0, DEFAULT_VERTICES.length / 2);

    requestAnimationFrame((t) => this.render(t));
  }

  private handleResize() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    const uRes = this.uniforms.get("u_resolution") ?? null;
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
    this.textures.forEach((txtr) => this.gl.deleteTexture(txtr));
    this.textures.clear();
    this.controller.abort();
  }
}

// Helper function to check if a number is a power of 2
function isPowerOf2(value: number): boolean {
  return (value & (value - 1)) == 0;
}
