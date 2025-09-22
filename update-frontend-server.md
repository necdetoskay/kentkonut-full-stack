# Frontend API URL Güncelleme Talimatları

Sunucudaki frontend uygulamasını güncellemek için aşağıdaki adımları izleyin:

1. Sunucuya SSH ile bağlanın:
```
ssh kullanici@172.41.42.51
```

2. Frontend uygulamasının kaynak koduna gidin:
```
cd /path/to/kentkonut-frontend
```

3. `src/config/ports.ts` dosyasını düzenleyin:
```
nano src/config/ports.ts
```

4. `getApiBaseUrl` fonksiyonunda aşağıdaki değişikliği yapın:
```typescript
// Bu satırı bulun:
return window.location.origin;

// Bu satırla değiştirin:
return 'http://172.41.42.51:3021';
```

5. Değişiklikleri kaydedin ve uygulamayı yeniden derleyin:
```
npm run build
```

6. Frontend konteynerini yeniden başlatın:
```
docker restart kentkonut-frontend
```

Bu adımlar, frontend uygulamasının API çağrılarını `localhost` yerine `172.41.42.51:3021` adresine yapmasını sağlayacaktır.