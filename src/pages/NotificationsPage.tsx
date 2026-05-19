import { useEffect, useState } from 'react';
import { Bell, BellOff, Check, Loader2 } from 'lucide-react';
import { api } from '../api';
import type { NotificationPreferences } from '../types';

const DAYS_OPTIONS = [3, 5, 7, 14, 21];
const SCORE_OPTIONS = [7, 8, 9];

type PermState = 'unknown' | 'granted' | 'denied' | 'unsupported';

function urlBase64ToArrayBuffer(base64: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const buf = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return buf;
}

export default function NotificationsPage() {
  const [permState, setPermState] = useState<PermState>('unknown');
  const [subscribed, setSubscribed] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    follow_up_enabled: 1,
    follow_up_days: 7,
    new_leads_enabled: 1,
    high_score_enabled: 1,
    high_score_threshold: 8,
    weekly_summary: 0,
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermState('unsupported');
      return;
    }
    setPermState(Notification.permission as PermState);

    // Check if already subscribed
    navigator.serviceWorker.ready.then(reg =>
      reg.pushManager.getSubscription()
    ).then(sub => setSubscribed(!!sub));

    // Load saved preferences
    api.getNotifPrefs().then(r => { if (r.preferences) setPrefs(r.preferences); });
  }, []);

  const enable = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { setPermState('denied'); setBusy(false); return; }
      setPermState('granted');

      const { publicKey } = await api.getVapidPublicKey();
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToArrayBuffer(publicKey),
      });

      const json = sub.toJSON();
      await api.subscribePush({
        endpoint: json.endpoint!,
        p256dh: json.keys!.p256dh,
        auth: json.keys!.auth,
      });
      setSubscribed(true);
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await api.unsubscribePush(sub.endpoint);
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    await api.saveNotifPrefs(prefs);
    setBusy(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (patch: Partial<NotificationPreferences>) =>
    setPrefs(p => ({ ...p, ...patch }));

  return (
    <div className="rung-notif-page">
      <div className="rung-page-heading">
        <h1>Notifications</h1>
        <p className="rung-page-subheading">Choose what you want Rung to remind you about.</p>
      </div>

      {/* Permission / enable section */}
      <div className="rung-notif-card">
        <div className="rung-notif-card-header">
          {subscribed
            ? <><Bell size={18} className="rung-notif-icon-on" /> Push notifications are on</>
            : <><BellOff size={18} className="rung-notif-icon-off" /> Push notifications are off</>
          }
        </div>

        {permState === 'unsupported' && (
          <p className="rung-notif-hint">Your browser doesn't support push notifications. Try Chrome or Firefox.</p>
        )}
        {permState === 'denied' && (
          <p className="rung-notif-hint">Notifications are blocked. Open your browser settings and allow notifications for this site, then reload.</p>
        )}
        {permState !== 'unsupported' && (
          subscribed
            ? <button className="rung-notif-toggle-btn off" onClick={disable} disabled={busy}>
                {busy ? <Loader2 size={15} className="spin" /> : <BellOff size={15} />}
                Turn off notifications
              </button>
            : <button className="rung-notif-toggle-btn on" onClick={enable} disabled={busy || permState === 'denied'}>
                {busy ? <Loader2 size={15} className="spin" /> : <Bell size={15} />}
                Turn on notifications
              </button>
        )}
      </div>

      {/* Preferences — only shown when subscribed */}
      {subscribed && (
        <div className="rung-notif-prefs">
          <h2 className="rung-notif-section-title">What to notify me about</h2>

          {/* Follow-up reminders */}
          <div className="rung-notif-row">
            <label className="rung-notif-toggle">
              <input
                type="checkbox"
                checked={!!prefs.follow_up_enabled}
                onChange={e => set({ follow_up_enabled: e.target.checked ? 1 : 0 })}
              />
              <span className="rung-notif-toggle-track" />
            </label>
            <div className="rung-notif-row-body">
              <div className="rung-notif-row-title">Follow-up reminders</div>
              <div className="rung-notif-row-desc">
                Alert me when an application has had no activity for
                <select
                  className="rung-notif-select"
                  value={prefs.follow_up_days}
                  disabled={!prefs.follow_up_enabled}
                  onChange={e => set({ follow_up_days: Number(e.target.value) })}
                >
                  {DAYS_OPTIONS.map(d => <option key={d} value={d}>{d} days</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* New leads */}
          <div className="rung-notif-row">
            <label className="rung-notif-toggle">
              <input
                type="checkbox"
                checked={!!prefs.new_leads_enabled}
                onChange={e => set({ new_leads_enabled: e.target.checked ? 1 : 0 })}
              />
              <span className="rung-notif-toggle-track" />
            </label>
            <div className="rung-notif-row-body">
              <div className="rung-notif-row-title">New job leads</div>
              <div className="rung-notif-row-desc">Notify me each morning when new leads are fetched from my sources.</div>
            </div>
          </div>

          {/* High-score lead */}
          <div className="rung-notif-row">
            <label className="rung-notif-toggle">
              <input
                type="checkbox"
                checked={!!prefs.high_score_enabled}
                onChange={e => set({ high_score_enabled: e.target.checked ? 1 : 0 })}
              />
              <span className="rung-notif-toggle-track" />
            </label>
            <div className="rung-notif-row-body">
              <div className="rung-notif-row-title">Strong matches</div>
              <div className="rung-notif-row-desc">
                Alert me when a lead scores
                <select
                  className="rung-notif-select"
                  value={prefs.high_score_threshold}
                  disabled={!prefs.high_score_enabled}
                  onChange={e => set({ high_score_threshold: Number(e.target.value) })}
                >
                  {SCORE_OPTIONS.map(s => <option key={s} value={s}>{s}+/10</option>)}
                </select>
                or higher.
              </div>
            </div>
          </div>

          {/* Weekly summary */}
          <div className="rung-notif-row">
            <label className="rung-notif-toggle">
              <input
                type="checkbox"
                checked={!!prefs.weekly_summary}
                onChange={e => set({ weekly_summary: e.target.checked ? 1 : 0 })}
              />
              <span className="rung-notif-toggle-track" />
            </label>
            <div className="rung-notif-row-body">
              <div className="rung-notif-row-title">Weekly summary</div>
              <div className="rung-notif-row-desc">A brief Monday morning summary of your pipeline — applications this week, active in process, total tracked.</div>
            </div>
          </div>

          <button className="rung-notif-save-btn" onClick={save} disabled={busy}>
            {saved
              ? <><Check size={15} /> Saved</>
              : busy ? <><Loader2 size={15} className="spin" /> Saving…</>
              : 'Save preferences'}
          </button>
        </div>
      )}
    </div>
  );
}
