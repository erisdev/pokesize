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

/* yes, this is a trivial implementation that doesn't handle arguments or context */
function debounce(wait, func) {
    var timer;
    return function() {
        if (timer) clearTimeout(timer);
        timer = setTimeout(function() {
            timeout = null;
            func();
        }, wait);
    };
}

function handle_input(input) {
    if (input.value !== '') {
        var size = parse_size(input.value, input.name);
        if (size === 0) {
            input.classList.add('error');
            render_results(input.name, []);
        }
        else {
            input.classList.remove('error');
            var results = search(input.name, size)
            render_results(input.name, results);
        }
    }
}

function search(key, size) {
    var by_size = (a, b) => a[0] - b[0];
    var by_name = (a, b) => a.display_name.localeCompare(b.display_name);
    var i = bs.closest(db[key], [size], by_size);
    return db[key][i][1].map((id) => db.pokemon[id]).sort(by_name);
    // var results = bs.rangeValue()
}

function render_results(key, results) {
    var table = document.querySelector(`.output.by-${key}`);
    table.innerHTML = '';

    for (let it of results) {
        var dex_url, icon_url;
        if (it.form) {
            dex_url = `https://veekun.com/dex/pokemon/${it.species}?form=${it.form}`;
            icon_url = `vendor/pokedex-media/pokemon/icons/${it.dex}-${it.form}.png`;
        }
        else {
            dex_url = `https://veekun.com/dex/pokemon/${it.species}`;
            icon_url = `vendor/pokedex-media/pokemon/icons/${it.dex}.png`;
        }

        var row = document.createElement('tr');
        table.append(row);

        var cell = document.createElement('td');
        row.append(cell);

        var link = document.createElement('a');
        link.href = dex_url;
        cell.append(link);

        var icon = document.createElement('i');
        icon.className = 'icon';
        icon.style.backgroundImage = `url("${icon_url}")`;
        link.append(icon);

        var label = document.createElement('span');
        label.textContent = it.display_name;
        link.append(label);
    }
}

window.app = function() {
    for (let input of document.querySelectorAll('input[name]')) {
        var handler = debounce(500, handle_input.bind(null, input));
        input.addEventListener('input', handler, false);
        input.addEventListener('change', handler, false);
        handler();
    }
}
