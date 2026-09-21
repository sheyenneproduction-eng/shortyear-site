// shortyear.com, the home page: the waitlist forms and the small ring that fills as you read.
(function () {
  // The waitlist goes to the `waitlist` table of the Supabase project (migration 17). The publishable
  // key is public by design: the table only accepts new rows from the site, it never lets anyone read them.
  var ENDPOINT = 'https://ttqoliuvnjctbbrjusdx.supabase.co/rest/v1/waitlist';
  var KEY = 'sb_publishable_I9esUKGVDgQ6oioAAyA_hg_u84i3osZ';

  // `?ref=` in a link (a video description, for example) says where people came from. Letters, digits, - and _ only.
  var ref = (new URLSearchParams(location.search).get('ref') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);

  function done(form) {
    var p = document.createElement('p');
    p.className = 'join-done';
    p.setAttribute('role', 'status');
    p.textContent = 'You’re on the list. We’ll email you the day Shortyear opens.';
    form.replaceWith(p);
  }

  document.querySelectorAll('form[data-join]').forEach(function (form) {
    var input = form.querySelector('input[type="email"]');
    var button = form.querySelector('button');
    var error = form.parentNode.querySelector('.join-error');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (error) error.hidden = true;
      // A field people never see. If it is filled, a bot did it: act as if it worked, send nothing.
      if (form.querySelector('.trap').value) { done(form); return; }
      var email = input.value.trim();
      if (!email) return;
      button.disabled = true;
      button.textContent = 'Joining…';
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { apikey: KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ email: email, source: form.getAttribute('data-join') + (ref ? ':' + ref : '') }),
      }).then(function (res) {
        // 409: the address is already on the list. For the person, that is the same good news.
        if (res.ok || res.status === 409) return done(form);
        throw new Error(String(res.status));
      }).catch(function () {
        button.disabled = false;
        button.textContent = 'Join the waitlist';
        if (error) error.hidden = false;
      });
    });
  });

  var mini = document.querySelector('.minimap');
  if (!mini) return;
  var paths = mini.querySelectorAll('path');
  var week = mini.querySelector('span');
  function update() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var n = Math.max(1, Math.min(12, Math.ceil((max > 0 ? window.scrollY / max : 1) * 12)));
    paths.forEach(function (el, i) { el.setAttribute('class', i < n ? 'lit' : ''); });
    week.textContent = n;
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
