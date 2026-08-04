# Modèle de projet pour coder avec Codex

Bienvenue 👋

Ce dossier est un **modèle** (on dit aussi *template*). Il ne contient pas encore de
programme : il contient le mode d'emploi pour installer les outils, puis créer ton
propre projet à partir de ce modèle.

Codex est un assistant : tu lui écris en français ce que tu veux faire, et il écrit le
code à ta place. Tu n'as pas besoin de savoir programmer pour commencer.

> 📎 Cette documentation est écrite pour **macOS**.

---

## Par où commencer ?

Fais les étapes **dans l'ordre**. Ne saute pas d'étape.

| Ordre | Fichier | Ce que tu vas faire | Durée |
|:-----:|---------|---------------------|-------|
| 1️⃣ | **[INSTALL.md](INSTALL.md)** | Installer les 3 outils nécessaires sur ton Mac : VS Code, Git et Codex | 30 à 45 min |
| 2️⃣ | **[CLONE.md](CLONE.md)** | Créer ton projet à partir de ce modèle et le télécharger sur ton Mac | 15 à 20 min |
| 3️⃣ | **[AIDE.md](AIDE.md)** | À garder sous la main : petit dictionnaire des mots compliqués et solutions aux problèmes courants | — |

> 💡 **Tu n'as à faire l'étape 1 qu'une seule fois**, la première fois.
> Pour chaque nouveau projet, tu recommenceras seulement l'étape 2.

---

## Comment lire ces documents

- Les mots entre `police machine à écrire` sont des choses à **taper exactement** comme
  écrit, sans rien changer.
- Les blocs gris comme celui-ci sont des commandes à recopier dans le Terminal :

  ```bash
  echo "Bonjour"
  ```

  Tu peux cliquer sur l'icône de copie en haut à droite du bloc, puis coller dans le
  Terminal.
- 🛑 signale un point où il faut être attentif.
- ✅ signale une vérification : si ça ne marche pas, arrête-toi là et cherche la solution
  dans [AIDE.md](AIDE.md).

---

## Que contient ce modèle ?

```
modele-projet/
├── README.md      ← tu es ici
├── INSTALL.md     ← étape 1 : installer les outils
├── CLONE.md       ← étape 2 : créer ton projet
├── AIDE.md        ← dictionnaire et dépannage
├── AGENTS.md      ← les consignes que Codex lira à chaque fois
└── .gitignore     ← liste de fichiers que Git doit ignorer
```

Le fichier **AGENTS.md** est important : c'est là que tu écriras tes préférences
(« réponds-moi en français », « explique-moi chaque étape », etc.). Codex le lit
automatiquement au début de chaque conversation. Tu le rempliras plus tard, avec l'aide
de Codex lui-même.

---

## En cas de blocage

Ce n'est jamais grave et rien n'est cassé. Trois réflexes, dans cet ordre :

1. Relis l'étape depuis le début, lentement.
2. Consulte [AIDE.md](AIDE.md).
3. Demande à Codex lui-même : ouvre-le et écris ton problème en français, par exemple :
   *« Quand je tape git status, j'obtiens ce message : … Que dois-je faire ? »*

Bon courage, et bienvenue dans la programmation ! 🚀
