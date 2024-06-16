const header = document.getElementsByTagName('header')[0];
const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext('2d');
let currentColor = document.querySelector('.colors .current .active');
const fstColorBtn = document.querySelector('.colors .current .first');
const sndColorBtn = document.querySelector('.colors .current .second');

const selectFill = document.querySelector('.style .fill');
const selectStroke = document.querySelector('.style .stroke');
const selectWidth = document.querySelector('select.width');

canvas.width = innerWidth;
canvas.height = innerHeight;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.lineWidth = 1;
ctx.strokeStyle = 'black';

const airbrushWaitTime = 25;

let snapshot;
let polygonSnapshot;
let points = [];
let canEndPolygon = true;
let lastPos = { x: 0, y: 0 };
let isDrawing = false;
let stroke;
let fill;
let pressed = false;
let airbrushLoop;

const startDraw = (x, y) => {
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    isDrawing = true;
    pressed = true;
    if (useTool !== polygon) {
        ctx.beginPath();
        lastPos = { x, y };
    } else {
        if (!points[0]) {
            polygonSnapshot = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );
            points[0] = { x, y };
            polygon(x, y);
        } else {
            polygon(x, y);
            points.push;
        }
    }
    if (useTool === airbrush) {
        airbrushLoop = setInterval(() => fillAirbrush(x, y), airbrushWaitTime);
    } else if (useTool === brush) {
        ctx.arc(x, y, 0, 0, Math.PI * 2);
        ctx.stroke();
    } else if (useTool === eraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
    }
};

const endDraw = (x, y) => {
    isDrawing = false;
    if (useTool === polygon) {
        if (points[1]) {
            if (
                Math.hypot(
                    Math.abs(points[0].x - x),
                    Math.abs(points[0].y - y)
                ) < 10
            ) {
                endPolygon();
            }
        }
        if (points[0]) {
            points.push({ x, y });
        }
        lastPos = { x, y };
        setTimeout(() => (canEndPolygon = true), 500);
    }
    ctx.closePath();
    pressed = false;
    clearInterval(airbrushLoop);
};

const brush = (x, y) => {
    if (!isDrawing) return;
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastPos = { x, y };
};

const eraser = (x, y) => {
    if (!isDrawing) return;
    ctx.globalCompositeOperation = 'destination-out';
    brush(x, y);
    ctx.globalCompositeOperation = 'source-over';
};

const square = (x, y) => {
    if (!isDrawing) return;
    if (snapshot) ctx.putImageData(snapshot, 0, 0);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.rect(lastPos.x, lastPos.y, x - lastPos.x, y - lastPos.y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
};

const circle = (x, y) => {
    if (!isDrawing) return;
    if (snapshot) ctx.putImageData(snapshot, 0, 0);
    ctx.beginPath();
    ctx.ellipse(
        lastPos.x + (x - lastPos.x) / 2,
        lastPos.y + (y - lastPos.y) / 2,
        Math.abs(x - lastPos.x) / 2,
        Math.abs(y - lastPos.y) / 2,
        0,
        0,
        Math.PI * 2
    );
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
};

const triangle = (x, y) => {
    if (!isDrawing) return;
    if (snapshot) ctx.putImageData(snapshot, 0, 0);
    ctx.beginPath();
    ctx.moveTo(lastPos.x + (x - lastPos.x) / 2, lastPos.y);
    ctx.lineTo(x, y);
    ctx.lineTo(lastPos.x, y);
    ctx.lineTo(lastPos.x + (x - lastPos.x) / 2, lastPos.y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
};

const line = (x, y) => {
    if (!isDrawing) return;
    if (snapshot) ctx.putImageData(snapshot, 0, 0);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.stroke();
};

const airbrush = (x, y) => {
    if (!isDrawing) return;
    clearInterval(airbrushLoop);
    fillAirbrush(x, y);
    airbrushLoop = setInterval(() => fillAirbrush(x, y), airbrushWaitTime);
};

const fillAirbrush = (x, y) => {
    if (!isDrawing || useTool !== airbrush) return;
    for (let i = 0; i < parseFloat(ctx.lineWidth) / 10 + 1; i++) {
        let randX =
            Math.floor(Math.random() * ctx.lineWidth) - ctx.lineWidth / 2;
        let randY =
            Math.floor(Math.random() * ctx.lineWidth) - ctx.lineWidth / 2;
        ctx.fillRect(x + randX, y + randY, 1, 1);
    }
};

const colorPicker = (x, y) => {
    if (!isDrawing) return;

    const data = ctx.getImageData(x, y, 1, 1).data;
    const color = [data[0], data[1], data[2]];
    const hexColor = dataToHex(color);

    fstColorBtn.value = hexColor;
};

const dataToHex = (data) => {
    return (
        '#' +
        data
            .map((num) => num.toString(16))
            .map((string) => (string.length === 1 ? '0' + string : string))
            .join('')
    );
};

const polygon = (x, y) => {
    if (!isDrawing) return;
    if (snapshot) ctx.putImageData(snapshot, 0, 0);
    ctx.strokeStyle = '#aaaaaa';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.closePath();
    ctx.strokeStyle = fstColorBtn.value;
    ctx.lineWidth = selectWidth.value;
};

const endPolygon = () => {
    if (polygonSnapshot) ctx.putImageData(polygonSnapshot, 0, 0);
    ctx.strokeStyle = fstColorBtn.value;
    ctx.fillStyle = sndColorBtn.value;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.lineTo(points[0].x, points[0].y);
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
    ctx.closePath();
    points = [];
    polygonSnapshot = null;
};

const clearAll = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fillBackground();
    points = [];
};

const fillBackground = () => {
    ctx.globalCompositeOperation = 'destination-over';
    let aux = ctx.fillStyle;
    ctx.fillStyle = sndColorBtn.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = aux;
    ctx.globalCompositeOperation = 'source-over';
};

const setColor = (color) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    currentColor.value = color;
};

const setTool = (tool) => {
    if (tool === square || tool === triangle) {
        ctx.lineJoin = 'miter';
        ctx.lineCap = 'square';
    } else {
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
    }
    useTool = tool;
};

const setStroke = () => {
    stroke = selectStroke.value === 'true';
};

const setFill = () => {
    fill = selectFill.value === 'true';
};

const switchColorPos = () => {
    let fstValue = fstColorBtn.value;
    fstColorBtn.value = sndColorBtn.value;
    sndColorBtn.value = fstValue;
    currentColor = document.querySelector('.colors .current .active');
};

const setWidth = () => {
    ctx.lineWidth = parseInt(selectWidth.value);
};

let useTool = brush;

fstColorBtn.value = '#000000';
sndColorBtn.value = '#ffffff';

setFill();
setStroke();
setWidth();
fillBackground();

canvas.addEventListener('mousedown', (e) => {
    if (useTool === airbrush) {
        if (e.button === 0) {
            ctx.fillStyle = fstColorBtn.value;
        } else if (e.button === 2) {
            ctx.fillStyle = sndColorBtn.value;
        }
    } else {
        if (e.button === 0) {
            ctx.strokeStyle = fstColorBtn.value;
            ctx.fillStyle = sndColorBtn.value;
        } else if (e.button === 2) {
            ctx.strokeStyle = sndColorBtn.value;
            ctx.fillStyle = fstColorBtn.value;
        }
    }

    if (useTool === polygon) {
        if (e.button === 2 && canEndPolygon) {
            endPolygon();
        } else if (e.button === 0) {
            canEndPolygon = false;
            startDraw(e.offsetX, e.offsetY);
        }
    } else {
        startDraw(e.offsetX, e.offsetY);
    }

    fillBackground();
});

window.addEventListener('mouseup', (e) => {
    endDraw(e.offsetX, e.offsetY);
});

window.addEventListener('mousemove', (e) => {
    useTool(e.offsetX, e.offsetY);
    fillBackground();
});

canvas.addEventListener('contextmenu', (event) => event.preventDefault());

header.addEventListener('mousedown', () => {
    if (useTool === polygon && points[0]) {
        let aux = polygonSnapshot;
        endPolygon();
        if (snapshot) ctx.putImageData(snapshot, 0, 0);
        if (aux) ctx.putImageData(aux, 0, 0);
    }
});
