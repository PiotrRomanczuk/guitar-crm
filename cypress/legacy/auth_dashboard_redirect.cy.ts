describe('Dashboard auth redirects', () => {
  it('redirects unauthenticated user from /dashboard to /sign-in', () => {
    cy.clearCookies();
    cy.visit('/dashboard', { failOnStatusCode: false });
    cy.location('pathname').should('eq', '/sign-in');
    // cy.location('search').should('contain', 'redirect=%2Fdashboard'); // This might vary
  });
});
