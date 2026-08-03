# Aide — dictionnaire et dépannage

Garde ce document sous la main. Il répond aux questions les plus fréquentes.

---

## Petit dictionnaire

| Mot | Ce que ça veut dire |
|-----|---------------------|
| **Terminal** | Fenêtre où l'on tape des ordres au clavier au lieu de cliquer. Aussi appelé « console » ou « ligne de commande ». |
| **Commande** | Un ordre tapé dans le Terminal, validé par la touche `Entrée`. |
| **Dossier / répertoire** | La même chose. « Répertoire » est le mot employé par les informaticiens. |
| **Git** | Le logiciel qui enregistre l'historique de tes modifications. |
| **GitHub** | Le site internet qui héberge tes projets. Git et GitHub sont deux choses différentes : Git est l'outil, GitHub est le site. |
| **Dépôt** *(repository, repo)* | Un projet suivi par Git. C'est simplement un dossier avec un historique. |
| **Cloner** | Télécharger un projet GitHub sur son Mac. |
| **Commit** | Un enregistrement, une « photographie » du projet à un instant donné. |
| **Push** | Envoyer ses commits sur GitHub. |
| **Pull** | Récupérer sur son Mac les modifications présentes sur GitHub. |
| **Branche** *(branch)* | Une version parallèle du projet, pour essayer quelque chose sans risque. Tu travailleras d'abord sur la branche principale, appelée `main`. |
| **Template / modèle** | Un projet tout prêt, destiné à être copié pour en démarrer un nouveau. |
| **Extension** | Un module qui ajoute une fonction à VS Code. |
| **PATH** | La liste des endroits où le Terminal cherche les programmes. Quand un programme « n'est pas reconnu », c'est souvent qu'il n'est pas dans le PATH. |
| **Codex** | L'assistant d'OpenAI qui écrit du code à partir de tes consignes en français. |
| **AGENTS.md** | Le fichier de consignes que Codex lit automatiquement au début de chaque conversation. |

---

## Problèmes fréquents

### « command not found »

Le Terminal ne trouve pas le programme. Dans l'ordre :

1. **Vérifie l'orthographe.** `git`, pas `Git` ni `gti`.
2. **Ferme complètement le Terminal** (`Cmd` + `Q`, pas seulement la fenêtre) **et
   rouvre-en un neuf.** C'est la cause n°1 : un Terminal ouvert avant l'installation ne
   connaît pas les nouveaux programmes.
3. **Redémarre ton Mac.** Cela règle la plupart des cas restants.
4. Si c'est toujours le cas, le programme n'est probablement pas installé : reprends la
   section correspondante de [INSTALL.md](INSTALL.md).

### `codex` n'est pas reconnu

Après l'installation de Codex, le Terminal doit être **entièrement quitté** (`Cmd` + `Q`)
**puis rouvert** — un nouvel onglet ne suffit pas.

Si le problème persiste, essaie l'installation par une autre voie. Avec Homebrew, si tu
l'as :

```bash
brew install --cask codex
```

Sinon, via Node.js :

```bash
npm install -g @openai/codex
```

Si `npm` n'est pas reconnu non plus, installe Node.js depuis **https://nodejs.org**
(choisis la version **LTS**), puis rouvre le Terminal.

### `code .` ne fonctionne pas

La commande `code` n'a pas été activée. Dans VS Code : `Cmd` + `Maj` + `P`, tape
`shell command`, puis choisis **« Shell Command: Install 'code' command in PATH »**.
Rouvre ensuite un Terminal neuf.

### Git me demande un mot de passe et le refuse

C'est normal : depuis 2021, GitHub n'accepte plus le mot de passe du compte dans le
Terminal. Il faut un **jeton d'accès personnel** (*personal access token*), une sorte de
mot de passe à usage technique.

1. Va sur **https://github.com/settings/tokens**
2. Clique sur **Generate new token** → **Generate new token (classic)**.
3. Dans **Note**, écris par exemple `Mon Mac`.
4. Dans **Expiration**, choisis `90 days` (ou `No expiration` si tu préfères ne pas avoir à
   recommencer).
5. Dans la liste des cases à cocher, coche **`repo`** (la première, tout en haut).
6. Descends et clique sur **Generate token**.
7. 🛑 **Copie immédiatement le jeton affiché** (il commence par `ghp_`). GitHub ne te le
   remontrera **jamais**. Colle-le dans le trousseau d'accès de macOS ou une note sûre.
8. Quand Git demande `Password`, colle ce jeton à la place du mot de passe.

> 💡 Le jeton n'apparaît pas à l'écran quand tu le colles. C'est normal, appuie sur
> `Entrée`.

### « fatal: not a git repository »

Tu n'es pas dans un dossier de projet. Tape `pwd` pour voir où tu es, puis déplace-toi dans
ton projet :

```bash
cd ~/Projets/mon-premier-projet
```

### « Your branch is behind » ou « rejected — non-fast-forward » lors d'un push

GitHub contient des modifications que tu n'as pas sur ton Mac. Récupère-les d'abord, puis
renvoie :

```bash
git pull
```

```bash
git push
```

### Le Terminal affiche `:` en bas de l'écran et ne réagit plus

Tu es tombé dans une visionneuse de texte. Appuie sur la touche `q` (comme *quit*) pour en
sortir.

### Le Terminal s'est ouvert dans un éditeur bizarre que je ne peux pas quitter

C'est l'éditeur `vim`. Pour en sortir sans rien enregistrer : appuie sur `Échap`, puis tape
`:q!` et appuie sur `Entrée`.

Pour éviter que cela se reproduise, dis à Git d'utiliser VS Code :

```bash
git config --global core.editor "code --wait"
```

### J'ai fait une bêtise, je veux revenir en arrière

**Rien n'est jamais perdu si tu as fait des commits.** Le plus simple : ouvre Codex et
explique-lui la situation en français, par exemple :

> *J'ai modifié des fichiers par erreur et je veux revenir à mon dernier commit. Quelle
> commande dois-je taper ?*

Pour annuler **toutes** les modifications non encore enregistrées et revenir au dernier
commit :

```bash
git restore .
```

🛑 Cette commande efface définitivement le travail non enregistré. À n'utiliser que si tu
es sûr de vouloir tout jeter depuis le dernier commit.

### Codex ne répond pas / me dit que je n'ai pas accès

1. Vérifie que ton abonnement ChatGPT est actif sur **https://chatgpt.com**.
   Codex n'est pas inclus dans la version gratuite.
2. Reconnecte-toi : dans le Terminal, tape `codex` puis choisis **Sign in with ChatGPT**.
3. Vérifie ta connexion internet.

### VS Code est en anglais

`Cmd` + `Maj` + `P` → tape `Configure Display Language` → `Entrée` → choisis **Français** →
laisse VS Code redémarrer.

---

## Réflexes qui sauvent

- **`git status` ne casse jamais rien.** En cas de doute, tape-le : il te dira où tu en es.
- **Fais un commit avant d'essayer quelque chose de risqué.** C'est ton filet de sécurité.
- **Lis les messages d'erreur.** Ils sont en anglais, mais ils contiennent presque toujours
  la solution. Copie-colle le message dans Codex et demande :
  *« Que signifie ce message et que dois-je faire ? »*
- **Demande à Codex.** Il connaît Git, le Terminal, VS Code et GitHub. Une question posée
  en français, même maladroitement, obtiendra une réponse utile.

---

## Aide-mémoire des raccourcis VS Code

| Raccourci | Effet |
|-----------|-------|
| `Cmd` + `S` | Enregistrer le fichier |
| `Cmd` + `Z` | Annuler la dernière action |
| `Ctrl` + `ù` | Ouvrir / fermer le Terminal dans VS Code |
| `Cmd` + `Maj` + `X` | Panneau des extensions |
| `Cmd` + `Maj` + `G` | Panneau Git (contrôle de code source) |
| `Cmd` + `Maj` + `P` | Barre de commandes (tout est là) |
| `Cmd` + `+` / `-` | Agrandir / réduire le texte |

> 💡 Le Terminal intégré à VS Code (`Ctrl` + `ù`) s'ouvre directement dans le dossier de ton
> projet. Une fois habitué, c'est plus pratique que le Terminal séparé.
