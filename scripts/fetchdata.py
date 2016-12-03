import csv
import json
import requests

LANGUAGE_ID = '9' # english lol

POKEMON_CSV       = 'https://raw.githubusercontent.com/veekun/pokedex/master/pokedex/data/csv/pokemon.csv'
SPECIES_CSV       = 'https://raw.githubusercontent.com/veekun/pokedex/master/pokedex/data/csv/pokemon_species.csv'
FORMS_CSV         = 'https://raw.githubusercontent.com/veekun/pokedex/master/pokedex/data/csv/pokemon_forms.csv'
SPECIES_NAMES_CSV = 'https://raw.githubusercontent.com/veekun/pokedex/master/pokedex/data/csv/pokemon_species_names.csv'
FORM_NAMES_CSV    = 'https://raw.githubusercontent.com/veekun/pokedex/master/pokedex/data/csv/pokemon_form_names.csv'

def download_csv(url):
    response = requests.get(url)
    return csv.DictReader(response.iter_lines(decode_unicode=True))

def convert_pokemon(row):
    species = specieses[row['species_id']]
    form = forms[row['id']]
    if form['id'] in form_names:
        form_name = form_names[form['id']]
        if form_name['pokemon_name']:
            display_name = form_name['pokemon_name']
        else:
            display_name = '{species} ({form})'.format(
                species=species_names[species['id']],
                form=form_name['form_name'])
    else:
        display_name = species_names[species['id']]


    return { 'weight'       : int(row['weight']),
             'height'       : int(row['height']),
             'dex'          : int(row['species_id']),
             'species'      : species['identifier'],
             'form'         : form['form_identifier'],
             'display_name' : display_name.lower() }

def check_language(row):
    return row['local_language_id'] == LANGUAGE_ID

def convert_species(row):
    return (row['id'], row)

def convert_form(row):
    return (row['pokemon_id'], row)

def convert_species_name(row):
    return (row['pokemon_species_id'], row['name'])

def convert_form_name(row):
    return (row['pokemon_form_id'], row)

forms = dict(convert_form(x) \
    for x in download_csv(FORMS_CSV))
specieses = dict(convert_species(x) \
    for x in download_csv(SPECIES_CSV))
species_names = dict(convert_species_name(x) \
    for x in download_csv(SPECIES_NAMES_CSV) if check_language(x))
form_names = dict(convert_form_name(x) \
    for x in download_csv(FORM_NAMES_CSV) if check_language(x))

with open('app/db/pokemon.json', 'w') as outfile:
    reader = download_csv(POKEMON_CSV)
    json.dump([convert_pokemon(x) for x in reader], outfile)
