precision highp float;

uniform float uTime;
uniform vec3 diffuse; // Base color, maybe a metallic gray

// Control Uniforms
uniform float uNoiseFrequency; // e.g., 50.0
uniform float uNoiseIntensity; // e.g., 0.1
uniform float uFresnelPower;   // e.g., 3.0
uniform float uGlowIntensity;  // e.g., 0.3
uniform float uGlowSpeed;      // e.g., 1.5

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

// Simple pseudo-random function
float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

// Simple noise function
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = rand(i);
    float b = rand(i + vec2(1.0, 0.0));
    float c = rand(i + vec2(0.0, 1.0));
    float d = rand(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Iridescent color function based on angle
vec3 iridescentColor(float angle) {
    float hue = mod(angle * 2.0 + uTime * 0.1, 1.0); // Shift hue over time
    float saturation = 0.8 + 0.2 * sin(angle * 10.0 + uTime * 0.5); // Vary saturation
    float lightness = 0.6 + 0.1 * cos(angle * 5.0); // Vary lightness

    // Basic HSL to RGB conversion (approximation)
    float c = (1.0 - abs(2.0 * lightness - 1.0)) * saturation;
    float x = c * (1.0 - abs(mod(hue * 6.0, 2.0) - 1.0));
    float m = lightness - c / 2.0;
    vec3 rgb;
    if (hue < 1.0/6.0) rgb = vec3(c, x, 0.0);
    else if (hue < 2.0/6.0) rgb = vec3(x, c, 0.0);
    else if (hue < 3.0/6.0) rgb = vec3(0.0, c, x);
    else if (hue < 4.0/6.0) rgb = vec3(0.0, x, c);
    else if (hue < 5.0/6.0) rgb = vec3(x, 0.0, c);
    else rgb = vec3(c, 0.0, x);

    return rgb + m;
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);

    // Add subtle distortion to the normal using noise
    float distortion = noise(vUv * uNoiseFrequency + uTime * 0.2) * uNoiseIntensity;
    normal = normalize(normal + vec3(distortion, distortion, distortion));

    // Calculate dot product for Fresnel/view angle effect
    float viewAngleDot = clamp(dot(viewDirection, normal), 0.0, 1.0);

    // Fresnel term for metallic reflection strength
    float fresnel = pow(1.0 - viewAngleDot, uFresnelPower);

    // Get base metallic color (e.g., silver/gray)
    vec3 baseColor = vec3(0.7, 0.7, 0.75); // Metallic gray

    // Get iridescent color based on view angle
    vec3 iridescence = iridescentColor(viewAngleDot);

    // Mix base color and iridescence using Fresnel term
    vec3 metallicColor = mix(baseColor, iridescence, fresnel * 0.8 + 0.2);

    // Hearth-beat glow effect
    float glowPulse = (sin(uTime * uGlowSpeed) * 0.5 + 0.5); // Simple sine pulse (0 to 1)
    glowPulse = pow(glowPulse, 3.0); // Make the pulse sharper
    float glow = glowPulse * uGlowIntensity;

    vec3 finalColor = metallicColor + metallicColor * glow; // Additive glow

    gl_FragColor = vec4(finalColor, 1.0);
}