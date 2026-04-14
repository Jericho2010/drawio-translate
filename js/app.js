const STENCILS = {
    'event_hubs': { style: 'image;aspect=fixed;html=1;points=[];align=center;fontSize=12;image=https://raw.githubusercontent.com/jgraph/drawio/master/src/main/webapp/img/lib/azure2/iot/Event_Hubs.svg;', w: 60, h: 60 },
    'databricks': { style: 'image;aspect=fixed;html=1;points=[];align=center;fontSize=12;image=https://raw.githubusercontent.com/jgraph/drawio/master/src/main/webapp/img/lib/azure2/analytics/Azure_Databricks.svg;', w: 60, h: 60 },
    'databricks_container': { style: 'swimlane;whiteSpace=wrap;html=1;startSize=30;fillColor=#ffffff;strokeColor=#f3722c;fontColor=#333333;fontStyle=1;dashed=1;shadow=1;spacingLeft=10;swimlaneLine=1;', w: 'auto', h: 'auto' },
    'adls': { style: 'image;aspect=fixed;html=1;points=[];align=center;fontSize=12;image=https://raw.githubusercontent.com/jgraph/drawio/master/src/main/webapp/img/lib/azure2/storage/Data_Lake_Storage.svg;', w: 60, h: 60 },
    'powerbi': { style: 'image;aspect=fixed;html=1;points=[];align=center;fontSize=12;image=https://raw.githubusercontent.com/jgraph/drawio/master/src/main/webapp/img/lib/azure2/power_platform/PowerBI.svg;', w: 60, h: 60 },
    'azure_sql': { style: 'image;aspect=fixed;html=1;points=[];align=center;fontSize=12;image=https://raw.githubusercontent.com/jgraph/drawio/master/src/main/webapp/img/lib/azure2/databases/SQL_Database.svg;', w: 60, h: 60 },
    'cosmos_db': { style: 'image;aspect=fixed;html=1;points=[];align=center;fontSize=12;image=https://raw.githubusercontent.com/jgraph/drawio/master/src/main/webapp/img/lib/azure2/databases/Azure_Cosmos_DB.svg;', w: 60, h: 60 },
    'web_app': { style: 'image;aspect=fixed;html=1;points=[];align=center;fontSize=12;image=https://raw.githubusercontent.com/jgraph/drawio/master/src/main/webapp/img/lib/azure2/app_services/App_Services.svg;', w: 60, h: 60 },
    'delta_table': { style: 'shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=10;fillColor=#f8f9fa;strokeColor=#0050ef;fontColor=#111111;fontStyle=1;shadow=1;', w: 60, h: 70 },
    'container': { style: 'swimlane;whiteSpace=wrap;html=1;startSize=30;fillColor=#ffffff;fontColor=#333333;strokeColor=#555555;dashed=1;shadow=1;', w: 'auto', h: 'auto' },
    'user': { style: 'shape=actor;whiteSpace=wrap;html=1;fillColor=#f8f9fa;strokeColor=#333333;fontColor=#333333;shadow=1;', w: 40, h: 60 },
    'default': { style: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#a6a6a6;fontColor=#333333;shadow=1;', w: 120, h: 60 }
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

    const rows = rawCsv.split('\n');
    if (rows.length < 2) {
        alert("CSV needs headers and at least one row of data.");
        return;
    }

    let headerRow = rows[0];
    let newHeaderRow = headerRow + ',style,width,height';
    
    let newDataRows = [];
    for (let i = 1; i < rows.length; i++) {
        let line = rows[i].trim();
        if (!line) continue;
        
        let cols = line.split(',');
        let typeVal = cols[3] ? cols[3].trim().toLowerCase() : '';
        
        let mappedNode = STENCILS[typeVal] || STENCILS['default'];
        
        newDataRows.push(line + ',' + mappedNode.style + ',' + mappedNode.w + ',' + mappedNode.h);
    }

    let drawioConfig = `# label: %name%
# style: %style%
# width: @width
# height: @height
# parent: %parent%
# connect: {"from": "connects_to", "to": "id", "invert": true, "style": "edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#666666;strokeWidth=2;"}
# layout: horizontalflow
# nodespacing: 70
# levelspacing: 120
# edgespacing: 50
# padding: 30
## CSV Data begins
`;

    let finalCsvData = drawioConfig + newHeaderRow + '\n' + newDataRows.join('\n');
    console.log("Injecting Data:\n", finalCsvData);

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
