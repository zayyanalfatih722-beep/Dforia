import React from "react";
import { MessageCircle } from "lucide-react";
import { useGetSettings } from "@workspace/api-client-react";

export function WhatsAppFloat() {
  const { data: settings } = useGetSettings();

  const handleClick = () => {
    const wa = settings?.whatsappNumber || "6282255994981";
    const text = encodeURIComponent("Halo D'Foria Kitchen, saya ingin bertanya tentang menu...");
    window.open(`https://wa.me/${wa}?text=${text}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-24 right-4 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center animate-in fade-in slide-in-from-bottom-8"
      aria-label="Contact via WhatsApp"
    >
      <MessageCircle size={28} />
    </button>
  );
}
