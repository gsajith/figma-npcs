figma.showUI(__html__, {width: 140, height: 80});

const nodes = [];
let zoom = figma.viewport.zoom;
let parentNode = null;

figma.ui.onmessage = msg => {
    if (msg.type === 'create-cursors') {
        createCursor().then(cursorGroup => {
            cursorGroup.x = figma.viewport.center.x;
            cursorGroup.y = figma.viewport.center.y;
            figma.currentPage.appendChild(cursorGroup);
            cursorGroup.rescale(1 / zoom);
            nodes.push({cursor: cursorGroup, target: getValidTarget(), moveWait: 0});

            if (!parentNode) {
                parentNode = figma.group([cursorGroup], figma.currentPage, figma.currentPage.children.length);
                parentNode.name = '😈😈😈 NPCs 😈😈😈';
            } else {
                parentNode.appendChild(cursorGroup);
            }
        });

        // This is how figma responds back to the ui
        figma.ui.postMessage({
            type: 'create-cursors',
            message: `Created ${msg.count} Cursors`,
        });
    }
};

const colors = [
    {r: 255 / 255, g: 199 / 255, b: 0 / 255},
    {r: 255 / 255, g: 159 / 255, b: 21 / 255},
    {r: 242 / 255, g: 78 / 255, b: 30 / 255},
    {r: 26 / 255, g: 188 / 255, b: 255 / 255},
    {r: 200 / 255, g: 77 / 255, b: 203 / 255},
    {r: 162 / 255, g: 89 / 255, b: 255 / 255},
    {r: 10 / 255, g: 207 / 255, b: 131 / 255},
];

const names = [
    'Cristina Finley',
    'Pola Mcdermott',
    'Lexi-Mai Hogan',
    'Hadiya Rowley',
    'Cameron Lane',
    'Ivie Winter',
    'Nimrah Smith',
    'Aarav Cooley',
    'Rhyley Kavanagh',
    'Juno David',
    'Wilma Dalby',
    'Wade Walker',
    'Josh Cooley',
    'Malaika Mcgowan',
    'Muskaan Marsden',
    'Reece Dickson',
    'Griffin Akhtar',
    'Eathan Miranda',
    'Eira Hodgson',
    'Gemma Parry',
    'Billy - Joe Abbott',
    'Campbell Sweeney',
    'Kaleem Khan',
    'Presley Ramsey',
    'Courtnie Adam',
    'Tyrell Burke',
    'Elaina Gale',
    'Lilly - May Sadler',
    'Joann Benton',
    'Peter Mcneil',
    'Ahyan Watson',
    'Nafeesa Melia',
    'Marek Correa',
    'Aneesa Spooner',
    'Muna Oneill',
    'Zak Jacobs',
    'Natalie Pierce',
    'Desiree Wheeler',
    'Lilliana Shea',
    'Reeva House',
];

const getFigmaColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
};

const getRandomName = () => {
    return names[Math.floor(Math.random() * names.length)];
};

async function createCursor() {
    const color = getFigmaColor();
    const name = getRandomName();

    let cursor = figma.createVector();
    cursor.vectorPaths = [
        {
            windingRule: 'EVENODD',
            data: 'M 0 0 L 4.65 22.19 L 10.71 13.68 L 20 12 Z',
        },
    ];
    cursor.fills = [{type: 'SOLID', color: color}];
    cursor.strokes = [{type: 'SOLID', color: {r: 1, g: 1, b: 1}}];
    cursor.effects = [
        {
            type: 'DROP_SHADOW',
            color: {r: 0, g: 0, b: 0, a: 0.45},
            blendMode: 'NORMAL',
            offset: {x: 0.52, y: 1.81},
            radius: 2.58,
            visible: true,
        },
    ];
    cursor.strokeWeight = 1.55;

    let group = figma.group([cursor], figma.currentPage, 0);
    group.name = '😈 NPC: ' + name;

    let frame = figma.createFrame();
    frame.layoutMode = 'HORIZONTAL';
    frame.counterAxisSizingMode = 'AUTO';

    let nameBox = figma.createText();
    await figma.loadFontAsync({family: 'Inter', style: 'Regular'});
    nameBox.fontName = {family: 'Inter', style: 'Regular'};
    nameBox.characters = name;
    nameBox.fontSize = 13.75;
    nameBox.letterSpacing = {value: 2.5, unit: 'PERCENT'};
    nameBox.setRangeFills(0, name.length, [{type: 'SOLID', color: {r: 1, g: 1, b: 1}}]);

    frame.appendChild(nameBox);
    frame.x = 16;
    frame.y = 23;
    frame.horizontalPadding = 5;
    frame.verticalPadding = 2;
    frame.fills = [{type: 'SOLID', color: color}];

    group.appendChild(frame);
    group.rescale(0.8);
    return group;
}

const targetHitRange = 10;
const cursorMoveInterval = 50;
const moveSpeed = 20;

setInterval(() => {
    nodes.forEach((node, index, object) => {
        if (figma.getNodeById(node.cursor.id) === null) {
            object.splice(index, 1);
            return;
        }
        if (node.moveWait <= 0) {
            if (
                Math.abs(node.cursor.x - node.target.x) < targetHitRange / figma.viewport.zoom &&
                Math.abs(node.cursor.y - node.target.y) < targetHitRange / figma.viewport.zoom
            ) {
                // Cursor reached target
                // 5% chance to just stand there... MENACINGLY
                node.moveWait = Math.random() * 5000 + 2000 + (Math.random() < 0.05 ? 15000 : 0);
                node.target = getValidTarget(0.75);
            } else {
                // Move toward the target
                let distToTargetX = node.target.x - node.cursor.x;
                let distToTargetY = node.target.y - node.cursor.y;
                let ratio = Math.min(Math.abs(distToTargetX / distToTargetY), 10);

                let moveX = (distToTargetX < 0 ? -1 : 1) * (moveSpeed / figma.viewport.zoom) * (ratio > 1 ? 1 : ratio);
                let moveY =
                    ((distToTargetY < 0 ? -1 : 1) * (moveSpeed / figma.viewport.zoom)) / (ratio < 1 ? 1 : ratio);
                node.cursor.x = node.cursor.x + moveX;
                node.cursor.y = node.cursor.y + moveY;
                console.log(moveX);
            }
        } else {
        }

        node.moveWait = node.moveWait - cursorMoveInterval;
    });
}, cursorMoveInterval);

const getValidTarget = (scaleFactor = 1) => {
    let x,
        y = 0;
    let bounds = figma.viewport.bounds;

    console.log(bounds);

    let marginX = (1 - scaleFactor) * bounds.width;
    let marginY = (1 - scaleFactor) * bounds.height;
    x = Math.floor(Math.random() * (bounds.width - marginX)) + (bounds.x + marginX);
    y = Math.floor(Math.random() * (bounds.height - marginY)) + (bounds.y + marginY);
    console.log(x, y);
    return {x: x, y: y};
};

setInterval(() => {
    if (figma.viewport.zoom !== zoom) {
        let oldZoom = zoom;
        zoom = figma.viewport.zoom;
        console.log(zoom);
        nodes.forEach(node => {
            node.cursor.rescale(oldZoom / zoom);
        });
    }
}, 50);
