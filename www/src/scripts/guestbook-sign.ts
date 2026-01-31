export function initGuestbookSign() {
  document.getElementById('sign-guestbook')?.addEventListener('click', async (e) => {
    e.preventDefault();
    const status = document.getElementById('guestbook-status')!;

    const name = prompt('name:');
    if (!name) return;

    const message = prompt('message:');
    if (!message) return;

    const url = prompt('url (optional):');

    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message, url: url || null }),
      });

      if (res.ok) {
        status.textContent = ' thanks! pending approval.';
      } else {
        status.textContent = ' error';
      }
    } catch {
      status.textContent = ' failed';
    }
  });
}
