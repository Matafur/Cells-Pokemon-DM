import { LitElement } from 'lit-element';



export class PokemonesDm extends LitElement {



  fetchPokemonList(url = 'https://pokeapi.co/api/v2/pokemon?limit=100') {
    return fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const promises = data.results.map((pokemon) => this.fetchPokemonDetails(pokemon.name));
        return Promise.all(promises).then((pokemons) => {
          const basePokemons = pokemons.filter((pokemon) => pokemon.isBasePokemon);

          this.arrayPokemon = [...this.arrayPokemon, ...basePokemons];
          this.nextUrl = data.next;

          this.dispatchEvent(new CustomEvent('pokemonesFetched', {
            detail: {
              pokemons: this.arrayPokemon,
              nextUrl: this.nextUrl,
            },
          }));
        });
      })
      .catch((error) => {
        console.error('Error al consumir la lista:', error);
        this.dispatchEvent(new CustomEvent('errorFetch', { detail: { error } }));
      });
  }


  fetchPokemonDetails(pokemonName) {
    return fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
      .then((response) => response.json())
      .then((data) => {
        const { name, sprites, species, types } = data;
        const typesNames = types.map((typeInfo) => typeInfo.type.name).join(', ');

        return fetch(species.url)
          .then((response) => response.json())
          .then((speciesData) => {
            const isBasePokemon = !speciesData.evolves_from_species;

            return {
              name,
              image: sprites.other.dream_world.front_default,
              speciesUrl: species.url,
              types: typesNames,
              isBasePokemon,
            };
          });
      })
      .catch((error) => {
        console.error('Error al consumir los detalles:', error);
      });
  }

  fetchEvolutionChain(speciesUrl) {
    fetch(speciesUrl)
      .then((response) => response.json())
      .then((speciesData) => fetch(speciesData.evolution_chain.url))
      .then((response) => response.json())
      .then((evolutionData) => {
        const fetchEvolutionImages = async (species) => {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${species.name}`);
          const data = await response.json();
          const typesNames = data.types.map((typeInfo) => typeInfo.type.name).join(', ');
          return {
            name: species.name,
            types: typesNames,
            image: data.sprites.other.dream_world.front_default || data.sprites.front_default,
          };
        };

        const processEvolutionChain = async (chain) => {
          const evolutions = [];
          let currentEvolution = chain;

          while (currentEvolution) {
            const evolutionDetails = await fetchEvolutionImages(currentEvolution.species);
            evolutions.push(evolutionDetails);
            currentEvolution = currentEvolution.evolves_to[0];
          }

          return evolutions;
        };

        processEvolutionChain(evolutionData.chain)
          .then((evolutions) => {
            this.dispatchEvent(new CustomEvent('evolucionesFetched', { detail: { evolutions } }));
          })
          .catch((error) => {
            console.error('Error al procesar la cadena de evolución:', error);
            this.dispatchEvent(new CustomEvent('errorFetch', { detail: { error } }));
          });
      })
      .catch((error) => {
        console.error('Error al consumir la evolucion', error);
        this.dispatchEvent(new CustomEvent('errorFetch', { detail: { error } }));
      });
  }
}

