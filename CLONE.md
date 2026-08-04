# Étape 2 — Créer ton projet à partir de ce modèle

Tu as installé les outils (voir [INSTALL.md](INSTALL.md)). Tu vas maintenant créer ton
premier projet. Compte **15 à 20 minutes**.

## Le principe en une image

```
   GitHub (sur Internet)              Ton Mac
   ─────────────────────              ───────

   📦 Le modèle
        │
        │  ① « Use this template »
        ▼
   📦 Ton projet  ───────────────►  📁 Ton dossier de travail
        │              ② cloner            │
        │                                  │  ③ tu travailles
        │                                  │     avec Codex
        │              ④ envoyer           │
        ◄──────────────────────────────────┘
```

1. **Copier le modèle** pour en faire *ton* projet, sur GitHub.
2. **Cloner** : télécharger ton projet sur ton Mac pour pouvoir y travailler.
3. **Travailler** dans VS Code avec Codex.
4. **Envoyer** tes modifications sur GitHub pour les sauvegarder.

Les étapes 3 et 4 se répètent à l'infini. Les étapes 1 et 2 ne se font qu'une seule fois
par projet.

---

## 1. Copier le modèle sur GitHub

1. Ouvre ton navigateur et va sur la page GitHub de ce modèle :
   **https://github.com/paztek/modele-projet**
2. Vérifie que tu es bien connecté à GitHub : ta photo ou tes initiales doivent apparaître
   en haut à droite.

   > 🛑 Ce modèle est **privé**. Si tu obtiens une page « 404 — Not Found », c'est
   > simplement que tu n'es pas connecté, ou pas connecté avec le bon compte. Vérifie que
   > tu es bien identifié sous le nom **`88JA88`**, puis recharge la page.
3. Clique sur le bouton vert **« Use this template »** (Utiliser ce modèle), en haut à
   droite de la page, puis sur **« Create a new repository »**.

   > 🛑 Ne clique **pas** sur « Fork ». Un *fork* garde un lien avec le modèle d'origine ;
   > « Use this template » te donne une copie neuve et indépendante, c'est ce que tu veux.

4. Remplis le formulaire :
   - **Repository name** : le nom de ton projet. Utilise des lettres minuscules et des
     tirets, sans accents ni espaces. Par exemple `mon-premier-projet` ou
     `carnet-de-recettes`.
   - **Description** *(facultatif)* : une phrase pour te souvenir de quoi il s'agit.
   - **Public / Private** : choisis **Private** (privé) si tu veux être le seul à le voir.
     Tu pourras toujours le rendre public plus tard.
5. Clique sur le bouton vert **« Create repository »**.

Après quelques secondes, GitHub affiche ton nouveau projet. Il contient les mêmes fichiers
que le modèle, mais il t'appartient.

✅ **Vérification** : en haut de la page, tu lis `ton-nom-utilisateur / mon-premier-projet`.

---

## 2. Choisir où ranger tes projets

Avant de télécharger, décide d'un dossier où tu rangeras **tous** tes projets. Le plus
simple : un dossier `Projets` dans ton dossier personnel.

Ouvre le Terminal et tape ces deux commandes, l'une après l'autre :

```bash
mkdir -p ~/Projets
```

```bash
cd ~/Projets
```

**Ce que font ces commandes :**

- `mkdir -p ~/Projets` crée le dossier `Projets`. Le `~` (tilde) désigne ton dossier
  personnel. L'option `-p` évite toute erreur si le dossier existe déjà.
- `cd ~/Projets` signifie *« va dans le dossier Projets »*. `cd` veut dire *change
  directory*, changer de dossier. C'est l'équivalent d'un double-clic dans le Finder.

> 💡 Pour taper le caractère `~` sur un clavier Mac français : `Alt` + `N`, puis `Espace`.

✅ **Vérification** : tape `pwd` (*print working directory*, « affiche le dossier
courant »). Tu dois voir `/Users/ton-nom/Projets`.

---

## 3. Cloner ton projet

*Cloner*, c'est télécharger une copie de ton projet GitHub sur ton Mac, avec tout son
historique.

### Récupérer l'adresse du projet

1. Sur la page GitHub de **ton** projet, clique sur le bouton vert **« Code »**.
2. Reste sur l'onglet **HTTPS**.
3. Clique sur la petite icône de copie (deux feuilles superposées) à droite de l'adresse.
   L'adresse est maintenant dans ton presse-papier. Elle ressemble à :
   `https://github.com/jacques-dupont/mon-premier-projet.git`

### Lancer le clonage

Dans le Terminal (toujours placé dans `~/Projets`), tape `git clone`, **un espace**, puis
colle l'adresse :

```bash
git clone https://github.com/jacques-dupont/mon-premier-projet.git
```

Appuie sur `Entrée`.

**La première fois, Git te demandera de t'identifier.** Selon les cas :

- Une fenêtre s'ouvre et propose **« Se connecter avec un navigateur »** → clique, puis
  autorise l'accès sur la page GitHub qui s'ouvre. C'est la méthode la plus simple.
- Ou bien le Terminal demande `Username` puis `Password`. 🛑 **Le mot de passe de ton
  compte GitHub ne fonctionne pas ici.** Il faut un *jeton d'accès* : voir la rubrique
  « Git me demande un mot de passe » dans [AIDE.md](AIDE.md).

Tu verras défiler quelques lignes en anglais (`Cloning into…`, `Receiving objects…`).
C'est normal.

✅ **Vérification** :

```bash
ls
```

`ls` (*list*) affiche le contenu du dossier courant. Tu dois voir le nom de ton projet
apparaître.

---

## 4. Ouvrir le projet dans VS Code

Entre dans le dossier de ton projet, puis ouvre-le :

```bash
cd mon-premier-projet
```

```bash
code .
```

🛑 Le **point** après `code` est essentiel : il signifie *« le dossier dans lequel je me
trouve »*. Ne l'oublie pas.

VS Code s'ouvre sur ton projet. Tu vois la liste des fichiers dans la colonne de gauche.

> 💡 **Si `code .` ne fonctionne pas** (message `command not found`), c'est que la commande
> `code` n'a pas été activée : reprends la section « Activer la commande `code` » dans
> [INSTALL.md](INSTALL.md). En attendant, tu peux toujours ouvrir VS Code normalement puis
> aller dans le menu **Fichier → Ouvrir le dossier…**

Si VS Code demande *« Do you trust the authors of the files in this folder? »*
(Fais-tu confiance aux auteurs ?), clique sur **Yes, I trust the authors**. C'est ton
propre projet.

✅ **Vérification** : dans la colonne de gauche, tu vois `README.md`, `INSTALL.md`,
`CLONE.md`, etc.

---

## 5. Travailler avec Codex

C'est maintenant que ça devient intéressant.

1. Dans VS Code, clique sur l'icône **Codex** dans la barre de gauche.
2. Écris ce que tu veux faire, **en français, en langage courant**. Par exemple :

   > *Je débute complètement en programmation. Explique-moi ce que contient ce projet.*

   Ou, pour te lancer :

   > *Crée une page web toute simple qui affiche « Bonjour tout le monde » avec un fond
   > bleu clair. Explique-moi chaque fichier que tu crées.*

3. Codex réfléchit, puis propose des modifications. Il te demandera parfois l'autorisation
   avant de créer ou modifier un fichier : lis, puis accepte.

### Trois conseils pour bien parler à Codex

- **Dis que tu débutes.** Codex adaptera ses explications. Tu peux lui écrire une fois pour
  toutes : *« Je suis débutant, explique-moi chaque étape simplement et en français. »*
- **Une demande à la fois.** Mieux vaut cinq petites demandes successives qu'une seule très
  longue.
- **N'aie pas peur de te tromper.** Grâce à Git, tout est enregistré : on peut toujours
  revenir en arrière. Tu ne peux rien casser d'irréparable.

> 💡 Plus tard, tu rempliras le fichier **AGENTS.md** avec tes préférences. Codex le lit
> automatiquement au début de chaque conversation, ce qui évite de répéter les mêmes
> consignes à chaque fois. Tu peux d'ailleurs demander à Codex de le rédiger pour toi.

---

## 6. Sauvegarder ton travail sur GitHub

Tes modifications n'existent pour l'instant que sur ton Mac. Voici comment les envoyer sur
GitHub. **Ces trois commandes sont à retenir : ce sont les seules dont tu auras besoin au
quotidien.**

Dans le Terminal, placé dans ton dossier de projet :

### a) Voir ce qui a changé

```bash
git status
```

Git liste les fichiers modifiés, ajoutés ou supprimés. C'est une commande sans risque :
elle regarde, elle ne change rien. Prends l'habitude de la taper souvent.

### b) Enregistrer une étape

```bash
git add .
```

```bash
git commit -m "Ajout de ma première page web"
```

- `git add .` : *« prépare tous les fichiers modifiés »*. Là encore, le point signifie
  « tout ce qui se trouve ici ».
- `git commit -m "…"` : *« enregistre définitivement cette étape »*, avec un message
  décrivant ce que tu as fait. 🛑 Garde bien les guillemets autour du message. Écris un
  message clair : c'est un message pour le « toi » de dans six mois.

Un *commit* est comme une photographie de ton projet à un instant donné. Tu pourras
toujours revenir à cette photo plus tard.

### c) Envoyer sur GitHub

```bash
git push
```

Tes enregistrements partent sur GitHub. Rafraîchis la page de ton projet dans le
navigateur : tes fichiers y sont.

✅ **Vérification** : sur github.com, ton projet affiche ton message de commit et la
mention « il y a quelques secondes ».

### Le rythme de travail habituel

```
   modifier avec Codex  →  git add .  →  git commit -m "…"  →  git push
          ▲                                                       │
          └───────────────────────────────────────────────────────┘
```

Fais un commit **chaque fois que tu as terminé quelque chose qui fonctionne**, même si
c'est petit. Plusieurs fois par jour, c'est très bien.

> 💡 Tu peux aussi faire tout cela **sans le Terminal** : dans VS Code, l'icône avec trois
> points reliés (le « contrôle de code source », `Cmd` + `Maj` + `G`) permet de tout faire
> en cliquant. Écris ton message en haut, clique sur **Valider**, puis sur **Synchroniser
> les modifications**.

---

## 7. Reprendre le travail plus tard

Quand tu rallumes ton Mac et veux continuer :

```bash
cd ~/Projets/mon-premier-projet
```

```bash
git pull
```

```bash
code .
```

- `git pull` récupère les éventuelles modifications faites ailleurs (depuis un autre
  ordinateur, ou directement sur le site GitHub). Prends l'habitude de le taper **avant**
  de commencer à travailler.

---

## Récapitulatif des commandes

Il n'y en a que huit. Tu les connaîtras par cœur en quelques jours.

| Commande | Ce qu'elle fait |
|----------|-----------------|
| `cd nom-du-dossier` | Entrer dans un dossier |
| `cd ..` | Remonter d'un dossier |
| `ls` | Voir ce qu'il y a dans le dossier courant |
| `pwd` | Savoir où l'on se trouve |
| `code .` | Ouvrir le dossier courant dans VS Code |
| `git status` | Voir ce qui a changé |
| `git add .` puis `git commit -m "…"` | Enregistrer une étape |
| `git push` / `git pull` | Envoyer / récupérer sur GitHub |

---

## Et pour le prochain projet ?

Tu n'auras **pas** à refaire [INSTALL.md](INSTALL.md). Il te suffira de reprendre ce
document à partir de l'étape 1 : « Use this template », puis `git clone`, et c'est parti.

👉 En cas de souci, consulte [AIDE.md](AIDE.md).
