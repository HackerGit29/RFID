import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import SwipeGesture from '../components/SwipeGesture';
import { Tool } from '../types';

const sampleTool: Tool = {
  id: '1',
  name: 'Perceuse Bosch GSR 18V',
  category: 'Électroportatif',
  serialNumber: 'GSR-2024-001',
  rfidEnabled: true,
  bleEnabled: false,
  status: 'available',
  assignedTo: 'Jean Dupont',
  location: 'Bâtiment A · Labo 3',
  price: 149.00,
  state: 'authorized',
};

export default function ToolDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <SwipeGesture onSwipeLeft={handleBack}>
    <div className="bg-black font-body text-white antialiased select-none">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 glass-header flex justify-between items-center px-6 h-16 max-w-none">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer active:scale-95 duration-200"
          >
            <span className="material-symbols-outlined text-blue-200">arrow_back_ios_new</span>
          </button>
          <span className="font-headline font-bold tracking-tight text-xl text-blue-100">
            Détails de l'outil
          </span>
        </div>
        <div className="flex items-center gap-6">
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer active:scale-95 duration-200">
            <span className="material-symbols-outlined text-blue-200" style={{ fontVariationSettings: '"FILL" 1' }}>
              favorite
            </span>
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer active:scale-95 duration-200">
            <span className="material-symbols-outlined text-blue-200">settings</span>
          </button>
        </div>
      </nav>

      <main className="relative min-h-screen pb-40">
        {/* Hero Section */}
        <section className="relative w-full h-[320px] overflow-hidden">
          <img
            alt={sampleTool.name}
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAL4mRGkygPuza33-O66QWR-CYFIkHyMTV5u4sqdFQ8hTfrR4yUGHKkxKWxGB1zptnD1eQg_itr_V-SXtpbOu1KTUbjCv6N3SIwDk3rRx5QZYTJ1tyvxVSX5wnzFNm489_XwdzpBeXbvwl0lzcyMd3vW2IxM3hZyAHJgbWxW6dRr58sCGIaZFM258RTcMG_CgEB_ERRNJdXruet_qQlnljPoJm8ut4N3CpynnB4uwhep21SFmot18wA52XVn80Opb-BNm44YMQoLdug"
          />
          {/* Hero Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          
          {/* Hero Content */}
          <div className="absolute bottom-12 left-0 w-full px-6 flex justify-between items-end">
            <div className="space-y-1">
              <p className="font-label text-xs font-bold uppercase tracking-widest text-[#06C167]">
                {sampleTool.category}
              </p>
              <h1 className="font-headline text-3xl font-extrabold text-white tracking-tight">
                {sampleTool.name}
              </h1>
            </div>
            <div className="p-3 bg-white/5/40 rounded-full backdrop-blur-md active:scale-90 duration-150 cursor-pointer">
              <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: '"FILL" 1' }}>
                favorite
              </span>
            </div>
          </div>
        </section>

        {/* Draggable Bottom Sheet */}
        <section className="bottom-sheet fixed bottom-0 left-0 right-0 h-[574px] rounded-t-[32px] shadow-2xl overflow-y-auto z-40 border-t border-outline-variant/10">
          {/* Drag Handle */}
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-10 h-1 rounded-full bg-secondary-fixed-dim/20"></div>
          </div>

          <div className="px-6 py-4 space-y-8">
            {/* Quick Actions */}
            <div className="flex justify-between items-center gap-2">
              <div className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-[#06C167] flex items-center justify-center text-black active:scale-90 transition-all">
                  <span className="material-symbols-outlined text-2xl">location_on</span>
                </div>
                <span className="font-label text-[10px] font-bold uppercase text-white/70">
                  Localiser
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1 cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 transition-all">
                  <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
                </div>
                <span className="font-label text-[10px] font-bold uppercase text-white/70">
                  Check-out
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1 cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 transition-all">
                  <span className="material-symbols-outlined text-2xl">edit</span>
                </div>
                <span className="font-label text-[10px] font-bold uppercase text-white/70">
                  Modifier
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1 cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 transition-all">
                  <span className="material-symbols-outlined text-2xl">report_problem</span>
                </div>
                <span className="font-label text-[10px] font-bold uppercase text-white/70">
                  Signaler
                </span>
              </div>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-4 rounded-xl space-y-2">
                <p className="font-label text-[10px] font-bold uppercase text-white/70">
                  Statut
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#06C167]"></span>
                  <span className="font-body font-semibold text-[#06C167]">
                    {sampleTool.status === 'available' ? 'Disponible' : sampleTool.status}
                  </span>
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl space-y-2">
                <p className="font-label text-[10px] font-bold uppercase text-white/70">
                  Localisation
                </p>
                <p className="font-body font-semibold truncate text-white">
                  {sampleTool.location || 'N/A'}
                </p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl space-y-2">
                <p className="font-label text-[10px] font-bold uppercase text-white/70">
                  Attribution
                </p>
                <p className="font-body font-semibold text-white">
                  {sampleTool.assignedTo || 'Non assigné'}
                </p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl space-y-2">
                <p className="font-label text-[10px] font-bold uppercase text-white/70">
                  Valeur
                </p>
                <p className="font-body font-semibold text-white">
                  €{sampleTool.price.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Technology Badges */}
            <div className="space-y-4">
              <h3 className="font-headline font-bold text-sm text-white tracking-wide uppercase">
                Connectivité Industrielle
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">nfc</span>
                    <div>
                      <p className="font-body font-bold text-sm">Puce RFID</p>
                      <p className="font-body text-xs text-white/70">
                        {sampleTool.rfidEnabled ? 'Configuré & Actif' : 'Non équipé'}
                      </p>
                    </div>
                  </div>
                  {sampleTool.rfidEnabled ? (
                    <span className="material-symbols-outlined text-[#06C167]" style={{ fontVariationSettings: '"FILL" 1' }}>
                      check_circle
                    </span>
                  ) : (
                    <button className="px-4 py-1.5 bg-[#06C167] text-black rounded-full text-xs font-bold active:scale-95 transition-all">
                      AJOUTER
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3 text-white/70">
                    <span className="material-symbols-outlined">bluetooth</span>
                    <div>
                      <p className="font-body font-bold text-sm">Balise BLE</p>
                      <p className="font-body text-xs">
                        {sampleTool.bleEnabled ? 'Configuré & Actif' : 'Non équipé'}
                      </p>
                    </div>
                  </div>
                  {!sampleTool.bleEnabled && (
                    <button className="px-4 py-1.5 bg-[#06C167] text-black rounded-full text-xs font-bold active:scale-95 transition-all">
                      AJOUTER
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Movement History */}
            <div className="space-y-4">
              <h3 className="font-headline font-bold text-sm text-white tracking-wide uppercase">
                Historique Mouvements
              </h3>
              <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
                <div className="relative pl-8 flex justify-between items-start">
                  <span className="absolute left-0 top-1 w-[24px] h-[24px] bg-white/10 rounded-full border-4 border-background flex items-center justify-center z-10"></span>
                  <div>
                    <p className="font-body font-bold text-sm">Check-in</p>
                    <p className="font-body text-xs text-white/70">
                      Retourné par Jean Dupont
                    </p>
                  </div>
                  <span className="font-label text-[10px] text-white/70 pt-1">
                    AUJOURD'HUI 09:15
                  </span>
                </div>
                <div className="relative pl-8 flex justify-between items-start">
                  <span className="absolute left-0 top-1 w-[24px] h-[24px] bg-white/10 rounded-full border-4 border-background flex items-center justify-center z-10"></span>
                  <div>
                    <p className="font-body font-bold text-sm">Check-out</p>
                    <p className="font-body text-xs text-white/70">
                      Emprunté par Marc V.
                    </p>
                  </div>
                  <span className="font-label text-[10px] text-white/70 pt-1">
                    HIER 14:30
                  </span>
                </div>
              </div>
            </div>

            {/* Destructive Actions */}
            <div className="pt-4 pb-8">
              <button className="w-full py-4 text-error font-bold text-sm uppercase tracking-widest bg-error-container/10 rounded-xl active:bg-error-container/20 transition-all">
                Marquer comme perdu
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Nav */}
      <BottomNav activeTab="inventory" />
    </div>
    </SwipeGesture>
  );
}
