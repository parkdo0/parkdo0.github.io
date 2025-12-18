---
layout: archive
title: "카테고리"
permalink: /categories/
author_profile: true
---

<div class="folder-structure">
  {% comment %} 카테고리 매핑 {% endcomment %}
  {% assign category_display_map = "Work-Experience:실무 경험,Learning:학습 & 최신 기술,CS-Knowledge:CS 기초 지식,Toy-Projects:토이 프로젝트,Troubleshooting:문제 해결,Frontend:프론트엔드,Vue3:Vue3,PM:PM,ProjectManagement:프로젝트 관리" | split: "," %}
  
  {% comment %} 표시 순서 {% endcomment %}
  {% assign category_order = "Work-Experience,Learning,Frontend,Vue3,PM,ProjectManagement,CS-Knowledge,Toy-Projects,Troubleshooting" | split: "," %}
  
  {% comment %} 모든 포스트를 순회하며 첫 번째 카테고리에만 할당 {% endcomment %}
  {% assign posts_by_category = "" | split: "," %}
  
  {% for post in site.posts %}
    {% assign post_categories = post.categories %}
    {% if post_categories.size > 0 %}
      {% assign first_category = post_categories[0] %}
      {% assign category_found = false %}
      
      {% comment %} 이미 해당 카테고리에 할당되었는지 확인 {% endcomment %}
      {% for category_key in category_order %}
        {% if category_key == first_category %}
          {% assign category_found = true %}
          {% break %}
        {% endif %}
      {% endfor %}
      
      {% if category_found %}
        {% comment %} 카테고리별로 포스트 그룹화 (간단한 방법) {% endcomment %}
        {% assign category_posts = site.categories[first_category] %}
        {% for cat_post in category_posts %}
          {% if cat_post.url == post.url %}
            {% assign posts_by_category = posts_by_category | push: post %}
            {% break %}
          {% endif %}
        {% endfor %}
      {% endif %}
    {% endif %}
  {% endfor %}
  
  {% for category_key in category_order %}
    {% assign category_display = category_key %}
    {% for map_item in category_display_map %}
      {% assign map_parts = map_item | split: ":" %}
      {% if map_parts[0] == category_key %}
        {% assign category_display = map_parts[1] %}
        {% break %}
      {% endif %}
    {% endfor %}
    
    {% comment %} 해당 카테고리의 포스트 중 첫 번째 카테고리가 이 카테고리인 것만 필터링 {% endcomment %}
    {% assign category_posts_filtered = "" | split: "," %}
    {% assign category_posts = site.categories[category_key] %}
    
    {% for post in category_posts %}
      {% assign post_first_category = post.categories[0] %}
      {% if post_first_category == category_key %}
        {% assign category_posts_filtered = category_posts_filtered | push: post %}
      {% endif %}
    {% endfor %}
    
    {% if category_posts_filtered.size > 0 %}
      <div class="folder-item">
        <div class="folder-header" data-folder-toggle>
          <span class="folder-icon">📁</span>
          <h2 class="folder-title">{{ category_display }}</h2>
          <span class="folder-count">({{ category_posts_filtered.size }})</span>
          <span class="folder-arrow">▼</span>
        </div>
        <div class="folder-content">
          <ul class="folder-posts">
            {% for post in category_posts_filtered %}
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
      {% if category_posts.size == 0 %}
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
      {% assign category_posts_filtered = "" | split: "," %}
      {% for post in category[1] %}
        {% assign post_first_category = post.categories[0] %}
        {% if post_first_category == category[0] %}
          {% assign category_posts_filtered = category_posts_filtered | push: post %}
        {% endif %}
      {% endfor %}
      
      {% if category_posts_filtered.size > 0 %}
        <div class="folder-item">
          <div class="folder-header" data-folder-toggle>
            <span class="folder-icon">📁</span>
            <h2 class="folder-title">{{ category[0] }}</h2>
            <span class="folder-count">({{ category_posts_filtered.size }})</span>
            <span class="folder-arrow">▼</span>
          </div>
          <div class="folder-content">
            <ul class="folder-posts">
              {% for post in category_posts_filtered %}
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
      {% endif %}
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
