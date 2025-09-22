'use client';

import { useState } from 'react';
import PageCreateForm from './PageCreateForm';
import UnifiedPageCreator from '../components/UnifiedPageCreator';
import PageCreationModeSelector from '../components/PageCreationModeSelector';

type CreationMode = 'selector' | 'simple' | 'advanced';

export default function NewPagePage() {
  const [mode, setMode] = useState<CreationMode>('selector');

  const handleModeSelect = (selectedMode: 'simple' | 'advanced') => {
    setMode(selectedMode);
  };

  const handleModeSwitch = () => {
    setMode(mode === 'simple' ? 'advanced' : 'simple');
  };

  const handleBackToSelector = () => {
    setMode('selector');
  };

  switch (mode) {
    case 'selector':
      return <PageCreationModeSelector onModeSelect={handleModeSelect} />;

    case 'simple':
      return (
        <PageCreateForm
          onModeSwitch={handleModeSwitch}
          showModeSwitch={true}
        />
      );

    case 'advanced':
      return (
        <UnifiedPageCreator
          onModeSwitch={handleModeSwitch}
          showModeSwitch={true}
        />
      );

    default:
      return <PageCreationModeSelector onModeSelect={handleModeSelect} />;
  }
}
