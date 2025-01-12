## 🏃 Running locally

### 🍞 Bun installation <sup>Visit [bun.sh](https://bun.sh/) for more info</sup>

```bash
curl https://bun.sh/install | bash
```

### 📦 To install dependencies

```bash
bun install
```

### 🚀 To run

```bash
bun run start
```

➡️ Access the GUI at `http://localhost:6200/`

---

## 🐳 Running with Docker

### 🏠 Locally

```bash
docker build -t janus .
docker run -p 6200:6200 -v /local/mount/path:/uploads -v /local/mount/path:/timelines janus
```
