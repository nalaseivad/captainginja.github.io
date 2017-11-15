---
layout: site
---

# Posts

<ul class="posts">
  {% for post in site.posts %}

  <li>
    {{ post.date | date_to_string }} - 
    <a href="{{ post.url }}" title="{{ post.title }}" target="_self">{{ post.title }}</a>
  </li>
  {% endfor %}
</ul>
