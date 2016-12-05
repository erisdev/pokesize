// shamelessly copied & transliterated from spline-pokedex, which is licensed
// under the mit license. see <https://git.io/v1CoF> for the original
// implementation.

module.exports = {
    si_prefixes: {
        'yotta': 1e24,      'yocto': 1e-24,
        'zetta': 1e21,      'zepto': 1e-21,
        'exa'  : 1e18,      'atto' : 1e-18,
        'peta' : 1e15,      'femto': 1e-15,
        'tera' : 1e12,      'pico' : 1e-12,
        'giga' : 1e9,       'nano' : 1e-9,
        'mega' : 1e6,       'micro': 1e-6,
        'kilo' : 1000,      'milli': 0.001,
        'hecta': 100,       'centi': 0.01,
        'deca' : 10,        'deci' : 0.1
    },

    si_abbrs: {
        'Y' : 'yotta',      'y' : 'yocto',
        'Z' : 'zetta',      'z' : 'zepto',
        'E' : 'exa',        'a' : 'atto',
        'P' : 'peta',       'f' : 'femto',
        'T' : 'tera',       'p' : 'pico',
        'G' : 'giga',       'n' : 'nano',
        'M' : 'mega',       'µ' : 'micro',
        'k' : 'kilo',       'm' : 'milli',
        'h' : 'hecta',      'c' : 'centi',
        'da': 'deca',       'd' : 'deci'
    },

    // 1 of each unit is X meters
    height_units: {
        'pokemon':          0.1,

        'meter':            1,
        'metre':            1,

        'ångström':         1e-10,
        'angstrom':         1e-10,
        'thou':             0.0000254,
        'inch':             0.0254,
        'hand':             0.1016,
        'foot':             0.3048,
        'yard':             0.9144,
        'furlong':          201.168,
        'mile':             1609.344,
        'league':           4828.032,
        'link':             0.201168,
        'rod':              5.0292,
        'pole':             5.0292,
        'chain':            20.1168,

        // nautical
        'fathom':           1.853184,
        'cable':            185.3184,
        'nauticalmile':     1853.184,

        // astronomy and physics
        'astronomicalunit': 1.496e11,
        'lightyear':        9460730472580800,
        'lightsecond':      299792458,
        'lightminute':      17987547480,
        'lighthour':        1079252848800,
        'lightday':         2.59020684e13,
        'lightweek':        1.81314479e14,
        'lightfortnight':   3.62628958e14,
        'parsec':           3.0857e16,
        'plancklength':     1.61625281e-35,
        'lightplanck':      1.61625281e-35,

        // ancient
        'cubit':            0.45,
        'royalcubit':       0.525,

        // easter egg
        'smoot':            1.70180
    },

    height_abbrs: {
        'Å'  : 'ångström',
        'm'  : 'meter',
        'in' : 'inch',
        'h'  : 'hand',
        'ft' : 'foot',
        'yd' : 'yard',
        'mi' : 'mile',
        'li' : 'link',
        'rd' : 'rod',
        'ch' : 'chain',
        'fur': 'furlong',
        'lea': 'league',
        'ftm': 'fathom',
        'cb' : 'cable',
        'NM' : 'nauticalmile',
        'au' : 'astronomicalunit',
        'ly' : 'lightyear',
        'pc' : 'parsec'
    },

    // 1 of these is X kilograms
    weight_units: {
        'pokemon':          0.1,

        'grain':            0.00006479891,
        'dram':             0.001771845,
        'ounce':            0.02834952,
        'pound':            0.45359237,
        'stone':            6.35029318,
        'quarter':          12.70058636,
        'hundredweight':    45.359237,
        'shortton':         907.18474,
        'ton':              907.18474,
        'longton':          1016.0469088,
        'metricton':        1000,
        'troyounce':        0.03110348,
        'troypound':        0.3732417,
        'pennyweight':      0.001555174,
        'gram':             0.001,
        'bushel':           27.216,  // i.e., of wheat

        'planckmass':       2.1764411e-8
    },

    weight_abbrs: {
        'gr':   'grain',
        'dr':   'dram',
        'oz':   'ounce',
        'lb':   'pound',
        'lbs':  'pound', // at kiri's request
        'st':   'stone',
        'qtr':  'quarter',
        'cwt':  'hundredweight',
        'ozt':  'troyounce',
        'lbt':  'troypound',
        'dwt':  'pennyweight',
        'g':    'gram'
    }
};
