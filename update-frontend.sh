#!/bin/bash

# Frontend uygulamasının kaynak kodunu güncelle
ssh user@172.41.42.51 "cd /path/to/kentkonut-frontend && \
  sed -i 's|return window.location.origin|return \"http://172.41.42.51:3021\"|g' src/config/ports.ts && \
  npm run build && \
  docker restart kentkonut-frontend"