#!/bin/zsh

# Lance l’éditeur depuis le dossier officiel Romains-et-Barbares.
DOSSIER_PROJET=${0:A:h}
PORT=8765
ADRESSE_EDITEUR="http://127.0.0.1:${PORT}/editeur-routes.html"
JOURNAL_SERVEUR="/tmp/romains-et-barbares-serveur.log"

# Si le bon serveur répond déjà, il suffit d’ouvrir l’éditeur.
if curl --silent --fail --max-time 2 "http://127.0.0.1:${PORT}/etat-editeur" >/dev/null 2>&1; then
  open "$ADRESSE_EDITEUR"
  exit 0
fi

# Un autre programme utilisant le même port empêcherait de servir le bon projet.
if lsof -nP -iTCP:${PORT} -sTCP:LISTEN >/dev/null 2>&1; then
  osascript -e 'display alert "Éditeur indisponible" message "Le port 8765 est déjà utilisé par un autre programme." as critical'
  exit 1
fi

cd "$DOSSIER_PROJET" || exit 1
python3 "$DOSSIER_PROJET/serveur-editeur.py" >"$JOURNAL_SERVEUR" 2>&1 &!

# Attend brièvement que le serveur soit prêt avant d’ouvrir le navigateur.
for tentative in {1..25}; do
  if curl --silent --fail --max-time 1 "http://127.0.0.1:${PORT}/etat-editeur" >/dev/null 2>&1; then
    open "$ADRESSE_EDITEUR"
    exit 0
  fi
  sleep 0.2
done

osascript -e 'display alert "Éditeur indisponible" message "Le serveur local n’a pas pu démarrer. Le détail se trouve dans /tmp/romains-et-barbares-serveur.log." as critical'
exit 1
