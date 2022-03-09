
const MAX_SPEED = 7;
const INITIAL_SPEED = 0.75;
let speed = INITIAL_SPEED;

let telar;
let features;
let playing = true;

const MAX_ZOOM = 1;
let defaultZoom;
let zoom;

let threadMargins;
let threadCount;

let backgroundColor;
let lightModifier;

let snapshotTaken = false;

function setup() {
    pseudorandom.fxhash();

    features = calculateFeatures();

    const telarBuilder = new TelarBuilder();
    
    telarBuilder.addWeavePatterns(specialPatterns);
    telarBuilder.addWeavePatterns(foursPatterns);
    telarBuilder.addWeavePatterns(eightsPatterns);
    telarBuilder.addWeavePatterns(sixteensPatterns);
    telarBuilder.addWeavePatterns(twentyFoursPatterns);
    
    telarBuilder.addColorPalettes(colorPalettes);
    telarBuilder.addColorPatterns(colorPatterns);
    
    switch(features["Size"]) {
        case "Small":
            zoom = defaultZoom = 0.618;
            threadCount = 33;
        break;
        default:
        case "Large":
            zoom = defaultZoom = 0.83;
            threadCount = 37;
        break;
    }
    switch(features["Thread"]) {
        case "Thin":
            threadMargins = 0.14;
        break;
        case "Normal":
            threadMargins = 0.10;
        break;
        default:
        case "Thick":
            threadMargins = 0.06;
        break;
    }
    switch(features["Background"]) {
        case "Lighter":
            lightModifier = 0.5;
        break;
        default:
        case "Darker":
            lightModifier = -0.7;
        break;
    }



    telar = telarBuilder.build(threadCount, threadMargins);
    createCanvas(windowWidth, windowHeight);
    telar.weave();


    backgroundColor = new Color(pseudorandom.pick(telar.colorPalette)).lightness(lightModifier).color();

    draw();
    cursor(HAND);
}

function draw() {
    if(playing) {
        render();
        telar.telarMatrix = gameOfTextile(telar.telarMatrix);
        if(!snapshotTaken && speed > INITIAL_SPEED) {
            fxpreview();
            snapshotTaken = true;
        }
        if(speed <= MAX_SPEED) {
            speed += 0.5;
            frameRate(speed);
        }
    }
}

function render() {
    background(backgroundColor);
    telar.draw(zoom);
}

function live(cell) {
    let horizontal = cell.over.orientation == "horizontal" ? cell.over : cell.under;
    let vertical = cell.over.orientation == "vertical" ? cell.over : cell.under;
    cell.under = horizontal;
    cell.over = vertical;
}

function die(cell) {
    let horizontal = cell.over.orientation == "horizontal" ? cell.over : cell.under;
    let vertical = cell.over.orientation == "vertical" ? cell.over : cell.under;
    cell.over = horizontal;
    cell.under = vertical;
}

function gameOfTextile(telarMatrix) {
    const newTelarMatrix = new Array(telarMatrix.length);

    function k(index, limit) {
        if(index < 0) {
            return limit + index;
        } else {
            return index % limit;
        }
    }

    for (let i = 0; i < telarMatrix.length; i++) {
        newTelarMatrix[i] = new Array(telarMatrix[i].length);
        for (let j = 0; j < telarMatrix[i].length; j++) {
            newTelarMatrix[i][j] = { ...telarMatrix[i][j] };

            let neighborsOn = 0;

            neighborLeft  = telarMatrix[k(i - 1, telarMatrix.length)][j];
            neighborRight = telarMatrix[k(i + 1, telarMatrix.length)][j];
            neighborUp    = telarMatrix[i][k(j - 1, telarMatrix[i].length)];
            neighborDown  = telarMatrix[i][k(j + 1, telarMatrix[i].length)];

            neighborLeftUp  = telarMatrix[k(i - 1, telarMatrix.length)][k(j - 1, telarMatrix[i].length)];
            neighborLeftDown = telarMatrix[k(i - 1, telarMatrix.length)][k(j + 1, telarMatrix[i].length)];
            neighborRightUp    = telarMatrix[k(i + 1, telarMatrix.length)][k(j - 1, telarMatrix[i].length)];
            neighborRightDown  = telarMatrix[k(i + 1, telarMatrix.length)][k(j + 1, telarMatrix[i].length)];


            if(neighborLeft.over.orientation == "vertical")  neighborsOn++;
            if(neighborRight.over.orientation == "vertical") neighborsOn++;
            if(neighborUp.over.orientation == "vertical")    neighborsOn++;
            if(neighborDown.over.orientation == "vertical")  neighborsOn++;

            if(neighborLeftUp.over.orientation == "vertical")  neighborsOn++;
            if(neighborLeftDown.over.orientation == "vertical")  neighborsOn++;
            if(neighborRightUp.over.orientation == "vertical")  neighborsOn++;
            if(neighborRightDown.over.orientation == "vertical")  neighborsOn++;

            if((neighborsOn == 2 || neighborsOn == 3) && telarMatrix[i][j].over.orientation == "vertical") {
                live(newTelarMatrix[i][j])              
            } else {    
                if(neighborsOn == 3 && telarMatrix[i][j].over.orientation == "horizontal") {
                    live(newTelarMatrix[i][j])              
                } else {
                    die(newTelarMatrix[i][j])              
                }            
            }
        }
    }

    for (let i = 0; i < newTelarMatrix.length; i++) {
        if(!newTelarMatrix[i].some(e => e.over.orientation == "vertical")) {
            live(newTelarMatrix[i][pseudorandom.integer(0, newTelarMatrix[i].length - 1)]);
        }
    }
    for (let j = 0; j < newTelarMatrix[0].length; j++) {
        hasOneOver = false;
        for (let i = 0; i < newTelarMatrix.length; i++) {
            if(newTelarMatrix[i][j].over.orientation == "vertical") {
                hasOneOver = true;
                break;
            }
        }
        if(!hasOneOver) {
            live(newTelarMatrix[pseudorandom.integer(0, newTelarMatrix.length - 1)][j]);
        }
    }

    return newTelarMatrix;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// Saves the artwork as an image of DESIRED_SIZE_IN_PIXELS size when the S key is pressed
// taking into consideration the pixel density of the user's display
function keyPressed() {
    if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
        telar.invertedX = !telar.invertedX;
        telar.revert = !telar.revert;
    }

    if (keyCode === 32) {
        playing = !playing;
    }

    if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
        telar.invertedY = !telar.invertedY;
        telar.revert = !telar.revert;
    }

    if (key == "f" || key == "F") {
        zoom = zoom == MAX_ZOOM ? defaultZoom : MAX_ZOOM;
    }

    if (keyCode === ENTER || keyCode === RETURN) {
        speed = INITIAL_SPEED;
        telar.weave();
    }

    if (key == "s" || key == "S") {
        const wasPlaying = playing;
        playing = false;
        const DESIRED_SIZE_IN_PIXELS = 6000;
        resizeCanvas(DESIRED_SIZE_IN_PIXELS / pixelDensity(), DESIRED_SIZE_IN_PIXELS / pixelDensity());
        render();
        saveCanvas('textile_bacteria_yepayepayepa_' + fxhash, 'png');
        windowResized();
        playing = wasPlaying;
    }


    render();
}

// Bacteria feeder
function mouseClicked() {
    for (let i = 0; i < 200; i++) {
        live(telar.telarMatrix[pseudorandom.integer(0, telar.telarMatrix.length - 1)][pseudorandom.integer(0, telar.telarMatrix[0].length - 1)]);        
    }

    render();
}