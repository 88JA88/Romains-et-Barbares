#!/usr/bin/env python3
"""Serveur local de l’éditeur de routes de Romains-et-Barbares."""

from __future__ import annotations

import html
import json
import math
import os
import re
import shutil
import tempfile
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


DOSSIER_PROJET = Path(__file__).resolve().parent
FICHIER_CARTE = DOSSIER_PROJET / "carte.svg"
DOSSIER_SAUVEGARDES = DOSSIER_PROJET / "sauvegardes"
ADRESSE = "127.0.0.1"
PORT = 8765
TAILLE_MAXIMALE = 2_000_000
IDENTIFIANT_ROUTE = re.compile(r"route-[1-9][0-9]*\Z")
IDENTIFIANT_NOEUD = re.compile(r"node-[1-9][0-9]*\Z")
IDENTIFIANT_LIEU = re.compile(r'<circle class="place"[^>]*\bid="([^"]+)"')
DEBUT_COUCHE = '    <g id="couche-routes">'
FIN_COUCHE = '    </g>\n    <g id="couche-villes-centres">'


def attribut(valeur: object) -> str:
    return html.escape(str(valeur), quote=True)


def nombre(valeur: object, nom: str) -> int | float:
    resultat = float(valeur)
    if not math.isfinite(resultat):
        raise ValueError(f"{nom} doit être un nombre fini")
    return int(resultat) if resultat.is_integer() else resultat


def valider_reseau(contenu: object, carte_actuelle: str) -> tuple[list[dict], list[dict]]:
    if not isinstance(contenu, dict):
        raise ValueError("Le réseau reçu est invalide")
    routes = contenu.get("routes")
    noeuds = contenu.get("noeuds")
    if not isinstance(routes, list) or not isinstance(noeuds, list):
        raise ValueError("Les listes de routes et de nœuds sont obligatoires")
    if not 1 <= len(routes) <= 500 or not 0 <= len(noeuds) <= 300:
        raise ValueError("Le nombre de routes ou de nœuds est anormal")

    ids_noeuds: set[str] = set()
    noeuds_valides: list[dict] = []
    for source in noeuds:
        if not isinstance(source, dict):
            raise ValueError("Un nœud est invalide")
        identifiant = str(source.get("id", ""))
        if not IDENTIFIANT_NOEUD.fullmatch(identifiant) or identifiant in ids_noeuds:
            raise ValueError(f"Identifiant de nœud invalide ou répété : {identifiant}")
        ids_noeuds.add(identifiant)
        noeuds_valides.append({
            "id": identifiant,
            "cx": nombre(source.get("cx"), f"cx de {identifiant}"),
            "cy": nombre(source.get("cy"), f"cy de {identifiant}"),
        })

    lieux = set(IDENTIFIANT_LIEU.findall(carte_actuelle))
    extremites_connues = lieux | ids_noeuds
    ids_routes: set[str] = set()
    routes_valides: list[dict] = []
    for source in routes:
        if not isinstance(source, dict):
            raise ValueError("Une route est invalide")
        identifiant = str(source.get("id", ""))
        depart = str(source.get("a", ""))
        arrivee = str(source.get("b", ""))
        trace = str(source.get("d", ""))
        poignees = source.get("handles", [])
        if not IDENTIFIANT_ROUTE.fullmatch(identifiant) or identifiant in ids_routes:
            raise ValueError(f"Identifiant de route invalide ou répété : {identifiant}")
        if depart not in extremites_connues or arrivee not in extremites_connues:
            raise ValueError(f"Extrémité inconnue pour {identifiant}")
        if not trace.startswith("M ") or len(trace) > 20_000 or any(signe in trace for signe in '<>&"'):
            raise ValueError(f"Tracé invalide pour {identifiant}")
        if not isinstance(poignees, list):
            raise ValueError(f"Poignées invalides pour {identifiant}")
        poignees_valides = []
        for point in poignees:
            if not isinstance(point, dict):
                raise ValueError(f"Poignée invalide pour {identifiant}")
            poignees_valides.append({"x": nombre(point.get("x"), "x"), "y": nombre(point.get("y"), "y")})
        ids_routes.add(identifiant)
        routes_valides.append({
            "id": identifiant,
            "a": depart,
            "b": arrivee,
            "x1": nombre(source.get("x1"), "x1"),
            "y1": nombre(source.get("y1"), "y1"),
            "x2": nombre(source.get("x2"), "x2"),
            "y2": nombre(source.get("y2"), "y2"),
            "handles": poignees_valides,
            "d": trace,
        })
    return routes_valides, noeuds_valides


def construire_couche(routes: list[dict], noeuds: list[dict]) -> str:
    lignes = [DEBUT_COUCHE]
    for route in routes:
        poignees = json.dumps(route["handles"], ensure_ascii=False, separators=(",", ":"))
        lignes.append(
            '      <path class="segment" data-type="segment" '
            f'id="{attribut(route["id"])}" data-a="{attribut(route["a"])}" data-b="{attribut(route["b"])}" '
            f'data-x1="{attribut(route["x1"])}" data-y1="{attribut(route["y1"])}" '
            f'data-x2="{attribut(route["x2"])}" data-y2="{attribut(route["y2"])}" '
            f'data-handles="{attribut(poignees)}" d="{attribut(route["d"])}" fill="none" '
            'stroke="#765a32" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" '
            'vector-effect="non-scaling-stroke"/>'
        )
    for noeud in noeuds:
        lignes.append(
            '      <circle class="node" data-type="node" '
            f'id="{attribut(noeud["id"])}" data-id="{attribut(noeud["id"])}" '
            f'cx="{attribut(noeud["cx"])}" cy="{attribut(noeud["cy"])}" r="9" '
            'fill="#fff" stroke="#765a32" stroke-width="2" vector-effect="non-scaling-stroke"/>'
        )
    return "\n".join(lignes)


def enregistrer_reseau(contenu: object) -> dict:
    carte_actuelle = FICHIER_CARTE.read_text(encoding="utf-8")
    routes, noeuds = valider_reseau(contenu, carte_actuelle)
    debut = carte_actuelle.find(DEBUT_COUCHE)
    fin = carte_actuelle.find(FIN_COUCHE, debut)
    if debut < 0 or fin < 0:
        raise ValueError("La couche officielle des routes est introuvable")
    nouvelle_carte = carte_actuelle[:debut] + construire_couche(routes, noeuds) + "\n" + carte_actuelle[fin:]

    DOSSIER_SAUVEGARDES.mkdir(exist_ok=True)
    horodatage = datetime.now().strftime("%Y%m%d-%H%M%S")
    sauvegarde = DOSSIER_SAUVEGARDES / f"carte-{horodatage}.svg"
    shutil.copy2(FICHIER_CARTE, sauvegarde)

    descripteur, chemin_temporaire = tempfile.mkstemp(prefix="carte-", suffix=".svg", dir=DOSSIER_PROJET)
    try:
        with os.fdopen(descripteur, "w", encoding="utf-8") as fichier:
            fichier.write(nouvelle_carte)
        os.replace(chemin_temporaire, FICHIER_CARTE)
    finally:
        if os.path.exists(chemin_temporaire):
            os.unlink(chemin_temporaire)
    return {"routes": len(routes), "noeuds": len(noeuds), "sauvegarde": sauvegarde.name}


class Gestionnaire(SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()

    def do_GET(self) -> None:
        if self.path == "/etat-editeur":
            self.repondre_json(200, {"pret": True})
            return
        super().do_GET()

    def do_POST(self) -> None:
        if self.path != "/enregistrer-reseau":
            self.repondre_json(404, {"erreur": "Adresse inconnue"})
            return
        try:
            taille = int(self.headers.get("Content-Length", "0"))
            if not 0 < taille <= TAILLE_MAXIMALE:
                raise ValueError("Taille de données invalide")
            contenu = json.loads(self.rfile.read(taille).decode("utf-8"))
            resultat = enregistrer_reseau(contenu)
            self.repondre_json(200, resultat)
        except (ValueError, json.JSONDecodeError, OSError) as erreur:
            self.repondre_json(400, {"erreur": str(erreur)})

    def repondre_json(self, code: int, contenu: dict) -> None:
        donnees = json.dumps(contenu, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(donnees)))
        self.end_headers()
        self.wfile.write(donnees)


if __name__ == "__main__":
    os.chdir(DOSSIER_PROJET)
    serveur = ThreadingHTTPServer((ADRESSE, PORT), Gestionnaire)
    print(f"Éditeur disponible sur http://{ADRESSE}:{PORT}/editeur-routes.html")
    serveur.serve_forever()
