import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <div className={`${className} rounded-xl overflow-hidden flex items-center justify-center`}>
      <img 
        src="https://ewdrrhdsxjrhxyzgjokg.supabase.co/storage/v1/object/public/assets/logos.png" 
        alt="ZippyType Logo" 
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
