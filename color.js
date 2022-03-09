class Color {
    constructor(v1, v2, v3) {
        if(typeof(v1) === "string" && v1.trim().startsWith("#") && v2 === undefined && v3 === undefined) {
            hex = v1.trim().replace('#', '');

            var bigint = parseInt(hex, 16);

            this.r = (bigint >> 16) & 255;
            this.g = (bigint >> 8) & 255;
            this.b = bigint & 255;
            this.a = 255;

            return;
        }
        if(v1 instanceof Color) {
            this.r = v1.levels[0];
            this.g = v1.levels[1];
            this.b = v1.levels[2];
            this.a = v1.levels[3];

            return;
        }

        throw "Color parameters not supported"
    }

    lightness(percentage) {
        this.r = Math.round(this.r * (1 + percentage));
        this.g = Math.round(this.g * (1 + percentage));
        this.b = Math.round(this.b * (1 + percentage));

        return this;
    }

    addNoise(amount) {
        this.r += min(max(pseudorandom.integer(-amount, amount), 0), 255);
        this.g += min(max(pseudorandom.integer(-amount, amount), 0), 255);
        this.b += min(max(pseudorandom.integer(-amount, amount), 0), 255);

        return this;
    }

    color() {
        return color(this.r, this.g, this.b);
    }
}