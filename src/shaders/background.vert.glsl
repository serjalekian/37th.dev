precision mediump float;

uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    vec3 pos = position;

    // Custom displacement logic
    float displacement = sin(pos.x * 5.0 + uTime * 0.5) * 0.1 +
                        cos(pos.y * 5.0 + uTime * 0.3) * 0.1;
    vec3 displacedPosition = pos + normal * displacement;

    vec4 mvPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}