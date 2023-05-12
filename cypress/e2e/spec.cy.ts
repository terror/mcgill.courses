/// <reference types="cypress" />
describe('Vite the root page', () => {
  it('should visit', () => {
    cy.visit('/');
    cy.contains(
      'Explore thousands of course and professor reviews from McGill students'
    );
  });
});
