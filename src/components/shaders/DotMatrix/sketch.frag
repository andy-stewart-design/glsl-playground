// A branch of 250203.frag

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_grid;
uniform float u_speed;

void main() {
    // Normalize the coordinate space
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    // Remap the coordinate space from 0,1 to -1,1
    uv = uv * 2.0 - 1.0;
    // Fix aspect ratio of coordinates
    uv.x *= u_resolution.x / u_resolution.y;
    // Save a copy of the original coordinate space
    vec2 uvScreen = uv;
    // Divide the space into a repeating grid
    uv = fract(uv * u_grid);
    // Remap the coordiante space of each cell
    uv = uv * 2.0 - 1.0;

    float d = length(uv);
    float blur = 0.025;
    float rad = 1.;
    rad = distance(uvScreen, vec2(0.));
    // rad = uvScreen.y;
    rad = sin(rad + u_time * u_speed) + 1. / 2.;
    d = smoothstep(rad - blur, rad + blur, d);
    d = 1. - d;

    gl_FragColor = vec4(d, 0., 0., 1.);
}

// https://www.youtube.com/watch?v=f4s1h2YETNY&t=900s