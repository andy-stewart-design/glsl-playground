#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 mouse = u_mouse / u_resolution;
    mouse = mouse * 2.0 - 1.0;

    gl_FragColor = vec4(0., 0., abs(mouse.x), 1.);
}