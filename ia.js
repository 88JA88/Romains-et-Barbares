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

  function identifiantAction(action) {
    return `${action.segment.id}:${action.depart.id}:${action.destination.id}`;
  }

  function comparerIdentifiants(a, b) {
    return identifiantAction(a)
      .localeCompare(identifiantAction(b), 'fr', { numeric: true });
  }

  function choisirAttaqueCapitaleGagnante(actions, moteur) {
    const attaques = actions
      .filter(action =>
        action.destination.dataset.owner
        && action.destination.dataset.owner !== action.depart.dataset.owner
        && action.destination.classList.contains('place')
      )
      .map(action => {
        const forceAttaque = moteur.calculerValeurReseau(moteur.recenserReseau(action.depart));
        const forceDefense = moteur.calculerValeurReseau(moteur.recenserReseau(action.destination));
        return {
          ...action,
          forceAttaque,
          forceDefense,
          points: moteur.valeurStrategique(action.destination)
        };
      })
      // Une égalité de réseaux laisse encore une possibilité de victoire par chance.
      .filter(action => action.forceAttaque >= action.forceDefense);

    attaques.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const certitudeA = a.forceAttaque > a.forceDefense ? 1 : 0;
      const certitudeB = b.forceAttaque > b.forceDefense ? 1 : 0;
      if (certitudeB !== certitudeA) return certitudeB - certitudeA;
      const margeA = a.forceAttaque - a.forceDefense;
      const margeB = b.forceAttaque - b.forceDefense;
      if (margeB !== margeA) return margeB - margeA;
      return comparerIdentifiants(a, b);
    });

    return attaques[0] || null;
  }

  function choisirCoupureCertaine(actions, moteur) {
    const coupures = actions
      .filter(action =>
        action.destination.dataset.owner
        && action.destination.dataset.owner !== action.depart.dataset.owner
        && action.destination.classList.contains('node')
      )
      .map(action => {
        const forceAttaque = moteur.segmentsAdjacents(action.depart.id)
          .filter(segment => segment.dataset.owner === action.depart.dataset.owner)
          .length;
        const forceDefense = moteur.segmentsAdjacents(action.destination.id)
          .filter(segment => segment.dataset.owner === action.destination.dataset.owner)
          .length;
        return {
          ...action,
          forceAttaque,
          forceDefense,
          valeurReseauCoupe: moteur.calculerValeurReseau(
            moteur.recenserReseau(action.destination)
          )
        };
      })
      // Pour préparer une attaque, l'IA ne compte jamais sur le hasard.
      .filter(action =>
        action.forceDefense > 0
        && action.forceAttaque > action.forceDefense
      );

    coupures.sort((a, b) => {
      if (b.valeurReseauCoupe !== a.valeurReseauCoupe) {
        return b.valeurReseauCoupe - a.valeurReseauCoupe;
      }
      const margeA = a.forceAttaque - a.forceDefense;
      const margeB = b.forceAttaque - b.forceDefense;
      if (margeB !== margeA) return margeB - margeA;
      return comparerIdentifiants(a, b);
    });

    return coupures[0] || null;
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
            actions.push(action);
          });
      });

    if (joueur === 'red') {
      const attaqueCapitale = choisirAttaqueCapitaleGagnante(actions, moteur);
      if (attaqueCapitale) return attaqueCapitale;

      const coupure = choisirCoupureCertaine(actions, moteur);
      if (coupure) return coupure;
    }

    const actionsJouables = actions.filter(action => action.note >= 0);

    actionsJouables.sort((a, b) => {
      if (b.note !== a.note) return b.note - a.note;
      return comparerIdentifiants(a, b);
    });

    return actionsJouables[0] || null;
  }

  globalThis.IAJeu = Object.freeze({ choisirAction });
})();
