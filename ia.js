(() => {
  function estLiaisonAllieeAutorisee(depart, destination) {
    const deuxCapitales = depart.classList.contains('place') && destination.classList.contains('place');
    const noeudVersCapitale = depart.classList.contains('node') && destination.classList.contains('place');
    const deuxNoeuds = depart.classList.contains('node') && destination.classList.contains('node');
    return deuxCapitales || noeudVersCapitale || deuxNoeuds;
  }

  function noterAction(action, moteur) {
    const { depart, destination } = action;
    const destinationNeutre = !destination.dataset.owner;
    const destinationAlliee = destination.dataset.owner === depart.dataset.owner;

    if (destinationAlliee) {
      const reseauDepart = moteur.recenserReseau(depart);
      const dejaReliee = reseauDepart.points.includes(destination);
      return dejaReliee ? 10 : 45;
    }

    if (destinationNeutre) {
      return destination.classList.contains('place') ? 90 : 55;
    }

    const forceDefense = moteur.segmentsAdjacents(destination.id)
      .filter(segment => segment.dataset.owner === destination.dataset.owner)
      .length;

    if (destination.classList.contains('place')) {
      const forceAttaqueReseau = moteur.calculerValeurReseau(moteur.recenserReseau(depart));
      const forceDefenseReseau = moteur.calculerValeurReseau(moteur.recenserReseau(destination));
      if (forceAttaqueReseau < forceDefenseReseau) return -1;
      const risqueEgalite = forceAttaqueReseau === forceDefenseReseau ? 25 : 0;
      return 130 + (forceAttaqueReseau - forceDefenseReseau) * 10 - risqueEgalite;
    }

    if (forceDefense === 0) return 105;

    const forceAttaque = moteur.segmentsAdjacents(depart.id)
      .filter(segment => segment.dataset.owner === depart.dataset.owner)
      .length;
    if (forceAttaque < forceDefense) return -1;

    const routesCoupees = forceDefense;
    const risqueEgalite = forceAttaque === forceDefense ? 25 : 0;
    return 110 + routesCoupees * 8 + (forceAttaque - forceDefense) * 10 - risqueEgalite;
  }

  function choisirAction({ segments, points, joueur, moteur }) {
    const pointsParId = new Map(points.map(point => [point.id, point]));
    const actions = [];

    points
      .filter(point => point.dataset.owner === joueur)
      .forEach(depart => {
        moteur.segmentsAdjacents(depart.id)
          .filter(segment => !segment.dataset.owner)
          .forEach(segment => {
            const destinationId = segment.dataset.a === depart.id
              ? segment.dataset.b
              : segment.dataset.a;
            const destination = pointsParId.get(destinationId);
            if (!destination) return;
            if (destination.dataset.owner === joueur && !estLiaisonAllieeAutorisee(depart, destination)) return;

            const action = { depart, destination, segment };
            action.note = noterAction(action, moteur);
            if (action.note >= 0) actions.push(action);
          });
      });

    actions.sort((a, b) => {
      if (b.note !== a.note) return b.note - a.note;
      return `${a.segment.id}:${a.depart.id}:${a.destination.id}`
        .localeCompare(`${b.segment.id}:${b.depart.id}:${b.destination.id}`, 'fr', { numeric: true });
    });

    return actions[0] || null;
  }

  globalThis.IAJeu = Object.freeze({ choisirAction });
})();
