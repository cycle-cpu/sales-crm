# Deploy: GitHub Pages (UI) + Cloudflare Worker (shared data)

The page is hosted free on GitHub Pages. A tiny Cloudflare Worker holds the shared
pipeline so you and your partner see the same data. The page talks to the Worker.

---

## A. Remove the old Cloudflare Pages project (if you made it)
```
npx wrangler pages project delete sales-crm
```
(or Cloudflare dashboard → Workers & Pages → sales-crm → Manage → Delete.)
This does NOT touch your KV data — you can reuse the namespace below.

---

## B. Deploy the Worker API  (run inside `sales-crm/api/`)
```
npx wrangler kv namespace create CRM        # paste the printed id into api/wrangler.toml
npx wrangler deploy                          # prints the Worker URL
npx wrangler secret put CRM_PASSCODE         # type the shared access code
```
The deploy prints something like `https://sales-crm-api.<your-subdomain>.workers.dev`.
Copy that URL.

> Already made a KV namespace earlier? Reuse its id instead of creating a new one:
> `npx wrangler kv namespace list`

---

## C. Point the page at the Worker
In `index.html`, set the API line to your Worker URL:
```js
const API='https://sales-crm-api.<your-subdomain>.workers.dev';
```

---

## D. Host the page on GitHub Pages
Already pushed to `github.com/cycle-cpu/sales-crm`. To turn on Pages:

```
# enable Pages on the main branch root
gh api -X POST repos/cycle-cpu/sales-crm/pages -f source[branch]=main -f source[path]=/
```
Or: GitHub repo → **Settings → Pages → Source: Deploy from a branch → main / root → Save**.

Your link will be: **https://cycle-cpu.github.io/sales-crm/**

After any edit:
```
git add -A && git commit -m "update" && git push
```
Pages redeploys in ~1 min.

---

## Done
Send your partner the github.io link + the access code. First load asks for the
code, then it auto-saves and polls every ~12s so you both stay in sync.

- Opened as a plain local file, it runs offline on that device only ("Local only").
- Last write wins — only matters if you both edit the *same* shop within ~12s.
- Rotate the code anytime: re-run `npx wrangler secret put CRM_PASSCODE` in `api/`.
