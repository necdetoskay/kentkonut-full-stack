import React, { useEffect, useRef } from 'react';

interface TiptapContentRendererProps {
  content: string;
  className?: string;
}

/**
 * TiptapContentRenderer - Renders TipTap HTML content using Universal Styles
 *
 * This component renders TipTap editor output using the universal CSS approach
 * from the TipTap integration folder. It applies the .tiptap-render class which
 * provides consistent styling between editor and frontend preview.
 *
 * Key Features:
 * - Uses .tiptap-render class for consistent styling
 * - Relies on universal CSS file for floating image support
 * - Perfect consistency between editor and preview
 * - Standard TipTap integration approach
 */
export const TiptapContentRenderer: React.FC<TiptapContentRendererProps> = ({
  content,
  className = ''
}) => {
  // Apply tiptap-render class for universal styling consistency
  const combinedClassName = `tiptap-render ${className}`.trim();
  const containerRef = useRef<HTMLDivElement>(null);

  // Industry Standard: CSS-only approach (no JavaScript enforcement)
  // This provides better performance and follows modern best practices

  return (
    <div
      ref={containerRef}
      className={combinedClassName}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default TiptapContentRenderer;
