
Math.randomFloat = function (min, max) {
    return (Math.random() * (max - min) + min).toFixed(4);
};

Math.randomInt = function (min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
};

var Vector2 = function (x, y) {
    this.x = x;
    this.y = y;
    this.magnitude = null;

    var that = this;

    this.Magnitude = function () {
        if(that.magnitude == null)
            that.magnitude = Math.sqrt(Math.pow(that.x, 2) + Math.pow(that.y, 2));
        return that.magnitude;
    };

    this.Normalize = function () {
        return new Vector2(that.x/that.Magnitude(), that.y/that.Magnitude());
    };

    this.Add = function (v1) {
        that.x += v1.x;
        that.y += v1.y;
        return that;
    };

    this.Multiply = function (number) {
        that.x *= number;
        that.y *= number;
        return that;
    };

    return this;
};

// Static methods

Vector2.up = new Vector2(0,1);

Vector2.down = new Vector2(0,-1);

Vector2.left = new Vector2(-1,0);

Vector2.right = new Vector2(1,0);

Vector2.one = new Vector2(1,1);

Vector2.none = new Vector2(-1,-1);

Vector2.zero = new Vector2(0,0);

Vector2.Distance = function (v1, v2) {
    var x = v1.x-v2.x;
    var y = v1.y-v2.y;
    return (new Vector2(x, y)).Magnitude();
};

Vector2.DistanceFast = function (v1, v2) {
    var x = v1.x-v2.x;
    var y = v1.y-v2.y;

    return Math.pow(x, 2) + Math.pow(y, 2);
};

Vector2.Between = function (v1, v2) {
    var x = v2.x - v1.x;
    var y = v2.y - v1.y;
    return new Vector2(v1.x + x/2, v1.y + y/2);
};

Vector2.VectorTo = function (v1, v2) {
    var x = v2.x - v1.x;
    var y = v2.y - v1.y;
    return new Vector2(x, y);
};

Vector2.RandomBetween = function (v1, v2) {
    var x = Math.randomInt(v1.x, v2.x);
    var y = Math.randomInt(v1.y, v2.y);
    return new Vector2(x, y);
};

Vector2.RandomInRange = function (v1, range) {
    var x = Math.randomInt(-range, range);
    var y = Math.randomInt(-range, range);
    return new Vector2(v1.x + x, v1.y + y);
};