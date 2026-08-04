(() => {
  const texte = document.getElementById('texte-selection');
  const boutonAnnuler = document.getElementById('bouton-annuler');
  const segments = [...document.querySelectorAll('.segment')];
  const points = [...document.querySelectorAll('.node, .place')];
  const moteur = MoteurJeu.creer(segments, points);
  const {
    configurerValeurs,
    segmentEntre,
    segmentsAdjacents,
    recenserChaineDuSegment,
    recenserReseau,
    calculerValeurReseau,
    calculerScores,
    calculerSoutiensSegment
  } = moteur;
  const formaterScore = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
  const couleurRouteNeutre = '#000000';
  const epaisseurRouteNeutre = '1';
  const epaisseurRouteControlee = '2.5';
  const historique = [];
  const segmentsEnSurbrillance = new Set();
  let depart = null;
  let conflitActif = null;

  document.querySelectorAll('.place').forEach(lieu => {
    lieu.dataset.owner = lieu.dataset.initialSide || '';
    lieu.dataset.couleur = lieu.getAttribute('fill') || '';
  });

  document.querySelectorAll('.node').forEach(noeud => {
    noeud.dataset.owner = '';
    noeud.dataset.couleur = '';
  });

  segments.forEach(segment => {
    segment.dataset.owner = '';
    segment.setAttribute('stroke', couleurRouteNeutre);
    segment.setAttribute('stroke-width', epaisseurRouteNeutre);
  });

  function nomCamp(owner) {
    return owner === 'red' ? 'barbare rouge' : 'romain bleu';
  }

  function annulerDepart(message = 'Choisissez un lieu rouge ou bleu') {
    depart?.classList.remove('est-selectionne');
    depart = null;
    texte.textContent = message;
  }

  function actualiserSurbrillanceReseau() {
    segments.forEach(segment => {
      segment.classList.remove('est-reseau-selectionne', 'est-reseau-atténue');
      if (!segmentsEnSurbrillance.size) return;
      segment.classList.add(segmentsEnSurbrillance.has(segment)
        ? 'est-reseau-selectionne'
        : 'est-reseau-atténue');
    });
  }

  function effacerSurbrillanceReseau() {
    segmentsEnSurbrillance.clear();
    actualiserSurbrillanceReseau();
  }

  function afficherChaineDuSegment(segmentDepart) {
    const chaine = recenserChaineDuSegment(segmentDepart);
    if (!chaine.size) {
      effacerSurbrillanceReseau();
      segmentsEnSurbrillance.add(segmentDepart);
      [segmentDepart.dataset.a, segmentDepart.dataset.b].forEach(pointId => {
        const point = points.find(candidat => candidat.id === pointId);
        if (!point?.dataset.owner) return;
        recenserReseau(point).segments.forEach(segment => segmentsEnSurbrillance.add(segment));
      });
      actualiserSurbrillanceReseau();
      const soutiens = calculerSoutiensSegment(segmentDepart);
      texte.textContent = `${segmentDepart.id} convoité — Bleu ${formaterScore.format(soutiens.bleu)} / Rouge ${formaterScore.format(soutiens.rouge)}`;
      return;
    }

    const retirer = [...chaine].every(segment => segmentsEnSurbrillance.has(segment));
    chaine.forEach(segment => {
      if (retirer) {
        segmentsEnSurbrillance.delete(segment);
      } else {
        segmentsEnSurbrillance.add(segment);
      }
    });
    actualiserSurbrillanceReseau();
    const couleur = segmentDepart.dataset.owner === 'blue' ? 'bleue' : 'rouge';
    if (retirer) {
      texte.textContent = `Chaîne ${couleur} masquée`;
      return;
    }

    const pointChaine = points.find(point =>
      (point.id === segmentDepart.dataset.a || point.id === segmentDepart.dataset.b) &&
      point.dataset.owner === segmentDepart.dataset.owner
    );
    const valeurChaine = calculerValeurReseau(recenserReseau(pointChaine));
    texte.textContent = `Chaîne ${couleur} — Soutien : ${formaterScore.format(valeurChaine)}`;
  }

  function actualiserBoutonAnnuler() {
    boutonAnnuler.classList.toggle('inactif', historique.length === 0);
    window.parent.postMessage({ type: 'scores-jeu', ...calculerScores() }, '*');
  }

  window.addEventListener('message', evenement => {
    if (evenement.data?.type !== 'configurer-valeurs') return;
    configurerValeurs(evenement.data.valeurs);
    actualiserBoutonAnnuler();
  });

  function restaurerAttribut(element, nom, valeur) {
    if (valeur === null) {
      element.removeAttribute(nom);
    } else {
      element.setAttribute(nom, valeur);
    }
  }

  function annulerDerniereAction() {
    if (!historique.length) {
      texte.textContent = 'Aucune conquête à annuler';
      return;
    }

    const action = historique.pop();
    action.segment.dataset.owner = action.segmentOwner;
    restaurerAttribut(action.segment, 'stroke', action.segmentStroke);
    restaurerAttribut(action.segment, 'stroke-width', action.segmentStrokeWidth);
    action.noeud.dataset.owner = action.noeudOwner;
    action.noeud.dataset.couleur = action.noeudCouleur;
    restaurerAttribut(action.noeud, 'fill', action.noeudFill);
    (action.segmentsNeutralises || []).forEach(etat => {
      etat.segment.dataset.owner = etat.owner;
      restaurerAttribut(etat.segment, 'stroke', etat.stroke);
      restaurerAttribut(etat.segment, 'stroke-width', etat.strokeWidth);
    });
    if (Object.hasOwn(action, 'conflitAvant')) {
      conflitActif = action.conflitAvant;
      action.noeud.classList.toggle('est-en-conflit', conflitActif?.lieu === action.noeud);
    }
    let message = `${action.segment.id} et ${action.noeud.id} restaurés à leur état précédent`;
    if (action.type === 'liaison-alliee') message = `${action.segment.id} restaurée à son état précédent`;
    if (action.type === 'resolution-conflit') message = `Résolution annulée — ${action.noeud.id} est de nouveau en conflit`;
    if (action.type === 'declenchement-conflit') message = `Conflit annulé — ${action.noeud.id} restauré`;
    annulerDepart(message);
    actualiserBoutonAnnuler();
  }

  function relierPointsAllies(destination, segment) {
    const owner = depart.dataset.owner;
    const couleur = depart.dataset.couleur;
    historique.push({
      type: 'liaison-alliee',
      segment,
      noeud: destination,
      segmentOwner: segment.dataset.owner,
      segmentStroke: segment.getAttribute('stroke'),
      segmentStrokeWidth: segment.getAttribute('stroke-width'),
      noeudOwner: destination.dataset.owner,
      noeudCouleur: destination.dataset.couleur,
      noeudFill: destination.getAttribute('fill')
    });

    segment.dataset.owner = owner;
    segment.setAttribute('stroke', couleur);
    segment.setAttribute('stroke-width', epaisseurRouteControlee);
    const origine = depart.id;
    annulerDepart(`${segment.id} relie maintenant ${origine} à ${destination.id} pour le camp ${nomCamp(owner)}`);
    actualiserBoutonAnnuler();
  }

  function declencherConflit(lieu, segment) {
    const reseauAttaquant = recenserReseau(depart);
    const reseauDefenseur = recenserReseau(lieu);
    const conflit = {
      lieu,
      segmentAttaque: segment,
      attaquantOwner: depart.dataset.owner,
      attaquantCouleur: depart.dataset.couleur,
      defenseurOwner: lieu.dataset.owner,
      defenseurCouleur: lieu.dataset.couleur,
      valeurAttaquant: calculerValeurReseau(reseauAttaquant),
      valeurDefenseur: calculerValeurReseau(reseauDefenseur)
    };

    historique.push({
      type: 'declenchement-conflit',
      segment,
      noeud: lieu,
      segmentOwner: segment.dataset.owner,
      segmentStroke: segment.getAttribute('stroke'),
      segmentStrokeWidth: segment.getAttribute('stroke-width'),
      noeudOwner: lieu.dataset.owner,
      noeudCouleur: lieu.dataset.couleur,
      noeudFill: lieu.getAttribute('fill'),
      conflitAvant: null
    });

    segment.dataset.owner = conflit.attaquantOwner;
    segment.setAttribute('stroke', conflit.attaquantCouleur);
    segment.setAttribute('stroke-width', epaisseurRouteControlee);
    lieu.dataset.owner = '';
    lieu.dataset.couleur = '';
    lieu.setAttribute('fill', '#ffffff');
    lieu.classList.add('est-en-conflit');
    conflitActif = conflit;
    annulerDepart(`${lieu.id} en conflit — attaque ${conflit.valeurAttaquant} point(s), défense ${conflit.valeurDefenseur} point(s) — cliquez pour résoudre`);
    actualiserBoutonAnnuler();
  }

  function resoudreConflit() {
    const conflit = conflitActif;
    const egalite = conflit.valeurAttaquant === conflit.valeurDefenseur;
    const attaquantGagne = egalite
      ? Math.random() < 0.5
      : conflit.valeurAttaquant > conflit.valeurDefenseur;
    const vainqueurOwner = attaquantGagne ? conflit.attaquantOwner : conflit.defenseurOwner;
    const vainqueurCouleur = attaquantGagne ? conflit.attaquantCouleur : conflit.defenseurCouleur;
    const perdantOwner = attaquantGagne ? conflit.defenseurOwner : conflit.attaquantOwner;
    const segmentsNeutralises = segmentsAdjacents(conflit.lieu.id)
      .filter(segment => segment.dataset.owner === perdantOwner)
      .map(segment => ({
        segment,
        owner: segment.dataset.owner,
        stroke: segment.getAttribute('stroke'),
        strokeWidth: segment.getAttribute('stroke-width')
      }));

    historique.push({
      type: 'resolution-conflit',
      segment: conflit.segmentAttaque,
      noeud: conflit.lieu,
      segmentOwner: conflit.segmentAttaque.dataset.owner,
      segmentStroke: conflit.segmentAttaque.getAttribute('stroke'),
      segmentStrokeWidth: conflit.segmentAttaque.getAttribute('stroke-width'),
      noeudOwner: conflit.lieu.dataset.owner,
      noeudCouleur: conflit.lieu.dataset.couleur,
      noeudFill: conflit.lieu.getAttribute('fill'),
      segmentsNeutralises,
      conflitAvant: conflit
    });

    conflit.lieu.dataset.owner = vainqueurOwner;
    conflit.lieu.dataset.couleur = vainqueurCouleur;
    conflit.lieu.setAttribute('fill', vainqueurCouleur);
    conflit.lieu.classList.remove('est-en-conflit');
    segmentsNeutralises.forEach(etat => {
      etat.segment.dataset.owner = '';
      etat.segment.setAttribute('stroke', couleurRouteNeutre);
      etat.segment.setAttribute('stroke-width', epaisseurRouteNeutre);
    });
    conflitActif = null;
    const departage = egalite ? 'égalité départagée à 50/50' : 'meilleur réseau';
    annulerDepart(`${conflit.lieu.id} remporté par le camp ${nomCamp(vainqueurOwner)} (${departage}) — réseaux recalculés`);
    actualiserBoutonAnnuler();
  }

  function conquerirCapitaleIsolee(capitale, segment) {
    const owner = depart.dataset.owner;
    const couleur = depart.dataset.couleur;
    const ancienOwner = capitale.dataset.owner;
    const segmentsNeutralises = segmentsAdjacents(capitale.id)
      .filter(route => route !== segment && route.dataset.owner === ancienOwner)
      .map(route => ({
        segment: route,
        owner: route.dataset.owner,
        stroke: route.getAttribute('stroke'),
        strokeWidth: route.getAttribute('stroke-width')
      }));

    historique.push({
      segment,
      noeud: capitale,
      segmentOwner: segment.dataset.owner,
      segmentStroke: segment.getAttribute('stroke'),
      segmentStrokeWidth: segment.getAttribute('stroke-width'),
      noeudOwner: capitale.dataset.owner,
      noeudCouleur: capitale.dataset.couleur,
      noeudFill: capitale.getAttribute('fill'),
      segmentsNeutralises
    });

    segment.dataset.owner = owner;
    segment.setAttribute('stroke', couleur);
    segment.setAttribute('stroke-width', epaisseurRouteControlee);
    capitale.dataset.owner = owner;
    capitale.dataset.couleur = couleur;
    capitale.setAttribute('fill', couleur);
    segmentsNeutralises.forEach(etat => {
      etat.segment.dataset.owner = '';
      etat.segment.setAttribute('stroke', couleurRouteNeutre);
      etat.segment.setAttribute('stroke-width', epaisseurRouteNeutre);
    });

    const origine = depart.id;
    annulerDepart(`${capitale.id} conquise depuis ${origine} par le camp ${nomCamp(owner)}`);
    actualiserBoutonAnnuler();
  }

  function choisirPoint(point) {
    if (conflitActif) {
      if (point === conflitActif.lieu) {
        resoudreConflit();
      } else {
        texte.textContent = `${conflitActif.lieu.id} doit être résolu avant tout autre mouvement`;
      }
      return;
    }

    if (!depart) {
      if (!point.dataset.owner) {
        texte.textContent = `${point.id} est encore neutre`;
        return;
      }

      depart = point;
      depart.classList.add('est-selectionne');
      texte.textContent = `${depart.id} sélectionné — choisissez un nœud neutre voisin`;
      return;
    }

    if (point === depart) {
      annulerDepart();
      return;
    }

    if (point.dataset.owner === depart.dataset.owner) {
      const segmentAllie = segmentEntre(depart.id, point.id);
      const deuxCapitales = depart.classList.contains('place') && point.classList.contains('place');
      const noeudVersCapitale = depart.classList.contains('node') && point.classList.contains('place');
      if ((deuxCapitales || noeudVersCapitale) && segmentAllie && !segmentAllie.dataset.owner) {
        relierPointsAllies(point, segmentAllie);
        return;
      }

      annulerDepart();
      depart = point;
      depart.classList.add('est-selectionne');
      texte.textContent = `${depart.id} sélectionné — choisissez un nœud neutre voisin`;
      return;
    }

    const segment = segmentEntre(depart.id, point.id);
    if (!segment) {
      texte.textContent = `${point.id} n'est pas directement voisin de ${depart.id}`;
      return;
    }

    if (segment.dataset.owner) {
      texte.textContent = `${segment.id} est déjà conquis`;
      return;
    }

    if (point.classList.contains('place') && point.dataset.owner) {
      const reseauDefenseur = recenserReseau(point);
      if (reseauDefenseur.capitales.length > 1) {
        declencherConflit(point, segment);
        return;
      }

      conquerirCapitaleIsolee(point, segment);
      return;
    }

    if (point.dataset.owner) {
      declencherConflit(point, segment);
      return;
    }

    if (!point.classList.contains('node')) {
      texte.textContent = 'Pour cette étape, la destination doit être un nœud neutre';
      return;
    }

    const owner = depart.dataset.owner;
    const couleur = depart.dataset.couleur;
    historique.push({
      segment,
      noeud: point,
      segmentOwner: segment.dataset.owner,
      segmentStroke: segment.getAttribute('stroke'),
      segmentStrokeWidth: segment.getAttribute('stroke-width'),
      noeudOwner: point.dataset.owner,
      noeudCouleur: point.dataset.couleur,
      noeudFill: point.getAttribute('fill')
    });
    segment.dataset.owner = owner;
    segment.setAttribute('stroke', couleur);
    segment.setAttribute('stroke-width', epaisseurRouteControlee);
    point.dataset.owner = owner;
    point.dataset.couleur = couleur;
    point.setAttribute('fill', couleur);
    const origine = depart.id;
    annulerDepart(`${segment.id} et ${point.id} conquis depuis ${origine} par le camp ${nomCamp(owner)}`);
    actualiserBoutonAnnuler();
  }

  document.querySelectorAll('.segment').forEach(segment => {
    const zone = segment.cloneNode(false);
    zone.removeAttribute('id');
    zone.removeAttribute('data-type');
    zone.setAttribute('class', 'segment-hit');
    segment.parentNode.insertBefore(zone, segment.nextSibling);
    zone.addEventListener('click', evenement => {
      evenement.stopPropagation();
      texte.textContent = `${segment.id} — clic droit pour afficher les chaînes reliées`;
    });
    zone.addEventListener('contextmenu', evenement => {
      evenement.preventDefault();
      evenement.stopPropagation();
      annulerDepart();
      afficherChaineDuSegment(segment);
    });
  });

  points.forEach(point => {
    point.addEventListener('click', evenement => {
      evenement.stopPropagation();
      effacerSurbrillanceReseau();
      choisirPoint(point);
    });
  });

  boutonAnnuler.addEventListener('click', evenement => {
    evenement.stopPropagation();
    effacerSurbrillanceReseau();
    annulerDerniereAction();
  });

  document.addEventListener('keydown', evenement => {
    if ((evenement.ctrlKey || evenement.metaKey) && evenement.key.toLowerCase() === 'z') {
      evenement.preventDefault();
      annulerDerniereAction();
    }
  });

  document.documentElement.addEventListener('click', () => {
    effacerSurbrillanceReseau();
    annulerDepart();
  });
  actualiserBoutonAnnuler();
})();
