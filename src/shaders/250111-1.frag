#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv *= 6.;
    uv -= 3.;

    // float c = step(0.4, uv.y);
    // float c = step(0.6, uv.y);
    float c = step(sin(uv.x * 4. + u_time) - 0.05, uv.y) - step(sin(uv.x * 4. + u_time) + 0.05, uv.y);

    gl_FragColor = vec4(vec3(0., 0., c), 1.0);
}