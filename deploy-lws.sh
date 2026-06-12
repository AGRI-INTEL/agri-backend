#!/usr/bin/env bash
# ============================================================
# AgriIntel360 — Script de déploiement FTP vers LWS
# Usage : bash deploy-lws.sh
# ============================================================

set -e

FTP_HOST="ftp.lsgrouptogo.com"
FTP_USER="doc@agriintel360.lsgrouptogo.com"
# Le mot de passe sera demandé interactivement (ne jamais le mettre en clair ici)

REMOTE_DIR="/agriintel360.lsgrouptogo.com"   # Répertoire cible sur LWS
LOCAL_NEXT=".next"
LOCAL_PUBLIC="public"

echo "============================================"
echo "  AgriIntel360 — Déploiement LWS via FTP"
echo "============================================"
echo ""
echo "ETAPE 1 : Vérification du build..."
if [ ! -d "$LOCAL_NEXT/static" ]; then
  echo "ERREUR : Dossier .next/static introuvable. Lancez d'abord : npm run build"
  exit 1
fi
echo "  ✓ Build trouvé"

echo ""
echo "ETAPE 2 : Déploiement via lftp..."
echo "  → Hôte    : $FTP_HOST"
echo "  → Compte  : $FTP_USER"
echo "  → Cible   : $REMOTE_DIR"
echo ""

read -s -p "Mot de passe FTP : " FTP_PASS
echo ""

# lftp permet le transfert récursif et la synchronisation
lftp -u "$FTP_USER","$FTP_PASS" "$FTP_HOST" << EOF

# Se placer dans le répertoire distant
cd $REMOTE_DIR

echo "--- Upload du dossier public/ (favicon, images, manifest...) ---"
mirror --reverse --delete --verbose --parallel=4 \
  $LOCAL_PUBLIC/ $REMOTE_DIR/

echo "--- Upload du dossier _next/static/ (chunks JS, CSS) ---"
mkdir -p $REMOTE_DIR/_next/static
mirror --reverse --delete --verbose --parallel=4 \
  $LOCAL_NEXT/static/ $REMOTE_DIR/_next/static/

echo "--- Transfert terminé ---"
bye
EOF

echo ""
echo "============================================"
echo "  ✓ Déploiement terminé !"
echo ""
echo "  Vérifiez : https://agriintel360.lsgrouptogo.com"
echo "============================================"
