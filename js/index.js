const bs = require('binarysearch');

const parse_size = require('./parse_size');
const units = require('./units');

var db = (function() {
    var pokemon = require('../db/pokemon.json');
    var by_height = new Map, by_weight = new Map;

    for (let [i, row] of pokemon.entries()) {
        if (!by_weight.has(row.weight))
            by_weight.set(row.weight, [i]);
        else
            by_weight.get(row.weight).push(i);

        if (!by_height.has(row.height))
            by_height.set(row.height, [i]);
        else
            by_height.get(row.height).push(i);
    }

    return {
        height: [...by_height.entries()].sort((a, b) => a[0] - b[0]),
        weight: [...by_weight.entries()].sort((a, b) => a[0] - b[0]),
        pokemon
    };

    // XXX unfortunately looks like bs.closest only returns physically closest
    // return {
    //     height: bs.indexObject(pokemon, (row) => row.height),
    //     weight: bs.indexObject(pokemon, (row) => row.weight),
    //     pokemon
    // };
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
        var size = parse_size(input.value, input.name);
        if (size === 0) {
            // eevee's code didn't include error handling and i'm too lazy to
            // add it, but we can assume 0 is a failure case because who the
            // hell is 0 anything. clear the results list!
            input.classList.add('error');
            render_results(input.name, []);
        }
        else {
            // ok cool that looks like a measurement ig. go ahead & run a search
            input.classList.remove('error');
            var results = search(input.name, size)
            render_results(input.name, results);
        }
    }
}

// called by handle_input to find pokemon matching the height or weight entered..
function search(key, size) {
    // binary search the index table sorted by `key`. bs returns index
    var by_size = (a, b) => a[0] - b[0];
    var result = db[key][bs.closest(db[key], [size], by_size)];

    // map the indices in the result to actual records & return them sorted by
    // display name
    var by_name = (a, b) => a.display_name.localeCompare(b.display_name);
    return result[1].map((id) => db.pokemon[id]).sort(by_name);
}

function dex_url(pokemon) {
    return `https://veekun.com/dex/pokemon/${pokemon.species}/flavor?form=${pokemon.form}`;
}

function icon_url(pokemon) {
    var icon_name = [pokemon.dex];
    if (pokemon.form) icon_name.push(pokemon.form);
    return `vendor/pokedex-media/pokemon/icons/${icon_name.join('-')}.png`;
}

function format_size(pokemon, key) {
    if (key === 'height') {
        var metres = pokemon[key] * units.height_units.pokemon;
        var feet   = Math.floor(metres / units.height_units.foot);
        var inches = Math.round(metres / units.height_units.inch) % 12;
        return [`${metres.toFixed(1)} m`, `${feet}'${inches}"`];
    }
    else if (key === 'weight') {
        var kg = pokemon[key] * units.weight_units.pokemon;
        var lb = kg / units.weight_units.pound;
        return [`${kg.toFixed(1)} kg`, `${lb.toFixed(1)} lb.`];
    }
    return ['???', '???'];
}

// the boring part, or the interesting part, depending on who you are. turns the
// search results into a nice table so we have something to look at
function render_results(key, results) {
    // find the appropriate table element based on key
    var table = document.querySelector(`.output.by-${key}`);
    table.innerHTML = '';

    var range = document.createRange();
    range.selectNodeContents(table);

    for (let pokemon of results) {
        var [metric, imperial] = format_size(pokemon, key);

        table.appendChild(range.createContextualFragment(`
            <tr>
                <td>
                    <a href="${dex_url(pokemon)}">
                        <i class="icon" style="background-image:url('${icon_url(pokemon)}')"></i>
                        <span>${pokemon.display_name}</span>
                    </a>
                </td>
                <td class="numeric">${metric}</td>
                <td class="numeric">${imperial}</td>
            </tr>
        `));
    }
}

// the entry point, where we bind our event listeners for posterity
window.app = function() {
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
