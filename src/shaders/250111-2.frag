#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

    float c = smoothstep(0.05, 0.01, abs(abs(uv.y) - smoothstep(-0.5, 0.25, uv.x) * 0.3));

    gl_FragColor = vec4(vec3(0., 0., c), 1.0);
}

// https://www.youtube.com/watch?v=60VoL-F-jIQ