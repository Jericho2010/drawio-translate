const ICON_BASE = 'https://raw.githubusercontent.com/jgraph/drawio/master/src/main/webapp/img/lib/';

const imgStyle = (path) => {
    const imgUrl = path.startsWith('data:') ? path : (path.startsWith('http') ? path : ICON_BASE + path);
    return 'shape=image;html=1;image=' + imgUrl + ';verticalLabelPosition=bottom;verticalAlign=top;align=center;fontSize=11;fontColor=#333333;';
};
