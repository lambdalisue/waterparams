(function(exports) {
"use strict";

const CELSIUS_COFF = new Decimal('273.15');

function sum(arr) {
    return arr.reduce(function(lhs, rhs) {
        return lhs.add(rhs);
    });
}

function rationalFunction(numerator, denominator) {
    return sum(numerator).div(sum(denominator));
}

exports.toCelsius = function toCelsius(kelvin) {
    return kelvin.sub(CELSIUS_COFF);
};

exports.toKelvin = function toKelvin(celsius) {
    return celsius.add(CELSIUS_COFF);
};

exports.estimateDiffusionCoefficient = function estimateDiffusionCoefficient(T) {
    // doi: 10.1063/1.2121687
    const D0    = new Decimal('1.635e-8');
    const Ts    = new Decimal('215.05');
    const gamma = new Decimal('2.063');
    // m^2 s^-1
    return D0.mul(T.div(Ts).sub(1).pow(gamma));
};

exports.estimateDensity = function estimateDensity(T) {
    // doi: 10.1021/je60064a005
    const a0 = new Decimal('999.83952');
    const a1 = new Decimal('16.945176');
    const a2 = new Decimal('-7.9870401e-3');
    const a3 = new Decimal('-46.170461e-6');
    const a4 = new Decimal('105.56302e-9');
    const a5 = new Decimal('-280.54253e-12');
    const b  = new Decimal('16.87985e-3');

    // Kelvin -> Celsius
    T = toCelsius(T);

    // kg/m^3
    return rationalFunction([
        a0,
        a1.mul(T),
        a2.mul(T.pow(2)),
        a3.mul(T.pow(3)),
        a4.mul(T.pow(4)),
        a5.mul(T.pow(5)),
    ], [
        new Decimal('1'),
        b.mul(T),
    ]);
};

exports.estimateIsothermalCompressibility = function estimateIsothermalCompressibility(T) {
    // doi: 10.1021/je60064a005
    let a0, a1, a2, a3, a4, a5, b;
    if (T.gt(100)) {
        // T < 100
        a0 = new Decimal('50.88496');
        a1 = new Decimal('0.6163813');
        a2 = new Decimal('1.459187e-3');
        a3 = new Decimal('20.08438e-6');
        a4 = new Decimal('-58.47727e-9');
        a5 = new Decimal('410.4110e-12');
        b  = new Decimal('19.67348e-3');
    } else {
        // 100 < T < 150
        a0 = new Decimal('50.884917');
        a1 = new Decimal('0.62590623');
        a2 = new Decimal('1.3848668e-3');
        a3 = new Decimal('21.603427e-6');
        a4 = new Decimal('-72.087667e-9');
        a5 = new Decimal('465.45054e-12');
        b  = new Decimal('19.859983e-3');
    }

    // Kelvin -> Celsius
    T = toCelsius(T);

    // 10^6 bar^-1 = 10^5 MPa^-1
    return rationalFunction([
        a0,
        a1.mul(T),
        a2.mul(T.pow(2)),
        a3.mul(T.pow(3)),
        a4.mul(T.pow(4)),
        a5.mul(T.pow(5)),
    ], [
        new Decimal('1'),
        b.mul(T),
    ]);
};

exports.estimateThermalExpansionCoefficient = function estimateThermalExpansionCoefficient(T) {
    // doi: 10.1021/je60064a005
    // a(t) = 1/V(t) d/dt V(t)
    //      = r(t)/M d/dt M/r(t)
    //      = r(t) d/dt (1 + bt)/(a0 + a1*t + a2*t^2 + a3*t^3 + a4*t^4 + a5*t^5)
    const a0 = new Decimal('999.83952');
    const a1 = new Decimal('16.945176');
    const a2 = new Decimal('-7.9870401e-3');
    const a3 = new Decimal('-46.170461e-6');
    const a4 = new Decimal('105.56302e-9');
    const a5 = new Decimal('-280.54253e-12');
    const b  = new Decimal('16.87985e-3');

    // Estimate density
    let r = estimateDensity(T);

    // Kelvin -> Celsius
    T = toCelsius(T);

    // K^-1
    let A = b;
    let B = sum([
        a0,
        a1.mul(T),
        a2.mul(T.pow(2)),
        a3.mul(T.pow(3)),
        a4.mul(T.pow(4)),
        a5.mul(T.pow(5)),
    ]);
    let C = b.mul(T).add(1).mul(sum([
        a1,
        a2.mul(T).mul(2),
        a3.mul(T.pow(2)).mul(3),
        a4.mul(T.pow(3)).mul(4),
        a5.mul(T.pow(4)).mul(5),
    ]));
    let D = B.pow(2);
    // 10^6 K^-1
    return r.mul(A.div(B).sub(C.div(D))).mul((new Decimal(10)).pow(6));
};


exports.estimateSpecificHeat = function estimateSpecificHeat(T) {
    // doi: 10.1021/je60064a005
    const a0 = new Decimal('4.1855');
    const a1 = new Decimal('0.996185');
    const a2 = new Decimal('0.0002874');
    const a3 = new Decimal('5.26');
    const a4 = new Decimal('0.011160');
    const a5 = new Decimal('-0.036');

    // Kelvin -> Celsius
    T = toCelsius(T);

    // J g^-1 K^-1
    return a0.mul(sum([
        a1,
        a2.mul(T.add(100).div(100).pow(a3)),
        a4.mul((new Decimal('10')).pow(a5.mul(T))),
    ]));
};

})(window);
