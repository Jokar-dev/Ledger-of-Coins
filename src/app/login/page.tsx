import EmberCanvas from '@/components/ember-canvas'
import LoginForm from './login-form'

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-y-auto overflow-x-hidden flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Ambient Background Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 fixed" 
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCpuC3-4MMrKBXXQu6mxbXqH5jOIjU5h-GOCBqmdhj_COGrvVbLmzBn8pjY3Hpk7y5ozKdEdvM9MOVuGkJ255iRPQuNmPV6ToBGJ9EI5Mz91e9-ByGec2i2n-y3iB_-YWcJh3U20euwfram0-d96tujjNJXKl4G2n9QNCN38KkwgA0zcE1SMoZApFL6IPN1iDMHoLmxvuXl-Hs_l6yt1zkf_iwPKk1_J8EwbiQUaOzQhN_doOxrpt9P62LECZCH7_h8YfIF4JEfij8v')" }}
      />
      
      {/* Magical Vignette/Gradient overlay for depth */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-transparent to-background/80 pointer-events-none fixed" />
      
      {/* Particle/Embers Canvas */}
      <EmberCanvas />

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-md my-auto flex flex-col items-center">
        <div className="stone-tablet w-full rounded-xl border-2 border-outline-variant p-6 sm:p-8 flex flex-col items-center backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          {/* Compass/Mystical Seal */}
          <div className="w-16 h-16 rounded-full border border-primary/50 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(242,202,80,0.15)] bg-surface-container-lowest">
            <span className="material-symbols-outlined text-[32px] text-primary rune-pulse">explore</span>
          </div>

          {/* Brand Identity */}
          <h1 className="font-display-lg text-display-lg text-primary-fixed mb-2 text-center drop-shadow-[0_0_10px_rgba(255,224,136,0.4)] tracking-wide">
            Ledger of the Wanderers
          </h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-8 uppercase tracking-widest text-center opacity-80">
            Unlock the Archives
          </p>

          <LoginForm />
        </div>
      </main>
    </div>
  )
}
