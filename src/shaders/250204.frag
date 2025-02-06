#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_rows;
uniform vec3 u_color;

float makeOdd(float n) {
    return floor(n / 2.0) * 2.0 + 1.0;
}

void main() {
    // Normalize and center the coordinate space
    vec2 uvScreen = gl_FragCoord.xy / u_resolution.xy;
    vec2 uv = gl_FragCoord.xy / u_resolution.xy * 2.0 - 1.0;
    // Fix aspect ratio of coordinates
    float aspectRatio = u_resolution.x / u_resolution.y;
    uv.x *= aspectRatio;

    // Calculate grid indices
    float cols = makeOdd(floor(u_rows * aspectRatio));
    float xIndex = floor(uvScreen.x * cols) / (cols - 1.);
    float yIndex = floor(uvScreen.y * u_rows) / (u_rows - 1.);

    // Calculate the center of the current grid cell
    vec2 cellUV = vec2(xIndex, yIndex);

    // Calculate distance from cell center to screen center
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(cellUV, center);

    // Normalize distance to create gradient
    float maxDist = distance(vec2(0.0, 0.0), center);
    float normalizedDist = 1.0 - (dist / maxDist);

    float a = normalizedDist + (sin(u_time) + 1. / 2.);
    float b = a - 1.;
    float c = a > 1. ? b : a;

    float brightness = c;

    // Create sharper falloff 
    // brightness = pow(brightness, 1.25);

    vec3 col = vec3(u_color.x * brightness, u_color.y * brightness, u_color.z * brightness);
    gl_FragColor = vec4(col, 1.0);
}
