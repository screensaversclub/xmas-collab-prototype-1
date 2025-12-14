uniform vec3 color1;
uniform vec3 color2;
uniform float time;

varying vec2 vUv;

void main() {
    float iterations = 10.0;
    float stripe = mod(((vUv.x + vUv.y) + time / 10.0) * iterations, 1.0);

    vec3 c = stripe > 0.5 ? color1 : color2;

    c = c * 1.5;

    csm_DiffuseColor = vec4(c, 1.0);
}
