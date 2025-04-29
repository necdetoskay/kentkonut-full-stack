"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderItem {
  name: string;
  path: string;
  subFolders: FolderItem[];
  sizeBytes: number;
  size: string;
  fileCount: number;
  modifiedAt: string;
}

interface FolderTreeProps {
  data: FolderItem;
  onFolderSelect: (path: string) => void;
  selectedPath: string;
  level?: number;
}

export function FolderTreeItem({ 
  data, 
  onFolderSelect, 
  selectedPath, 
  level = 0 
}: FolderTreeProps) {
  const [expanded, setExpanded] = useState(level < 1); // İlk seviye klasörleri varsayılan olarak açık
  
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  const handleFolderSelect = () => {
    onFolderSelect(data.path);
  };
  
  const isSelected = selectedPath === data.path;
  const hasSubFolders = data.subFolders && data.subFolders.length > 0;
  
  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-muted group text-sm",
          isSelected && "bg-muted text-primary"
        )}
        onClick={handleFolderSelect}
        style={{ paddingLeft: `${(level * 12) + 4}px` }}
      >
        <div className="flex items-center mr-1" onClick={handleToggleExpand}>
          {hasSubFolders ? (
            expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <span className="w-4"></span>
          )}
        </div>
        
        <div className="mr-2">
          {expanded ? (
            <FolderOpen className="h-4 w-4 text-yellow-400" />
          ) : (
            <Folder className="h-4 w-4 text-yellow-400" />
          )}
        </div>
        
        <div className="overflow-hidden whitespace-nowrap text-ellipsis flex-grow">
          {data.name}
        </div>
        
        <div className="text-muted-foreground text-xs ml-2">
          {data.fileCount} dosya | {data.size}
        </div>
      </div>
      
      {expanded && hasSubFolders && (
        <div className="ml-2">
          {data.subFolders.map((subFolder, index) => (
            <FolderTreeItem
              key={`${subFolder.path}-${index}`}
              data={subFolder}
              onFolderSelect={onFolderSelect}
              selectedPath={selectedPath}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderTree({ 
  data, 
  onFolderSelect, 
  selectedPath 
}: {
  data: FolderItem;
  onFolderSelect: (path: string) => void;
  selectedPath: string;
}) {
  return (
    <div className="bg-background border rounded-md p-2 w-full min-h-[240px] overflow-auto">
      <FolderTreeItem
        data={data}
        onFolderSelect={onFolderSelect}
        selectedPath={selectedPath}
      />
    </div>
  );
} 