/// <reference types="cypress" />

describe('k8s page checks', () => {
  beforeEach(() => {
    cy.visit(
      `http://${Cypress.env('HOST') || 'localhost'}:${
        Cypress.env('PORT') || 3000
      }/kubernetes`,
    );
  });

  it('should open a cluster detail', () => {
    cy.contains('mock-cluster').click();
    cy.contains('ruby-ex-git-xf45fo').click();
    cy.contains('PipelineRun').should('exist');
    cy.get('button[title="Close the drawer"]').click();
    cy.contains('ruby-ex-git-xf45fo').parents('div[role="button"]').click();
    cy.contains('Pipeline Spec').should('exist');
    cy.contains('2023-03-30T07:03:04Z').should('exist');
  });
});
