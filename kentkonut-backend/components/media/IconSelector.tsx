"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

// Get all icon names from Lucide
const iconNames = Object.keys(LucideIcons).filter(
  (key) => key !== "createLucideIcon" && key !== "default"
);

interface IconSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function IconSelector({ value, onChange }: IconSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get the selected icon component
  const SelectedIcon = value ? (LucideIcons as any)[value] : null;
  
  // Filter icons based on search query
  const filteredIcons = iconNames.filter((name) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <Button
        variant="outline"
        className="w-full flex justify-between items-center h-20"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-2">
          {SelectedIcon ? (
            <>
              <SelectedIcon className="h-6 w-6" />
              <span>{value}</span>
            </>
          ) : (
            <span className="text-muted-foreground">İkon Seçin</span>
          )}
        </div>
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>İkon Seçin</DialogTitle>
          </DialogHeader>
          
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="İkon ara..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <ScrollArea className="h-[50vh]">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {filteredIcons.map((iconName) => {
                const Icon = (LucideIcons as any)[iconName];
                return (
                  <Button
                    key={iconName}
                    variant="outline"
                    className={cn(
                      "h-16 flex flex-col gap-1 items-center justify-center p-2",
                      value === iconName && "border-primary bg-primary/10"
                    )}
                    onClick={() => {
                      onChange(iconName);
                      setOpen(false);
                    }}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs truncate w-full text-center">
                      {iconName}
                    </span>
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
