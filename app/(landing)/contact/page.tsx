import type { Metadata } from 'next';
import { Mail, Phone, Clock, Send, ArrowRight } from 'lucide-react';
import { APP_CONTACT_EMAIL, APP_SUPPORT_PHONE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contact — AgriIntel360',
  description: 'Contactez AgriIntel360 pour une démo, un accompagnement ou une question sur nos solutions agricoles.',
};

const SECTORS = [
  { label: 'Végétal',      color: '#22C55E' },
  { label: 'Animal',       color: '#D97706' },
  { label: 'Halieutique',  color: '#38BDF8' },
  { label: 'Forestier',    color: '#86EFAC' },
];

// Agricultural parcels mosaic — 45 cells, 9 columns × 5 rows
const PARCEL_PALETTE = [
  '#0F4D22', '#17622A', '#1A7530', '#4ADE80', '#22C55E',
  '#16A34A', '#D97706', '#0C1810', '#1A3726', '#7A9475',
  '#E8A733', '#17622A', '#22C55E', '#1A7530', '#4ADE80',
  '#0891B2', '#1A3726', '#16A34A', '#E8A733', '#0F4D22',
  '#38BDF8', '#1A7530', '#D97706', '#4ADE80', '#17622A',
  '#22C55E', '#0891B2', '#1A3726', '#16A34A', '#D97706',
  '#4ADE80', '#E8A733', '#0F4D22', '#22C55E', '#1A7530',
  '#17622A', '#D97706', '#16A34A', '#38BDF8', '#4ADE80',
  '#1A3726', '#E8A733', '#22C55E', '#0F4D22', '#1A7530',
];

const PARCELS_OPACITIES = PARCEL_PALETTE.map((_, i) =>
  0.38 + Math.abs(Math.sin(i * 1.3 + 0.7)) * 0.58
);

export default function ContactPage() {
  return (
    <main style={{ color: '#E8E0CC', background: '#0C1810' }}>
      {/* ── Global interactive styles ─────────────────────── */}
      <style>{`
        .ci {
          width: 100%;
          background: #0a1a0e;
          border: 1px solid rgba(74,222,128,0.13);
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 14px;
          color: #E8E0CC;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          font-family: inherit;
          line-height: 1.5;
          box-sizing: border-box;
        }
        .ci::placeholder { color: #384D38; }
        .ci:focus {
          border-color: rgba(74,222,128,0.45);
          box-shadow: 0 0 0 3px rgba(74,222,128,0.07);
        }
        .ci option { background: #0e2218; }
        .csb {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #E8A733;
          color: #0a1a0e;
          border: none;
          border-radius: 10px;
          padding: 13px 26px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: background 0.18s ease, transform 0.12s ease;
          flex-shrink: 0;
        }
        .csb:hover { background: #F5BE4A; transform: translateY(-1px); }
        .csb:active { transform: translateY(0); }
        .c-link-green { color: #4ADE80; text-decoration: none; font-weight: 600; }
        .c-link-green:hover { opacity: 0.75; }
        .c-card-link { display: block; text-decoration: none; color: inherit; transition: background 0.14s ease; }
        .c-card-link:hover > div { background: rgba(74,222,128,0.04) !important; }
        .c-ghost-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(74,222,128,0.06);
          border: 1px solid rgba(74,222,128,0.18);
          border-radius: 10px;
          padding: 11px 20px;
          font-size: 13px; font-weight: 600;
          color: #4ADE80; text-decoration: none;
          transition: background 0.15s ease;
        }
        .c-ghost-btn:hover { background: rgba(74,222,128,0.12); }
      `}</style>

      {/* ═══════════════════════════════════════════════════════
          HERO — parcel-grid texture + headline + quick card
      ═══════════════════════════════════════════════════════ */}
      <section
        style={{
          backgroundImage: `
            linear-gradient(rgba(74,222,128,0.032) 1px, transparent 1px),
            linear-gradient(90deg, rgba(74,222,128,0.032) 1px, transparent 1px)
          `,
          backgroundSize: '52px 52px',
          padding: '72px 0 64px',
        }}
      >
        <div className="mx-auto max-w-6xl px-6 lg:px-10">

          {/* Status pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(74,222,128,0.07)',
            border: '1px solid rgba(74,222,128,0.16)',
            borderRadius: '5px', padding: '5px 14px', marginBottom: '44px',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#4ADE80', display: 'block',
              boxShadow: '0 0 8px rgba(74,222,128,0.7)',
            }} />
            <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4ADE80' }}>
              Équipe disponible · Lun–Ven
            </span>
          </div>

          <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:items-start">

            {/* ── Left: headline ── */}
            <div>
              <h1 style={{
                fontSize: 'clamp(2.5rem, 5.5vw, 4.8rem)',
                fontWeight: '800',
                letterSpacing: '-0.04em',
                lineHeight: '1.02',
                color: '#F0EDE0',
                marginBottom: '24px',
              }}>
                Parlons de<br />
                <span style={{ color: '#4ADE80' }}>vos données</span><br />
                terrain.
              </h1>

              <p style={{
                fontSize: '16px', lineHeight: '1.8',
                color: '#6B8564', maxWidth: '480px', marginBottom: '40px',
              }}>
                Prévisions de récolte, suivi d'intrants, qualité du sol —
                notre équipe vous accompagne pour extraire de la valeur
                de chaque donnée agricole.
              </p>

              {/* Sector chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {SECTORS.map(s => (
                  <span key={s.label} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(255,255,255,0.025)',
                    border: `1px solid ${s.color}30`,
                    borderRadius: '5px', padding: '5px 13px',
                    fontSize: '11px', fontWeight: '600',
                    color: s.color, letterSpacing: '0.07em',
                  }}>
                    <span style={{
                      width: '5px', height: '5px', borderRadius: '50%',
                      background: s.color, display: 'inline-block',
                    }} />
                    {s.label}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Right: quick contact card ── */}
            <div style={{
              background: '#112119',
              border: '1px solid rgba(74,222,128,0.09)',
              borderRadius: '18px', padding: '28px',
            }}>
              <p style={{
                fontSize: '10px', fontWeight: '600',
                letterSpacing: '0.22em', textTransform: 'uppercase',
                color: '#4D6B5E', marginBottom: '24px',
              }}>
                Coordonnées directes
              </p>

              {([
                { Icon: Mail,  label: 'EMAIL',        value: APP_CONTACT_EMAIL, color: '#4ADE80', href: `mailto:${APP_CONTACT_EMAIL}` },
                { Icon: Phone, label: 'TÉLÉPHONE',    value: APP_SUPPORT_PHONE, color: '#E8A733', href: `tel:${APP_SUPPORT_PHONE.replace(/[^+0-9]/g, '')}` },
                { Icon: Clock, label: 'DISPONIBILITÉ', value: '9h–18h · Lun–Ven', color: '#6B8564', href: null },
              ] as const).map(({ Icon, label, value, color, href }, i) => {
                const inner = (
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '14px',
                    padding: i > 0 ? '18px 0 0' : '0',
                    borderTop: i > 0 ? '1px solid rgba(74,222,128,0.06)' : 'none',
                    marginTop: i > 0 ? '18px' : '0',
                    background: 'transparent',
                    transition: 'background 0.15s',
                  }}>
                    <span style={{
                      width: '36px', height: '36px', borderRadius: '9px', flexShrink: 0,
                      background: `${color}14`, border: `1px solid ${color}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color,
                    }}>
                      <Icon size={16} />
                    </span>
                    <div>
                      <p style={{ fontSize: '9px', color: '#4D6B5E', letterSpacing: '0.18em', marginBottom: '3px' }}>{label}</p>
                      <p style={{
                        fontSize: '13px', fontWeight: '600',
                        color: href ? color : '#C4D4BC',
                        wordBreak: 'break-all',
                      }}>
                        {value}
                      </p>
                    </div>
                  </div>
                );
                return href ? (
                  <a key={label} href={href} className="c-card-link">{inner}</a>
                ) : (
                  <div key={label}>{inner}</div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FORM + SIDEBAR
      ═══════════════════════════════════════════════════════ */}
      <section style={{ paddingBottom: '80px' }}>
        <div className="mx-auto max-w-6xl px-6 lg:px-10">

          {/* Section divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '0 0 48px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(74,222,128,0.08)' }} />
            <p style={{
              fontSize: '10px', fontWeight: '600',
              letterSpacing: '0.22em', textTransform: 'uppercase', color: '#4D6B5E',
            }}>
              Écrivez-nous
            </p>
            <div style={{ flex: 1, height: '1px', background: 'rgba(74,222,128,0.08)' }} />
          </div>

          <div className="grid gap-8 lg:grid-cols-[3fr_2fr] lg:items-start lg:gap-10">

            {/* ════════════════════════
                FORM PANEL
            ════════════════════════ */}
            <div style={{
              background: '#112119',
              border: '1px solid rgba(74,222,128,0.08)',
              borderRadius: '20px',
              padding: 'clamp(28px, 4vw, 52px)',
            }}>
              <h2 style={{
                fontSize: 'clamp(1.5rem, 2.8vw, 2.15rem)',
                fontWeight: '700', letterSpacing: '-0.025em',
                marginBottom: '8px', color: '#F0EDE0',
              }}>
                Décrivez votre projet.
              </h2>
              <p style={{
                fontSize: '14px', color: '#6B8564',
                marginBottom: '36px', lineHeight: '1.8',
              }}>
                Un message précis nous permet de vous répondre avec
                la bonne expertise dès le premier échange.
              </p>

              <form action={`mailto:${APP_CONTACT_EMAIL}`} method="GET" encType="text/plain">
                <div style={{ display: 'grid', gap: '22px' }}>

                  {/* Row: name + org */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label style={{
                        display: 'block', fontSize: '10px', fontWeight: '700',
                        letterSpacing: '0.18em', textTransform: 'uppercase',
                        color: '#4D6B5E', marginBottom: '8px',
                      }}>
                        Nom complet
                      </label>
                      <input type="text" name="nom" placeholder="Votre nom" className="ci" />
                    </div>
                    <div>
                      <label style={{
                        display: 'block', fontSize: '10px', fontWeight: '700',
                        letterSpacing: '0.18em', textTransform: 'uppercase',
                        color: '#4D6B5E', marginBottom: '8px',
                      }}>
                        Organisation
                      </label>
                      <input type="text" name="organisation" placeholder="Votre structure" className="ci" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{
                      display: 'block', fontSize: '10px', fontWeight: '700',
                      letterSpacing: '0.18em', textTransform: 'uppercase',
                      color: '#4D6B5E', marginBottom: '8px',
                    }}>
                      Email professionnel
                    </label>
                    <input type="email" name="email" placeholder="votre@organisation.com" className="ci" />
                  </div>

                  {/* Sector */}
                  <div>
                    <label style={{
                      display: 'block', fontSize: '10px', fontWeight: '700',
                      letterSpacing: '0.18em', textTransform: 'uppercase',
                      color: '#4D6B5E', marginBottom: '8px',
                    }}>
                      Secteur agricole
                    </label>
                    <select name="secteur" className="ci" style={{ cursor: 'pointer' }}>
                      <option value="">Sélectionner un secteur</option>
                      <option value="vegetal">Agriculture Végétale</option>
                      <option value="animal">Élevage &amp; Animal</option>
                      <option value="halieutique">Halieutique &amp; Pêche</option>
                      <option value="forestier">Forestier</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label style={{
                      display: 'block', fontSize: '10px', fontWeight: '700',
                      letterSpacing: '0.18em', textTransform: 'uppercase',
                      color: '#4D6B5E', marginBottom: '8px',
                    }}>
                      Votre message
                    </label>
                    <textarea
                      name="body"
                      rows={5}
                      placeholder="Décrivez votre projet, vos données disponibles, et l'objectif recherché..."
                      className="ci"
                      style={{ resize: 'vertical', minHeight: '130px', lineHeight: '1.65' }}
                    />
                  </div>

                  {/* Actions row */}
                  <div style={{
                    display: 'flex', gap: '16px',
                    alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', paddingTop: '4px',
                  }}>
                    <p style={{ fontSize: '12px', color: '#4D6B5E', flex: 1, minWidth: '180px' }}>
                      Ou directement à{' '}
                      <a href={`mailto:${APP_CONTACT_EMAIL}`} className="c-link-green">
                        {APP_CONTACT_EMAIL}
                      </a>
                    </p>
                    <button type="submit" className="csb">
                      Envoyer le message
                      <Send size={14} />
                    </button>
                  </div>

                </div>
              </form>
            </div>

            {/* ════════════════════════
                SIDEBAR
            ════════════════════════ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Contact list */}
              <div style={{
                background: '#112119',
                border: '1px solid rgba(74,222,128,0.08)',
                borderRadius: '16px', overflow: 'hidden',
              }}>
                {([
                  { Icon: Phone, label: 'Téléphone',    value: APP_SUPPORT_PHONE,  sub: 'Lun–Ven · 9h–18h',       color: '#E8A733', href: `tel:${APP_SUPPORT_PHONE.replace(/[^+0-9]/g, '')}` },
                  { Icon: Mail,  label: 'Email',         value: APP_CONTACT_EMAIL,  sub: 'Réponse < 24h ouvrées', color: '#4ADE80', href: `mailto:${APP_CONTACT_EMAIL}` },
                  { Icon: Clock, label: 'Disponibilité', value: 'Lundi – Vendredi', sub: '9h00 à 18h00 (GMT)',    color: '#6B8564', href: null },
                ] as const).map(({ Icon, label, value, sub, color, href }, i) => {
                  const inner = (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '18px 22px',
                      borderBottom: i < 2 ? '1px solid rgba(74,222,128,0.05)' : 'none',
                      background: 'transparent', transition: 'background 0.14s',
                    }}>
                      <span style={{
                        width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                        background: `${color}12`, border: `1px solid ${color}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color,
                      }}>
                        <Icon size={18} />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{
                          fontSize: '9px', color: '#4D6B5E',
                          letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '2px',
                        }}>
                          {label}
                        </p>
                        <p style={{
                          fontSize: '13px', fontWeight: '600',
                          color: href ? color : '#C4D4BC',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {value}
                        </p>
                        <p style={{ fontSize: '11px', color: '#4D6B5E', marginTop: '1px' }}>{sub}</p>
                      </div>
                    </div>
                  );
                  return href ? (
                    <a key={label} href={href} className="c-card-link">{inner}</a>
                  ) : (
                    <div key={label}>{inner}</div>
                  );
                })}
              </div>

              {/* Mission block */}
              <div style={{
                background: '#112119',
                borderTop: '1px solid rgba(74,222,128,0.08)',
                borderRight: '1px solid rgba(74,222,128,0.08)',
                borderBottom: '1px solid rgba(74,222,128,0.08)',
                borderLeft: '3px solid #4ADE80',
                borderRadius: '0 14px 14px 0',
                padding: '22px 24px',
              }}>
                <p style={{
                  fontSize: '9px', fontWeight: '700',
                  letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: '#4ADE80', marginBottom: '10px',
                }}>
                  Notre mission
                </p>
                <p style={{ fontSize: '14px', lineHeight: '1.75', color: '#A8C4A0' }}>
                  Rendre les données agricoles actionnables pour chaque exploitant,
                  conseiller et décideur en Afrique.
                </p>
              </div>

              {/* ────────────────────────────────────────────────
                  AESTHETIC RISK: Agricultural parcels mosaic
                  Abstraction CSS des parcelles de terrain —
                  spécifique au monde agri, jamais vu sur contact
              ──────────────────────────────────────────────── */}
              <div style={{
                background: '#112119',
                border: '1px solid rgba(74,222,128,0.08)',
                borderRadius: '16px', padding: '20px',
              }}>
                <p style={{
                  fontSize: '9px', fontWeight: '700',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: '#4D6B5E', marginBottom: '14px',
                }}>
                  Couverture · 4 filières
                </p>

                {/* The parcel grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(9, 1fr)',
                  gap: '3px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}>
                  {PARCEL_PALETTE.map((color, i) => (
                    <div
                      key={i}
                      style={{
                        aspectRatio: '1',
                        background: color,
                        opacity: PARCELS_OPACITIES[i],
                        borderRadius: '1px',
                      }}
                    />
                  ))}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                  {SECTORS.map(s => (
                    <span key={s.label} style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      fontSize: '10px', color: '#6B8564',
                    }}>
                      <span style={{
                        width: '8px', height: '8px',
                        borderRadius: '2px', background: s.color, display: 'inline-block',
                      }} />
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CLOSING STRIP
      ═══════════════════════════════════════════════════════ */}
      <section style={{
        background: '#090F0A',
        borderTop: '1px solid rgba(74,222,128,0.07)',
        padding: '36px 0',
      }}>
        <div
          className="mx-auto max-w-6xl px-6 lg:px-10"
          style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
          }}
        >
          <div>
            <p style={{
              fontSize: '10px', color: '#4D6B5E',
              letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '5px',
            }}>
              Contact direct
            </p>
            <p style={{ fontSize: '15px', color: '#B4CAB0' }}>
              Écrivez directement à{' '}
              <a href={`mailto:${APP_CONTACT_EMAIL}`} className="c-link-green">
                {APP_CONTACT_EMAIL}
              </a>
            </p>
          </div>
          <a href={`mailto:${APP_CONTACT_EMAIL}`} className="c-ghost-btn">
            Ouvrir le client email
            <ArrowRight size={14} />
          </a>
        </div>
      </section>
    </main>
  );
}
