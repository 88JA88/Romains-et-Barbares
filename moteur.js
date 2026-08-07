(() => {
  function creer(segments, points) {
    let valeurs = {
      noeud: 0.5,
      capitaleBleue: 1,
      capitaleRouge: 1
    };

    function configurerValeurs(nouvellesValeurs) {
      valeurs = { ...valeurs, ...nouvellesValeurs };
    }

    function segmentEntre(a, b) {
      return segments.find(segment =>
        (segment.dataset.a === a && segment.dataset.b === b) ||
        (segment.dataset.a === b && segment.dataset.b === a)
      );
    }

    function segmentsAdjacents(pointId) {
      return segments.filter(segment =>
        segment.dataset.a === pointId || segment.dataset.b === pointId
      );
    }

    function recenserChaineDuSegment(segmentDepart) {
      const owner = segmentDepart.dataset.owner;
      if (!owner) return new Set();

      const pointsParId = new Map(points.map(point => [point.id, point]));
      const segmentsVisites = new Set([segmentDepart]);
      const pointsAVisiter = [segmentDepart.dataset.a, segmentDepart.dataset.b];
      const pointsVisites = new Set();

      while (pointsAVisiter.length) {
        const pointId = pointsAVisiter.shift();
        const point = pointsParId.get(pointId);
        if (!point || pointsVisites.has(pointId) || point.dataset.owner !== owner) continue;

        pointsVisites.add(pointId);
        segmentsAdjacents(pointId).forEach(segment => {
          if (segment.dataset.owner !== owner || segmentsVisites.has(segment)) return;
          segmentsVisites.add(segment);
          pointsAVisiter.push(segment.dataset.a === pointId ? segment.dataset.b : segment.dataset.a);
        });
      }

      return segmentsVisites;
    }

    function recenserReseau(pointDepart) {
      const owner = pointDepart?.dataset.owner || '';
      const resultat = {
        owner,
        points: [],
        noeuds: [],
        capitales: [],
        segments: []
      };

      if (!owner) return resultat;

      const pointsParId = new Map(points.map(point => [point.id, point]));
      const pointsVisites = new Set();
      const segmentsVisites = new Set();
      const aVisiter = [pointDepart];

      while (aVisiter.length) {
        const point = aVisiter.shift();
        if (pointsVisites.has(point.id) || point.dataset.owner !== owner) continue;

        pointsVisites.add(point.id);
        resultat.points.push(point);
        if (point.dataset.type === 'lieu') {
          resultat.capitales.push(point);
        } else {
          resultat.noeuds.push(point);
        }

        segmentsAdjacents(point.id).forEach(segment => {
          if (segment.dataset.owner !== owner) return;

          if (!segmentsVisites.has(segment.id)) {
            segmentsVisites.add(segment.id);
            resultat.segments.push(segment);
          }

          const voisinId = segment.dataset.a === point.id
            ? segment.dataset.b
            : segment.dataset.a;
          const voisin = pointsParId.get(voisinId);
          if (voisin && !pointsVisites.has(voisinId)) aVisiter.push(voisin);
        });
      }

      return resultat;
    }

    function valeurStrategique(point) {
      if (point.dataset.type === 'node') return valeurs.noeud;
      return point.dataset.initialSide === 'red'
        ? valeurs.capitaleRouge
        : valeurs.capitaleBleue;
    }

    function calculerValeurReseau(reseau) {
      return reseau.points.reduce((total, point) => total + valeurStrategique(point), 0);
    }

    function calculerScores() {
      return points.reduce((scores, point) => {
        if (point.dataset.owner === 'blue') scores.bleu += valeurStrategique(point);
        if (point.dataset.owner === 'red') scores.rouge += valeurStrategique(point);
        return scores;
      }, { bleu: 0, rouge: 0 });
    }

    function calculerSoutiensSegment(segment) {
      const pointsParId = new Map(points.map(point => [point.id, point]));
      const pointsComptes = new Set();
      const soutiens = { bleu: 0, rouge: 0 };

      [segment.dataset.a, segment.dataset.b].forEach(pointId => {
        const point = pointsParId.get(pointId);
        if (!point?.dataset.owner) return;

        recenserReseau(point).points.forEach(pointDuReseau => {
          if (pointsComptes.has(pointDuReseau.id)) return;
          pointsComptes.add(pointDuReseau.id);
          if (pointDuReseau.dataset.owner === 'blue') {
            soutiens.bleu += valeurStrategique(pointDuReseau);
          }
          if (pointDuReseau.dataset.owner === 'red') {
            soutiens.rouge += valeurStrategique(pointDuReseau);
          }
        });
      });

      return soutiens;
    }

    return Object.freeze({
      configurerValeurs,
      segmentEntre,
      segmentsAdjacents,
      recenserChaineDuSegment,
      recenserReseau,
      valeurStrategique,
      calculerValeurReseau,
      calculerScores,
      calculerSoutiensSegment
    });
  }

  globalThis.MoteurJeu = Object.freeze({ creer });
})();
