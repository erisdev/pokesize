const bs = require('binarysearch');

const parse_size = require('./parse_size');
const units = require('./units');

var db = (function() {
    var pokemon = require('../db/pokemon.json');
    return {
        height: bs.indexObject(pokemon, (row) => row.height),
        weight: bs.indexObject(pokemon, (row) => row.weight),
        pokemon
    };
})();

// yes, this is a trivial implementation that doesn't handle arguments or
// context. don't need 'em, don't want to include a library just for this
function debounce(wait, func) {
    var timer;
    return function() {
        if (timer) clearTimeout(timer);
        timer = setTimeout(function() {
            timer = null;
            func();
        }, wait);
    };
}

// called every time the contents of an input changes. input is the, er, input
// element.
function handle_input(input) {
    if (input.value !== '') {
        // input.name is either height or width, which "happens"
        var [size, query] = parse_size(input.value, input.name);
        if (size === 0) {
            // eevee's code didn't include error handling and i'm too lazy to
            // add it, but we can assume 0 is a failure case because who the
            // hell is 0 anything. clear the results list!
            input.classList.add('error');
            render_results(input.name, 0, []);
        }
        else {
            // ok cool that looks like a measurement ig. go ahead & run a search
            input.classList.remove('error');
            var results = search(input.name, size)
            render_results(input.name, size, query, results);
        }
    }
}

// called by handle_input to find pokemon matching the height or weight entered..
function search(key, size) {
    const min_results = 10; // arbitrary

    var fuzziness = 2;
    var first = -1, last = -1;

    while (last - first < min_results) {
        [first, last] = bs.range(db[key], size - fuzziness, size + fuzziness);
        fuzziness *= Math.SQRT2;
    }

    var results = [];
    for (let {k:id} of db[key].slice(first, last)) {
        results.push(db.pokemon[id]);
    }

    results.sort(function(a, b) {
        var diff_a = Math.abs(size - a[key]);
        var diff_b = Math.abs(size - b[key]);

        if (diff_a !== diff_b)
            return diff_a - diff_b;
        else if (a[key] !== a[key])
            return a[key] - b[key];
        else
            return a.display_name.localeCompare(b.display_name);
    });

    return results;
}

function dex_url(pokemon) {
    return `https://veekun.com/dex/pokemon/${pokemon.species}/flavor?form=${pokemon.form}`;
}

function icon_url(pokemon) {
    var icon_name = [pokemon.dex];
    if (pokemon.form) icon_name.push(pokemon.form);
    return `vendor/pokedex-media/pokemon/icons/${icon_name.join('-')}.png`;
}

function format_size(key, size, query) {
    var [prefix, unit] = query[0].slice(1);
    size *= units.height_units.pokemon;

    if (unit === 'foot' && !prefix) {
        // special case handling: if the first unit was feet do FT'IN"
        var feet   = Math.floor(size / units.height_units.foot);
        var inches = Math.round(size / units.height_units.inch) % 12;
        return `${feet}&#8242;${('0' + inches).slice(-2)}&#8243;`;
    }

    if (prefix)
        size /= units.si_prefixes[prefix];

    if (key === 'height')
        size /= units.height_units[unit];
    else if (key === 'weight')
        size /= units.weight_units[unit];
    else return '???';

    var result = size.toFixed(1) + ' ';
    if (unit in units.abbr_for) {
        if (prefix) result += units.abbr_for[prefix];
        result += units.abbr_for[unit];
    }
    else {
        if (prefix) result += prefix;
        result += unit;
    }

    return result;
}

// the boring part, or the interesting part, depending on who you are. turns the
// search results into a nice table so we have something to look at
function render_results(key, size, query, results) {
    const max_results = 7;

    // find the appropriate table element based on key
    var table = document.querySelector(`.output.by-${key}`);
    table.innerHTML = '';

    // need to select the table's insides or tr & td elements will vanish
    var range = document.createRange();
    range.selectNodeContents(table);

    var rendered_count = 0;
    for (let pokemon of results) {

        table.appendChild(range.createContextualFragment(`
            <tr class="pokemon">
                <td style="background-image:url('${icon_url(pokemon)}')">
                    <a href="${dex_url(pokemon)}">${pokemon.display_name}</a>
                </td>
                <td class="numeric">${format_size(key, pokemon[key], query)}</td>
                <td class="numeric">${Math.round((pokemon[key] - size) / size * 100)}%</td>
            </tr>
        `));

        rendered_count += 1;
        if (rendered_count == max_results)
            table.appendChild(range.createContextualFragment(
                '<tr class="more"><td colspan="3">&hellip;</td></tr>'))
    }
}

// the entry point, where we bind our event listeners for posterity
window.app = function() {
    document.body.addEventListener('click', function(event) {
        var target = event.target;
        while (target) {
            if (target.tagName === 'TR' && target.classList.contains('more')) {
                target.parentElement.removeChild(target);
                event.stopPropagation();
                event.preventDefault();
                break;
            }
            else
                target = target.parentElement;
        }
    }, false);

    for (let input of document.querySelectorAll('input[name]')) {
        // see, this is the only time debounce was even used. don't want to
        // call that yucky parser or search for every single keypress, best to
        // wait for the user to (maybe) finish typing, then try
        var handler = debounce(500, handle_input.bind(null, input));
        input.addEventListener('input', handler, false);
        input.addEventListener('change', handler, false);

        // go ahead, call the input handler with the default inputs
        handler();
    }
}
