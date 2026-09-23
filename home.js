// shortyear.com, l'accueil : les 3 formulaires de la liste d'attente. Le mouvement de la page est dans home-ui.js.
(function () {
  // La liste d'attente écrit dans la table `waitlist` du projet Supabase (migrations 17 et 18). La clé publiable est
  // publique par conception : la table accepte une ligne venant du site, elle ne laisse jamais relire la liste.
  var ENDPOINT = 'https://ttqoliuvnjctbbrjusdx.supabase.co/rest/v1/waitlist';
  var KEY = 'sb_publishable_I9esUKGVDgQ6oioAAyA_hg_u84i3osZ';

  // `?ref=` dans un lien (une description de vidéo, par exemple) dit d'où viennent les gens. Lettres, chiffres, - et _.
  var ref = (new URLSearchParams(location.search).get('ref') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);

  function done(form) {
    var p = document.createElement('p');
    p.className = 'join-done';
    p.setAttribute('role', 'status');
    p.innerHTML = '<b>You’re on the list.</b><span>1 email when Shortyear opens on your phone. That’s it.</span>';
    form.replaceWith(p);
    var block = p.parentNode;
    var fieldset = block && block.querySelector('.platform');
    if (fieldset) fieldset.remove();
    var note = block && block.querySelector('.iphone-note');
    if (note) note.hidden = true;
  }

  // Le téléphone choisi sous le formulaire. La base ne connaît que `android` et `ios` (migration 18).
  function platformOf(block) {
    var picked = block && block.querySelector('input[type="radio"]:checked');
    if (!picked) return null;
    return picked.value === 'iphone' ? 'ios' : 'android';
  }

  document.querySelectorAll('form[data-join]').forEach(function (form) {
    var block = form.closest('.join-block') || form.parentNode;
    var input = form.querySelector('input[type="email"]');
    var button = form.querySelector('button');
    var error = block.querySelector('.join-error');
    var trap = form.querySelector('.trap');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (error) error.hidden = true;
      // Un champ que personne ne voit. Rempli, c'est un robot : on fait comme si c'était parti, on n'envoie rien.
      if (trap && trap.value) { done(form); return; }
      var email = input.value.trim();
      if (!email) return;
      button.disabled = true;
      button.textContent = 'Joining…';
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { apikey: KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({
          email: email,
          source: form.getAttribute('data-join') + (ref ? ':' + ref : ''),
          platform: platformOf(block),
        }),
      }).then(function (res) {
        // 409 : l'adresse est déjà sur la liste. Pour la personne, c'est la même bonne nouvelle.
        if (res.ok || res.status === 409) return done(form);
        throw new Error(String(res.status));
      }).catch(function () {
        button.disabled = false;
        button.textContent = 'Join the waitlist';
        if (error) error.hidden = false;
      });
    });
  });

})();
