uniform float time;
uniform vec3 color;
uniform vec3 color1;
uniform vec3 color2;
uniform samplerCube envMapF;

varying vec2 vUv;
in vec3 vReflect;

void main() {
  float iterations = 10.0;
  float k = mod(vUv.y * iterations, 1.0);

  vec3 c;
  float reflectFactor = 0.2;

  if (k > 0.5) {
    c = color1;
    reflectFactor = 0.3;
  } else {
    c = color2;
    reflectFactor = 0.7;
  }

  vec3 reflectColor = textureCube(envMapF, normalize(vReflect)).rgb;
  vec3 finalColor = mix(reflectColor, c, reflectFactor);
  csm_DiffuseColor = vec4(finalColor, 1.0);
}
