import {
  html,
  fixture,
  assert,
  fixtureCleanup
} from '@open-wc/testing';
import '../pokemones-dm.js';

suite('PokemonesDm', () => {
  let el;

  teardown(() => fixtureCleanup());

  suite('default', () => {
    setup(async () => {
      el = await fixture(html`
        <pokemones-dm></pokemones-dm>
      `);
      await el.updateComplete;
    });

    test('a11y', async () => {
      await assert.isAccessible(el);
    });

    test('Consumo de api y cargar el listado de pokemones', async () => {
      // Mock de la respuesta de fetch
      const originalFetch = window.fetch;
      window.fetch = async (url) => {
        if (url === 'https://pokeapi.co/api/v2/pokemon?limit=100') {
          return {
            json: () => Promise.resolve({
              results: [{ name: 'bulbasaur' }],
              next: null
            })
          };
        }
        return originalFetch(url);
      };

      const eventPromise = new Promise((resolve) => {
        el.addEventListener('pokemonesFetched', (event) => {
          assert.isNotEmpty(event.detail.pokemons);
          resolve();
        });
      });

      await el.fetchPokemonList();
      await eventPromise;

      // Restaura fetch
      window.fetch = originalFetch;
    });

    test('Consumo de los detalles de los pokemones', async () => {
      // Mock de la respuesta de fetch
      const originalFetch = window.fetch;
      window.fetch = async (url) => {
        if (url === 'https://pokeapi.co/api/v2/pokemon/bulbasaur') {
          return {
            json: () => Promise.resolve({
              name: 'bulbasaur',
              sprites: { other: { dream_world: { front_default: 'image_url' } } },
              species: { url: 'species_url' },
              types: [{ type: { name: 'grass' } }]
            })
          };
        }
        return originalFetch(url);
      };

      const details = await el.fetchPokemonDetails('bulbasaur');
      assert.equal(details.name, 'bulbasaur');
      assert.equal(details.image, 'image_url');

      // Restaura fetch
      window.fetch = originalFetch;
    });


  });
});
