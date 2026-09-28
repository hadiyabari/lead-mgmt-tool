export default function CookiesPage() {
  return (
    <article className="m-legal">
      <h1>Cookie Policy</h1>
      <p>Last updated: 28 September 2026</p>

      <h2>How we ask</h2>
      <p>
        On your first visit we show a consent banner. You can choose Accept all (essential and
        analytics) or Essential only. You can change that choice later with Cookie preferences in the
        site footer.
      </p>

      <h2>Essential cookies</h2>
      <p>
        Required for security, client login sessions, and storing your cookie preference. These run
        regardless of analytics choice.
      </p>

      <h2>Analytics cookies and storage</h2>
      <p>
        Only if you Accept all: we record page views and related events (path, referrer, UTM
        parameters, a random session id in sessionStorage) via our own endpoint. We do not load
        third-party ad trackers on the marketing site by default.
      </p>

      <h2>If you choose Essential only</h2>
      <p>
        No analytics page_view events are sent. Contact form submissions still work because they are
        a service request you initiate, not background tracking.
      </p>

      <h2>Policy updates</h2>
      <p>
        When consent categories change, the stored preference version is invalidated and the banner
        is shown again.
      </p>

      <h2>Contact</h2>
      <p>03293318181 · contact form on this site.</p>
    </article>
  );
}
