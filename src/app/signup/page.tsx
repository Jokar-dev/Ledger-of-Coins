import Link from 'next/link'
import SignupForm from './signup-form'

export default function SignupPage() {
  return (
    <div className="relative antialiased min-h-screen flex flex-col lg:flex-row overflow-x-hidden">
      {/* Visual Storytelling Pane (Left side 1:1) */}
      <div className="relative w-full lg:w-1/2 min-h-[320px] lg:min-h-screen flex items-center justify-center p-6 sm:p-10 lg:p-16 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBsKo7nPFMGbrDerhTTB15oK1jEOGduOKXB95Az8OflgwaZx-gqOdVmOp0z82LbCecOO7y-cny2hIUMsKm6iwhBo6If2cm7ZfYfWd24ONEj38SxQvb2VRCZn0nRlocc3elKJNx_ZHN5fvlQkjk7Wj-QA4fS3RGCH8ScMy8ajeOqbStslfcgw0hTaVSByZnpy9HTBwW-gx61GwyzZITiioj1R9T5pz4qhEUPSOoBj3eoeC0iOxUSJEdoTOPYLbZE5X6QencsH31kiJzr')" }}
        />
        
        {/* Vignette / Darkening overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/50 to-transparent z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent lg:bg-gradient-to-l lg:from-surface-container-lowest lg:via-transparent z-0" />
        
        {/* Lore Text */}
        <div className="relative z-10 max-w-lg text-left self-end lg:self-center pb-6 lg:pb-0">
          <span className="material-symbols-outlined text-primary text-4xl sm:text-5xl mb-4 opacity-80">auto_awesome</span>
          <h1 className="font-display-lg text-3xl sm:text-4xl lg:text-display-lg text-primary-fixed drop-shadow-[0_0_12px_rgba(233,195,73,0.6)] mb-3 sm:mb-4">
            Ledger of the Wanderers
          </h1>
          <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-md">
            Every great adventure requires an accurate accounting. Forge your legacy, track your bounties, and uncover the wealth of forgotten realms. Your chronicle begins here.
          </p>
        </div>
      </div>

      {/* Interactive Canvas (Right side Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-surface-container-lowest relative min-h-[500px]">
        {/* Stone Tablet Form Container */}
        <div className="w-full max-w-md bg-surface-container border border-outline-variant/40 rounded-xl p-6 sm:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] relative z-10 my-auto">
          <div className="text-center mb-8">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-2">Chronicle Creation</h2>
            <p className="font-label-sm text-label-sm text-outline uppercase tracking-widest">Register as a New Scribe</p>
          </div>
          
          <SignupForm />

        </div>
      </div>
    </div>
  )
}
