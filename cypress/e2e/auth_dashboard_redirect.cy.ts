describe('Dashboard auth redirects', () => {
  it('redirects unauthenticated user from /dashboard to /auth/login', () => {
    cy.clearCookies();
    cy.visit('/dashboard', { failOnStatusCode: false });
    cy.location('pathname').should('eq', '/auth/login');
    cy.location('search').should('contain', 'redirect=%2Fdashboard');
  });
});
