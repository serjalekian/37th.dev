precision mediump float;

uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;

#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {
    #include <uv_vertex>

    vUv = uv;
    vNormal = normal;

    vec3 pos = position;

    // Custom displacement logic
    float displacement = sin(pos.x * 5.0 + uTime * 0.5) * 0.1 +
                         cos(pos.y * 5.0 + uTime * 0.3) * 0.1;
    vec3 displacedPosition = pos + normal * displacement;

    #include <begin_vertex>
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <displacementmap_vertex> // Apply displacement to built-in 'transformed'
    transformed = displacedPosition; // Override standard position with our displaced one
    #include <project_vertex>
    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);

} 