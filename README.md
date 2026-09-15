![Diagrammaton banner](assets/diagrammation-banner.png)

# Diagrammaton

---

Diagrammaton is an HTML-first editor for rich, animated technical diagrams.

- Start from layered system-landscape and decision-workflow compositions.
- Combine semantic DOM components: platforms, boundaries, services, data stores, actors, actions, cards, and metrics.
- Add locally embedded technology logos for databases, DevOps, messaging, cloud, observability, and application runtimes.
- Combine software architecture with 40 reusable electronic symbols, including microcontrollers, sensors, buses, relays, motors, semiconductors, passive components, and power rails.
- Add local logos for AI, agentic and RAG stacks including LangChain, Hugging Face, Ollama, ONNX, PyTorch, TensorFlow, Gemini, Anthropic and Mistral AI.
- Connect components with curved, orthogonal, straight, animated, dashed, or bidirectional routes.
- Edit labels, badges, capabilities, colors, positions, and dimensions without drawing individual primitives.
- Zoom through large compositions while keeping every component and connector crisp.
- Download a self-contained HTML document first, followed by its animated GIF companion.
- Render the exported HTML with a local Python Playwright/Pillow service for high-fidelity GIFs.
- Switch between English and French and four visual themes while working.

Diagram nodes are real HTML elements. SVG is deliberately limited to the connector layer, giving the editor the expressive layout of a web document without sacrificing precise routes.

The component library currently includes more than 100 vector technology marks covering databases, delivery platforms, messaging, observability, cloud providers, languages, and frameworks. Brand vectors come from the CC0-licensed Simple Icons package and remain embedded in standalone HTML exports.

---

## See Diagrammaton in action

![Animated diagram example](assets/architecture.gif)

---

## Quickstart

### Install

```bash
npm install
python3 -m venv .gif-service-venv
.gif-service-venv/bin/pip install -r requirements-gif-service.txt
```

### Run

```bash
npm run gif:service
```

and

```bash
npm run dev
```

The GIF service binds to `127.0.0.1:8000`. Vite forwards `/api/gif` to it, so the editor downloads the standalone HTML first and then requests its GIF companion. For deployment, run the service behind the same reverse proxy as the editor, or set `GIF_SERVICE_URL` before starting Vite.
