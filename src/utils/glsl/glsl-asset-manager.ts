import { setTextureParams, updateTexture } from "./glsl-utils";
import type { UniformConfig, UniformValue } from "./types";

class GlslAssetManager {
  readonly gl: WebGLRenderingContext;
  readonly program: WebGLProgram;
  readonly uniforms: Map<string, WebGLUniformLocation | null> = new Map();
  readonly textures: Map<number, WebGLTexture> = new Map();
  private videoEl: HTMLVideoElement | null = null;

  constructor(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    initialUniforms: UniformConfig = {}
  ) {
    this.gl = gl;
    this.program = program;

    // Built-in uniform locations
    const uTime = this.gl.getUniformLocation(this.program, "u_time");
    this.uniforms.set("u_time", uTime);
    const uRes = this.gl.getUniformLocation(this.program, "u_resolution");
    this.uniforms.set("u_resolution", uRes);
    const uMouse = this.gl.getUniformLocation(this.program, "u_mouse");
    this.uniforms.set("u_mouse", uMouse);

    // Initialize custom uniforms
    this.initializeUniforms(initialUniforms);
  }

  private initializeUniforms(uniforms: UniformConfig) {
    for (const [name, config] of Object.entries(uniforms)) {
      const location = this.gl.getUniformLocation(this.program, name);
      if (!location) continue;

      this.uniforms.set(name, location);
      this.setUniform(name, config);
    }
  }

  private loadTexture(name: string, url: string) {
    // Create a new texture
    const texture = this.gl.createTexture();
    const textureUnit = this.textures.size;
    if (!texture) {
      console.error(`Error loading texture ${name}`);
      return;
    }

    // Use a placeholder pixel while the image loads
    this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    updateTexture(this.gl);

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
      try {
        const texture = this.textures.get(textureUnit);
        const sizeName = `${name}_size`;
        const sizeLocation = this.gl.getUniformLocation(this.program, sizeName);

        if (sizeLocation && texture) {
          this.uniforms.set(sizeName, sizeLocation);
          this.gl.uniform2f(sizeLocation, image.width, image.height);
          this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
          this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
          setTextureParams(this.gl, image);
          updateTexture(this.gl, image);
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

  public async setupWebcam(name = "u_webcam") {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    // Create a new texture
    const location = this.gl.getUniformLocation(this.program, name);
    const texture = this.gl.createTexture();
    const textureUnit = this.textures.size;
    if (!texture || !location) {
      console.error("Failed to create texture");
      console.error({ texture, location, textureUnit });
      return;
    }

    // Set the sampler uniform to use the correct texture unit
    this.gl.uniform1i(location, textureUnit);

    // Use a placeholder pixel while the image loads
    this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    updateTexture(this.gl);

    // Track the texture
    this.textures.set(textureUnit, texture);

    const video = document.createElement("video");
    this.videoEl = video;
    video.autoplay = true;
    video.muted = true;

    video.addEventListener("loadeddata", (e) => {
      video.play();

      try {
        const texture = this.textures.get(textureUnit);
        const sizeName = `${name}_size`;
        const sizeLocation = this.gl.getUniformLocation(this.program, sizeName);

        if (sizeLocation && texture) {
          this.uniforms.set(sizeName, sizeLocation);
          this.gl.uniform2f(sizeLocation, 640, 480);
          this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
          this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
          setTextureParams(this.gl, video);
          updateTexture(this.gl, video);
        }
      } catch (error) {
        console.error(`Error loading texture ${name}:`, error);
      }
    });

    video.srcObject = stream;
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
        this.loadTexture(name, value);
        break;
      default:
        console.warn(`Unsupported uniform type: ${type}`);
    }
  }

  public destroy() {
    this.textures.forEach((txtr) => this.gl.deleteTexture(txtr));
    this.textures.clear();
    if (this.videoEl && this.videoEl.srcObject) {
      const stream = this.videoEl.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      this.videoEl = null;
    }
  }
}

export default GlslAssetManager;
