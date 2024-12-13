describe('MCQ Generation Flow', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/mcq/generate', {
      statusCode: 200,
      body: {
        status: 'completed',
        questions: [
          {
            id: 'test-q1',
            type: 'basic',
            question: 'Test question?',
            options: [
              { id: 'a', text: 'Option A', isCorrect: true },
              { id: 'b', text: 'Option B', isCorrect: false }
            ],
            explanation: 'Test explanation',
            difficulty: 'medium',
            tags: ['test']
          }
        ]
      }
    }).as('generateMCQ');

    cy.intercept('POST', '/api/analytics/events', {
      statusCode: 200
    }).as('trackAnalytics');

    cy.intercept('POST', '/api/feedback/batch', {
      statusCode: 200
    }).as('submitFeedback');
  });

  it('should complete full MCQ generation flow', () => {
    // Visit MCQ generation page
    cy.visit('/mcq/generate');

    // Fill generation form
    cy.get('textarea[name="content"]')
      .type('Test content for MCQ generation');
    
    cy.get('select[name="difficulty"]')
      .select('medium');

    cy.get('button')
      .contains('Generate Questions')
      .click();

    // Wait for generation
    cy.wait('@generateMCQ');

    // Answer question
    cy.get('input[type="radio"]')
      .first()
      .click();

    cy.get('button')
      .contains('Submit Answer')
      .click();

    // Submit feedback
    cy.get('[data-testid="star-rating"]')
      .children()
      .eq(4)
      .click();

    cy.get('button')
      .contains('Submit Feedback')
      .click();

    // Verify analytics and feedback
    cy.wait('@trackAnalytics');
    cy.wait('@submitFeedback');

    // Verify success message
    cy.contains('Thank you for your feedback!')
      .should('be.visible');
  });
}); 