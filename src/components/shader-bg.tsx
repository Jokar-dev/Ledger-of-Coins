'use client'

import { useEffect, useRef } from 'react'

export default function ShaderBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl')
    if (!gl) return

    const vertexShaderSource = `
      attribute vec2 position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = position * 0.5 + 0.5;
        v_texCoord.y = 1.0 - v_texCoord.y;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `

    const fragmentShaderSource = `
precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float rune(vec2 p, float id) {
    p = abs(p - 0.5) * 2.0;
    float d = 0.0;
    if(id < 0.25) d = max(p.x, p.y);
    else if(id < 0.5) d = p.x + p.y;
    else if(id < 0.75) d = length(p);
    else d = max(p.x * 0.8 + p.y * 0.2, p.y * 0.8 + p.x * 0.2);
    return smoothstep(0.5, 0.48, d) - smoothstep(0.45, 0.43, d);
}

void main() {
    vec2 uv = v_texCoord;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 p = uv * aspect;
    
    // Base colors
    vec3 colorDeep = vec3(0.08, 0.04, 0.02); // Deep ancient brown
    vec3 colorParchment = vec3(0.18, 0.12, 0.08); // Weathered parchment
    vec3 colorGoldLoss = vec3(0.6, 0.4, 0.1); // Fading gold
    vec3 colorVoid = vec3(0.05, 0.02, 0.01); // Dark void
    
    // Ambient texture
    float n = noise(uv * 200.0 + u_time * 0.02);
    vec3 base = mix(colorDeep, colorParchment, n * 0.15 + 0.3);
    
    // Dissolving Gold Particles (signifying loss)
    float particles = 0.0;
    for(float i = 0.0; i < 12.0; i++) {
        float seed = i * 1.57;
        vec2 pos = vec2(noise(vec2(seed, 1.0)) * aspect.x, noise(vec2(seed, 2.0)));
        // Move downwards slowly like sinking gold/dust
        pos.y = fract(pos.y - u_time * 0.04);
        float dist = length(p - pos);
        // Fading intensity as they sink
        float intensity = 0.0012 / (dist * dist);
        particles += intensity * (1.0 - pos.y);
    }
    
    // Fading Runes
    vec2 grid = fract(uv * 8.0 - vec2(0.0, u_time * 0.02));
    vec2 id = floor(uv * 8.0 - vec2(0.0, u_time * 0.02));
    float r = rune(grid, noise(id));
    float rFade = noise(id + u_time * 0.05);
    particles += r * smoothstep(0.7, 0.3, rFade) * 0.2;
    
    // Vignette for depth
    float vignette = 1.0 - length(uv - 0.5) * 1.2;
    
    vec3 finalColor = mix(colorVoid, base + (colorGoldLoss * particles), vignette);
    
    gl_FragColor = vec4(finalColor, 1.0);
}
    `

    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
        const shader = gl.createShader(type)
        if (!shader) return null
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        return shader
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
    if (!vertexShader || !fragmentShader) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
    ]), gl.STATIC_DRAW)

    const positionAttributeLocation = gl.getAttribLocation(program, "position")
    const timeLocation = gl.getUniformLocation(program, "u_time")
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution")

    let animationId: number
    function render(time: number) {
        time *= 0.001
        if (!canvas) return
        if (!gl) return
        
        if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
            canvas.width = canvas.clientWidth
            canvas.height = canvas.clientHeight
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
        }
        
        gl.useProgram(program)
        gl.enableVertexAttribArray(positionAttributeLocation)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)
        
        gl.uniform1f(timeLocation, time)
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
        
        gl.drawArrays(gl.TRIANGLES, 0, 6)
        animationId = requestAnimationFrame(render)
    }
    animationId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10" id="shader-bg" />
}
