# FlowArchitect: LLM to Draw.io Orchestrator

FlowArchitect is a lightweight, portable HTML/JS orchestrator that bridges the gap between Large Language Model (LLM) outputs and Draw.io architecture diagrams. 

## How it Works
1. **The Parser**: Provide the included `PROMPT_TEMPLATE.md` to any LLM (Gemini, M365 Copilot, Claude). Provide the LLM with your prose description of the desired architecture. It outputs a strictly formatted CSV.
2. **The Stylist & Assembler (This App)**: Paste the generated CSV into the left pane of this web app.
3. **The Rendering**: The app translates the simplified component names into complex Draw.io stencil shapes (currently focused on Azure Data and Databricks). It injects the assembled configuration into an embedded Draw.io iframe using its auto-layout capabilities.

## Usage
Simply open `index.html` in any web browser. No backend required.

## Tech Stack
* Vanilla HTML / CSS / JavaScript
* Draw.io Iframe API (`postMessage`)
* Native Draw.io CSV Auto-Layout Configuration

## Date - Action - Summary
* April 2026 - Initial configuration and git instantiation - Created repository structure and baseline logic plan.
