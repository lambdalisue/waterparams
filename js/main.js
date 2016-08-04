(function(exports) {
"use strict";

function sum(arr) {
    return arr.reduce(function(lhs, rhs) {
        return lhs + rhs;
    });
}

exports.toCelsius = function toCelsius(kelvin) {
    return kelvin - 273.15;
};

exports.toKelvin = function toKelvin(celsius) {
    return celsius + 273.15;
};

exports.estimateDiffusionCoefficient = function estimateDiffusionCoefficient(kelvin) {
    const D0    = 1.635e-8; // +- 2.242e-11 [m^2 s^-1]
    const Ts    = 215.05;   // +- 1.29 [K]
    const gamma = 2.063;    // +- 0.051
    const D = D0 * Math.pow((kelvin/Ts) - 1, gamma);
    return D;
};

exports.estimateDensity = function estimateDensity(kelvin) {
    const a0 = 999.83952;
    const a1 = 16.945176;
    const a2 = -7.9870401e-3;
    const a3 = -46.170461e-6;
    const a4 = 105.56302e-9;
    const a5 = -280.54253e-12;
    const b  = 16.87985e-3;

    let celsius = toCelsius(kelvin);
    let terms = [
        a0,
        a1 * celsius,
        a2 * Math.pow(celsius, 2),
        a3 * Math.pow(celsius, 3),
        a4 * Math.pow(celsius, 4),
        a5 * Math.pow(celsius, 5),
    ];
    let d = sum(terms) / (1 + b * celsius);
    return d * 1e-3;  // kg/m^3 -> g/cm^3
}

})(window);
