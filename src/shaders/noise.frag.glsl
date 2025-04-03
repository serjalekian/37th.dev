precision highp float;

uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uNoiseIntensity;
uniform float uNoiseScale;
uniform float uNoiseSpeed;
uniform float uDistortionAmount;

varying vec2 vUv;

// Simple pseudo-random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
    const float K1 = 0.366025404; // (sqrt(3)-1)/2
    const float K2 = 0.211324865; // (3-sqrt(3))/6
    
    vec2 i = floor(p + (p.x + p.y) * K1);
    vec2 a = p - i + (i.x + i.y) * K2;
    vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec2 b = a - o + K2;
    vec2 c = a - 1.0 + 2.0 * K2;
    
    vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
    vec3 n = h * h * h * h * vec3(dot(a, hash(i)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));
    
    return dot(n, vec3(70.0));
}

void main() {
    // Get the original rendered scene
    vec2 uv = vUv;
    
    // Add subtle distortion based on noise
    float timeOffset = uTime * uNoiseSpeed;
    float noiseValue = noise(uv * uNoiseScale + timeOffset) * uDistortionAmount;
    vec2 distortedUv = uv + vec2(noiseValue, noiseValue * 0.8);
    
    // Sample the scene with distorted UVs
    vec4 sceneColor = texture2D(tDiffuse, distortedUv);
    
    // Film grain effect - random noise that changes each frame
    float grain = random(uv + vec2(sin(uTime * 0.1), cos(uTime * 0.1))) * 2.0 - 1.0;
    
    // Apply noise based on intensity
    vec3 finalColor = sceneColor.rgb + vec3(grain * uNoiseIntensity);
    
    // Output the combined result
    gl_FragColor = vec4(finalColor, 1.0);
} 