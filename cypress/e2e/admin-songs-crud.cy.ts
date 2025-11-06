/// <reference types="cypress" />

/**
 * Admin Songs CRUD E2E
 * Focus: Create and Delete Song
 *
 * Assumes admin credentials from development_credentials.txt
 * Covers:
 *  - Create new song as admin
 *  - Delete song as admin
 *
 * Data-testid attributes required for buttons and forms:
 *  - [data-testid="create-song-btn"]
 *  - [data-testid="song-form-title"]
 *  - [data-testid="song-form-author"]
 *  - [data-testid="song-form-level"]
 *  - [data-testid="song-form-key"]
 *  - [data-testid="song-form-ultimate-guitar-link"]
 *  - [data-testid="song-form-submit"]
 *  - [data-testid="song-row-{id}"]
 *  - [data-testid="delete-song-btn-{id}"]
 */

describe('Admin Songs CRUD', () => {
	const admin = {
		email: 'p.romanczuk@gmail.com',
		password: 'test123_admin',
	};

	const testSong = {
		title: `Test Song ${Date.now()}`,
		author: 'Test Author',
		level: 'intermediate',
		key: 'C',
		ultimate_guitar_link: 'https://www.ultimate-guitar.com/test-song',
	};

	let createdSongId = null;

	beforeEach(() => {
		cy.clearCookies();
		cy.clearLocalStorage();
		cy.visit('/sign-in');
		cy.get('input[type="email"]').type(admin.email);
		cy.get('input[type="password"]').type(admin.password);
		cy.get('button[type="submit"]').click();
		cy.contains(admin.email, { timeout: 10000 }).should('be.visible');
		cy.visit('/songs');
		cy.get('[data-testid="song-list-loading"]', { timeout: 5000 }).should(
			'not.exist'
		);
	});

	it('should create a new song as admin', () => {
		cy.get('[data-testid="create-song-btn"]').should('be.visible').click();
		cy.get('[data-testid="song-form-title"]').type(testSong.title);
		cy.get('[data-testid="song-form-author"]').type(testSong.author);
		cy.get('[data-testid="song-form-level"]').select(testSong.level);
		cy.get('[data-testid="song-form-key"]').select(testSong.key);
		cy.get('[data-testid="song-form-ultimate-guitar-link"]').type(
			testSong.ultimate_guitar_link
		);
		cy.get('[data-testid="song-form-submit"]').click();
		// Wait for redirect and new song to appear in list
		cy.contains(testSong.title, { timeout: 10000 }).should('be.visible');
		// Optionally, get the song row id for deletion
		cy.get('[data-testid^="song-row-"]')
			.contains(testSong.title)
			.parent()
			.invoke('attr', 'data-testid')
			.then((rowId) => {
				createdSongId = rowId.replace('song-row-', '');
			});
	});

	it('should delete the created song as admin', () => {
		// Find the song row by title
		cy.contains(testSong.title, { timeout: 10000 }).should('be.visible');
		cy.get('[data-testid^="song-row-"]')
			.contains(testSong.title)
			.parent()
			.invoke('attr', 'data-testid')
			.then((rowId) => {
				const songId = rowId.replace('song-row-', '');
				cy.get(`[data-testid="delete-song-btn-${songId}"]`)
					.should('be.visible')
					.click();
				// Confirm deletion (if modal)
				cy.contains(/confirm|delete/i).click();
				// Song should disappear from list
				cy.contains(testSong.title).should('not.exist');
			});
	});
});
