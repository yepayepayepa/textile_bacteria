const VERTICAL = "vertical";
const HORIZONTAL = "horizontal";

const STROKE_COLOR = "rgba(0, 0, 0, 1)";
const STROKE_WEIGHT = 0.5 / 1000;
const SHADOW_STROKE_WEIGHT = 3 / 1000;


class TelarAxis {
    constructor(length) {
        this.data = new Array(length);
        for (let i = 0; i < this.data.length; i++) {
            this.data[i] = { color: null, value: 0 };            
        }
    }

    setColors(colors, start = 0) {
        for (let i = 0;  i < colors.length && i + start < this.data.length; i++) {
            this.data[start + i].color = colors[i];
        }
    }

    setSeries(series, start = 0) {
        for (let i = 0;  i < series.length && i + start < this.data.length; i++) {
            this.data[start + i].value = series[i];
        }
    }
}

class Telar {
    constructor(threadingLength, treadlingLength, colorPalette, looseness) {
        this.threading = new TelarAxis(threadingLength);
        this.treadling = new TelarAxis(treadlingLength);
        this.colorPalette = colorPalette;
        this.looseness = looseness;
        this.invertedX = true;
        this.invertedY = true;

        this.revert = true;
    }

    setThreadingColors(colors, start = 0) {
        this.threading.setColors(colors, start);
    }

    setThreadingSeries(series, start = 0) {
        this.threading.setSeries(series, start);
    }

    setTreadlingColors(colors, start = 0) {
        this.treadling.setColors(colors, start);
    }

    setTreadlingSeries(series, start = 0) {
        this.treadling.setSeries(series, start);
    }

    setTieUp(tieUp) {
        this.tieUp = tieUp;
    }

    weave() {
        this.telarMatrix = [];

        let threadValue, treadleValue, over, under;
        for (let i = 0; i < this.treadling.data.length; i++) {
            this.telarMatrix[i] = new Array(this.threading.data.length);
            treadleValue = this.treadling.data[i].value - 1;
            for (let j = 0; j < this.threading.data.length; j++) {
                threadValue = this.threading.data[j].value - 1;
                if(this.tieUp[treadleValue][threadValue] > 0) {
                    over = VERTICAL;
                    under = HORIZONTAL;
                } else {
                    over = HORIZONTAL;
                    under = VERTICAL;
                }

                this.telarMatrix[i][j] = {
                    over: {
                        orientation: over,
                        color: over == VERTICAL ? this.threading.data[j].color : this.treadling.data[i].color,
                    },
                    under: {
                        orientation: under,
                        color: under == VERTICAL ? this.threading.data[j].color : this.treadling.data[i].color,
                    },
                    frame: {
                        x: j * (1 / this.threading.data.length),
                        y: i * (1 / this.treadling.data.length),
                        width: (1 / this.threading.data.length),
                        height: (1 / this.treadling.data.length),
                        lx: (1 / this.threading.data.length) * this.looseness,
                        ly: (1 / this.treadling.data.length) * this.looseness,
                    }
                }
            }
        }
    }

    draw(size) {
        const drawHorizontalThread = (thread, frame) => {
            noStroke();
            fill(thread.color);
            rect(0,      dimensionlessy(frame.y + frame.ly),
                 width,  dimensionless(frame.height - frame.ly * 2));

            stroke(STROKE_COLOR);
            strokeCap(SQUARE);

            strokeWeight(dimensionless(!this.invertedY ? STROKE_WEIGHT : SHADOW_STROKE_WEIGHT));
            line(
                0,     dimensionlessy(frame.y + frame.ly),
                width, dimensionlessy(frame.y + frame.ly)
            );

            strokeWeight(dimensionless(this.invertedY ? STROKE_WEIGHT : SHADOW_STROKE_WEIGHT));
            line(
                0,     dimensionlessy(frame.y + frame.height - frame.ly),
                width, dimensionlessy(frame.y + frame.height - frame.ly)
            );
        }

        const drawVerticalThread = (thread, frame) => {
            noStroke();
            fill(thread.color);
            rect(dimensionlessx(frame.x + frame.lx), 0,
                 dimensionless(frame.width - frame.lx * 2), height);

            stroke(STROKE_COLOR);
            strokeCap(SQUARE);

            strokeWeight(dimensionless(!this.invertedX ? STROKE_WEIGHT : SHADOW_STROKE_WEIGHT));
            line(
                dimensionlessx(frame.x + frame.lx), 0,
                dimensionlessx(frame.x + frame.lx), height
            );

            strokeWeight(dimensionless(this.invertedX ? STROKE_WEIGHT : SHADOW_STROKE_WEIGHT));
            line(
                dimensionlessx(frame.x + frame.width - frame.lx), 0,
                dimensionlessx(frame.x + frame.width - frame.lx), height
            );
        }

        let horizontal;
        for (let i = 0; i < this.telarMatrix.length; i++) {
            horizontal = this.telarMatrix[i][0].over.orientation == HORIZONTAL ? this.telarMatrix[i][0].over : this.telarMatrix[i][0].under;
            drawHorizontalThread(horizontal, this.resizeFrame(this.telarMatrix[i][0].frame, size));
        }

        let vertical;
        for (let j = 0; j < this.telarMatrix[0].length; j++) {
            vertical = this.telarMatrix[0][j].over.orientation == VERTICAL ? this.telarMatrix[0][j].over : this.telarMatrix[0][j].under;
            drawVerticalThread(vertical, this.resizeFrame(this.telarMatrix[0][j].frame, size));
        }
        
        for (let i = 0; i < this.telarMatrix.length; i++) {
            for (let j = 0; j < this.telarMatrix[i].length; j++) {
                this.render(this.telarMatrix[i][j], size);
            }
        }
    }


    resizeFrame(frame, size) {
        const margin = (1 - size) / 2;
        let frameX = frame.x;
        let frameY = frame.y;

        if(this.invertedX) {
            frameX = 1 - frameX - frame.width;
        }
        if(this.invertedY) {
            frameY = 1 - frameY - frame.height;
        }

        return {
            width: frame.width * size,
            height: frame.height * size,
            x: frameX * size + margin,
            y: frameY * size + margin,
            lx: frame.lx * size,
            ly: frame.ly * size,
        }
    }

    render(cross, size) {
        const HI_RES_CORRECTION = 0.7;
        const margin = (1 - size) / 2;


    
        const drawCrossThread = (thread, frame) => {
            const lx = frame.lx;
            const ly = frame.ly;

            let frameX = frame.x;
            let frameY = frame.y;

            if(this.invertedX) {
                frameX = 1 - frameX - frame.width;
            }
            if(this.invertedY) {
                frameY = 1 - frameY - frame.height;
            }

            if(thread.orientation === VERTICAL) {
                noStroke();
                fill(thread.color);
                rect(dimensionlessx(frameX + lx), dimensionlessy(frameY - ly * HI_RES_CORRECTION), dimensionless(frame.width - lx * 2), dimensionless(frame.height + lx * 2 * HI_RES_CORRECTION));

                stroke(STROKE_COLOR);
                strokeCap(SQUARE);
                strokeWeight(dimensionless(this.invertedX ? STROKE_WEIGHT : SHADOW_STROKE_WEIGHT));
                line(
                    dimensionlessx(frameX + lx) + dimensionless(frame.width - lx * 2), dimensionlessy(frameY - ly * HI_RES_CORRECTION),
                    dimensionlessx(frameX + lx) + dimensionless(frame.width - lx * 2), dimensionlessy(frameY - ly * HI_RES_CORRECTION) + dimensionless(frame.height + lx * 2 * HI_RES_CORRECTION)
                );

                strokeWeight(dimensionless(!this.invertedX ? STROKE_WEIGHT : SHADOW_STROKE_WEIGHT));
                line(
                    dimensionlessx(frameX + lx), dimensionlessy(frameY - ly * HI_RES_CORRECTION),
                    dimensionlessx(frameX + lx), dimensionlessy(frameY - ly * HI_RES_CORRECTION) + dimensionless(frame.height + lx * 2 * HI_RES_CORRECTION)
                );
            }
            if(thread.orientation === HORIZONTAL) {
                noStroke();
                fill(thread.color);
                rect(dimensionlessx(frameX - lx * HI_RES_CORRECTION), dimensionlessy(frameY + ly), dimensionless(frame.width + lx * 2 * HI_RES_CORRECTION), dimensionless(frame.height - ly * 2));

                stroke(STROKE_COLOR);
                strokeCap(SQUARE);
                strokeWeight(dimensionless(this.invertedY ? STROKE_WEIGHT : SHADOW_STROKE_WEIGHT));
                line(
                    dimensionlessx(frameX - lx * HI_RES_CORRECTION), dimensionlessy(frameY + ly) + dimensionless(frame.height - ly * 2),
                    dimensionlessx(frameX - lx * HI_RES_CORRECTION) + dimensionless(frame.width + lx * 2 * HI_RES_CORRECTION), dimensionlessy(frameY + ly) + dimensionless(frame.height - ly * 2)
                );
                strokeWeight(dimensionless(!this.invertedY ? STROKE_WEIGHT : SHADOW_STROKE_WEIGHT));
                line(
                    dimensionlessx(frameX - lx * HI_RES_CORRECTION), dimensionlessy(frameY + ly),
                    dimensionlessx(frameX - lx * HI_RES_CORRECTION) + dimensionless(frame.width + lx * 2 * HI_RES_CORRECTION), dimensionlessy(frameY + ly)
                );
            }
        };

        


        const resizeFrame = (frame) => {
            return {
                width: frame.width * size,
                height: frame.height * size,
                x: frame.x * size + margin,
                y: frame.y * size + margin,
                lx: frame.lx * size,
                ly: frame.ly * size,
            }
        }

        if(!this.revert) {
            drawCrossThread(cross.under, resizeFrame(cross.frame));
            drawCrossThread(cross.over,  resizeFrame(cross.frame));
        } else {
            drawCrossThread(cross.over,  resizeFrame(cross.frame));
            drawCrossThread(cross.under, resizeFrame(cross.frame));
        }
    }

    /**
     * Returns a prefilled array with TelayKeys ready to be used as threading or threadling
     * @param Number targetLength the desired length of the resulting array
     * @param Array colors the list of colors to use
     * @param Array pattern the pattern of repetition to be used to fill the threading or treadling with colors
     * @returns 
     */
    generateColorSeries(targetLength, colors, pattern) {
        if(pattern == undefined) {
            pattern = new Array(colors.length);
            pattern.fill(1);
        }

        const series = [];
        let colorIndex = 0;
        while(series.length < targetLength) {
            for (let i = 0; i < pattern.length; i++) {
                const current = pattern[i];
                for (let j = 0; j < current; j++) {
                    series.push(this.noiseColor(colors[colorIndex % colors.length]));
                    if(series.length == targetLength) {
                        return series;
                    }      
                }
                colorIndex++;
            }
        }
    }

    noiseColor(originalColor) {
        const noiseAmount = 10;
        const alteredColor = new Color(originalColor);
        alteredColor.addNoise(noiseAmount);
        return alteredColor.color();
    }

    generateNumberSeries(targetLength, pattern) {
        const series = [];
        while(series.length < targetLength) {
            for (let i = 0; i < pattern.length; i++) {
                series.push(pattern[i]);
                if(series.length == targetLength) {
                    return series;
                }
            }
        }
    }
}


class TelarBuilder {
    constructor() {
        this.weavePatterns = [];
        this.colorPalettes = [];
        this.colorPatterns = [];
    }

    addColorPalettes(colorPalettes) {
        this.colorPalettes = this.colorPalettes.concat(colorPalettes);
    }

    addColorPatterns(colorPatterns) {
        this.colorPatterns = this.colorPatterns.concat(colorPatterns);
    }

    addWeavePatterns(weavePatterns) {
        this.weavePatterns = this.weavePatterns.concat(weavePatterns);
    }

    overlapWeavePattern(telar, newWeavePattern, type, start, count) {
        let newRowNumber = telar.tieUp.length;
        let newColNumber = telar.tieUp[0].length;

        if(type == HORIZONTAL) {
            newRowNumber += newWeavePattern.tieUp.length;
            newColNumber = Math.max(telar.tieUp[0].length, newWeavePattern.tieUp[0].length);
        }
        if(type == VERTICAL) {
            newRowNumber = Math.max(telar.tieUp.length, newWeavePattern.tieUp.length);
            newColNumber += newWeavePattern.tieUp[0].length;
        }

        const newTieUp = new Array(newRowNumber);
        for (let i = 0; i < newRowNumber; i++) {
            newTieUp[i] = new Array(newColNumber);
            for (let j = 0; j < newColNumber; j++) {
                newTieUp[i][j] = 0;
                if(i < telar.tieUp.length && j < telar.tieUp[0].length) {
                    newTieUp[i][j] = telar.tieUp[i][j];
                } else {
                    if(type == HORIZONTAL && i >= telar.tieUp.length ||
                        type == VERTICAL && j >= telar.tieUp[0].length) {
                        newTieUp[i][j] = newWeavePattern.tieUp[i % newWeavePattern.tieUp.length][j % newWeavePattern.tieUp[0].length];
                    }
                }
            }
        }

        const newPatternColor = pseudorandom.pick(telar.colorPalette);

        if(type == VERTICAL) {
            for (let i = start; i < start + count && i < telar.threading.data.length; i++) {
                telar.threading.data[i].value = telar.tieUp[0].length + newWeavePattern.threading[i % newWeavePattern.threading.length];
                telar.threading.data[i].color = newPatternColor;
            }
        }
        if(type == HORIZONTAL) {
            for (let i = start; i < start + count && i < telar.treadling.data.length; i++) {
                telar.treadling.data[i].value = telar.tieUp.length + newWeavePattern.treadling[i % newWeavePattern.treadling.length];
                telar.treadling.data[i].color = newPatternColor;
            }
        }

        telar.tieUp = newTieUp;
    }

    build(telarSize, tightness) {       
        const baseWeavePattern = this.weavePatterns[pseudorandom.integer(0, this.weavePatterns.length - 1)];
        
        let selectedPalette = this.colorPalettes[pseudorandom.integer(0, this.colorPalettes.length - 1)];
        let selectedThreadPattern = this.colorPatterns[pseudorandom.integer(0, this.colorPatterns.length - 1)];
        let selectedTreadlePattern = this.colorPatterns[pseudorandom.integer(0, this.colorPatterns.length - 1)];
        
        // selectedPalette = this.colorPalettes[this.colorPalettes.length - 1];  // FOR TESTING ONLY
        // selectedThreadPattern = this.colorPatterns[this.colorPatterns.length - 1];  // FOR TESTING ONLY
        // selectedTreadlePattern = this.colorPatterns[this.colorPatterns.length - 1];  // FOR TESTING ONLY

        if(pseudorandom.boolean()) {
            selectedThreadPattern.reverse();
        }
        if(pseudorandom.boolean()) {
            selectedTreadlePattern.reverse();
        }
        
        const baseThreadingColorNumber = selectedPalette.length;
        const baseTreadlingColorNumber = selectedPalette.length;
        
        const telar = new Telar(telarSize, telarSize, selectedPalette, tightness);

        telar.setThreadingColors(telar.generateColorSeries(
                telarSize, 
                pseudorandom.pickAllowingRepeatedButNotAllTheSame(selectedPalette, baseThreadingColorNumber),
                selectedThreadPattern
            ));
        telar.setThreadingSeries(telar.generateNumberSeries(
                telarSize, 
                baseWeavePattern.threading
            ));
        
        telar.setTreadlingColors(telar.generateColorSeries(
                telarSize, 
                pseudorandom.pickAllowingRepeatedButNotAllTheSame(selectedPalette, baseTreadlingColorNumber),
                selectedTreadlePattern
            ));
        telar.setTreadlingSeries(telar.generateNumberSeries(
                telarSize, 
                baseWeavePattern.treadling
            ));
    
        telar.setTieUp(baseWeavePattern.tieUp);


        return telar;
    }
}