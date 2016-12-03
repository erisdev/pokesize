// shamelessly copied & transliterated from spline-pokedex, which is licensed
// under the mit license. see <https://git.io/v1CoF> for the original
// implementation.

const {height_units, height_abbrs,
       weight_units, weight_abbrs,
       si_prefixes,  si_abbrs} = require('./units');

module.exports = function parse_size(size, height_or_weight) {
    // Parses a string that looks remotely like a height or weight.
    //
    // SI prefixes are allowed on any unit.  Yes.  Any.
    //
    // `size` is the string to parse.  `height_or_weight` should be either
    // 'height' or 'weight'.
    //
    // Returns a number of Pokémon units.  Height in decimeters; weight in
    // hectograms.
    //
    // This function assumes the input is valid.  If it dies for any reason,
    // the input is bogus.

    var units, abbrs, pokemon_unit;
    if (height_or_weight == 'height') {
        units = height_units;
        abbrs = height_abbrs;
        pokemon_unit = 0.1;
    }
    else if (height_or_weight == 'weight') {
        units = weight_units;
        abbrs = weight_abbrs;
        pokemon_unit = 0.1;
    }

    // A size looks like:
    // [NUMBER] [SI PREFIX] [UNIT]
    // ...where the number is optional, the SI prefix is optional, the unit
    // might be a Pokémon, and there may or may not be spaces anywhere in here.
    // And there can be multiple parts, e.g. 5'10" or 6m12cm.
    // In the case of ambiguity, no SI prefix wins.
    //
    // First thing to do is figure out where parts end.  A part must either
    // start with a number or be separated by a space from the previous part.
    // But "kilo meter" could then either be read as one kilometer, or one kilo
    // plus one meter.  The most flexible way to resolve this ambiguity is to
    // try the longest string first, then start breaking off pieces until
    // something valid is found.
    //
    // So!  First, break into what absolutely must be parts: a non-number
    // followed by a number must be a new part.
    // The original implementation assumes that dots not preceded by a space go
    // on the end of the unit, but javascript's regular expressions are
    // primitive trash with no support for lookbehind.
    size = size.trim()
    var rough_parts = size.split(/((?:[0-9]*[,.])?[0-9]+)/);

    // The first element will be either an empty string or a lone unit name...
    if (rough_parts[0] === '') {
        // Nothing; the string began with a number, so this is junk
        rough_parts.shift();
    }
    else {
        // Lone unit; insert an implied 1
        rough_parts.splice(0, 0, '1');
    }

    // 1'3 and 1m20 are common abbreviations
    var len = rough_parts.length;
    if (rough_parts[len - 1] === '') {
        if (rough_parts[len - 3] === 'lb')
            rough_parts[len - 1] = 'ounce';
        else if (rough_parts[len - 3] === 'm')
            rough_parts[len - 1] = 'centimeter';
        else if (rough_parts[len - 3] === "'")
            rough_parts[len - 1] = 'inch';
    }

    // Okay, now clean this up a bit.  Break into tuples of (num, unit, unit,
    // ...), remove whitespace everywhere, and turn the numbers into actual
    // numbers
    var parts = [];
    while (rough_parts.length > 0) {
        number = rough_parts.shift().trim();
        unit = rough_parts.shift().trim();

        number = number.replace(',', '.');  // euro decimal point
        number = parseFloat(number, 10);

        // Divide '   mega  metre  ' into ('mega', 'metre')
        unit_chunks = unit.split(/\s+/);

        parts.push([number, unit_chunks]);
    }


    // Alright!  Got a list of individual units.  Awesome.
    // Now go through them and try to turn them into something intelligible.
    // Use a while loop, because the list might be modified in-flight
    var result = 0.0;
    while (parts.length > 0) {
        var done = false;
        var [number, unit_chunks] = parts.pop();

        if (unit_chunks.length == 0) {
            // What?
            throw Error("couldn't understand units format, possibly missing a unit?");
        }

        // There are several possibilities here:
        // - SI prefix might be part of the first chunk, the entire first chunk,
        //   or absent
        // - Unit name could be one or more chunks
        // - Entire first chunk could be an abbreviation
        // Run through each of these.  Remember, no-prefix and no-abbr win.

        var possible_units = [];  // (prefix, chunks) tuples

        // No prefix
        possible_units.push([ null, unit_chunks ]);

        // Prefix in first chunk
        var possible_prefix = unit_chunks[0].toLowerCase();
        if (si_prefixes.hasOwnProperty(possible_prefix)) {
            possible_units.push([ possible_prefix, unit_chunks.slice(1) ]);
        }

        // Prefix as part of first chunk
        for (let prefix_length of [3, 4, 5]) {
            possible_prefix = unit_chunks[0].slice(0, prefix_length);
            possible_prefix = possible_prefix.toLowerCase();

            if (si_prefixes.hasOwnProperty(possible_prefix)) {
                var chunks_sans_prefix = [ unit_chunks[0].slice(prefix_length),
                                           ...unit_chunks.slice(1) ];
                possible_units.push([ possible_prefix, chunks_sans_prefix ])
            }
        }

        // Abbreviations don't get spaces; "k m" is meaningless.
        // Also, abbreviations are the only place where case matters, and only
        // for the prefix
        if (unit_chunks.length === 1) {
            var unit = unit_chunks[0];
            if (unit.charAt(unit.length - 1) === '.') {
                unit = unit.slice(0, -1);
            }
            for (let prefix_length of [0, 1, 2]) {
                var prefix = unit.slice(0, prefix_length)
                var abbr   = unit.slice(prefix_length);
                abbr = abbr.toLowerCase()

                if ((!prefix || si_abbrs.hasOwnProperty(prefix)) && abbrs.hasOwnProperty(abbr)) {
                    possible_units.push([
                        prefix ? si_abbrs[prefix] : null,
                        [ abbrs[abbr] ]
                    ]);
                }
            }
        }

        // Prefix in possible_units is now guaranteed to be valid or None, so
        // part of the problem is solved.
        // See if the rest of the unit of any of these possibilities is good
        for (let [prefix, base_unit_chunks] of possible_units) {
            var base_unit = base_unit_chunks.join('')  // unit names have no spaces
            base_unit = base_unit.toLowerCase()

            // Some slightly special munging for a few units:
            if (['feet', "'"].indexOf(base_unit) !== -1) {
                base_unit = 'foot';
            }
            else if (['inches', '"'].indexOf(base_unit) !== -1) {
                base_unit = 'inch';
            }

            // Chump fix for plural names.  Some units end in 's', and should
            // take precedence
            if (!units.hasOwnProperty(base_unit) && base_unit.charAt(base_unit.length - 1) === 's') {
                base_unit = base_unit.slice(0, -1);
            }
            if (units.hasOwnProperty(base_unit)) {
                // Successful match!  Convert and we are DONE
                result += number * units[base_unit]
                        * (si_prefixes[prefix] || 1.0) / pokemon_unit;
                done = true;
                break;
            }
        }

        if (done) continue;

        // (the part that treats pokemon names as units is omitted)

        // XXX fallback: assume 'inch meter' is two parts
    }

    return result;
}
