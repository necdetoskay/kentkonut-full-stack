"use client";

import { SafeHtmlRenderer } from '@/components/content/SafeHtmlRenderer';
import { Check, X, AlertCircle, Info, Star, ArrowRight, ChevronRight } from 'lucide-react';

interface ListContentProps {
  content: {
    id: string;
    title?: string;
    content?: string;
    config?: {
      items?: Array<{
        text: string;
        description?: string;
        icon?: 'check' | 'x' | 'alert' | 'info' | 'star' | 'arrow' | 'chevron' | 'bullet' | 'number';
        status?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
      }>;
      listType?: 'unordered' | 'ordered' | 'checklist' | 'feature' | 'steps';
      style?: 'simple' | 'card' | 'minimal' | 'highlighted';
      columns?: 1 | 2 | 3;
      spacing?: 'compact' | 'normal' | 'relaxed';
    };
    caption?: string;
  };
}

export function ListContentRenderer({ content }: ListContentProps) {
  const items = content.config?.items || [];
  const listType = content.config?.listType || 'unordered';
  const style = content.config?.style || 'simple';
  const columns = content.config?.columns || 1;
  const spacing = content.config?.spacing || 'normal';

  if (items.length === 0) {
    return (
      <div className="mb-6">
        <div className="flex flex-col items-center justify-center py-8 bg-gray-50 text-gray-500 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-4xl mb-2">📋</div>
          <p>Bu liste bloğunda öğe bulunmuyor</p>
        </div>
      </div>
    );
  }

  const getIconComponent = (iconType?: string, status?: string) => {
    const iconProps = "w-5 h-5";
    
    switch (iconType) {
      case 'check':
        return <Check className={`${iconProps} text-green-600`} />;
      case 'x':
        return <X className={`${iconProps} text-red-600`} />;
      case 'alert':
        return <AlertCircle className={`${iconProps} text-yellow-600`} />;
      case 'info':
        return <Info className={`${iconProps} text-blue-600`} />;
      case 'star':
        return <Star className={`${iconProps} text-yellow-500 fill-current`} />;
      case 'arrow':
        return <ArrowRight className={`${iconProps} text-gray-600`} />;
      case 'chevron':
        return <ChevronRight className={`${iconProps} text-gray-600`} />;
      case 'bullet':
        return <div className="w-2 h-2 bg-gray-600 rounded-full" />;
      default:
        // Status-based colors for default icons
        const statusColors = {
          success: 'text-green-600',
          error: 'text-red-600',
          warning: 'text-yellow-600',
          info: 'text-blue-600',
          neutral: 'text-gray-600'
        } as const;
        const colorClass = status && status in statusColors 
          ? statusColors[status as keyof typeof statusColors] 
          : 'text-gray-600';
        return <div className={`w-2 h-2 bg-current rounded-full ${colorClass}`} />;
    }
  };

  const getSpacingClasses = () => {
    switch (spacing) {
      case 'compact':
        return 'space-y-2';
      case 'relaxed':
        return 'space-y-6';
      case 'normal':
      default:
        return 'space-y-4';
    }
  };

  const getColumnClasses = () => {
    switch (columns) {
      case 2:
        return 'grid grid-cols-1 md:grid-cols-2 gap-4';
      case 3:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
      case 1:
      default:
        return '';
    }
  };

  const renderSimpleList = () => (
    <div className={columns > 1 ? getColumnClasses() : `${getSpacingClasses()}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            {listType === 'ordered' ? (
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {index + 1}
              </span>
            ) : (
              getIconComponent(item.icon, item.status)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-gray-900 leading-relaxed">
              <SafeHtmlRenderer content={item.text} />
            </div>
            {item.description && (
              <div className="mt-1 text-sm text-gray-600">
                <SafeHtmlRenderer content={item.description} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderCardList = () => (
    <div className={columns > 1 ? getColumnClasses() : getSpacingClasses()}>
      {items.map((item, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {listType === 'ordered' ? (
                <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 font-semibold rounded-full">
                  {index + 1}
                </span>
              ) : (
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getIconComponent(item.icon, item.status)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-gray-900 font-medium leading-relaxed">
                <SafeHtmlRenderer content={item.text} />
              </div>
              {item.description && (
                <div className="mt-2 text-sm text-gray-600">
                  <SafeHtmlRenderer content={item.description} />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMinimalList = () => (
    <div className={columns > 1 ? getColumnClasses() : getSpacingClasses()}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-3 py-2 border-b border-gray-100 last:border-b-0">
          <div className="flex-shrink-0">
            {listType === 'ordered' ? (
              <span className="text-gray-500 font-medium min-w-[1.5rem]">
                {index + 1}.
              </span>
            ) : (
              getIconComponent(item.icon, item.status)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-gray-900 leading-relaxed">
              <SafeHtmlRenderer content={item.text} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderHighlightedList = () => (
    <div className={columns > 1 ? getColumnClasses() : getSpacingClasses()}>
      {items.map((item, index) => {
        const isSuccess = item.status === 'success' || item.icon === 'check';
        const isError = item.status === 'error' || item.icon === 'x';
        const isWarning = item.status === 'warning' || item.icon === 'alert';
        const isInfo = item.status === 'info' || item.icon === 'info';

        let bgColor = 'bg-gray-50';
        let borderColor = 'border-gray-200';

        if (isSuccess) {
          bgColor = 'bg-green-50';
          borderColor = 'border-green-200';
        } else if (isError) {
          bgColor = 'bg-red-50';
          borderColor = 'border-red-200';
        } else if (isWarning) {
          bgColor = 'bg-yellow-50';
          borderColor = 'border-yellow-200';
        } else if (isInfo) {
          bgColor = 'bg-blue-50';
          borderColor = 'border-blue-200';
        }

        return (
          <div key={index} className={`${bgColor} ${borderColor} border rounded-lg p-4`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {listType === 'ordered' ? (
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-full">
                    {index + 1}
                  </span>
                ) : (
                  getIconComponent(item.icon, item.status)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-gray-900 font-medium leading-relaxed">
                  <SafeHtmlRenderer content={item.text} />
                </div>
                {item.description && (
                  <div className="mt-2 text-sm text-gray-700">
                    <SafeHtmlRenderer content={item.description} />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderListByStyle = () => {
    switch (style) {
      case 'card':
        return renderCardList();
      case 'minimal':
        return renderMinimalList();
      case 'highlighted':
        return renderHighlightedList();
      case 'simple':
      default:
        return renderSimpleList();
    }
  };

  return (
    <div className="mb-6">
      {/* List Title */}
      {content.title && (
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {content.title}
        </h3>
      )}

      {/* Additional Content */}
      {content.content && content.content.trim() !== '' && (
        <div className="mb-6 max-w-none">
          <SafeHtmlRenderer
            content={content.content}
            className=""
          />
        </div>
      )}

      {/* List Items */}
      {renderListByStyle()}

      {/* List Caption */}
      {content.caption && (
        <p className="mt-4 text-center text-gray-600 italic text-sm">
          {content.caption}
        </p>
      )}
    </div>
  );
}
