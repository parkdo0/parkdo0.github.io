---
layout: archive
title: "카테고리"
permalink: /categories/
author_profile: true
---

<div class="folder-structure">
  {% comment %} 카테고리 매핑 {% endcomment %}
  {% assign category_display_map = "Work-Experience:실무 경험,Learning:학습 & 최신 기술,CS-Knowledge:CS 기초 지식,Toy-Projects:토이 프로젝트,Troubleshooting:문제 해결" | split: "," %}
  
  {% comment %} 표시 순서 {% endcomment %}
  {% assign category_order = "Work-Experience,Learning,CS-Knowledge,Toy-Projects,Troubleshooting" | split: "," %}
  
  {% for category_key in category_order %}
    {% assign category_display = category_key %}
    {% for map_item in category_display_map %}
      {% assign map_parts = map_item | split: ":" %}
      {% if map_parts[0] == category_key %}
        {% assign category_display = map_parts[1] %}
        {% break %}
      {% endif %}
    {% endfor %}
    
    {% assign category_posts = site.categories[category_key] %}
    {% if category_posts.size > 0 %}
      <div class="folder-item">
        <div class="folder-header" data-folder-toggle>
          <span class="folder-icon">📁</span>
          <h2 class="folder-title">{{ category_display }}</h2>
          <span class="folder-count">({{ category_posts.size }})</span>
          <span class="folder-arrow">▼</span>
        </div>
        <div class="folder-content">
          <ul class="folder-posts">
            {% for post in category_posts %}
              <li class="folder-post-item">
                <a href="{{ post.url | relative_url }}" class="folder-post-link">
                  <span class="folder-post-icon">📄</span>
                  <span class="folder-post-title">{{ post.title }}</span>
                  <span class="folder-post-date">{{ post.date | date: "%Y.%m.%d" }}</span>
                </a>
              </li>
            {% endfor %}
          </ul>
        </div>
      </div>
    {% else %}
      <div class="folder-item folder-empty">
        <div class="folder-header">
          <span class="folder-icon">📁</span>
          <h2 class="folder-title">{{ category_display }}</h2>
          <span class="folder-count">(0)</span>
        </div>
        <div class="folder-content">
          <p class="folder-empty-text">(추후 작성)</p>
        </div>
      </div>
    {% endif %}
  {% endfor %}
  
  {% comment %} 매핑되지 않은 기존 카테고리들 {% endcomment %}
  {% for category in site.categories %}
    {% assign is_mapped = false %}
    {% for category_key in category_order %}
      {% if category_key == category[0] %}
        {% assign is_mapped = true %}
        {% break %}
      {% endif %}
    {% endfor %}
    
    {% unless is_mapped %}
      <div class="folder-item">
        <div class="folder-header" data-folder-toggle>
          <span class="folder-icon">📁</span>
          <h2 class="folder-title">{{ category[0] }}</h2>
          <span class="folder-count">({{ category[1] | size }})</span>
          <span class="folder-arrow">▼</span>
        </div>
        <div class="folder-content">
          <ul class="folder-posts">
            {% for post in category[1] %}
              <li class="folder-post-item">
                <a href="{{ post.url | relative_url }}" class="folder-post-link">
                  <span class="folder-post-icon">📄</span>
                  <span class="folder-post-title">{{ post.title }}</span>
                  <span class="folder-post-date">{{ post.date | date: "%Y.%m.%d" }}</span>
                </a>
              </li>
            {% endfor %}
          </ul>
        </div>
      </div>
    {% endunless %}
  {% endfor %}
</div>

<script>
  // Folder toggle functionality
  document.addEventListener('DOMContentLoaded', function() {
    const folderHeaders = document.querySelectorAll('[data-folder-toggle]');
    folderHeaders.forEach(header => {
      header.addEventListener('click', function() {
        const folderItem = this.closest('.folder-item');
        const folderContent = folderItem.querySelector('.folder-content');
        const arrow = this.querySelector('.folder-arrow');
        
        folderItem.classList.toggle('folder-open');
        if (folderItem.classList.contains('folder-open')) {
          arrow.textContent = '▲';
        } else {
          arrow.textContent = '▼';
        }
      });
    });
    
    // Open all folders by default
    folderHeaders.forEach(header => {
      const folderItem = header.closest('.folder-item');
      if (!folderItem.classList.contains('folder-empty')) {
        folderItem.classList.add('folder-open');
        header.querySelector('.folder-arrow').textContent = '▲';
      }
    });
  });
</script>
