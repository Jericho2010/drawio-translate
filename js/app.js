const STENCILS = {
    'event_hubs': 'image;aspect=fixed;html=1;points=[];align=center;fontSize=12;image=https://app.diagrams.net/img/lib/azure2/internet_of_things/Event_Hubs.svg;',
    'databricks': 'image;aspect=fixed;html=1;points=[];align=center;fontSize=12;image=https://app.diagrams.net/img/lib/azure2/analytics/Azure_Databricks.svg;',
    'adls': 'image;aspect=fixed;html=1;points=[];align=center;fontSize=12;image=https://app.diagrams.net/img/lib/azure2/storage/Storage_Accounts.svg;',
    'powerbi': 'image;aspect=fixed;html=1;points=[];align=center;fontSize=12;image=https://app.diagrams.net/img/lib/azure2/other/Power_BI_Logo.svg;',
    'azure_sql': 'image;aspect=fixed;html=1;points=[];align=center;fontSize=12;image=https://app.diagrams.net/img/lib/azure2/databases/SQL_Databases.svg;',
    'cosmos_db': 'image;aspect=fixed;html=1;points=[];align=center;fontSize=12;image=https://app.diagrams.net/img/lib/azure2/databases/Azure_Cosmos_DB.svg;',
    'web_app': 'image;aspect=fixed;html=1;points=[];align=center;fontSize=12;image=https://app.diagrams.net/img/lib/azure2/app_services/App_Services.svg;',
    'delta_table': 'shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#dae8fc;strokeColor=#6c8ebf;',
    'container': 'swimlane;whiteSpace=wrap;html=1;startSize=20;fillColor=#f5f5f5;fontColor=#333333;strokeColor=#666666;',
    'user': 'shape=actor;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;',
    'default': 'rounded=1;whiteSpace=wrap;html=1;'
};

const iframe = document.getElementById('drawio-iframe');
let iframeReady = false;

// Wait for the draw.io iframe to send the "init" event
window.addEventListener('message', function(evt) {
    if (evt.data && evt.data.length > 0) {
        try {
            const msg = JSON.parse(evt.data);
            if (msg.event === 'init') {
                iframeReady = true;
                console.log("Draw.io iframe is ready.");
            }
        } catch (e) {
            // Ignore parse errors from other messages
        }
    }
});

document.getElementById('renderBtn').addEventListener('click', () => {
    if (!iframeReady) {
        alert("Draw.io editor is still loading. Please wait a moment.");
        return;
    }

    const rawCsv = document.getElementById('csvInput').value.trim();
    if (!rawCsv) {
        alert("Please paste a CSV format first.");
        return;
    }

    // Process the CSV
    const rows = rawCsv.split('\n');
    if (rows.length < 2) {
        alert("CSV needs headers and at least one row of data.");
        return;
    }

    // Extract headers
    let headerRow = rows[0];
    // Create new headers appending 'style'
    let newHeaderRow = headerRow + ',style';
    
    // Process data rows
    let newDataRows = [];
    for (let i = 1; i < rows.length; i++) {
        let line = rows[i].trim();
        if (!line) continue;
        
        // This is a naive CSV parser. If quotes are used in descriptions, 
        // a more robust CSV parser would be needed, but LLMs usually output clean commas for simple schemas.
        let cols = line.split(',');
        
        // The type column is index 3 (id,name,parent,type,connects_to,connection_label)
        let typeVal = cols[3] ? cols[3].trim().toLowerCase() : '';
        
        let mappedStyle = STENCILS[typeVal] || STENCILS['default'];
        
        // Append style
        newDataRows.push(line + ',' + mappedStyle);
    }

let drawioConfig = `# label: %name%
# style: %style%
# parent: %parent%
# connect: {"from": "connects_to", "to": "id", "invert": true, "label": "%connection_label%", "style": "edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;"}
# layout: auto
# nodespacing: 60
# levelspacing: 100
# edgespacing: 40
# padding: 15
## CSV Data begins
`;

    let finalCsvData = drawioConfig + newHeaderRow + '\n' + newDataRows.join('\n');
    console.log("Injecting Data:\n", finalCsvData);

    // Send payload to Draw.io via postMessage API
    const payload = {
        action: 'load',
        autosave: 1,
        title: 'ArchitectDiagram.drawio',
        descriptor: {
            format: 'csv',
            data: finalCsvData
        }
    };

    iframe.contentWindow.postMessage(JSON.stringify(payload), '*');
});
