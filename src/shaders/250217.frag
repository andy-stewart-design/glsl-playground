#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_texture;
uniform vec2 u_texture_size;

void main() {
    // Get normalized coordinates
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Calculate aspect ratios
    float texAspect = u_texture_size.x / u_texture_size.y;
    float canvasAspect = u_resolution.x / u_resolution.y;

    // Adjust UVs to maintain aspect ratio (cover)
    vec2 adjustedUV = uv;

    if(canvasAspect > texAspect) {
        // Canvas is wider than texture
        float scale = canvasAspect / texAspect;
        adjustedUV.x = (uv.x - 0.5) * scale + 0.5;
    } else {
        // Canvas is taller than texture
        float scale = texAspect / canvasAspect;
        adjustedUV.y = (uv.y - 0.5) * scale + 0.5;
    }

    // Flip Y coordinate for proper orientation
    adjustedUV.y = 1.0 - adjustedUV.y;

    // Sample texture with adjusted coordinates
    vec4 texColor = texture2D(u_texture, adjustedUV);
    gl_FragColor = texColor;
}