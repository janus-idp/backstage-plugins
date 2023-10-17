/// <reference types="cypress" />

describe('tekton pipeline runs checks', () => {
  beforeEach(() => {
    cy.visit(
      `http://${Cypress.env('HOST') || 'localhost'}:${
        Cypress.env('PORT') || 3000
      }/tekton`,
    );
  });

  it('should show an in-progress pipeline', () => {
    cy.contains('ruby-ex-git-xf45fo').click();
    cy.contains('Pipeline Run').should('exist');
    cy.contains('build').should('exist');
    cy.contains('deploy').should('exist');
    cy.contains('Back to PipelineRun list').click();
    cy.contains('Pipeline Runs').should('exist');
  });

  it('should show a failed pipeline', () => {
    cy.contains('pipeline-test-wbvtlk').click();
    cy.contains('Pipeline Run').should('exist');
    cy.contains('Failed').should('exist');
    cy.contains('tkn').should('exist');
    cy.contains('git-clone').should('exist');
    cy.contains('argocd-task-sync-and-wait').should('exist');
    cy.contains('Back to PipelineRun list').click();
    cy.contains('Pipeline Runs').should('exist');
  });
});
