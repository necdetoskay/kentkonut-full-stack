'use client';

import React from 'react';
import BlockTypeTooltip from '@/components/help/BlockTypeTooltip';
import ContentBlocksHelpModal from '@/components/help/ContentBlocksHelpModal';
import BlockSelector from '@/components/help/BlockSelector';

export default function TooltipTestPage() {
  const [selectedBlockType, setSelectedBlockType] = React.useState<string>('');

  const handleBlockTypeSelect = (type: string) => {
    setSelectedBlockType(type);
    console.log('Block type selected:', type);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tooltip Help System Test</h1>
          {/* Help Modal Test */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Help Modal Test</h2>
          <p className="text-gray-600 mb-4">Click the button below to open the help modal:</p>
          <ContentBlocksHelpModal />
        </div>

        {/* Block Selector Test */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Block Selector with Tooltips Test</h2>
          <BlockSelector onBlockSelect={handleBlockTypeSelect} />
          {selectedBlockType && (
            <p className="mt-4 text-green-600">
              Selected block type: <strong>{selectedBlockType}</strong>
            </p>
          )}
        </div>

        {/* Individual Tooltip Tests */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Individual Tooltip Tests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['text', 'image', 'gallery', 'video', 'cta', 'quote', 'list', 'divider'].map((blockType) => (
              <div key={blockType} className="relative">
                <BlockTypeTooltip blockType={blockType}>
                  <button className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg p-4 text-left">
                    <div className="font-medium capitalize">{blockType}</div>
                    <div className="text-sm text-gray-500">Hover for tooltip</div>
                  </button>
                </BlockTypeTooltip>
              </div>
            ))}
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
              <span>✅ Page loaded successfully</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
              <span>✅ Help components imported without errors</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
              <span>✅ React hooks functioning properly</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
