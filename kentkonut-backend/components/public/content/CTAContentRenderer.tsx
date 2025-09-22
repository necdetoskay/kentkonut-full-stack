"use client";

import { SafeHtmlRenderer } from '@/components/content/SafeHtmlRenderer';
import { ArrowRight, ExternalLink, Phone, Mail, Download, Play } from 'lucide-react';

interface CTAContentProps {
  content: {
    id: string;
    title?: string;
    content?: string;
    config?: {
      buttons?: Array<{
        text: string;
        url: string;
        style?: 'primary' | 'secondary' | 'outline' | 'ghost';
        icon?: 'arrow' | 'external' | 'phone' | 'mail' | 'download' | 'play';
        target?: '_blank' | '_self';
        size?: 'small' | 'medium' | 'large';
      }>;
      layout?: 'horizontal' | 'vertical' | 'center';
      backgroundColor?: string;
      textColor?: string;
      alignment?: 'left' | 'center' | 'right';
    };
    caption?: string;
  };
}

export function CTAContentRenderer({ content }: CTAContentProps) {
  const buttons = content.config?.buttons || [];
  const layout = content.config?.layout || 'horizontal';
  const backgroundColor = content.config?.backgroundColor;
  const textColor = content.config?.textColor;
  const alignment = content.config?.alignment || 'center';

  if (buttons.length === 0) {
    return (
      <div className="mb-6">
        <div className="flex flex-col items-center justify-center py-8 bg-gray-50 text-gray-500 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-4xl mb-2">👆</div>
          <p>Bu CTA bloğunda buton bulunmuyor</p>
        </div>
      </div>
    );
  }

  const getIconComponent = (iconType?: string) => {
    switch (iconType) {
      case 'arrow':
        return <ArrowRight className="w-5 h-5" />;
      case 'external':
        return <ExternalLink className="w-5 h-5" />;
      case 'phone':
        return <Phone className="w-5 h-5" />;
      case 'mail':
        return <Mail className="w-5 h-5" />;
      case 'download':
        return <Download className="w-5 h-5" />;
      case 'play':
        return <Play className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getButtonStyles = (style?: string, size?: string) => {
    let baseStyles = "inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ";
    
    // Size styles
    switch (size) {
      case 'small':
        baseStyles += "px-4 py-2 text-sm ";
        break;
      case 'large':
        baseStyles += "px-8 py-4 text-lg ";
        break;
      case 'medium':
      default:
        baseStyles += "px-6 py-3 text-base ";
        break;
    }

    // Style variants
    switch (style) {
      case 'primary':
        baseStyles += "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg ";
        break;
      case 'secondary':
        baseStyles += "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-md hover:shadow-lg ";
        break;
      case 'outline':
        baseStyles += "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500 ";
        break;
      case 'ghost':
        baseStyles += "text-blue-600 hover:bg-blue-50 focus:ring-blue-500 ";
        break;
      default:
        baseStyles += "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg ";
        break;
    }

    return baseStyles;
  };

  const getContainerStyles = () => {
    let styles = "rounded-lg p-6 ";
    
    if (backgroundColor) {
      styles += `bg-[${backgroundColor}] `;
    } else {
      styles += "bg-gradient-to-r from-blue-50 to-indigo-50 ";
    }

    if (textColor) {
      styles += `text-[${textColor}] `;
    }

    switch (alignment) {
      case 'left':
        styles += "text-left ";
        break;
      case 'right':
        styles += "text-right ";
        break;
      case 'center':
      default:
        styles += "text-center ";
        break;
    }

    return styles;
  };

  const getButtonContainerStyles = () => {
    let styles = "flex ";
    
    switch (layout) {
      case 'vertical':
        styles += "flex-col space-y-3 ";
        break;
      case 'center':
        styles += "flex-wrap justify-center gap-3 ";
        break;
      case 'horizontal':
      default:
        styles += "flex-wrap gap-3 ";
        break;
    }

    switch (alignment) {
      case 'left':
        styles += "justify-start ";
        break;
      case 'right':
        styles += "justify-end ";
        break;
      case 'center':
      default:
        if (layout !== 'center') styles += "justify-center ";
        break;
    }

    return styles;
  };

  return (
    <div className="mb-6">
      <div className={getContainerStyles()}>
        {/* CTA Title */}
        {content.title && (
          <h3 className="text-2xl font-bold mb-4">
            {content.title}
          </h3>
        )}

        {/* CTA Content */}
        {content.content && content.content.trim() !== '' && (
          <div className="mb-6 max-w-none">
            <SafeHtmlRenderer
              content={content.content}
              className=""
            />
          </div>
        )}

        {/* CTA Buttons */}
        <div className={getButtonContainerStyles()}>
          {buttons.map((button, index) => {
            const IconComponent = getIconComponent(button.icon);
            
            return (
              <a
                key={index}
                href={button.url}
                target={button.target || '_self'}
                rel={button.target === '_blank' ? 'noopener noreferrer' : undefined}
                className={getButtonStyles(button.style, button.size)}
              >
                {button.text}
                {IconComponent && IconComponent}
              </a>
            );
          })}
        </div>

        {/* CTA Caption */}
        {content.caption && (
          <p className="mt-4 text-sm opacity-80">
            {content.caption}
          </p>
        )}
      </div>
    </div>
  );
}
