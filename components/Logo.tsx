import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <img 
      src="https://ewdrrhdsxjrhxyzgjokg.supabase.co/storage/v1/object/public/assets/logo.png" 
      alt="ZippyType Logo" 
      className={`${className} object-contain`} 
      referrerPolicy="no-referrer"
    />
  );
};
