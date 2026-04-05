export function initGuestbookForm() {
  const form = document.getElementById('guestbook-form') as HTMLFormElement | null;
  if (!form) return;

  const status = document.getElementById('guestbook-status')!;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';

    const data = new FormData(form);
    const name = (data.get('name') as string).trim();
    const message = (data.get('message') as string).trim();
    const url = (data.get('url') as string).trim() || null;

    if (!name || !message) return;

    const button = form.querySelector('button')!;
    button.disabled = true;

    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message, url }),
      });

      if (res.ok) {
        status.textContent = ' thanks! pending approval.';
        form.reset();
      } else if (res.status === 429) {
        status.textContent = ' too many requests, try later.';
      } else {
        const body = await res.json().catch(() => null);
        status.textContent = body?.error ? ` ${body.error}` : ' error';
      }
    } catch {
      status.textContent = ' failed';
    } finally {
      button.disabled = false;
    }
  });
}
