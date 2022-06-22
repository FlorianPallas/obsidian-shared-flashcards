import { parseHeadings } from './heading';

describe('heading parser', () => {
  it('should parse headings', () => {
    const headings = parseHeadings(
      '# L1\n## L2\n### L3\n#### L4\n##### L5\n###### L6'
    );
    expect(headings.length).toBe(6);
    let level = 0;
    for (let i = 0; i < 6; i++) {
      expect(headings[i].text).toBe(`L${i + 1}`);
      expect(headings[i].level).toBe(i + 1);
      expect(headings[i].index).toBe(level);
      level += 4 + headings[i].level;
    }
  });
});
