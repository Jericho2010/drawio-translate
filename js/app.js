// ========================================================
// FlowArchitect - XML Generation Engine
// ========================================================
// Generates mxGraph XML with precise x,y positioning.
// No reliance on Draw.io's auto-layout.
// ========================================================

const ICON_BASE = 'https://raw.githubusercontent.com/jgraph/drawio/master/src/main/webapp/img/lib/';

const STENCILS = {
    'data_source': {
        style: 'rounded=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;fontColor=#333333;fontSize=11;align=center;verticalAlign=middle;',
        w: 140, h: 50
    },
    'event_hubs': {
        style: 'image;html=1;image=' + ICON_BASE + 'azure2/iot/Event_Hubs.svg;verticalLabelPosition=bottom;verticalAlign=top;align=center;fontSize=11;fontColor=#333333;',
        w: 50, h: 50
    },
    'databricks': {
        style: 'image;html=1;image=' + ICON_BASE + 'azure2/analytics/Azure_Databricks.svg;verticalLabelPosition=bottom;verticalAlign=top;align=center;fontSize=11;fontColor=#333333;',
        w: 50, h: 60
    },
    'cosmos_db': {
        style: 'image;html=1;image=' + ICON_BASE + 'azure2/databases/Azure_Cosmos_DB.svg;verticalLabelPosition=bottom;verticalAlign=top;align=center;fontSize=11;fontColor=#333333;',
        w: 60, h: 60
    },
    'azure_sql': {
        style: 'image;html=1;image=' + ICON_BASE + 'azure2/databases/SQL_Database.svg;verticalLabelPosition=bottom;verticalAlign=top;align=center;fontSize=11;fontColor=#333333;',
        w: 50, h: 60
    },
    'powerbi': {
        style: 'image;html=1;image=' + ICON_BASE + 'azure2/power_platform/PowerBI.svg;verticalLabelPosition=bottom;verticalAlign=top;align=center;fontSize=11;fontColor=#333333;',
        w: 50, h: 60
    },
    'azure_monitor': {
        style: 'image;html=1;image=' + ICON_BASE + 'azure2/management_governance/Monitor.svg;verticalLabelPosition=bottom;verticalAlign=top;align=center;fontSize=11;fontColor=#333333;',
        w: 50, h: 50
    },
    'adls': {
        style: 'image;html=1;image=' + ICON_BASE + 'azure2/storage/Data_Lake_Storage_Gen1.svg;verticalLabelPosition=bottom;verticalAlign=top;align=center;fontSize=11;fontColor=#333333;',
        w: 50, h: 50
    },
    'dashboard': {
        style: 'rounded=0;whiteSpace=wrap;html=1;fillColor=#e8e8e8;strokeColor=#333333;fontColor=#333333;fontSize=11;align=center;verticalAlign=middle;',
        w: 80, h: 50
    },
    'default': {
        style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#a6a6a6;fontColor=#333333;fontSize=11;',
        w: 120, h: 50
    }
};

// Layout constants (pixels)
const L = {
    leftMargin: 30,
    sourceColW: 160,   // width for the source column (col -1)
    phaseColW: 170,    // width per phase column
    headerY: 10,       // y of phase header labels
    headerH: 30,       // height of header labels
    contentY: 55,      // y start for first content row
    rowH: 120          // vertical spacing between rows
};

// ---- Draw.io iframe communication ----
const iframe = document.getElementById('drawio-iframe');
let iframeReady = false;

window.addEventListener('message', function(evt) {
    if (evt.data && evt.data.length > 0) {
        try {
            const msg = JSON.parse(evt.data);
            if (msg.event === 'init') {
                iframeReady = true;
                console.log('Draw.io iframe ready');
            }
        } catch (e) {}
    }
});

document.getElementById('renderBtn').addEventListener('click', () => {
    if (!iframeReady) {
        alert('Draw.io is still loading. Please wait a moment.');
        return;
    }
    const csv = document.getElementById('csvInput').value.trim();
    if (!csv) return;

    try {
        const xml = buildDiagram(csv);
        console.log('Generated XML:\n', xml);
        iframe.contentWindow.postMessage(JSON.stringify({
            action: 'load',
            autosave: 0,
            xml: xml
        }), '*');
    } catch (err) {
        console.error('Diagram generation error:', err);
        alert('Error: ' + err.message);
    }
});

// ============================================================
// Main diagram builder: CSV → mxGraph XML
// ============================================================
function buildDiagram(csvText) {
    // --- 1. Parse CSV ---
    const lines = csvText.split('\n').filter(l => l.trim());
    const hdrs = lines[0].split(',').map(h => h.trim());
    const idx = name => hdrs.indexOf(name);

    const allNodes = [];
    const byId = {};

    for (let i = 1; i < lines.length; i++) {
        const vals = csvSplit(lines[i]);
        const n = {
            id:            (vals[idx('id')]            || '').trim(),
            name:          (vals[idx('name')]          || '').trim(),
            parent:        (vals[idx('parent')]        || '').trim(),
            type:          (vals[idx('type')]          || '').trim(),
            receives_from: (vals[idx('receives_from')] || '').trim(),
            step_number:   (vals[idx('step_number')]   || '').trim()
        };
        allNodes.push(n);
        byId[n.id] = n;
    }

    // --- 2. Separate phases from content ---
    const phases = allNodes.filter(n => n.type === 'phase');
    const content = allNodes.filter(n => n.type !== 'phase');
    const phaseIdx = {};
    phases.forEach((p, i) => { phaseIdx[p.id] = i; });

    // --- 3. Build edge list ---
    const edges = [];
    content.forEach(n => {
        if (!n.receives_from) return;
        n.receives_from.split(';').forEach(srcId => {
            srcId = srcId.trim();
            if (srcId && byId[srcId]) {
                edges.push({ from: srcId, to: n.id, step: n.step_number });
            }
        });
    });

    // --- 4. Assign columns ---
    // Phase children → phase's column index
    // Pure sources (no receives_from, no phase parent) → column -1
    // Others → topological: max(source columns) + 1
    content.forEach(n => {
        if (n.parent && phaseIdx[n.parent] !== undefined) {
            n._col = phaseIdx[n.parent];
        } else if (!n.receives_from) {
            n._col = -1;
        }
    });

    for (let iter = 0; iter < 20; iter++) {
        let changed = false;
        content.forEach(n => {
            if (n._col !== undefined) return;
            const srcs = n.receives_from.split(';').map(s => s.trim()).filter(Boolean);
            const cols = srcs.map(s => byId[s]?._col).filter(c => c !== undefined);
            if (cols.length > 0) {
                n._col = Math.max(...cols) + 1;
                changed = true;
            }
        });
        if (!changed) break;
    }
    content.forEach(n => { if (n._col === undefined) n._col = phases.length; });

    // --- 5. Assign rows within each column ---
    const colBuckets = {};
    content.forEach(n => {
        const c = n._col;
        if (!colBuckets[c]) colBuckets[c] = [];
        colBuckets[c].push(n);
    });
    Object.values(colBuckets).forEach(bucket => {
        bucket.forEach((n, i) => { n._row = i; });
    });

    // Align source nodes (col -1) to their target's row
    if (colBuckets[-1]) {
        colBuckets[-1].forEach(src => {
            const tgtEdge = edges.find(e => e.from === src.id);
            if (tgtEdge && byId[tgtEdge.to]?._row !== undefined) {
                src._row = byId[tgtEdge.to]._row;
            }
        });
    }

    // --- 6. Compute pixel positions ---
    content.forEach(n => {
        const st = STENCILS[n.type] || STENCILS['default'];
        n._w = st.w;
        n._h = st.h;

        if (n._col === -1) {
            n._x = L.leftMargin + (L.sourceColW - n._w) / 2;
        } else {
            const colX = L.leftMargin + L.sourceColW + n._col * L.phaseColW;
            n._x = colX + (L.phaseColW - n._w) / 2;
        }
        n._y = L.contentY + n._row * L.rowH;
    });

    // --- 7. Generate XML ---
    let nid = 100;
    let xml = '';

    // Phase column headers
    phases.forEach((p, i) => {
        const x = L.leftMargin + L.sourceColW + i * L.phaseColW;
        xml += mxVertex(nid++, esc(p.name),
            'text;html=1;align=center;verticalAlign=middle;strokeColor=none;fillColor=none;fontSize=14;fontStyle=1;fontColor=#333333;',
            x, L.headerY, L.phaseColW, L.headerH);
    });

    // Content nodes
    const cellMap = {};
    content.forEach(n => {
        const cid = nid++;
        cellMap[n.id] = cid;
        const st = STENCILS[n.type] || STENCILS['default'];
        xml += mxVertex(cid, esc(n.name), st.style, n._x, n._y, n._w, n._h);
    });

    // Edges with optional green step badges
    edges.forEach(e => {
        const eid = nid++;
        const sid = cellMap[e.from];
        const tid = cellMap[e.to];
        if (!sid || !tid) return;

        let style = 'edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#333333;strokeWidth=1.5;';
        if (e.step) {
            style += 'labelBackgroundColor=#107c41;fontColor=#ffffff;fontSize=12;fontStyle=1;';
        }
        xml += mxEdge(eid, e.step || '', style, sid, tid);
    });

    return '<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/>' + xml + '</root></mxGraphModel>';
}

// ---- XML element helpers ----
function mxVertex(id, value, style, x, y, w, h) {
    return '<mxCell id="' + id + '" value="' + value + '" style="' + style +
           '" vertex="1" parent="1"><mxGeometry x="' + x + '" y="' + y +
           '" width="' + w + '" height="' + h + '" as="geometry"/></mxCell>';
}

function mxEdge(id, value, style, source, target) {
    return '<mxCell id="' + id + '" value="' + value + '" style="' + style +
           '" edge="1" source="' + source + '" target="' + target +
           '" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>';
}

function esc(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
              .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function csvSplit(line) {
    const result = [];
    let cur = '';
    let inQ = false;
    for (const ch of line) {
        if (ch === '"') { inQ = !inQ; }
        else if (ch === ',' && !inQ) { result.push(cur); cur = ''; }
        else { cur += ch; }
    }
    result.push(cur);
    return result;
}
