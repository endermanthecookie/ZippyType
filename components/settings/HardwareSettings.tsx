
import React from 'react';
import KeyboardTester from '../KeyboardTester';

interface HardwareSettingsProps {
  calibratedKeys: Set<string>;
  setCalibratedKeys: (keys: Set<string>) => void;
  keyMappings: Record<string, string>;
  setKeyMappings: (mappings: Record<string, string>) => void;
  problemKeys: string[];
  setProblemKeys: (keys: string[]) => void;
}

const HardwareSettings: React.FC<HardwareSettingsProps> = ({
  calibratedKeys,
  setCalibratedKeys,
  keyMappings,
  setKeyMappings,
  problemKeys,
  setProblemKeys
}) => {
  return (
    <div className="glass rounded-[2rem] p-10 border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
      <KeyboardTester 
        testedKeys={calibratedKeys} 
        onTestedKeysChange={setCalibratedKeys} 
        mappings={keyMappings} 
        onMappingChange={setKeyMappings}
        problemKeys={problemKeys}
        onResetProblemKeys={() => setProblemKeys([])}
      />
    </div>
  );
};

export default HardwareSettings;
