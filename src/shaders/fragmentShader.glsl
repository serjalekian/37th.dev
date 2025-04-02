precision mediump float;

uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;

#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {
    #include <clipping_planes_fragment>
    #include <logdepthbuf_fragment>

    // Simple color based on normal and time - creates a subtle shimmer
    vec3 color = vec3(0.8, 0.8, 1.0) * (0.7 + 0.3 * abs(vNormal.z));
    color += sin(uTime * 0.5 + vUv.x * 10.0) * 0.1;

    gl_FragColor = vec4(color, 1.0);
} 