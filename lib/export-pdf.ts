// ============================================================================
// EXPORT PDF — Génération de liste utilisateurs en PDF côté client
// ============================================================================

import type { User } from '@/types/auth';
import { getRoleLabel, getAccountStatusLabel } from '@/types/auth';

/**
 * Génère et télécharge une liste d'utilisateurs en PDF.
 * Utilise l'API Canvas / window.print comme fallback universel
 * sans dépendances externes lourdes.
 */
export function exportUsersToPDF(users: User[], title = 'Liste des utilisateurs') {
  // Build HTML content for the PDF
  const now = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const rows = users
    .map(
      (u, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${u.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${u.email}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${getRoleLabel(u.role)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${getAccountStatusLabel(u.status)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${u.country || '—'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${
          u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '—'
        }</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${
          u.last_login_at ? new Date(u.last_login_at).toLocaleDateString('fr-FR') : 'Jamais'
        }</td>
      </tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #111827; padding: 24px; }
        h1 { font-size: 20px; font-weight: 700; color: #166534; margin-bottom: 4px; }
        .subtitle { font-size: 11px; color: #6b7280; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        thead tr { background: #166534; color: white; }
        thead th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; }
        tbody tr:hover { background: #f0fdf4 !important; }
        td { font-size: 11px; color: #374151; }
        .footer { margin-top: 16px; font-size: 10px; color: #9ca3af; text-align: right; }
        @media print {
          body { padding: 0; }
          @page { margin: 15mm; }
        }
      </style>
    </head>
    <body>
      <h1>🌾 AgriIntel360 — ${title}</h1>
      <p class="subtitle">Généré le ${now} · ${users.length} utilisateur${users.length > 1 ? 's' : ''}</p>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Statut</th>
            <th>Pays</th>
            <th>Inscription</th>
            <th>Dernière connexion</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="footer">AgriIntel360 · Exporté le ${now}</p>
    </body>
    </html>
  `;

  // Open in a new window and trigger print-to-PDF
  const win = window.open('', '_blank', 'width=1200,height=800');
  if (!win) {
    // Fallback: download as HTML if popup was blocked
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utilisateurs-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  // Small delay to let styles render
  setTimeout(() => {
    win.print();
  }, 500);
}

/**
 * Exporte un utilisateur individuel en PDF (fiche de profil).
 */
export function exportUserProfileToPDF(user: User) {
  const now = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  const field = (label: string, value: string | undefined) =>
    value
      ? `<div style="margin-bottom:8px"><span style="font-weight:600;color:#374151">${label}:</span> <span style="color:#6b7280">${value}</span></div>`
      : '';

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <title>Profil — ${user.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 13px; color: #111827; padding: 32px; }
        .header { display: flex; align-items: center; gap: 20px; padding-bottom: 20px; border-bottom: 2px solid #166534; margin-bottom: 24px; }
        .avatar { width: 80px; height: 80px; border-radius: 50%; background: #166534; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: 700; flex-shrink: 0; }
        h1 { font-size: 22px; font-weight: 700; color: #111827; }
        .role { font-size: 13px; color: #166534; font-weight: 600; margin-top: 4px; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 14px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; }
        .footer { margin-top: 24px; font-size: 10px; color: #9ca3af; text-align: right; border-top: 1px solid #e5e7eb; padding-top: 8px; }
        @media print { body { padding: 0; } @page { margin: 15mm; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="avatar">${user.name?.charAt(0)?.toUpperCase()}</div>
        <div>
          <h1>${user.name}</h1>
          <div class="role">${getRoleLabel(user.role)}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px">${getAccountStatusLabel(user.status)} · ID: ${user.id}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Informations de contact</div>
        <div class="grid">
          ${field('Email', user.email)}
          ${field('Téléphone', user.phone)}
          ${field('Pays', user.country_name || user.country)}
          ${field('Région', user.region)}
          ${field('Ville', user.city)}
          ${field('Fuseau horaire', user.timezone)}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Organisation</div>
        <div class="grid">
          ${field('Organisation', user.organisation)}
          ${field('Titre', user.job_title)}
          ${field('Département', user.department)}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Activité</div>
        <div class="grid">
          ${field('Inscription', user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : undefined)}
          ${field('Dernière connexion', user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('fr-FR') : 'Jamais')}
          ${field('Connexions', String(user.login_count))}
          ${field('Score de réputation', user.reputation_score !== undefined ? String(user.reputation_score) : undefined)}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Sécurité</div>
        <div class="grid">
          ${field('Email vérifié', user.email_verified ? 'Oui' : 'Non')}
          ${field('Téléphone vérifié', user.phone_verified ? 'Oui' : 'Non')}
          ${field('Double auth (2FA)', user.two_factor_enabled ? 'Activé' : 'Désactivé')}
          ${field('Niveau de vérification', user.verification_level)}
        </div>
      </div>

      <p class="footer">AgriIntel360 · Fiche générée le ${now}</p>
    </body>
    </html>
  `;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}

/**
 * Génère un rapport admin complet en PDF avec le logo AgriIntel360.
 */
export function exportAdminReportToPDF(params: {
  type: string;
  name: string;
  period: string;
  stats?: {
    users?: { total: number; active: number; verified: number; by_role?: Record<string, number> };
    system?: { version: string; environment: string; timestamp: string };
  } | null;
}) {
  const { type, name, period, stats } = params;
  const now = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const PERIOD_LABELS: Record<string, string> = {
    daily: "Aujourd'hui",
    weekly: 'Cette semaine',
    monthly: 'Ce mois',
    quarterly: 'Ce trimestre',
    yearly: 'Cette année',
    all: 'Tout l\'historique',
  };

  const periodLabel = PERIOD_LABELS[period] || period;

  // Build content sections per type
  let contentHtml = '';

  if (type === 'users' || type === 'all') {
    const u = stats?.users;
    const activeRate = u?.total ? Math.round((u.active / u.total) * 100) : 0;
    const verifiedRate = u?.total ? Math.round((u.verified / u.total) * 100) : 0;

    const byRoleRows = u?.by_role
      ? Object.entries(u.by_role)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 10)
          .map(([role, count]) => `
            <tr>
              <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${role}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${count}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${u.total ? Math.round((count as number) / u.total * 100) : 0}%</td>
            </tr>
          `).join('')
      : '';

    contentHtml += `
      <div style="margin-bottom:24px">
        <h2 style="font-size:16px;font-weight:700;color:#166534;margin-bottom:12px;border-bottom:2px solid #166534;padding-bottom:4px">
          📊 Statistiques Utilisateurs
        </h2>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px">
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;text-align:center">
            <div style="font-size:11px;color:#166534;font-weight:600">TOTAL</div>
            <div style="font-size:28px;font-weight:800;color:#111827">${u?.total ?? '—'}</div>
          </div>
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px;text-align:center">
            <div style="font-size:11px;color:#1d4ed8;font-weight:600">ACTIFS (${activeRate}%)</div>
            <div style="font-size:28px;font-weight:800;color:#111827">${u?.active ?? '—'}</div>
          </div>
          <div style="background:#fdf4ff;border:1px solid #e9d5ff;border-radius:8px;padding:12px;text-align:center">
            <div style="font-size:11px;color:#6b21a8;font-weight:600">VÉRIFIÉS (${verifiedRate}%)</div>
            <div style="font-size:28px;font-weight:800;color:#111827">${u?.verified ?? '—'}</div>
          </div>
        </div>

        ${byRoleRows ? `
          <h3 style="font-size:13px;font-weight:600;color:#374151;margin-bottom:8px">Répartition par rôle</h3>
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:#166534;color:white">
                <th style="padding:8px 12px;text-align:left;font-size:12px">Rôle</th>
                <th style="padding:8px 12px;text-align:center;font-size:12px">Nombre</th>
                <th style="padding:8px 12px;text-align:center;font-size:12px">%</th>
              </tr>
            </thead>
            <tbody>${byRoleRows}</tbody>
          </table>
        ` : ''}
      </div>
    `;
  }

  if (type === 'performance' || type === 'all') {
    const sys = stats?.system;
    contentHtml += `
      <div style="margin-bottom:24px">
        <h2 style="font-size:16px;font-weight:700;color:#166534;margin-bottom:12px;border-bottom:2px solid #166534;padding-bottom:4px">
          ⚡ Informations Système
        </h2>
        <table style="width:100%;border-collapse:collapse">
          <tbody>
            <tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">Version</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${sys?.version ?? '—'}</td></tr>
            <tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">Environnement</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-transform:capitalize">${sys?.environment ?? '—'}</td></tr>
            <tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">Horodatage</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${sys?.timestamp ? new Date(sys.timestamp).toLocaleString('fr-FR') : '—'}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600">Rapport généré le</td><td style="padding:8px 12px">${now}</td></tr>
          </tbody>
        </table>
      </div>
    `;
  }

  // For other types, placeholder
  if (!['users', 'performance', 'all'].includes(type)) {
    contentHtml = `
      <div style="text-align:center;padding:48px;color:#6b7280">
        <div style="font-size:48px;margin-bottom:12px">📄</div>
        <p style="font-size:14px">Ce rapport est généré par le serveur.</p>
        <p style="font-size:12px;margin-top:4px">Les données détaillées seront disponibles dans le fichier téléchargé.</p>
      </div>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <title>${name} — AgriIntel360</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #111827; }

        /* PAGE DE GARDE */
        .cover-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%);
          padding: 48px;
          text-align: center;
          page-break-after: always;
        }
        .logo-container {
          width: 120px;
          height: 120px;
          margin: 0 auto 24px;
          background: white;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          padding: 16px;
          overflow: hidden;
        }
        .logo-container img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .cover-title { font-size: 32px; font-weight: 800; color: #166534; margin-bottom: 8px; }
        .cover-subtitle { font-size: 18px; color: #374151; margin-bottom: 4px; }
        .cover-period { font-size: 14px; color: #6b7280; }
        .cover-meta { margin-top: 32px; font-size: 11px; color: #9ca3af; }
        .cover-line { width: 80px; height: 4px; background: #166534; margin: 24px auto; border-radius: 2px; }

        /* CONTENT PAGES */
        .content { padding: 32px; }

        /* PAGE HEADER with logo */
        .page-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 12px;
          border-bottom: 2px solid #166534;
          margin-bottom: 24px;
        }
        .header-logo {
          width: 40px;
          height: 40px;
          object-fit: contain;
        }
        .header-title { font-size: 14px; font-weight: 700; color: #166534; }
        .header-subtitle { font-size: 11px; color: #6b7280; }
        .header-right { margin-left: auto; text-align: right; font-size: 10px; color: #9ca3af; }

        /* FOOTER */
        .page-footer {
          position: fixed;
          bottom: 16px;
          left: 32px;
          right: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 10px;
          color: #9ca3af;
          border-top: 1px solid #e5e7eb;
          padding-top: 8px;
        }

        @media print {
          body { padding: 0; }
          @page { margin: 10mm; }
          .cover-page { page-break-after: always; }
        }
      </style>
    </head>
    <body>

      <!-- COVER PAGE -->
      <div class="cover-page">
        <div class="logo-container">
          <img src="/logo.png" alt="AgriIntel360" onerror="this.style.display='none';this.parentElement.innerHTML='<div style=font-size:48px>🌾</div>'" />
        </div>
        <div class="cover-title">AgriIntel360</div>
        <div class="cover-subtitle">Intelligence agricole pour l'Afrique</div>
        <div class="cover-line"></div>
        <div style="font-size:24px;font-weight:700;color:#111827;margin-bottom:8px">${name}</div>
        <div class="cover-period">Période : ${periodLabel}</div>
        <div class="cover-meta">Généré le ${now} • Rapport confidentiel</div>
      </div>

      <!-- CONTENT PAGE -->
      <div class="content">
        <!-- Page header with logo on every content page -->
        <div class="page-header">
          <img src="/logo.png" alt="" class="header-logo" onerror="this.style.display='none'" />
          <div>
            <div class="header-title">AgriIntel360 — ${name}</div>
            <div class="header-subtitle">Période : ${periodLabel}</div>
          </div>
          <div class="header-right">
            Généré le<br />${now}
          </div>
        </div>

        ${contentHtml}
      </div>

      <!-- Footer -->
      <div class="page-footer">
        <span>🌾 AgriIntel360 — Intelligence agricole pour l'Afrique</span>
        <span>Rapport confidentiel • ${now}</span>
      </div>

    </body>
    </html>
  `;

  const win = window.open('', '_blank', 'width=1000,height=800');
  if (!win) {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-${type}-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 700);
}
