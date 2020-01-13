let {
  openBrowser,
  goto,
  below,
  tableCell,
  closeBrowser,
  setConfig,
  text,
  above,
  link,
  near,
} = require('../../lib/taiko');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
let {
  createHtml,
  removeFile,
  openBrowserArgs,
} = require('./test-util');
const test_name = 'tableCell';

describe(test_name, () => {
  let filePath;

  before(async () => {
    let innerHtml = `
      <article id="text__hr">
      <header><h1>Horizontal rules</h1></header>
      <div>
        <hr>
      </div>
      <footer><p><a href="#top">[Top]</a></p></footer>
    </article>
    <article id="text__tables">
            <header><h1>Tabular data</h1></header>
            <table>
              <caption>Table Caption</caption>
              <thead>
                <tr>
                  <th>Table Heading 1</th>
                  <th>Table Heading 2</th>
                  <th>Table Heading 3</th>
                  <th>Table Heading 4</th>
                  <th>Table Heading 5</th>
                </tr>
              </thead>
              <tfoot>
                <tr>
                  <th>Table Footer 1</th>
                  <th>Table Footer 2</th>
                  <th>Table Footer 3</th>
                  <th>Table Footer 4</th>
                  <th>Table Footer 5</th>
                </tr>
              </tfoot>
              <tbody>
                <tr>
                  <td>Table Cell 1</td>
                  <td>Table Cell 2</td>
                  <td>Table Cell 3</td>
                  <td id='lucky'>Table Cell 4</td>
                  <td>Table Cell 5</td>
                </tr>
                <tr>
                  <td>Table Cell 1</td>
                  <td>Table Cell 2</td>
                  <td>Table Cell 3</td>
                  <td>Table Cell 4</td>
                  <td>Table Cell 5</td>
                </tr>
                <tr>
                  <td>Table Cell 1</td>
                  <td>Table Cell 2</td>
                  <td>Table Cell 3</td>
                  <td>Table Cell 4</td>
                  <td>Table Cell 5</td>
                </tr>
                <tr>
                  <td>Table Cell 1</td>
                  <td>Table Cell 2</td>
                  <td>Table Cell 3</td>
                  <td>Table Cell 4</td>
                  <td>Table Cell 5</td>
                </tr>
              </tbody>
            </table>
            <footer><p><a href="#top">[Top]</a></p></footer>
          </article>
      `;
    filePath = createHtml(innerHtml, test_name);
    await openBrowser(openBrowserArgs);
    await goto(filePath);
    setConfig({
      waitForNavigation: false,
    });
  });

  after(async () => {
    setConfig({
      waitForNavigation: true,
    });
    await closeBrowser();
    removeFile(filePath);
  });

  describe('using label as Table Caption', () => {
    it('test tableCell exists()', async () => {
      expect(
        await tableCell(
          {
            row: 1,
            col: 1,
          },
          'Table Caption',
        ).exists(),
      ).to.be.true;
    });

    it('test tableCell description', async () => {
      expect(
        await tableCell(
          {
            row: 1,
            col: 1,
          },
          'Table Caption',
        ).description,
      ).to.be.eql('tableCell at row:1 and column:1');
    });

    it('test tableCell text()', async () => {
      expect(
        await tableCell(
          {
            row: 1,
            col: 1,
          },
          'Table Caption',
        ).text(),
      ).to.be.eql('Table Cell 1');
    });

    it('test text should throw if the element is not found', async () => {
      expect(
        tableCell(
          {
            row: 1,
            col: 1,
          },
          'Below Caption',
        ).text(),
      ).to.be.eventually.rejected;
    });
    it('test tableCell throw error if row and col not provided', async () => {
      expect(() => tableCell('Above Caption')).to.throw(
        'Table Row or Column Value required',
      );
    });
  });

  describe('using label as any Table Header', () => {
    it('test tableCell exists()', async () => {
      expect(
        await tableCell(
          {
            row: 1,
            col: 1,
          },
          'Table Heading 1',
        ).exists(),
      ).to.be.true;
      expect(
        await tableCell(
          {
            row: 1,
            col: 1,
          },
          'Table Heading 3',
        ).exists(),
      ).to.be.true;
    });

    it('test tableCell description', async () => {
      expect(
        await tableCell(
          {
            row: 1,
            col: 1,
          },
          'Table Heading 1',
        ).description,
      ).to.be.eql('tableCell at row:1 and column:1');
    });

    it('test tableCell text()', async () => {
      expect(
        await tableCell(
          {
            row: 1,
            col: 1,
          },
          'Table Heading 1',
        ).text(),
      ).to.be.eql('Table Cell 1');
    });

    it('test text should throw if the element is not found', async () => {
      expect(
        tableCell(
          {
            row: 1,
            col: 1,
          },
          'Table Heading 11',
        ).text(),
      ).to.be.eventually.rejected;
    });
  });

  describe('using proximity selectors to locate table', () => {
    it('1 - test tableCell exists()', async () => {
      expect(
        await tableCell(
          {
            row: 1,
            col: 1,
          },
          below('Tabular data'),
        ).exists(),
      ).to.be.true;
    });

    it('2 - test tableCell exists()', async () => {
      expect(
        await tableCell(
          {
            row: 1,
            col: 1,
          },
          above('Table Footer 1'),
        ).exists(),
      ).to.be.true;
    });

    it('test tableCell description', async () => {
      expect(
        await tableCell({ row: '1', col: '1' }, below('Tabular data'))
          .description,
      ).to.be.eql('Table Cell Below Tabular data');
    });

    it('1 - test tableCell text()', async () => {
      expect(
        await tableCell(
          {
            row: 1,
            col: 1,
          },
          below('Tabular Data'),
        ).text(),
      ).to.be.eql('Table Cell 1');
    });

    it('2 - test TableCell text()', async () => {
      expect(
        await tableCell(
          {
            row: 1,
            col: 1,
          },
          above('Table Footer 1'),
        ).text(),
      ).to.be.eql('Table Cell 1');
    });

    it('test text should throw if the element is not found', async () => {
      await expect(
        tableCell({ row: 1, col: 1 }, 'Table Heading 11').text(),
      ).to.be.eventually.rejected;
    }).timeout(15000);
  });

  describe('Compatibility with other APIs', () => {
    it('Using tableCell in proximity selector', async () => {
      expect(
        await text(
          'Table Cell 2',
          above(tableCell({ row: 2, col: 2 }, 'Table Caption')),
        ).exists(),
      ).to.be.true;
    });

    it('Finding link using tableCell in proximity selector', async () => {
      expect(
        await link(
          above(tableCell({ row: 4, col: 1 }, 'Table Caption')),
        ).text(),
      ).to.be.eql('[Top]');
    });

    it('Getting value using argValue', async () => {
      expect(await tableCell({ id: 'lucky' }).text()).to.be.eql(
        'Table Cell 4',
      );
    });

    it('Getting text using proximity selectors', async () => {
      expect(
        await text(
          'Table Cell 1',
          near(tableCell({ row: 1, col: 1 }, 'Table Caption')),
        ).exists(),
      ).to.be.true;
    });
  });
});
