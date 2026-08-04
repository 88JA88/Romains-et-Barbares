# Étape 1 — Installer les outils

Ce document te guide pour installer, une fois pour toutes, les trois outils dont tu as
besoin. Compte **30 à 45 minutes** la première fois. Prends ton temps.

## Ce que tu vas installer, et pourquoi

| Outil | À quoi ça sert | Comparaison |
|-------|----------------|-------------|
| **VS Code** | Le logiciel dans lequel tu écris et vois tes fichiers | Un traitement de texte, mais pour du code |
| **Git** | Enregistre l'historique de tes modifications | Le « suivi des modifications » de Word, en beaucoup plus puissant |
| **Codex** | L'assistant qui écrit le code pour toi | Un collègue programmeur à qui tu parles en français |

Tu auras aussi besoin :

- d'un **compte GitHub** (gratuit) — c'est le site où tes projets sont sauvegardés en ligne ;
- d'un **compte ChatGPT payant** (Plus, Pro, Business, Edu ou Enterprise) — Codex y est inclus, sans supplément.

---

## Avant de commencer : le Terminal

Plusieurs étapes demandent d'utiliser le **Terminal**. C'est une fenêtre où l'on tape des
ordres au clavier au lieu de cliquer sur des boutons. Cela paraît intimidant, mais on ne
casse rien : tant que tu recopies exactement les commandes indiquées, tout va bien.

**Comment l'ouvrir :** appuie sur `Cmd` + `Barre d'espace`, tape `Terminal`, appuie sur
`Entrée`.

> 💡 Garde-le à portée de main : fais un clic droit sur son icône dans le Dock, puis
> **Options → Garder dans le Dock**.

**Comment ça marche :**

1. Tu vois une ligne qui se termine par un curseur clignotant. C'est l'*invite* : le
   Terminal attend tes ordres.
2. Tu tapes (ou colles) une commande.
3. Tu appuies sur `Entrée` pour la lancer. 🛑 **Rien ne se passe tant que tu n'appuies pas
   sur `Entrée`.**
4. Le Terminal affiche le résultat, puis te redonne la main.

**Pour coller du texte dans le Terminal :** `Cmd` + `V`.

> 💡 Le Terminal n'affiche **rien** quand tu tapes un mot de passe : pas d'étoiles, pas de
> points. C'est normal, c'est une sécurité. Tape à l'aveugle et appuie sur `Entrée`.

---

## 1. Installer VS Code

VS Code (Visual Studio Code) est gratuit et publié par Microsoft.

1. Ouvre ton navigateur internet et va sur **https://code.visualstudio.com**
2. Clique sur le gros bouton bleu de téléchargement. Le site détecte tout seul que tu es
   sur Mac. Si on te demande de choisir, prends la version **Apple Silicon** pour un Mac
   récent (depuis 2020), ou **Intel** pour un Mac plus ancien. En cas de doute, prends
   **Universal** : elle fonctionne dans les deux cas.
3. Attends la fin du téléchargement (le fichier arrive dans ton dossier **Téléchargements**).
4. Double-clique sur le fichier téléchargé (`VSCode-darwin-universal.zip`). Une icône
   bleue **Visual Studio Code** apparaît.
5. Fais-la glisser dans ton dossier **Applications**. 🛑 Cette étape est importante : sans
   elle, VS Code fonctionnera mal.
6. Ouvre le dossier **Applications** et double-clique sur **Visual Studio Code**.
7. macOS demande : *« Visual Studio Code est une application téléchargée sur Internet.
   Voulez-vous vraiment l'ouvrir ? »* → clique sur **Ouvrir**.

✅ **Vérification** : VS Code s'ouvre et affiche un écran de bienvenue.

> 💡 VS Code est en anglais par défaut. Pour le passer en français : appuie sur
> `Cmd` + `Maj` + `P`, tape `Configure Display Language`, appuie sur `Entrée`, choisis
> **Français**, puis laisse VS Code redémarrer.

### Activer la commande `code`

Cette petite manipulation te permettra d'ouvrir un projet dans VS Code directement depuis
le Terminal. Tu t'en serviras à l'étape 2.

1. Dans VS Code, appuie sur `Cmd` + `Maj` + `P`.
2. Tape `shell command`.
3. Choisis **« Shell Command: Install 'code' command in PATH »** et appuie sur `Entrée`.
4. macOS peut demander ton mot de passe de session : saisis-le.

✅ **Vérification** : dans un Terminal **neuf**, tape `code --version`. Un numéro doit
s'afficher.

---

## 2. Installer Git

Git enregistre l'historique de ton travail. Il n'a pas de fenêtre à lui : il s'utilise
depuis le Terminal ou depuis VS Code.

### Installation

Sur macOS, tout se fait en une commande. Ouvre le Terminal et tape :

```bash
git --version
```

- Si tu vois quelque chose comme `git version 2.43.0` → **Git est déjà installé**, passe
  directement à la section « Se présenter à Git ».
- Sinon, une fenêtre s'ouvre et propose d'installer les **outils de développement en ligne
  de commande**. Clique sur **Installer**, accepte la licence, et patiente quelques
  minutes.

✅ **Vérification** : `git --version` affiche un numéro de version.

### Se présenter à Git

Git a besoin de savoir qui tu es, pour signer chaque enregistrement de ton travail. Tape
ces deux commandes, **en remplaçant** le nom et l'adresse par les tiens (garde bien les
guillemets) :

```bash
git config --global user.name "Jacques Dupont"
```

```bash
git config --global user.email "jacques.dupont@example.com"
```

🛑 Utilise **la même adresse e-mail que celle de ton compte GitHub** (voir étape
suivante), sinon tes contributions ne seront pas reconnues.

Dis aussi à Git d'utiliser VS Code quand il a besoin de te faire écrire un texte — cela
t'évitera de tomber dans un éditeur déroutant :

```bash
git config --global core.editor "code --wait"
```

✅ **Vérification** :

```bash
git config --global --list
```

Tu dois voir tes nom et adresse s'afficher.

---

## 3. Créer un compte GitHub

GitHub est le site qui héberge tes projets en ligne. C'est gratuit, et c'est aussi ta
sauvegarde : même si ton Mac tombe en panne, ton travail est en sécurité.

1. Va sur **https://github.com**
2. Clique sur **Sign up** (S'inscrire).
3. Saisis ton adresse e-mail, choisis un mot de passe et un nom d'utilisateur.
   💡 Le nom d'utilisateur sera visible publiquement : choisis quelque chose de simple et
   durable, par exemple `jacques-dupont`.
4. GitHub t'envoie un code par e-mail. Recopie-le pour valider ton compte.

🛑 **Note ton nom d'utilisateur et ton mot de passe** dans un endroit sûr — le trousseau
d'accès de macOS fait très bien l'affaire. Tu en auras besoin à l'étape 2.

### Activer la double authentification

GitHub l'exige aujourd'hui pour tous les comptes. Le site te le proposera : suis la
procédure indiquée (application sur téléphone, ou SMS). 🛑 **Conserve précieusement les
codes de secours** que GitHub te donne à ce moment-là : ils te permettront de récupérer ton
compte si tu perds ton téléphone.

✅ **Vérification** : tu es connecté sur github.com et ton nom d'utilisateur apparaît en
haut à droite.

---

## 4. Installer Codex

Codex est l'assistant qui va écrire le code. Il existe en deux versions, et **tu vas
installer les deux** — elles fonctionnent ensemble.

- L'**extension VS Code** : une barre latérale dans laquelle tu discutes avec Codex. C'est
  celle que tu utiliseras tous les jours.
- Le **programme en ligne de commande** (Codex CLI) : la même chose, mais dans le Terminal.
  Il sert de base à l'extension et permet de vérifier que tout fonctionne.

### 4.a — Vérifier ton abonnement ChatGPT

Codex est inclus dans les abonnements ChatGPT **Plus, Pro, Business, Edu et Enterprise**.
Il n'est **pas** inclus dans la version gratuite.

Vérifie sur **https://chatgpt.com** que tu es bien abonné. Si ce n'est pas le cas,
souscris un abonnement **Plus** avant de continuer.

### 4.b — Installer le programme en ligne de commande

Ouvre le Terminal, copie-colle cette commande, puis appuie sur `Entrée` :

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | sh
```

L'installation prend une à deux minutes. Des lignes défilent : c'est normal, laisse faire.

Quand c'est terminé, **ferme complètement le Terminal** (`Cmd` + `Q`) **et rouvre-en un
neuf**.

✅ **Vérification** :

```bash
codex --version
```

Un numéro de version doit s'afficher. Si tu obtiens `command not found`, consulte
[AIDE.md](AIDE.md), rubrique « `codex` n'est pas reconnu ».

### 4.c — Se connecter à Codex

Toujours dans le Terminal, tape :

```bash
codex
```

1. Un menu apparaît. À l'aide des **flèches du clavier** ⬆️ ⬇️, sélectionne
   **« Sign in with ChatGPT »** puis appuie sur `Entrée`.
2. Ton navigateur s'ouvre automatiquement sur une page OpenAI.
3. Connecte-toi avec ton compte ChatGPT, puis clique sur **Autoriser** / **Allow**.
4. Le navigateur affiche un message de réussite. Reviens au Terminal : Codex indique que
   tu es connecté.

Codex est maintenant prêt et attend tes instructions. **Pour le quitter**, tape `/quit`
puis `Entrée` (ou appuie deux fois sur `Ctrl` + `C`).

✅ **Vérification** : dans le Terminal, tape `codex`, puis écris
`Bonjour, peux-tu te présenter en français ?` et appuie sur `Entrée`. Codex doit te
répondre.

### 4.d — Installer l'extension dans VS Code

1. Ouvre **VS Code**.
2. Dans la barre d'icônes tout à gauche, clique sur l'icône **Extensions** (quatre petits
   carrés dont un se détache). Raccourci : `Cmd` + `Maj` + `X`.
3. Dans le champ de recherche en haut, tape `Codex`.
4. Repère l'extension **Codex** publiée par **OpenAI**. 🛑 Vérifie bien le nom de
   l'éditeur : d'autres extensions portent des noms voisins.
5. Clique sur le bouton bleu **Installer**.
6. Une nouvelle icône Codex apparaît dans la barre de gauche. Clique dessus.
7. Clique sur **Sign in** et connecte-toi avec ton compte ChatGPT, comme à l'étape
   précédente. Si tu t'es déjà connecté dans le Terminal, l'extension te reconnaîtra
   peut-être toute seule.

✅ **Vérification** : le panneau Codex affiche une zone de saisie. Écris-y `Bonjour !` et
appuie sur `Entrée` — Codex répond.

---

## Récapitulatif

Avant de passer à l'étape suivante, vérifie que ces quatre points sont bien acquis :

- [ ] VS Code s'ouvre depuis ton dossier **Applications**
- [ ] `git --version` affiche un numéro dans le Terminal
- [ ] Tu es connecté sur github.com et tu connais ton nom d'utilisateur
- [ ] Le panneau Codex dans VS Code répond quand tu lui écris

Si les quatre cases sont cochées, bravo — le plus technique est derrière toi ! 🎉

👉 **Passe maintenant à [CLONE.md](CLONE.md)** pour créer ton premier projet.
