---
layout: archive
title: "카테고리"
permalink: /categories/
author_profile: true
---

{% assign categories_max = 0 %}
{% for category in site.categories %}
  {% if category[1].size > categories_max %}
    {% assign categories_max = category[1].size %}
  {% endif %}
{% endfor %}

<h2 class="archive-subtitle">📁 전체 카테고리</h2>

<ul class="taxonomy-index">
  {% for i in (1..categories_max) reversed %}
    {% for category in site.categories %}
      {% if category[1].size == i %}
        <li>
          <a href="#{{ category[0] | slugify }}">
            <strong>{{ category[0] }}</strong> <span class="taxonomy-count">{{ i }}</span>
          </a>
        </li>
      {% endif %}
    {% endfor %}
  {% endfor %}
</ul>

{% for i in (1..categories_max) reversed %}
  {% for category in site.categories %}
    {% if category[1].size == i %}
      <section id="{{ category[0] | slugify | downcase }}" class="taxonomy-section">
        <h2 class="archive-subtitle">{{ category[0] }}</h2>
        <div class="archive-posts-grid">
          {% for post in category[1] %}
            {% include archive-single.html post=post %}
          {% endfor %}
        </div>
        <a href="#page-title" class="back-to-top">↑ 맨 위로</a>
      </section>
    {% endif %}
  {% endfor %}
{% endfor %}
