// ===== REACT ÖRNEK =====
// React bileşeni
import React from 'react';
import './tiptap-render.css'; // CSS dosyasını import edin

const TiptapContent = ({ htmlContent }) => {
  return (
    <div 
      className="tiptap-render"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

// Kullanım
function App() {
  const htmlFromTiptap = `
    <h2>Başlık</h2>
    <p>Bu bir paragraf.</p>
    <img src="https://picsum.photos/300/200" data-float="left" style="width: 250px;" alt="Resim" />
    <p>Bu yazı resmin yanında görünecek...</p>
  `;

  return (
    <div>
      <TiptapContent htmlContent={htmlFromTiptap} />
    </div>
  );
}

// ===== VUE.JS ÖRNEK =====
// Vue bileşeni
<template>
  <div class="tiptap-render" v-html="htmlContent"></div>
</template>

<script>
export default {
  name: 'TiptapContent',
  props: {
    htmlContent: {
      type: String,
      required: true
    }
  }
}
</script>

<style>
@import './tiptap-render.css';
</style>

// ===== ANGULAR ÖRNEK =====
// Angular bileşeni
import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-tiptap-content',
  template: `
    <div class="tiptap-render" [innerHTML]="sanitizedHtml"></div>
  `,
  styleUrls: ['./tiptap-render.css']
})
export class TiptapContentComponent {
  @Input() htmlContent: string = '';
  
  constructor(private sanitizer: DomSanitizer) {}
  
  get sanitizedHtml(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
  }
}

// ===== VANILLA JAVASCRIPT ÖRNEK =====
// Vanilla JS kullanımı
function renderTiptapContent(htmlContent, containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.className = 'tiptap-render';
    container.innerHTML = htmlContent;
  }
}

// Kullanım
const htmlFromTiptap = `
  <h2>Başlık</h2>
  <p>Bu bir paragraf.</p>
  <img src="https://picsum.photos/300/200" data-float="left" style="width: 250px;" alt="Resim" />
  <p>Bu yazı resmin yanında görünecek...</p>
`;

renderTiptapContent(htmlFromTiptap, 'content-container');

// ===== NEXT.JS ÖRNEK =====
// Next.js bileşeni
import styles from './TiptapContent.module.css';

const TiptapContent = ({ htmlContent }) => {
  return (
    <div 
      className="tiptap-render"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default TiptapContent;

// ===== NUXT.JS ÖRNEK =====
// Nuxt.js bileşeni
<template>
  <div class="tiptap-render" v-html="htmlContent"></div>
</template>

<script>
export default {
  name: 'TiptapContent',
  props: {
    htmlContent: {
      type: String,
      required: true
    }
  }
}
</script>

<style>
@import '~/assets/css/tiptap-render.css';
</style>

// ===== SVELTE ÖRNEK =====
<!-- Svelte bileşeni -->
<script>
  export let htmlContent;
</script>

<div class="tiptap-render">
  {@html htmlContent}
</div>

<style>
  @import './tiptap-render.css';
</style>

// ===== WORDPRESS / PHP ÖRNEK =====
// PHP ile kullanım
<?php
function render_tiptap_content($html_content) {
    // CSS dosyasını enqueue edin
    wp_enqueue_style('tiptap-render', get_template_directory_uri() . '/css/tiptap-render.css');
    
    // HTML'i güvenli şekilde output edin
    echo '<div class="tiptap-render">' . wp_kses_post($html_content) . '</div>';
}

// Kullanım
$html_from_tiptap = '<h2>Başlık</h2><p>İçerik...</p>';
render_tiptap_content($html_from_tiptap);
?>

// ===== LARAVEL BLADE ÖRNEK =====
<!-- Blade template -->
@push('styles')
<link rel="stylesheet" href="{{ asset('css/tiptap-render.css') }}">
@endpush

<div class="tiptap-render">
    {!! $htmlContent !!}
</div>

// ===== DJANGO TEMPLATE ÖRNEK =====
<!-- Django template -->
{% load static %}

<link rel="stylesheet" href="{% static 'css/tiptap-render.css' %}">

<div class="tiptap-render">
    {{ html_content|safe }}
</div>