import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export default function SplashScreen() {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if this is the first app launch
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = localStorage.getItem('app_has_launched');
        
        if (hasLaunched === 'true') {
          // App already launched, go directly to home
          navigate('/home', { replace: true });
          return;
        }

        // Mark app as launched
        localStorage.setItem('app_has_launched', 'true');
        
        // Show splash for 2.5 seconds on first launch only
        await new Promise(resolve => setTimeout(resolve, 2500));
        setIsReady(true);
        navigate('/home', { replace: true });
      } catch (error) {
        console.error('Error checking first launch:', error);
        // Fallback: always navigate after timeout
        await new Promise(resolve => setTimeout(resolve, 2500));
        setIsReady(true);
        navigate('/home', { replace: true });
      }
    };

    checkFirstLaunch();

    // Listen for app resume (optional: could show splash again on resume)
    if (Capacitor.isNativePlatform()) {
      App.addListener('appStateChange', ({ isActive }) => {
        // You could add logic here if needed
      });
    }

    return () => {
      // Cleanup listeners
      if (Capacitor.isNativePlatform()) {
        App.removeAllListeners();
      }
    };
  }, [navigate]);

  return (
    <main className="relative flex flex-col items-center justify-between w-full h-screen min-h-screen bg-black mesh-gradient overflow-hidden">
      {/* Top Visual Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#06C167]/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-on-primary-container/10 rounded-full blur-[100px]"></div>
      
      {/* Spacer for centering layout */}
      <div className="flex-1"></div>
      
      {/* Central Branding Section */}
      <div className="relative flex flex-col items-center z-10">
        {/* Glow Effect behind Logo */}
        <div className="absolute inset-0 logo-glow scale-[2.5] -z-10"></div>
        
        {/* App Logo: Industrial Shield Icon */}
        <div className="relative w-[120px] h-[120px] flex items-center justify-center bg-gradient-to-br from-primary to-on-primary-container rounded-[2rem] shadow-[0px_20px_60px_rgba(0,46,106,0.6)] ring-1 ring-white/20">
          <span className="material-symbols-outlined text-on-primary text-6xl" style={{ fontVariationSettings: '"FILL" 1' }}>
            shield_with_heart
          </span>
          {/* Abstract BLE/RFID Waves overlays */}
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
            <span className="material-symbols-outlined text-on-primary text-8xl scale-125">
              wifi_tethering
            </span>
          </div>
        </div>
        
        {/* App Identity */}
        <div className="mt-10 text-center">
          <h1 className="font-headline text-[28px] font-extrabold tracking-tight text-white leading-none mb-3">
            ToolTracker Pro
          </h1>
          <p className="font-body text-sm font-medium tracking-wide text-outline uppercase tracking-[0.1em]">
            RFID + BLE Hybrid Tracking
          </p>
        </div>
      </div>
      
      {/* Footer / Credits */}
      <div className="flex-1 flex flex-col justify-end items-center pb-12 w-full px-8">
        <div className="flex flex-col items-center space-y-4">
          {/* Loading Indicator (Industrial style) */}
          <div className="w-12 h-[2px] bg-black-container-highest rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-primary rounded-full animate-pulse"></div>
          </div>
          
          {/* Partnership Badge */}
          <div className="flex items-center space-y-1 flex-col opacity-60">
            <span className="font-label text-[10px] font-bold uppercase tracking-[0.15em] text-outline">
              Powered by
            </span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[#06C167] text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>
                bolt
              </span>
              <span className="font-headline text-xs font-bold text-white tracking-tight">
                Supabase
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mock status bar */}
      <div className="absolute top-0 left-0 w-full h-12 flex justify-between items-center px-8 pt-4 opacity-40">
        <span className="text-xs font-bold">9:41</span>
        <div className="flex gap-1.5 items-center">
          <span className="material-symbols-outlined text-[14px]">signal_cellular_alt</span>
          <span className="material-symbols-outlined text-[14px]">wifi</span>
          <span className="material-symbols-outlined text-[14px]">battery_very_low</span>
        </div>
      </div>
    </main>
  );
}
