import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { RefreshCw, Database, CheckCircle, XCircle, Clock, Server } from 'lucide-react';
import { getApiBaseUrl } from '../config/ports';

interface DatabaseInfo {
  version: string;
  database_name: string;
  current_user: string;
  server_address: string;
  server_port: number;
}

interface TableCounts {
  users: number;
  news: number;
  projects: number;
  banners: number;
  media: number;
}

interface DbTestResult {
  status: 'success' | 'error';
  message: string;
  timestamp: string;
  responseTime?: string;
  database?: {
    info: DatabaseInfo;
    tables: TableCounts;
  };
  connection?: {
    status: string;
    testQuery?: any[];
  };
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}

const DbTest: React.FC = () => {
  const [testResult, setTestResult] = useState<DbTestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastTestTime, setLastTestTime] = useState<string | null>(null);

  const runDbTest = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/public/db-test`);
      const data = await response.json();
      setTestResult(data);
      setLastTestTime(new Date().toLocaleString('tr-TR'));
    } catch (error) {
      setTestResult({
        status: 'error',
        message: 'Bağlantı hatası',
        timestamp: new Date().toISOString(),
        error: {
          message: error instanceof Error ? error.message : 'Bilinmeyen hata',
          code: 'CONNECTION_ERROR'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDbTest();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'connected':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Database className="inline-block w-8 h-8 mr-3" />
            Veritabanı Test Sayfası
          </h1>
          <p className="text-gray-600">
            Sistem veritabanı bağlantısını ve durumunu kontrol edin.
          </p>
        </div>

        <div className="mb-6">
          <Button 
            onClick={runDbTest} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Test Ediliyor...' : 'Yeniden Test Et'}
          </Button>
          {lastTestTime && (
            <p className="text-sm text-gray-500 mt-2">
              Son test: {lastTestTime}
            </p>
          )}
        </div>

        {testResult && (
          <div className="space-y-6">
            {/* Genel Durum */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(testResult.status)}
                  Bağlantı Durumu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Badge className={getStatusColor(testResult.status)}>
                    {testResult.status === 'success' ? 'Başarılı' : 'Hatalı'}
                  </Badge>
                  {testResult.responseTime && (
                    <span className="text-sm text-gray-600">
                      Yanıt süresi: {testResult.responseTime}
                    </span>
                  )}
                </div>
                <p className="text-lg font-medium">{testResult.message}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Test zamanı: {new Date(testResult.timestamp).toLocaleString('tr-TR')}
                </p>
              </CardContent>
            </Card>

            {/* Veritabanı Bilgileri */}
            {testResult.database && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    Veritabanı Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Sunucu Bilgileri</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Veritabanı:</strong> {testResult.database.info.database_name}</p>
                        <p><strong>Kullanıcı:</strong> {testResult.database.info.current_user}</p>
                        <p><strong>Adres:</strong> {testResult.database.info.server_address}:{testResult.database.info.server_port}</p>
                        <p><strong>Versiyon:</strong> {testResult.database.info.version}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Tablo İstatistikleri</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Kullanıcılar:</strong> {testResult.database.tables.users} kayıt</p>
                        <p><strong>Haberler:</strong> {testResult.database.tables.news} kayıt</p>
                        <p><strong>Projeler:</strong> {testResult.database.tables.projects} kayıt</p>
                        <p><strong>Bannerlar:</strong> {testResult.database.tables.banners} kayıt</p>
                        <p><strong>Medya:</strong> {testResult.database.tables.media} kayıt</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bağlantı Detayları */}
            {testResult.connection && (
              <Card>
                <CardHeader>
                  <CardTitle>Bağlantı Detayları</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getStatusColor(testResult.connection.status)}>
                      {testResult.connection.status === 'connected' ? 'Bağlı' : 'Bağlantısız'}
                    </Badge>
                  </div>
                  {testResult.connection.testQuery && (
                    <p className="text-sm text-gray-600">
                      Test sorgusu başarıyla çalıştırıldı: {JSON.stringify(testResult.connection.testQuery)}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Hata Detayları */}
            {testResult.error && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Hata Detayları
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Hata Mesajı:</strong> {testResult.error.message}</p>
                    <p><strong>Hata Kodu:</strong> {testResult.error.code}</p>
                    {testResult.error.details && (
                      <details className="mt-4">
                        <summary className="cursor-pointer font-semibold">Teknik Detaylar</summary>
                        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(testResult.error.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!testResult && !loading && (
          <Card>
            <CardContent className="text-center py-8">
              <Database className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Veritabanı testi için "Yeniden Test Et" butonuna tıklayın.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DbTest;