// ========================================================
// FlowArchitect - XML Generation Engine v2
// ========================================================
// Generates mxGraph XML with precise x,y positioning.
// No reliance on Draw.io's auto-layout.
// ========================================================

const ICON_BASE = 'https://raw.githubusercontent.com/jgraph/drawio/master/src/main/webapp/img/lib/';

const imgStyle = (path) =>
    'image;html=1;image=' + ICON_BASE + path + ';verticalLabelPosition=bottom;verticalAlign=top;align=center;fontSize=11;fontColor=#333333;';

const STENCILS = {
    // ---- Structural ----
    'zone': {
        style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#E6F2E6;strokeColor=#82b366;fontColor=#333333;fontSize=11;fontStyle=1;verticalAlign=top;spacingTop=5;',
        w: 'auto', h: 'auto'
    },
    'zone_blue': {
        style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6c8ebf;fontColor=#333333;fontSize=11;fontStyle=1;verticalAlign=top;spacingTop=5;',
        w: 'auto', h: 'auto'
    },
    'governance_bar': {
        style: 'rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#cccccc;fontColor=#333333;fontSize=10;fontStyle=0;align=center;verticalAlign=middle;',
        w: 'auto', h: 35
    },
    // ---- Data Sources ----
    'data_source': {
        style: 'rounded=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;fontColor=#333333;fontSize=11;align=center;verticalAlign=middle;',
        w: 120, h: 45
    },
    // ---- Azure Services ----
    'adf':            { style: imgStyle('azure2/databases/Data_Factory.svg'),                  w: 48, h: 48 },
    'databricks':     { style: imgStyle('azure2/analytics/Azure_Databricks.svg'),              w: 48, h: 55 },
    'event_hubs':     { style: imgStyle('azure2/iot/Event_Hubs.svg'),                          w: 48, h: 48 },
    'cosmos_db':      { style: imgStyle('azure2/databases/Azure_Cosmos_DB.svg'),               w: 48, h: 48 },
    'azure_sql':      { style: imgStyle('azure2/databases/SQL_Database.svg'),                  w: 48, h: 48 },
    'powerbi':        { style: imgStyle('azure2/power_platform/PowerBI.svg'),                  w: 48, h: 55 },
    'synapse':        { style: imgStyle('azure2/analytics/Azure_Synapse_Analytics.svg'),       w: 48, h: 48 },
    'stream_analytics': { style: imgStyle('azure2/analytics/Stream_Analytics_Jobs.svg'),       w: 48, h: 48 },
    'purview':        { style: imgStyle('azure2/databases/Azure_Purview_Accounts.svg'),        w: 48, h: 48 },
    'data_catalog':   { style: imgStyle('azure2/integration/Azure_Data_Catalog.svg'),          w: 48, h: 48 },
    'adls':           { style: imgStyle('azure2/storage/Data_Lake_Storage_Gen1.svg'),          w: 48, h: 48 },
    'azure_monitor':  { style: imgStyle('azure2/management_governance/Monitor.svg'),           w: 48, h: 48 },
    'web_app':        { style: imgStyle('azure2/app_services/App_Services.svg'),               w: 48, h: 48 },
    // ---- Storage layers ----
    'bronze_layer': {
        style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#333333;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;',
        w: 120, h: 45
    },
    'silver_layer': {
        style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontColor=#333333;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;',
        w: 120, h: 45
    },
    'gold_layer': {
        style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#D5E8D4;strokeColor=#82B366;fontColor=#333333;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;',
        w: 120, h: 45
    },
    // ---- Tools (no Azure icon) ----
    'tool': {
        style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#666666;fontColor=#333333;fontSize=10;align=center;verticalAlign=middle;',
        w: 70, h: 35
    },
    'consumer': {
        style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#f0f0f0;strokeColor=#999999;fontColor=#333333;fontSize=10;align=center;verticalAlign=middle;',
        w: 130, h: 40
    },
    // ---- Fallback ----
    'default': {
        style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#a6a6a6;fontColor=#333333;fontSize=11;',
        w: 120, h: 50
    }
};

// Layout constants (pixels)
const L = {
    leftMargin: 30,
    sourceColW: 140,   // width for the source column (col -1)
    phaseColW: 155,    // width per phase column
    headerY: 10,       // y of phase header labels
    headerH: 28,       // height of header labels
    contentY: 50,      // y start for first content row
    rowH: 100          // vertical spacing between rows
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
                console.log('Draw.io iframe ready (init event received)');
                document.getElementById('renderBtn').textContent = 'Render Diagram';
            }
        } catch (e) {}
    }
});

// Fallback: if init event not received after 12s, force ready
setTimeout(() => {
    if (!iframeReady) {
        console.warn('Draw.io init timeout — forcing ready state');
        iframeReady = true;
        document.getElementById('renderBtn').textContent = 'Render Diagram';
    }
}, 12000);

// Show loading state on button
document.getElementById('renderBtn').textContent = 'Loading Draw.io...';

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
            autosave: 1,
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
    // When multiple sources feed the same target, offset them vertically
    if (colBuckets[-1]) {
        const usedRows = new Set();
        colBuckets[-1].forEach(src => {
            const tgtEdge = edges.find(e => e.from === src.id);
            if (tgtEdge && byId[tgtEdge.to]?._row !== undefined) {
                let targetRow = byId[tgtEdge.to]._row;
                // Find next available row starting from target row
                while (usedRows.has(targetRow)) targetRow++;
                src._row = targetRow;
                usedRows.add(targetRow);
            } else {
                // No target edge — keep original row but avoid conflicts
                let row = src._row;
                while (usedRows.has(row)) row++;
                src._row = row;
                usedRows.add(row);
            }
        });
    }

    // --- 6. Compute pixel positions ---
    content.forEach(n => {
        const st = STENCILS[n.type] || STENCILS['default'];
        n._w = (st.w === 'auto') ? 120 : st.w;
        n._h = (st.h === 'auto') ? 50  : st.h;

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
            'text;html=1;align=center;verticalAlign=middle;strokeColor=none;fillColor=none;fontSize=13;fontStyle=1;fontColor=#333333;',
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
            style += 'labelBackgroundColor=#107c41;fontColor=#ffffff;fontSize=11;fontStyle=1;';
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
