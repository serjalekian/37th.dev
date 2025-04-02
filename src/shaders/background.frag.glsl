precision mediump float;

uniform float uTime;
uniform vec3 diffuse;
uniform float opacity;

varying vec2 vUv;
varying vec3 vNormal;

void main() {
    vec3 color = vec3(0.8, 0.8, 1.0) * (0.7 + 0.3 * abs(vNormal.z));
    color += sin(uTime * 0.5 + vUv.x * 10.0) * 0.1;
    
    gl_FragColor = vec4(color, opacity);
}