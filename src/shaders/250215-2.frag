// Pixel Ripple

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float gridSize = 16.;
float edgeOffset = 0.9;

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
    uv = fract(uv * gridSize);
    // Remap the coordiante space of each cell
    uv = uv * 2.0 - 1.0;

    // calculate grid cell with borders
    float gridCell = step(-edgeOffset, uv.x);
    gridCell = gridCell * step(uv.x, edgeOffset);
    gridCell = gridCell * step(-edgeOffset, uv.y);
    gridCell = gridCell * step(uv.y, edgeOffset);

    // Calculate the grid cell center in original coordinates
    vec2 cellIndex = floor(uvScreen * gridSize);
    vec2 cellCenter = (cellIndex + 0.5) / gridSize;
    // Calculate distance of this cell from center of screen
    float distFromCenter = distance(cellCenter, vec2(0.));
    // Create a ripple effect from the center
    float nSin = (sin(u_time * 4. + distFromCenter * -16.) + 1.) / 2.;
    // Darken the color of the rings as they move awau from the center
    float darkFactor = distFromCenter * 0.375 + nSin;
    darkFactor = 1. - darkFactor;

    vec3 color = vec3(0., 0., darkFactor) * gridCell;

    gl_FragColor = vec4(color, 1.);
}

// https://www.youtube.com/watch?v=f4s1h2YETNY&t=900s