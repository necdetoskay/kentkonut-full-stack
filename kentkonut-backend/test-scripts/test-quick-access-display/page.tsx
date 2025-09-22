'use client';

import { useState, useEffect } from 'react';
import { QuickAccessDisplay } from '@/components/quick-access/QuickAccessDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface TestModule {
  id: string | number;
  title: string;
  type: 'page' | 'news' | 'project' | 'department';
  hasQuickAccess?: boolean;
}

export default function TestQuickAccessDisplayPage() {
  const [modules, setModules] = useState<TestModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<TestModule | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch modules with hasQuickAccess enabled
  const fetchModules = async () => {
    try {
      setLoading(true);
      
      // Fetch pages
      const pagesResponse = await fetch('/api/pages');
      const pagesData = await pagesResponse.json();
      const pages = pagesData.data?.filter((p: any) => p.hasQuickAccess) || [];
      
      // Fetch projects
      const projectsResponse = await fetch('/api/projects');
      const projectsData = await projectsResponse.json();
      const projects = projectsData.data?.filter((p: any) => p.hasQuickAccess) || [];
      
      // Fetch departments
      const departmentsResponse = await fetch('/api/departments');
      const departments = departmentsResponse.ok ? await departmentsResponse.json() : [];
      const filteredDepartments = departments.filter((d: any) => d.hasQuickAccess) || [];
      
      const allModules: TestModule[] = [
        ...pages.map((p: any) => ({ id: p.id, title: p.title, type: 'page' as const, hasQuickAccess: p.hasQuickAccess })),
        ...projects.map((p: any) => ({ id: p.id, title: p.title, type: 'project' as const, hasQuickAccess: p.hasQuickAccess })),
        ...filteredDepartments.map((d: any) => ({ id: d.id, title: d.name, type: 'department' as const, hasQuickAccess: d.hasQuickAccess }))
      ];
      
      setModules(allModules);
      
      // Auto-select first module if available
      if (allModules.length > 0) {
        setSelectedModule(allModules[0]);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          QuickAccessDisplay Component Test
        </h1>
        <p className="text-gray-600">
          Hızlı erişim linklerini farklı varyantlarda test edin
        </p>
      </div>

      {/* Module Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Test Modülü Seçin</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Select 
              value={selectedModule ? `${selectedModule.type}-${selectedModule.id}` : ''} 
              onValueChange={(value) => {
                const [type, id] = value.split('-');
                const module = modules.find(m => m.type === type && m.id.toString() === id);
                setSelectedModule(module || null);
              }}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Bir modül seçin..." />
              </SelectTrigger>
              <SelectContent>
                {modules.map((module) => (
                  <SelectItem key={`${module.type}-${module.id}`} value={`${module.type}-${module.id}`}>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {module.type}
                      </Badge>
                      <span>{module.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {modules.length === 0 && (
              <p className="text-gray-500">
                Henüz hasQuickAccess aktif olan modül bulunamadı. 
                Admin panelden bir sayfa, proje veya birim için hızlı erişimi aktifleştirin.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedModule && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Test Edilen Modül: {selectedModule.title}
            </h2>
            <Badge variant="outline">{selectedModule.type}</Badge>
          </div>

          {/* Default Variant */}
          <div>
            <h3 className="text-lg font-medium mb-3">Default Variant</h3>
            <QuickAccessDisplay 
              moduleType={selectedModule.type}
              moduleId={selectedModule.id}
              variant="default"
              showCount={true}
            />
          </div>

          {/* Compact Variant */}
          <div>
            <h3 className="text-lg font-medium mb-3">Compact Variant</h3>
            <QuickAccessDisplay 
              moduleType={selectedModule.type}
              moduleId={selectedModule.id}
              variant="compact"
              showCount={true}
            />
          </div>

          {/* Sidebar Variant */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Sidebar Variant</h3>
              <QuickAccessDisplay 
                moduleType={selectedModule.type}
                moduleId={selectedModule.id}
                variant="sidebar"
                showCount={true}
              />
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ana İçerik Alanı</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Bu alan ana içeriği temsil eder. Sidebar variant genellikle 
                    bu tür ana içerik alanlarının yanında kullanılır.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Inline Variant */}
          <div>
            <h3 className="text-lg font-medium mb-3">Inline Variant</h3>
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  Bu bir örnek paragraftır. İçerik içinde inline hızlı erişim linkleri şu şekilde görünür:
                </p>
                <QuickAccessDisplay 
                  moduleType={selectedModule.type}
                  moduleId={selectedModule.id}
                  variant="inline"
                  title="İlgili Linkler"
                  showCount={true}
                />
                <p className="text-gray-600 mt-4">
                  Inline variant genellikle içerik içinde veya alt kısımlarda kullanılır.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Limited Items */}
          <div>
            <h3 className="text-lg font-medium mb-3">Limited Items (Max 2)</h3>
            <QuickAccessDisplay 
              moduleType={selectedModule.type}
              moduleId={selectedModule.id}
              variant="default"
              maxItems={2}
              showCount={true}
              title="En Önemli Linkler"
            />
          </div>
        </div>
      )}
    </div>
  );
}
