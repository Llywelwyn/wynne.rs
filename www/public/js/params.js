!function() {
  var p = new URLSearchParams(location.search);

  var just = p.get('just');
  if (just && /^[a-z0-9-]+$/.test(just)) {
    document.documentElement.dataset.just = just;
    var css = 'section[data-section]:not([data-section="' + just + '"]){display:none}'
      + ' section[data-section="' + just + '"] .section-label{pointer-events:none;text-decoration:none;color:inherit}';
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
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelectorAll('section[data-section] pre').forEach(function(pre) {
        var lines = pre.innerHTML.split('\n');
        pre.innerHTML = lines.filter(function(line) {
          return !line.trim() || line.toLowerCase().indexOf(has) !== -1;
        }).join('\n');
      });
      document.querySelectorAll('.guestbook-entry').forEach(function(entry) {
        if (entry.textContent.toLowerCase().indexOf(has) === -1) {
          entry.style.display = 'none';
        }
      });
    });
  }
}();
