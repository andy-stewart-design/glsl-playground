#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    // Normalize and center the coordinate space
    vec2 uv = gl_FragCoord.xy / u_resolution.xy * 2.0 - 1.0;
    vec2 uvInit = uv;
    // Fix aspect ratio of coordinates
    uv.x *= u_resolution.x / u_resolution.y;
    // Create a grid
    uv = fract(uv * 8.) - 0.5;

    vec3 col = vec3(0., 0., 1.);
    float d = length(uv);

    // 
    d -= (sin(u_time * 2. - uvInit.x) + 1.) / 2. * 0.675;

    d = smoothstep(-0.0125, 0.0125, d);
    d = abs(1. - d);

    col *= d;

    gl_FragColor = vec4(col, 1.0);
}

// https://www.youtube.com/watch?v=f4s1h2YETNY&t=900s