# FlowArchitect

> **Conceptualized by [Jericho2010](https://github.com/Jericho2010)**
>
> **LLM-generated CSV → Cinematic Architecture Diagrams**
>
> *Premium Obsidian-style interface with native multi-cloud stencil support.*

---

## 🚀 The Core Workflow

FlowArchitect bridges the gap between technical requirements and visual documentation. By leveraging powerful LLMs (Gemini, Claude, GPT-4, M365 Copilot), you can turn a plain-text description into a professional-grade Draw.io diagram in seconds.

1.  **Copy the Prompt**: Grab the [latest prompt template](prompts/PROMPT_TEMPLATE.md).
2.  **Describe your Cloud**: Describe your architecture in plain English.
3.  **Translate**: Paste the LLM's CSV output into the interface.
4.  **Polish**: Render, Copy XML, and paste directly into [diagrams.net (Draw.io)](https://app.diagrams.net).

---

## 🏛️ Evolution of FlowArchitect

FlowArchitect has evolved from a simple script into a sophisticated architectural design suite.

### **Phase 1: Inception (v1 – v2)**
The foundational engine was built to take raw CSV data and generate precise `mxGraph` XML. This eliminated the need for manual dragging and dropping by calculating coordinates with a custom grouping logic.

### **Phase 2: The Multi-Cloud Era (v3 – v5)**
Expansion of the native stencil registries. 
- **v3**: Introduced **Azure** native shapes and Hierarchical Boundaries (VNets, Subnets).
- **v4 - v5**: Integrated the **Snowflake** ecosystem, allowing for 1:1 mapping of Snowflake services (Data Engineering, Unistore, etc.) using official native icons.

### **Phase 3: Microsoft Fabric & Premium UI (v6 – v7)**
The suite transitioned to a high-fidelity "Obsidian Slate" design.
- **v6**: Major extraction and integration of the **Microsoft Fabric** official icon pack.
- **v7**: A complete cinematic overhaul. Introduced **Obsidian Slate Glassmorphism**, interactive workflow steppers, full-screen blurred modals, and a single-file portable HTML distribution.

---

## 📦 Project Organization

```text
drawio-translate/
├── app/                    # Web Application Source
│   ├── assets/             # Brand identity (Logo)
│   ├── css/                # Obsidian Slate Design System
│   ├── js/                 # Translation engine & logic
│   │   └── stencils/       # Multi-cloud stencil registries
│   └── index.html          # Development entry point
├── prompts/                # LLM System Prompts
├── releases/               # Legacy versions (v1 - v6)
├── scripts/                # Build and CI/CD tools
├── FlowArchitect_v7.html   # THE RELEASE: Portable inlined app
└── README.md               # You are here
```

---

## 📜 Credits & Sources

FlowArchitect is built on the shoulders of giants. We utilize official architectural shapes from the following ecosystems:

*   **Microsoft Fabric & Azure**: Icons derived from the official [Microsoft Fabric Icon Pack](https://learn.microsoft.com/en-us/fabric/get-started/fabric-icon-pack).
*   **Snowflake**: Stencils extracted from the official Snowflake Asset Library.
*   **Databricks**: Architecture shapes sourced from official [Databricks Repositories](https://github.com/databricks) and brand guidelines.
*   **Diagramming Engine**: Built for use with [diagrams.net (Draw.io)](https://app.diagrams.net).
*   **UI Assets**: Custom-designed SVGs inspired by [Lucide](https://lucide.dev) and [Phosphor Icons](https://phosphoricons.com).

---

## 🛠️ Build & Installation

To generate the portable version of FlowArchitect:

```bash
# Rebuild the portable HTML
node scripts/build.js
```

The resulting `FlowArchitect_v7.html` contains all CSS, JS, and Prompts in a single file, perfect for offline use or sensitive environments where a server is not allowed.

---

**© 2026 FlowArchitect Engineering.**
*"Draw at the speed of thought."*
