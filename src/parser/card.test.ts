import { parseCards } from './card';

describe('card parser', () => {
  it('should parse a card', () => {
    const cards = parseCards('# Front #card\nBack\n^c-0123456789');
    expect(cards.length).toBe(1);
    expect(cards[0]).toMatchObject({
      front: 'Front',
      back: 'Back',
      label: '0123456789',
    });
  });

  it('should ignore an invalid card', () => {
    const cards = parseCards('# Front #card\nBack\n');
    expect(cards.length).toBe(0);
  });

  it('should handle empty fields', () => {
    const cards = parseCards('# Front #card\n^c-0123456789');
    expect(cards.length).toBe(1);
    expect(cards[0]).toMatchObject({
      front: 'Front',
      back: '',
      label: '0123456789',
    });
  });
});
