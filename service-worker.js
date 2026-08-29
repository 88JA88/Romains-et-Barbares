"use strict";

const NOM_CACHE = "romains-barbares-v1";

const FICHIERS_ESSENTIELS = [
  "./",
  "./accueil.html",
  "./index.html",
  "./manifest.webmanifest",
  "./carte.svg",
  "./01_fond_physique.png",
  "./plateau.js",
  "./moteur.js",
  "./ia.js",
  "./interface.js",
  "./ASSETS/icons/icon-192.png",
  "./ASSETS/icons/icon-512.png"
];

self.addEventListener("install", function(evenement) {
  evenement.waitUntil(
    caches.open(NOM_CACHE).then(function(cache) {
      return cache.addAll(FICHIERS_ESSENTIELS);
    })
  );
});

self.addEventListener("activate", function(evenement) {
  evenement.waitUntil(
    caches.keys().then(function(nomsCaches) {
      return Promise.all(
        nomsCaches
          .filter(function(nomCache) {
            return nomCache.startsWith("romains-barbares-") &&
              nomCache !== NOM_CACHE;
          })
          .map(function(nomCache) {
            return caches.delete(nomCache);
          })
      );
    })
  );
});

self.addEventListener("fetch", function(evenement) {
  const requete = evenement.request;
  const adresse = new URL(requete.url);

  // Seules les lectures de fichiers appartenant au jeu sont conservées localement.
  if (requete.method !== "GET" || adresse.origin !== self.location.origin) {
    return;
  }

  if (requete.mode === "navigate") {
    evenement.respondWith(
      fetch(requete)
        .then(function(reponse) {
          const copie = reponse.clone();

          caches.open(NOM_CACHE).then(function(cache) {
            cache.put(requete, copie);
          });

          return reponse;
        })
        .catch(function() {
          return caches.match(requete).then(function(reponseEnCache) {
            return reponseEnCache || caches.match("./index.html");
          });
        })
    );
    return;
  }

  evenement.respondWith(
    caches.match(requete).then(function(reponseEnCache) {
      if (reponseEnCache) {
        return reponseEnCache;
      }

      return fetch(requete).then(function(reponseReseau) {
        if (!reponseReseau || !reponseReseau.ok) {
          return reponseReseau;
        }

        const copie = reponseReseau.clone();

        caches.open(NOM_CACHE).then(function(cache) {
          cache.put(requete, copie);
        });

        return reponseReseau;
      });
    })
  );
});
