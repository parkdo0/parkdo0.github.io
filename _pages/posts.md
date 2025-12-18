---
layout: archive
title: "Posts"
permalink: /posts/
author_profile: true
---

<div class="archive-posts-grid">
  {% for post in site.posts %}
    {% include archive-single.html post=post %}
  {% endfor %}
</div>
