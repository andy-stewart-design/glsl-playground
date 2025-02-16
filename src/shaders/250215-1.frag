// A branch of 250203.frag

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float gridSize = 8.;
float spreadFactor = 0.9;
float spreadAmount = 0.5 + 2.5 * (1. - spreadFactor);

void main() {
    // Normalize the coordinate space
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 mouse = u_mouse / u_resolution;
    // Remap the coordinate space from 0,1 to -1,1
    uv = uv * 2.0 - 1.0;
    mouse = mouse * 2.0 - 1.0;
    // Fix aspect ratio of coordinates
    uv.x *= u_resolution.x / u_resolution.y;
    mouse.x *= u_resolution.x / u_resolution.y;
    // Save a copy of the original coordinate space
    vec2 uvScreen = uv;
    // Divide the space into a repeating grid
    // uv = fract(uv * gridSize);
    // Remap the coordiante space of each cell
    // uv = uv * 2.0 - 1.0;

    // Calculate the grid cell center in original coordinates
    vec2 cellIndex = floor(uvScreen * gridSize);
    vec2 cellCenter = (cellIndex + 0.5) / gridSize;
    // Calculate distance of this cell from center of screen
    float distFromMouse = distance(cellCenter, mouse);
    // Normalize this distance for darkening
    float darkFactor = min(distFromMouse * spreadAmount, 1.0);
    darkFactor = 1. - darkFactor;

    gl_FragColor = vec4(0., darkFactor, darkFactor, 1.);
}

// https://www.youtube.com/watch?v=f4s1h2YETNY&t=900s