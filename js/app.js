const STENCILS = {
    // Structural Elements
    'phase': { style: 'swimlane;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#333333;fontColor=#333333;fontStyle=0;startSize=40;dashed=0;align=center;', w: 'auto', h: 'auto' },
    'data_source': { style: 'shape=rectangle;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;fontColor=#333333;align=center;verticalAlign=middle;', w: 140, h: 60 },
    
    // Azure Icons (labels pushed entirely below the icon for professional look)
    'event_hubs': { style: 'image;html=1;image=https://raw.githubusercontent.com/jgraph/drawio/master/src/main/webapp/img/lib/azure2/iot/Event_Hubs.svg;verticalLabelPosition=bottom;verticalAlign=top;align=center;', w: 50, h: 50 },
    'databricks': { style: 'image;html=1;image=https://raw.githubusercontent.com/jgraph/drawio/master/src/main/webapp/img/lib/azure2/analytics/Azure_Databricks.svg;verticalLabelPosition=bottom;verticalAlign=top;align=center;', w: 50, h: 60 },
    'cosmos_db': { style: 'image;html=1;image=https://raw.githubusercontent.com/jgraph/drawio/master/src/main/webapp/img/lib/azure2/databases/Azure_Cosmos_DB.svg;verticalLabelPosition=bottom;verticalAlign=top;align=center;', w: 60, h: 60 },
    'powerbi': { style: 'image;html=1;image=https://raw.githubusercontent.com/jgraph/drawio/master/src/main/webapp/img/lib/azure2/power_platform/PowerBI.svg;verticalLabelPosition=bottom;verticalAlign=top;align=center;', w: 50, h: 60 },
    'azure_monitor': { style: 'image;html=1;image=https://raw.githubusercontent.com/jgraph/drawio/master/src/main/webapp/img/lib/azure2/management_governance/Monitor.svg;verticalLabelPosition=bottom;verticalAlign=top;align=center;', w: 50, h: 50 },
    'dashboard': { style: 'image;html=1;image=https://raw.githubusercontent.com/jgraph/drawio/master/src/main/webapp/img/lib/mscae/Dashboard.svg;verticalLabelPosition=bottom;verticalAlign=top;align=center;', w: 50, h: 50 },
    
    // Fallbacks
    'default': { style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#a6a6a6;fontColor=#333333;', w: 120, h: 60 }
};

const iframe = document.getElementById('drawio-iframe');
let iframeReady = false;

window.addEventListener('message', function(evt) {
    if (evt.data && evt.data.length > 0) {
        try {
            const msg = JSON.parse(evt.data);
            if (msg.event === 'init') {
                iframeReady = true;
                console.log("Draw.io iframe is ready.");
            }
        } catch (e) { }
    }
});

document.getElementById('renderBtn').addEventListener('click', () => {
    if (!iframeReady) {
        alert("Draw.io editor is loading. Please wait.");
        return;
    }

    const rawCsv = document.getElementById('csvInput').value.trim();
    if (!rawCsv) return;

    const rows = rawCsv.split('\n');
    if (rows.length < 2) return;

    let headerRow = rows[0];
    let newHeaderRow = headerRow + ',style,width,height';
    
    let newDataRows = [];
    for (let i = 1; i < rows.length; i++) {
        let line = rows[i].trim();
        if (!line) continue;
        
        let cols = line.split(',');
        let typeVal = cols[3] ? cols[3].trim().toLowerCase() : '';
        let stepVal = cols[5] ? cols[5].trim() : '';
        let nameVal = cols[1] || '';
        
        let mappedNode = STENCILS[typeVal] || STENCILS['default'];
        
        // Inject green circular badging dynamically if a step number exists
        if (stepVal) {
            nameVal = `<div style="position:absolute;top:0px;left:0px;background:#107c41;color:#fff;border-radius:10px;width:20px;height:20px;text-align:center;font-size:12px;font-weight:bold;line-height:20px;box-shadow:0 1px 3px rgba(0,0,0,0.3);z-index:99;">${stepVal}</div>` + nameVal;
        }

        // Push the augmented row (rebuilding line to inject the new injected HTML name)
        let newCols = [...cols];
        newCols[1] = `"${nameVal.replace(/"/g, '""')}"`; // Safely quote the HTML
        let newLine = newCols.join(',');

        newDataRows.push(newLine + ',' + mappedNode.style + ',' + mappedNode.w + ',' + mappedNode.h);
    }

    // Dynamic edge labels using step_number to create green circular numbered badges
    let drawioConfig = `# label: %name%
# style: %style%
# width: @width
# height: @height
# parent: %parent%
# connect: {"from": "receives_from", "to": "id", "style": "edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#111111;strokeWidth=1.5;"}
# layout: horizontalflow
# nodespacing: 80
# levelspacing: 120
# edgespacing: 40
# padding: 30
## CSV Data begins
`;

    let finalCsvData = drawioConfig + newHeaderRow + '\n' + newDataRows.join('\n');
    console.log("Injecting Data:\n", finalCsvData);

    const payload = {
        action: 'load',
        autosave: 1,
        title: 'ArchitectDiagram.drawio',
        descriptor: { format: 'csv', data: finalCsvData }
    };

    iframe.contentWindow.postMessage(JSON.stringify(payload), '*');
});
