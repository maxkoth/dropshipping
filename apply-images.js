(function () {
  var m = location.pathname.match(/store-(\d+)/);
  if (!m) return;
  var imgs = ((window.PRODUCT_IMAGES || {})['store-' + m[1]]) || [];
  if (!imgs.length) return; // no URLs set -> keep the emoji placeholder
  function paint(el, url) {
    if (!el || !url) return;
    el.textContent = '';
    el.style.backgroundImage = 'url(' + JSON.stringify(url) + ')';
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    el.style.backgroundRepeat = 'no-repeat';
  }
  function run() {
    document.querySelectorAll('.hero-img-placeholder,.product-img-placeholder,.demo-img-placeholder,.science-img-placeholder,.product-img-pl,.gallery-main').forEach(function (el) { paint(el, imgs[0]); });
    var thumbs = document.querySelectorAll('.gallery-thumb');
    thumbs.forEach(function (t, i) {
      var url = imgs[i % imgs.length];
      paint(t, url);
      t.onclick = function () {
        paint(document.getElementById('main-img'), url);
        thumbs.forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active');
      };
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
