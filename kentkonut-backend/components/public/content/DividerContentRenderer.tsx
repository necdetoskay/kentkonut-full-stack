"use client";

import { SafeHtmlRenderer } from '@/components/content/SafeHtmlRenderer';

interface DividerContentProps {
  content: {
    id: string;
    title?: string;
    content?: string;
    config?: {
      style?: 'line' | 'dots' | 'dashed' | 'gradient' | 'decorative' | 'text' | 'icon';
      thickness?: 'thin' | 'normal' | 'thick';
      color?: string;
      spacing?: 'compact' | 'normal' | 'relaxed';
      width?: 'narrow' | 'medium' | 'full';
      pattern?: 'solid' | 'dashed' | 'dotted' | 'double';
      text?: string;
      icon?: string;
      alignment?: 'left' | 'center' | 'right';
    };
    caption?: string;
  };
}

export function DividerContentRenderer({ content }: DividerContentProps) {
  const style = content.config?.style || 'line';
  const thickness = content.config?.thickness || 'normal';
  const color = content.config?.color || '#e5e7eb';
  const spacing = content.config?.spacing || 'normal';
  const width = content.config?.width || 'full';
  const pattern = content.config?.pattern || 'solid';
  const text = content.config?.text;
  const icon = content.config?.icon;
  const alignment = content.config?.alignment || 'center';

  const getSpacingClasses = () => {
    switch (spacing) {
      case 'compact':
        return 'my-4';
      case 'relaxed':
        return 'my-12';
      case 'normal':
      default:
        return 'my-8';
    }
  };

  const getWidthClasses = () => {
    switch (width) {
      case 'narrow':
        return 'w-1/4 mx-auto';
      case 'medium':
        return 'w-1/2 mx-auto';
      case 'full':
      default:
        return 'w-full';
    }
  };

  const getAlignmentClasses = () => {
    switch (alignment) {
      case 'left':
        return 'mr-auto';
      case 'right':
        return 'ml-auto';
      case 'center':
      default:
        return 'mx-auto';
    }
  };

  const getThicknessValue = () => {
    switch (thickness) {
      case 'thin':
        return '1px';
      case 'thick':
        return '4px';
      case 'normal':
      default:
        return '2px';
    }
  };

  const renderLineDivider = () => {
    let borderStyle = 'solid';
    switch (pattern) {
      case 'dashed':
        borderStyle = 'dashed';
        break;
      case 'dotted':
        borderStyle = 'dotted';
        break;
      case 'double':
        borderStyle = 'double';
        break;
      default:
        borderStyle = 'solid';
    }

    return (
      <div
        className={getWidthClasses()}
        style={{
          height: getThicknessValue(),
          backgroundColor: pattern === 'double' ? 'transparent' : color,
          borderTop: pattern === 'double' ? `${getThicknessValue()} double ${color}` : `${getThicknessValue()} ${borderStyle} ${color}`,
        }}
      />
    );
  };

  const renderDotsDivider = () => (
    <div className={`flex justify-center space-x-2 ${getWidthClasses()}`}>
      {[1, 2, 3].map((dot) => (
        <div
          key={dot}
          className="rounded-full"
          style={{
            width: thickness === 'thin' ? '4px' : thickness === 'thick' ? '8px' : '6px',
            height: thickness === 'thin' ? '4px' : thickness === 'thick' ? '8px' : '6px',
            backgroundColor: color,
          }}
        />
      ))}
    </div>
  );

  const renderDashedDivider = () => (
    <div className={`flex justify-center space-x-1 ${getWidthClasses()}`}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((dash) => (
        <div
          key={dash}
          style={{
            width: '8px',
            height: getThicknessValue(),
            backgroundColor: color,
          }}
        />
      ))}
    </div>
  );

  const renderGradientDivider = () => (
    <div
      className={getWidthClasses()}
      style={{
        height: getThicknessValue(),
        background: `linear-gradient(to right, transparent, ${color}, transparent)`,
      }}
    />
  );

  const renderDecorativeDivider = () => (
    <div className={`flex justify-center items-center ${getWidthClasses()}`}>
      <div
        className="flex-1"
        style={{
          height: getThicknessValue(),
          backgroundColor: color,
        }}
      />
      <div className="px-4">
        <div
          className="w-3 h-3 transform rotate-45"
          style={{
            backgroundColor: color,
          }}
        />
      </div>
      <div
        className="flex-1"
        style={{
          height: getThicknessValue(),
          backgroundColor: color,
        }}
      />
    </div>
  );

  const renderTextDivider = () => (
    <div className={`flex items-center ${getWidthClasses()}`}>
      <div
        className="flex-1"
        style={{
          height: getThicknessValue(),
          backgroundColor: color,
        }}
      />
      {text && (
        <div className="px-4">
          <span
            className="text-sm font-medium bg-white px-2"
            style={{ color: color }}
          >
            {text}
          </span>
        </div>
      )}
      <div
        className="flex-1"
        style={{
          height: getThicknessValue(),
          backgroundColor: color,
        }}
      />
    </div>
  );

  const renderIconDivider = () => (
    <div className={`flex items-center ${getWidthClasses()}`}>
      <div
        className="flex-1"
        style={{
          height: getThicknessValue(),
          backgroundColor: color,
        }}
      />
      {icon && (
        <div className="px-4">
          <span className="text-2xl" role="img" aria-label="divider icon">
            {icon}
          </span>
        </div>
      )}
      <div
        className="flex-1"
        style={{
          height: getThicknessValue(),
          backgroundColor: color,
        }}
      />
    </div>
  );

  const renderDividerByStyle = () => {
    switch (style) {
      case 'dots':
        return renderDotsDivider();
      case 'dashed':
        return renderDashedDivider();
      case 'gradient':
        return renderGradientDivider();
      case 'decorative':
        return renderDecorativeDivider();
      case 'text':
        return renderTextDivider();
      case 'icon':
        return renderIconDivider();
      case 'line':
      default:
        return renderLineDivider();
    }
  };

  return (
    <div className={`flex flex-col items-center ${getSpacingClasses()}`}>
      {/* Divider Title */}
      {content.title && (
        <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
          {content.title}
        </h3>
      )}

      {/* Additional Content Before Divider */}
      {content.content && content.content.trim() !== '' && (
        <div className="mb-4 max-w-none text-center">
          <SafeHtmlRenderer
            content={content.content}
            className=""
          />
        </div>
      )}

      {/* Divider */}
      <div className={`${getAlignmentClasses()} ${alignment === 'center' ? 'w-full flex justify-center' : ''}`}>
        <div className={alignment !== 'center' ? getWidthClasses() : ''}>
          {renderDividerByStyle()}
        </div>
      </div>

      {/* Divider Caption */}
      {content.caption && (
        <p className="mt-4 text-center text-gray-600 italic text-sm">
          {content.caption}
        </p>
      )}
    </div>
  );
}
