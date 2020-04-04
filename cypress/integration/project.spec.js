const WHITE = 'rgb(255, 255, 255)';
const BLACK = 'rgb(0, 0, 0)';

function chunk(arr, len) {
  let chunks = [],
      i = 0,
      n = arr.length;

  while (i < n) {
    chunks.push(arr.slice(i, i += len));
  }

  return chunks;
}

describe('Pixel Art Project', () => {
  beforeEach(() => {
    cy.visit('./index.html');
  });

  it('A página deve possuir o título "Paleta de Cores"', () => {
    cy.get('h1#title').should('have.text', 'Paleta de Cores');
  });

  it('A página deve possuir uma paleta de quatro cores', () => {
    cy.get('.color')
      .should('have.length', 4)
      .each((color) => {
        cy.wrap(color)
          .should('not.have.css', 'background-color', WHITE)
          .and('have.css', 'border', `1px solid ${BLACK}`)
          .and('have.class', 'color');
      })
      .then((colors) => {
        for (let index = 1; index < colors.length; index += 1) {
          const currentColor = colors[index];
          const previousColor = colors[index - 1];

          cy.wrap(currentColor)
            .should('be.onTheRightOf', previousColor)
            .and('be.horizontallyAlignedWith', previousColor);
        }
      });
  });

  it('A cor preta deve ser a primeira na paleta de cores', () => {
    cy.get('.color')
      .first()
      .should('have.css', 'background-color', BLACK);
  });

  it('A página deve possuir um quadro de pixels, com 25 pixels', () => {
    cy.get('.pixel')
      .should('have.length', 25)
      .each((pixel) => {
        expect(pixel).to.have.css('background-color', WHITE);
      })
      .and((pixels) => {
        const rows = chunk(pixels, 5);
        rows.forEach((row) => {
          for (let index = 1; index < row.length; index += 1) {
            const current = pixels[index];
            const previous = pixels[index - 1];

            cy.wrap(current)
              .should('be.onTheRightOf', previous)
              .and('be.horizontallyAlignedWith', previous);
          }
        })

        for (let index = 1; index < 5; index += 1) {
          expect(pixels[index * 5]).to.be.belowOf(pixels[(index - 1) * 5]);
        }
      })
  });

  it('O quadro de pixels deve aparecer abaixo da paleta de cores', () => {
    cy.get('#color-palette').then((colorPalette) => {
      cy.get('#pixel-board').should('be.belowOf', colorPalette);
    });
  });

  it('Cada pixel do quadro de pixels deve possuir 40 pixels de largura e 40 ' +
     'pixels de altura e ser delimitado por uma margem preta de 1 pixel', () => {
    cy.get('.pixel')
      .each((pixel) => {
        cy.wrap(pixel)
          .should('have.css', 'height', '40px')
          .and('have.css', 'width', '40px')
          .and('have.css', 'border', `1px solid ${BLACK}`);
      });
  });

  it('Ao carregar a página, a cor preta da paleta já deve estar selecionada ' +
     'para pintar os pixels', () => {
    cy.get('.selected').first().should('have.css', 'background-color', BLACK);
  });

  it('Ao clicar em uma das cores da paleta, a cor selecionada na paleta ' +
     'é que vai ser usada para preencher os pixels', () => {
    // click each color
    cy.get('.color').each((selectedColor, selectedColorIndex) => {
      cy.wrap(selectedColor).click();

      // and check that only this color has the class 'selected'
      cy.get('.color').each((color, colorIndex) => {
        if (colorIndex === selectedColorIndex) {
          expect(color).to.have.class('selected');
        } else {
          expect(color).not.to.have.class('selected');
        }
      });
    });
  });

  it('Ao clicar em um pixel com uma cor selecionada, o pixel deve ser ' +
     'preenchido com esta cor', () => {
    // for each color
    cy.get('.color').each((color) => {
      const backgroundColor = color.css('background-color');
      // click the color
      cy.wrap(color).click();

      // then for each pixel
      cy.get('.pixel').each((pixel) => {
        // click it and check that it has the selected color
        cy.wrap(pixel)
          .click()
          .should('have.css', 'background-color', backgroundColor);
      });
    });
  });

  it('Ao clicar em um pixel com uma cor selecionada, somente esse pixel ' +
     'deverá ser preenchido, sem influenciar na cor dos demais pixels', () => {
    const colorToPixelIndexMap = { 0: 6, 1: 8, 2: 16, 3: 18 };

    // for each color in the palette
    cy.get('.color').each((color, index) => {
      // first click the color
      cy.wrap(color).click();

      const backgroundColor = color.css('background-color');
      const clickedPixelIndex = colorToPixelIndexMap[index];

      // then we check that, when a pixel is clicked, it shouldn't affect
      cy.get('.pixel').eq(clickedPixelIndex).click();

      // the pixels in the left and right,
      cy.get('.pixel')
        .eq(clickedPixelIndex - 1)
        .should('not.have.css', 'background-color', backgroundColor);
      cy.get('.pixel')
        .eq(clickedPixelIndex + 1)
        .should('not.have.css', 'background-color', backgroundColor);

      // the pixels above and below
      cy.get('.pixel')
        .eq(clickedPixelIndex - 5)
        .should('not.have.css', 'background-color', backgroundColor);
      cy.get('.pixel')
        .eq(clickedPixelIndex + 5)
        .should('not.have.css', 'background-color', backgroundColor);

      // nor the pixels in its diagonal directions
      cy.get('.pixel')
        .eq(clickedPixelIndex - 6)
        .should('not.have.css', 'background-color', backgroundColor);
      cy.get('.pixel')
        .eq(clickedPixelIndex - 4)
        .should('not.have.css', 'background-color', backgroundColor);
      cy.get('.pixel')
        .eq(clickedPixelIndex + 4)
         .should('not.have.css', 'background-color', backgroundColor);
      cy.get('.pixel')
        .eq(clickedPixelIndex + 6)
        .should('not.have.css', 'background-color', backgroundColor);
    });
  });

  it('Crie um botão que, ao ser clicado, limpa o quadro, preenchendo a cor ' +
     'de todos seus pixels com branco', () => {
    // select the second color in the palette
    cy.get('.color').eq(1).click();

    // fill in every pixel in the board with the selected color
    cy.get('.pixel').each((pixel) => {
      cy.wrap(pixel).click();
    });

    // click the clear board button
    cy.get('#clear-board').click();

    // check that all pixels have white background color
    cy.get('.pixel').each((pixel) => {
      cy.wrap(pixel).should('have.css', 'background-color', WHITE);
    });
  });

  it('Faça o quadro de pixels ter seu tamanho definido pelo usuário', () => {
    // initial board size must be 5
    cy.get('.pixel').should('have.length', 25);

    // change the board size to 10
    cy.get('#board-size').clear().type(10);
    cy.get('#generate-board').click();
    cy.get('.pixel').should('have.length', 100);

    // when the board size is less then 5,
    // it should generate a board of size 5 
    cy.get('#board-size').clear().type(4);
    cy.get('#generate-board').click();
    cy.get('.pixel').should('have.length', 25);

    // change the board size to 50
    cy.get('#board-size').clear().type(50);
    cy.get('#generate-board').click();
    cy.get('.pixel').should('have.length', 2500);

    // when the board size is greater than 50
    // it should generate a board of size 50
    cy.get('#board-size').clear().type(51);
    cy.get('#generate-board').click();
    cy.get('.pixel').should('have.length', 2500);
  });

  it('Faça com que as cores da paleta sejam geradas aleatoriamente ao ' +
     'carregar a página', () => {
    cy.get('.color').then((colors) => {
      let currentColors, previousColors;

      // get the palette's initial colors
      previousColors = Array.from(colors).map((color) => (
        Cypress.$(color).css('background-color')
      ));

      // reload the page 5 times and check that the colors change each time
      for (let i = 0; i < 5; i += 1) {
        cy.reload();
        cy.get('.color').then((colors) => {
          currentColors = Array.from(colors).map((color) => (
            Cypress.$(color).css('background-color')
          ));
          
          expect(currentColors).not.to.deep.equal(previousColors);
          previousColors = currentColors;
        });
      } 
    });
  });
});
