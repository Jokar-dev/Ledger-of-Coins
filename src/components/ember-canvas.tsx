'use client'

import { useEffect, useRef } from 'react'

export default function EmberCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = canvas.width = window.innerWidth
    let height = canvas.height = window.innerHeight
    const embers: Ember[] = []
    const maxEmbers = 70

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    class Ember {
      x: number
      y: number
      size: number
      speedY: number
      speedX: number
      life: number
      maxLife: number
      color: string

      constructor() {
        this.x = Math.random() * width
        this.y = height + Math.random() * 200
        this.size = Math.random() * 2.5 + 0.5
        this.speedY = Math.random() * 1.5 + 0.5
        this.speedX = (Math.random() - 0.5) * 1
        this.life = Math.random() * 100 + 50
        this.maxLife = this.life
        this.color = `rgba(242, 202, 80, ${Math.random() * 0.8 + 0.2})`
      }

      update() {
        this.y -= this.speedY
        this.x += this.speedX + Math.sin(this.y / 50) * 0.5
        this.life--

        if (this.life <= 0 || this.y < -10) {
          this.reset()
        }
      }

      reset() {
        this.y = height + 10
        this.x = Math.random() * width
        this.life = Math.random() * 100 + 50
        this.maxLife = this.life
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.shadowBlur = 10
        ctx.shadowColor = '#f2ca50'
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife)
        ctx.fill()
        ctx.closePath()
      }
    }

    for (let i = 0; i < maxEmbers; i++) {
      embers.push(new Ember())
    }

    let animationId: number
    function animate() {
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)
      embers.forEach(ember => {
        ember.update()
        ember.draw()
      })
      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 pointer-events-none opacity-60" 
      id="emberCanvas" 
    />
  )
}
