uniform float time;
uniform vec3 color;
uniform vec3 color1;
uniform vec3 color2;
uniform samplerCube envMapF;

varying vec2 vUv;
in vec3 vReflect;

void main() {
    float iterations = 5.0;
    float k = mod(vUv.y * iterations, 1.0);

    vec3 c;
    float reflectFactor = 0.9;

    if (k > 0.5) {
        c = color1;
    } else {
        c = color2;
    }

    vec3 reflectColor = textureCube(envMapF, normalize(vReflect)).rgb;

    vec3 finalColor = mix(reflectColor, c, reflectFactor);

    finalColor = finalColor;

    csm_DiffuseColor = vec4(finalColor, 1.0);
}
