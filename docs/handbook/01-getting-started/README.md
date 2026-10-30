# 01 · Getting started

> From a clean machine to a cited, checked answer on your own hardware.

This section takes you from nothing installed to a working workbench with the demonstration corpus loaded, and then walks you through the first hour of using it.

## In this section

| Page | You will learn |
|---|---|
| [1.1 What CERTUS is](01-overview.md) | The problem CERTUS solves, what it is, what it is not, and the four stages of every run |
| [1.2 Requirements](02-requirements.md) | Hardware, operating systems, software and the disk and memory the models need |
| [1.3 Install on Linux and macOS](03-install-linux-macos.md) | Python environment, frontend packages and OCR, step by step |
| [1.4 Install on Windows](04-install-windows.md) | The same on Windows, including the Job Object sandbox |
| [1.5 Install the models](05-models.md) | Which local models to pull, what each one is for, and what happens when one is missing |
| [1.6 Seed the corpus and run](06-seed-and-run.md) | Load the synthetic SOP corpus and start both services |
| [1.7 Your first hour](07-first-hour.md) | A guided tour: ask, cite, hold, approve, audit |
| [1.8 Installation troubleshooting](08-install-troubleshooting.md) | What goes wrong on a first install, and how to fix it |
| [1.9 Install on an air-gapped host](09-offline-install.md) | Build an offline bundle on a connected machine; verify every hash and model digest, then install without a network |

> [!IMPORTANT]
> CERTUS needs a local model runtime, [Ollama](https://ollama.com), running on the same machine. Without it the workbench starts, but every question fails with a local inference error. Install it before anything else.

## The short version

If you already have Python 3.11+, Node 20+ and Ollama:

```bash
git clone https://github.com/Yug-dev0/CERTUS.git
cd CERTUS

python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
(cd frontend && npm install)

ollama pull qwen2.5:3b
ollama pull qwen2.5vl:3b
ollama pull nomic-embed-text

python scripts/seed_demo_data.py
./scripts/run.sh
```

Then open **http://127.0.0.1:3000** and sign in as `engineer` with the password `workbench`.

<!-- nav:start -->

---

| | | |
|:--|:--:|--:|
| [← The CERTUS Handbook](../README.md) | [↑ The CERTUS Handbook](../README.md) | [1.1 · What CERTUS is →](01-overview.md) |

<!-- nav:end -->
