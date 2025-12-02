varying vec2 vUv;
out vec3 vReflect;

void main() {
  vUv = uv;

  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec3 worldNormal = normalize(mat3(modelMatrix) * normal);

  vec3 incident = normalize(worldPosition.xyz - cameraPosition);
  vReflect = reflect(incident, worldNormal);
}
