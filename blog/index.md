---
layout: site
---

<ul class="blog-post-list">
  {% for post in site.posts %}
  <li class="blog-post-list-item">
    <div class="date">{{ post.date | date_to_string }}</div> 
    <a class="link" href="{{ post.url }}" title="{{ post.title }}" target="_self">
      <div class="title">{{ post.title }}</div>
      <div class="sub-title">{{ post.sub_title }}</div>
    </a>
  </li>
  {% endfor %}
</ul>