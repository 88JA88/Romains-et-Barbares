(() => {
  const texte = document.getElementById('texte-selection');
  const fondIndicateur = document.getElementById('fond-indicateur-selection');
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
  const couleurRouteNeutre = '#765a32';
  const epaisseurRouteNeutre = '1';
  const epaisseurRouteControlee = '2.5';
  const couleurCapitaleNeutre = '#4a4a4a';
  const historique = [];
  const segmentsEnSurbrillance = new Set();
  let depart = null;
  let conflitActif = null;
  let joueurActif = 'blue';
  let debutTour = 0;
  let coupsParTour = 1;
  let coupsJoues = 0;
  let configurationJoueurs = { mode: 'deux-joueurs', campHumain: 'blue' };
  let minuterieIA = null;
  let campagneTerminee = false;
  let messageFinCampagne = '';
  let detailsFinCampagne = [];
  let dernierSegmentIA = null;
  const delaiLectureMouvementIA = 2000;
  const delaiResolutionConflitIA = 900;

  function estTourOrdinateur() {
    return configurationJoueurs.mode === 'ordinateur'
      && joueurActif !== configurationJoueurs.campHumain;
  }

  function terminerTourOrdinateur() {
    minuterieIA = null;
    window.parent.postMessage({ type: 'tour-ordinateur-termine' }, '*');
  }

  function programmerCoupOrdinateur(delai = delaiLectureMouvementIA) {
    clearTimeout(minuterieIA);
    minuterieIA = setTimeout(jouerCoupOrdinateur, delai);
  }

  function effacerRepereDerniereActionIA() {
    dernierSegmentIA?.classList.remove('derniere-action-ia');
    dernierSegmentIA = null;
  }

  function signalerDerniereActionIA(action) {
    effacerRepereDerniereActionIA();
    dernierSegmentIA = action.segment;
    dernierSegmentIA.classList.add('derniere-action-ia');
  }

  function jouerCoupOrdinateur() {
    minuterieIA = null;
    if (!estTourOrdinateur()) return;
    if (coupsJoues >= coupsParTour) {
      terminerTourOrdinateur();
      return;
    }

    const action = IAJeu.choisirAction({ segments, points, joueur: joueurActif, moteur });
    if (!action) {
      texte.textContent = 'Les Barbares ne trouvent aucune offensive stratégique.';
      window.parent.postMessage({ type: 'offensive-ordinateur-impossible' }, '*');
      return;
    }

    texte.textContent = `${nomArmee(joueurActif)} préparent leur mouvement…`;
    choisirPoint(action.depart);
    choisirPoint(action.destination);

    if (conflitActif) {
      minuterieIA = setTimeout(() => {
        minuterieIA = null;
        choisirPoint(action.destination);
        signalerDerniereActionIA(action);
        programmerCoupOrdinateur();
      }, delaiResolutionConflitIA);
      return;
    }

    signalerDerniereActionIA(action);
    programmerCoupOrdinateur();
  }

  function publierEtatTour() {
    window.parent.postMessage({
      type: 'etat-tour',
      joueur: joueurActif,
      coupsJoues,
      coupsRestants: Math.max(0, coupsParTour - coupsJoues)
    }, '*');
  }

  function enregistrerCoup() {
    coupsJoues += 1;
    publierEtatTour();
  }

  function ajusterLargeurIndicateur() {
    const largeurTexte = texte.getComputedTextLength();
    const largeur = Math.min(1244, Math.max(420, Math.ceil(largeurTexte + 28)));
    fondIndicateur.setAttribute('width', largeur);
  }

  new MutationObserver(ajusterLargeurIndicateur).observe(texte, {
    childList: true,
    characterData: true,
    subtree: true
  });
  ajusterLargeurIndicateur();

  document.querySelectorAll('.place').forEach(lieu => {
    lieu.dataset.owner = lieu.dataset.initialSide || '';
    lieu.dataset.couleur = lieu.getAttribute('fill') || '';
    lieu.dataset.initialFill = lieu.getAttribute('fill') || '';
    lieu.dataset.initialStroke = lieu.getAttribute('stroke') || '';
    const anneau = document.querySelector(`.origin-ring[data-place-id="${lieu.id}"]`);
    if (anneau) {
      anneau.dataset.initialStroke = anneau.getAttribute('stroke') || '';
      anneau.dataset.initialStrokeWidth = anneau.getAttribute('stroke-width') || '';
    }
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

  function tirerCapitalesNeutres() {
    const capitales = points.filter(point => point.classList.contains('place'));
    const melange = [...capitales];
    for (let index = melange.length - 1; index > 0; index -= 1) {
      const autreIndex = Math.floor(Math.random() * (index + 1));
      [melange[index], melange[autreIndex]] = [melange[autreIndex], melange[index]];
    }
    return melange.slice(0, 5);
  }

  function afficherCapitaleNeutre(capitale) {
    capitale.dataset.owner = '';
    capitale.dataset.couleur = '';
    capitale.dataset.neutre = 'true';
    capitale.setAttribute('fill', '#5f8f4e');
    capitale.setAttribute('stroke', couleurCapitaleNeutre);
    capitale.setAttribute('stroke-width', '2');

    const anneau = document.querySelector(`.origin-ring[data-place-id="${capitale.id}"]`);
    if (!anneau) return;
    anneau.style.display = 'none';
  }

  function afficherCapitaleDeCamp(capitale, owner, couleur) {
    capitale.dataset.owner = owner;
    capitale.dataset.couleur = couleur;
    delete capitale.dataset.neutre;
    capitale.setAttribute('fill', couleur);
    capitale.setAttribute('stroke', '#ffffff');
    capitale.setAttribute('stroke-width', '1');

    const anneau = document.querySelector(`.origin-ring[data-place-id="${capitale.id}"]`);
    if (!anneau) return;
    anneau.style.display = '';
    anneau.setAttribute('stroke', couleur);
    anneau.setAttribute('stroke-width', '1.25');
  }

  const capitalesNeutres = tirerCapitalesNeutres();
  capitalesNeutres.forEach(afficherCapitaleNeutre);
  const capitalesDeCamp = points
    .filter(point => point.classList.contains('place') && !point.dataset.neutre);
  for (let index = capitalesDeCamp.length - 1; index > 0; index -= 1) {
    const autreIndex = Math.floor(Math.random() * (index + 1));
    [capitalesDeCamp[index], capitalesDeCamp[autreIndex]] = [capitalesDeCamp[autreIndex], capitalesDeCamp[index]];
  }
  capitalesDeCamp.forEach((capitale, index) => {
    if (index < 7) {
      afficherCapitaleDeCamp(capitale, 'blue', '#174f8a');
    } else {
      afficherCapitaleDeCamp(capitale, 'red', '#b33a2e');
    }
  });
  points
    .filter(point => point.classList.contains('place'))
    .forEach(capitale => {
      capitale.dataset.campDebut = capitale.dataset.owner || '';
    });
  if (capitalesNeutres.length) {
    texte.textContent = `Capitales neutres : ${capitalesNeutres.map(capitale => capitale.dataset.name).join(', ')}`;
  }

  function nomCamp(owner) {
    return owner === 'red' ? 'des Barbares' : 'des Romains';
  }

  function nomArmee(owner) {
    return owner === 'red' ? 'Les Barbares' : 'Les Romains';
  }

  function nomPoint(point) {
    return point.dataset.name || 'Ce carrefour';
  }

  function afficherMessageFinCampagne() {
    texte.textContent = '';
    [messageFinCampagne, ...detailsFinCampagne].forEach((ligne, index) => {
      const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      tspan.setAttribute('x', '14');
      tspan.setAttribute('y', String(24 + index * 23));
      tspan.textContent = ligne;
      texte.appendChild(tspan);
    });
    fondIndicateur.setAttribute('width', '1050');
    fondIndicateur.setAttribute('height', '82');
  }

  function annulerDepart(message = `Choisissez un lieu du camp ${nomCamp(joueurActif)}`) {
    depart?.classList.remove('est-selectionne');
    depart = null;
    if (campagneTerminee && message === messageFinCampagne) {
      afficherMessageFinCampagne();
      return;
    }
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
      texte.textContent = `Route disputée — Romains ${formaterScore.format(soutiens.bleu)} / Barbares ${formaterScore.format(soutiens.rouge)}`;
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
    const couleur = segmentDepart.dataset.owner === 'blue' ? 'des Romains' : 'des Barbares';
    if (retirer) {
      texte.textContent = `Chaîne ${couleur} masquée`;
      return;
    }

    const pointChaine = points.find(point =>
      (point.id === segmentDepart.dataset.a || point.id === segmentDepart.dataset.b) &&
      point.dataset.owner === segmentDepart.dataset.owner
    );
    const valeurChaine = calculerValeurReseau(recenserReseau(pointChaine));
    texte.textContent = `Réseau ${couleur} — Soutien : ${formaterScore.format(valeurChaine)}`;
  }

  function actualiserBoutonAnnuler() {
    boutonAnnuler.classList.toggle('inactif', historique.length <= debutTour);
    window.parent.postMessage({ type: 'scores-jeu', ...calculerScores() }, '*');
  }

  window.addEventListener('message', evenement => {
    if (evenement.data?.type === 'configurer-valeurs') {
      configurerValeurs(evenement.data.valeurs);
      coupsParTour = Math.max(1, Math.floor(Number(evenement.data.coupsParTour) || 1));
      configurationJoueurs = evenement.data.configurationJoueurs || configurationJoueurs;
      actualiserBoutonAnnuler();
      publierEtatTour();
    }

    if (evenement.data?.type === 'changer-joueur') {
      if (conflitActif) {
        texte.textContent = `La bataille pour ${nomPoint(conflitActif.lieu)} doit être résolue avant de passer la main`;
        return;
      }
      const conserverDernierMouvement = estTourOrdinateur()
        && evenement.data.joueur === configurationJoueurs.campHumain;
      const dernierMessage = texte.textContent;
      joueurActif = evenement.data.joueur === 'red' ? 'red' : 'blue';
      debutTour = historique.length;
      coupsJoues = 0;
      effacerSurbrillanceReseau();
      annulerDepart(conserverDernierMouvement
        ? dernierMessage
        : `Au tour du camp ${nomCamp(joueurActif)}`);
      actualiserBoutonAnnuler();
      publierEtatTour();
      window.parent.postMessage({ type: 'joueur-actif', joueur: joueurActif }, '*');
      if (estTourOrdinateur()) {
        texte.textContent = `Le camp ${nomCamp(joueurActif)} réfléchit…`;
        programmerCoupOrdinateur();
      }
    }

    if (evenement.data?.type === 'evaluer-campagne') {
      campagneTerminee = true;
      clearTimeout(minuterieIA);
      minuterieIA = null;
      effacerSurbrillanceReseau();
      const scores = calculerScores();
      const difference = Math.abs(scores.bleu - scores.rouge);
      const prises = `${formaterScore.format(difference)} ${difference === 1 ? 'prise' : 'prises'} de guerre`;
      const capitalesRomaines = points.filter(point =>
        point.classList.contains('place') && point.dataset.owner === 'blue'
      ).length;
      const capitalesBarbares = points.filter(point =>
        point.classList.contains('place') && point.dataset.owner === 'red'
      ).length;
      const positionsRomainesPerdues = points.filter(point =>
        point.classList.contains('place')
        && point.dataset.campDebut === 'blue'
        && point.dataset.owner !== 'blue'
      );
      const positionsAcquisesParLesRomains = points.filter(point =>
        point.classList.contains('place')
        && point.dataset.campDebut !== 'blue'
        && point.dataset.owner === 'blue'
      );

      const listeCapitales = capitales => capitales.length
        ? capitales.map(capitale => nomPoint(capitale)).join(', ')
        : 'aucun';

      let titre = 'Équilibre stratégique';
      if (scores.bleu !== scores.rouge) {
        const vainqueur = scores.bleu > scores.rouge ? 'blue' : 'red';
        const vaincuSansCapitale = vainqueur === 'blue'
          ? capitalesBarbares === 0
          : capitalesRomaines === 0;
        const niveau = vaincuSansCapitale ? 'totale' : 'stratégique';
        titre = `Victoire ${niveau} ${nomCamp(vainqueur)}`;
      }

      const message = `Campagne terminée — ${titre.toLowerCase()} — ${prises}`;
      detailsFinCampagne = [
        `${positionsAcquisesParLesRomains.length} position${positionsAcquisesParLesRomains.length === 1 ? '' : 's'} acquise${positionsAcquisesParLesRomains.length === 1 ? '' : 's'} par les Romains : ${listeCapitales(positionsAcquisesParLesRomains)}`,
        `${positionsRomainesPerdues.length} position${positionsRomainesPerdues.length === 1 ? '' : 's'} romaine${positionsRomainesPerdues.length === 1 ? '' : 's'} perdue${positionsRomainesPerdues.length === 1 ? '' : 's'} : ${listeCapitales(positionsRomainesPerdues)}`
      ];
      messageFinCampagne = message;
      annulerDepart(message);
      window.parent.postMessage({
        type: 'resultat-campagne',
        titre,
        butin: prises
      }, '*');
    }
  });

  function restaurerAttribut(element, nom, valeur) {
    if (valeur === null) {
      element.removeAttribute(nom);
    } else {
      element.setAttribute(nom, valeur);
    }
  }

  function annulerDerniereAction() {
    if (historique.length <= debutTour) {
      texte.textContent = 'Aucune action du joueur en cours à annuler';
      return;
    }

    const action = historique.pop();
    action.segment.dataset.owner = action.segmentOwner;
    restaurerAttribut(action.segment, 'stroke', action.segmentStroke);
    restaurerAttribut(action.segment, 'stroke-width', action.segmentStrokeWidth);
    action.noeud.dataset.owner = action.noeudOwner;
    action.noeud.dataset.couleur = action.noeudCouleur;
    restaurerAttribut(action.noeud, 'fill', action.noeudFill);
    if (Object.hasOwn(action, 'noeudStroke')) {
      restaurerAttribut(action.noeud, 'stroke', action.noeudStroke);
      restaurerAttribut(action.noeud, 'stroke-width', action.noeudStrokeWidth);
      if (action.noeudNeutre === null) {
        delete action.noeud.dataset.neutre;
      } else {
        action.noeud.dataset.neutre = action.noeudNeutre;
      }
    }
    if (action.anneau) {
      restaurerAttribut(action.anneau.element, 'stroke', action.anneau.stroke);
      restaurerAttribut(action.anneau.element, 'stroke-width', action.anneau.strokeWidth);
      action.anneau.element.style.display = action.anneau.display;
    }
    (action.segmentsNeutralises || []).forEach(etat => {
      etat.segment.dataset.owner = etat.owner;
      restaurerAttribut(etat.segment, 'stroke', etat.stroke);
      restaurerAttribut(etat.segment, 'stroke-width', etat.strokeWidth);
    });
    if (Object.hasOwn(action, 'conflitAvant')) {
      conflitActif = action.conflitAvant;
      action.noeud.classList.toggle('est-en-conflit', conflitActif?.lieu === action.noeud);
    }
    if (action.type !== 'declenchement-conflit') {
      coupsJoues = Math.max(0, coupsJoues - 1);
      publierEtatTour();
    }
    let message = 'Dernière action annulée';
    if (action.type === 'resolution-conflit') message = `Résolution annulée — la bataille pour ${nomPoint(action.noeud)} reprend`;
    if (action.type === 'declenchement-conflit') message = `Bataille pour ${nomPoint(action.noeud)} annulée`;
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
    annulerDepart(`${nomArmee(owner)} relient deux positions`);
    actualiserBoutonAnnuler();
    enregistrerCoup();
  }

  function calculerForceLocale(point, owner) {
    return segmentsAdjacents(point.id)
      .filter(segment => segment.dataset.owner === owner)
      .length;
  }

  function declencherConflit(lieu, segment, typeConflit) {
    const conflitDeReseaux = typeConflit === 'reseaux';
    const conflit = {
      type: typeConflit,
      lieu,
      departAttaque: depart,
      segmentAttaque: segment,
      attaquantOwner: depart.dataset.owner,
      attaquantCouleur: depart.dataset.couleur,
      defenseurOwner: lieu.dataset.owner,
      defenseurCouleur: lieu.dataset.couleur,
      forceAttaquant: conflitDeReseaux
        ? calculerValeurReseau(recenserReseau(depart))
        : calculerForceLocale(depart, depart.dataset.owner),
      forceDefenseur: conflitDeReseaux
        ? calculerValeurReseau(recenserReseau(lieu))
        : calculerForceLocale(lieu, lieu.dataset.owner)
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
    annulerDepart(`Bataille pour ${nomPoint(lieu)} — attaque ${conflit.forceAttaquant}, défense ${conflit.forceDefenseur} — cliquez pour combattre`);
    actualiserBoutonAnnuler();
  }

  function resoudreConflit() {
    const conflit = conflitActif;
    const egalite = conflit.forceAttaquant === conflit.forceDefenseur;
    const attaquantGagne = egalite
      ? Math.random() < 0.5
      : conflit.forceAttaquant > conflit.forceDefenseur;
    const vainqueurOwner = attaquantGagne ? conflit.attaquantOwner : conflit.defenseurOwner;
    const vainqueurCouleur = attaquantGagne ? conflit.attaquantCouleur : conflit.defenseurCouleur;
    const perdantOwner = attaquantGagne ? conflit.defenseurOwner : conflit.attaquantOwner;
    const pointPerdant = conflit.type === 'coupure' && !attaquantGagne
      ? conflit.departAttaque
      : conflit.lieu;
    const segmentsNeutralises = segmentsAdjacents(pointPerdant.id)
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
    const departage = egalite ? ' par chance' : '';
    annulerDepart(`${nomPoint(conflit.lieu)} — victoire ${nomCamp(vainqueurOwner)}${departage} (attaque ${conflit.forceAttaquant}, défense ${conflit.forceDefenseur})`);
    actualiserBoutonAnnuler();
    enregistrerCoup();
  }

  function conquerirCapitaleIsolee(capitale, segment) {
    const owner = depart.dataset.owner;
    const couleur = depart.dataset.couleur;
    const ancienOwner = capitale.dataset.owner;
    const anneau = document.querySelector(`.origin-ring[data-place-id="${capitale.id}"]`);
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
      noeudStroke: capitale.getAttribute('stroke'),
      noeudStrokeWidth: capitale.getAttribute('stroke-width'),
      noeudNeutre: capitale.dataset.neutre ?? null,
      anneau: anneau ? {
        element: anneau,
        stroke: anneau.getAttribute('stroke'),
        strokeWidth: anneau.getAttribute('stroke-width'),
        display: anneau.style.display
      } : null,
      segmentsNeutralises
    });

    segment.dataset.owner = owner;
    segment.setAttribute('stroke', couleur);
    segment.setAttribute('stroke-width', epaisseurRouteControlee);
    capitale.dataset.owner = owner;
    capitale.dataset.couleur = couleur;
    delete capitale.dataset.neutre;
    capitale.setAttribute('fill', couleur);
    capitale.setAttribute('stroke', '#ffffff');
    capitale.setAttribute('stroke-width', '1');
    if (anneau) {
      anneau.style.display = '';
      anneau.setAttribute('stroke', couleur);
      anneau.setAttribute('stroke-width', '1.25');
    }
    segmentsNeutralises.forEach(etat => {
      etat.segment.dataset.owner = '';
      etat.segment.setAttribute('stroke', couleurRouteNeutre);
      etat.segment.setAttribute('stroke-width', epaisseurRouteNeutre);
    });

    annulerDepart(`${nomArmee(owner)} conquièrent ${nomPoint(capitale)}`);
    actualiserBoutonAnnuler();
    enregistrerCoup();
  }

  function conquerirNoeudIsole(noeud, segment) {
    const owner = depart.dataset.owner;
    const couleur = depart.dataset.couleur;
    historique.push({
      type: 'prise-noeud-isole',
      segment,
      noeud,
      segmentOwner: segment.dataset.owner,
      segmentStroke: segment.getAttribute('stroke'),
      segmentStrokeWidth: segment.getAttribute('stroke-width'),
      noeudOwner: noeud.dataset.owner,
      noeudCouleur: noeud.dataset.couleur,
      noeudFill: noeud.getAttribute('fill')
    });

    segment.dataset.owner = owner;
    segment.setAttribute('stroke', couleur);
    segment.setAttribute('stroke-width', epaisseurRouteControlee);
    noeud.dataset.owner = owner;
    noeud.dataset.couleur = couleur;
    noeud.setAttribute('fill', couleur);

    annulerDepart(`${nomArmee(owner)} s’emparent d’un carrefour isolé`);
    actualiserBoutonAnnuler();
    enregistrerCoup();
  }

  function choisirPoint(point) {
    if (campagneTerminee) {
      afficherMessageFinCampagne();
      return;
    }
    if (conflitActif) {
      if (point === conflitActif.lieu) {
        resoudreConflit();
      } else {
        texte.textContent = `La bataille pour ${nomPoint(conflitActif.lieu)} doit être résolue avant tout autre mouvement`;
      }
      return;
    }

    if (!depart && coupsJoues >= coupsParTour) {
      texte.textContent = `Tous les coups du camp ${nomCamp(joueurActif)} ont été joués — passez la main`;
      return;
    }

    if (!depart) {
      if (!point.dataset.owner) {
        texte.textContent = `${nomPoint(point)} est encore neutre`;
        return;
      }

      if (point.dataset.owner !== joueurActif) {
        texte.textContent = `C’est au tour du camp ${nomCamp(joueurActif)}`;
        return;
      }

      depart = point;
      depart.classList.add('est-selectionne');
      texte.textContent = `${nomPoint(depart)} sélectionné — choisissez une position voisine`;
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
      const deuxNoeuds = depart.classList.contains('node') && point.classList.contains('node');
      if ((deuxCapitales || noeudVersCapitale || deuxNoeuds) && segmentAllie && !segmentAllie.dataset.owner) {
        relierPointsAllies(point, segmentAllie);
        return;
      }

      annulerDepart();
      depart = point;
      depart.classList.add('est-selectionne');
      texte.textContent = `${nomPoint(depart)} sélectionné — choisissez une position voisine`;
      return;
    }

    const segment = segmentEntre(depart.id, point.id);
    if (!segment) {
      texte.textContent = 'Ces deux positions ne sont pas reliées directement';
      return;
    }

    if (segment.dataset.owner) {
      texte.textContent = 'Cette route est déjà occupée';
      return;
    }

    if (point.dataset.owner) {
      if (point.classList.contains('place')) {
        declencherConflit(point, segment, 'reseaux');
        return;
      }

      const coupurePossible = segmentsAdjacents(point.id)
        .some(route => route.dataset.owner === point.dataset.owner);
      if (coupurePossible) {
        declencherConflit(point, segment, 'coupure');
      } else {
        conquerirNoeudIsole(point, segment);
      }
      return;
    }

    if (point.classList.contains('place')) {
      conquerirCapitaleIsolee(point, segment);
      return;
    }

    if (!point.classList.contains('node')) {
      texte.textContent = 'Pour cette étape, la destination doit être un carrefour neutre';
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
    annulerDepart(`${nomArmee(owner)} étendent leur territoire`);
    actualiserBoutonAnnuler();
    enregistrerCoup();
  }

  document.querySelectorAll('.segment').forEach(segment => {
    const zone = segment.cloneNode(false);
    zone.removeAttribute('id');
    zone.removeAttribute('data-type');
    zone.setAttribute('class', 'segment-hit');
    segment.parentNode.insertBefore(zone, segment.nextSibling);
    zone.addEventListener('click', evenement => {
      evenement.stopPropagation();
      if (campagneTerminee) {
        afficherMessageFinCampagne();
        return;
      }
      texte.textContent = 'Route — clic droit pour afficher le réseau relié';
    });
    zone.addEventListener('contextmenu', evenement => {
      evenement.preventDefault();
      evenement.stopPropagation();
      if (campagneTerminee) {
        afficherMessageFinCampagne();
        return;
      }
      annulerDepart();
      afficherChaineDuSegment(segment);
    });
  });

  document.addEventListener('click', () => {
    if (!estTourOrdinateur()) effacerRepereDerniereActionIA();
  }, true);

  points.forEach(point => {
    point.addEventListener('click', evenement => {
      evenement.stopPropagation();
      effacerSurbrillanceReseau();
      if (estTourOrdinateur()) {
        texte.textContent = `Le camp ${nomCamp(joueurActif)} réfléchit…`;
        return;
      }
      choisirPoint(point);
    });
  });

  boutonAnnuler.addEventListener('click', evenement => {
    evenement.stopPropagation();
    effacerSurbrillanceReseau();
    if (campagneTerminee) {
      afficherMessageFinCampagne();
      return;
    }
    if (estTourOrdinateur()) {
      texte.textContent = `Le camp ${nomCamp(joueurActif)} réfléchit…`;
      return;
    }
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
    annulerDepart(campagneTerminee ? messageFinCampagne : undefined);
  });
  actualiserBoutonAnnuler();
})();
