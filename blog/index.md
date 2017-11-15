---
layout: site
---

<ul class="blog-post-list">
  {% for post in site.posts %}
  <li class="blog-post-list-item">
    <span class="date">{{ post.date | date_to_string }}</span> 
    <a class="link" href="{{ post.url }}" title="{{ post.title }}" target="_self">
      <span class="title">{{ post.title }}</span>
    </a>
  </li>
  {% endfor %}
</ul>