!function() {
  var p = new URLSearchParams(location.search);

  var just = p.get('just');
  if (just && /^[a-z0-9-]+$/.test(just)) {
    document.documentElement.dataset.just = just;
    var css = 'section[data-section]:not([data-section="' + just + '"]){display:none}';
    document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
  }

  var act = p.get('do');
  var urls = window.__urls;
  if (urls && urls.length) {
    if (act === 'random') {
      var url = urls[Math.floor(Math.random() * urls.length)];
      location.replace(url.startsWith('http') ? url : location.origin + url);
    }
    if (act === 'newest') {
      location.replace(urls[0].startsWith('http') ? urls[0] : location.origin + urls[0]);
    }
  }
  if (act === 'admin') {
    location.replace('/admin');
  }

  if (p.has('compact')) document.documentElement.dataset.compact = '';

  var has = p.get('has');
  if (has) {
    document.documentElement.dataset.has = has;
    has = has.toLowerCase();
  }

  document.addEventListener('DOMContentLoaded', function() {
    if (has) {
      document.querySelectorAll('section[data-section] .entry').forEach(function(entry) {
        if (entry.textContent.toLowerCase().indexOf(has) === -1) {
          entry.style.display = 'none';
        }
      });
      document.querySelectorAll('.guestbook-entry').forEach(function(entry) {
        if (entry.textContent.toLowerCase().indexOf(has) === -1) {
          entry.style.display = 'none';
        }
      });
    }

    document.querySelectorAll('.section-label').forEach(function(a) {
      var link = new URLSearchParams(a.search);
      p.forEach(function(v, k) { if (!link.has(k)) link.set(k, v); });
      a.href = '?' + link.toString();
    });

    var find = document.getElementById('find');
    if (find) find.addEventListener('click', function(e) {
      e.preventDefault();
      var term = prompt('find:');
      if (!term) return;
      var q = new URLSearchParams(location.search);
      q.set('has', term);
      location.search = q.toString();
    });
  });
}();
