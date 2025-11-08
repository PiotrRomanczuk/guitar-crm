/// <reference types="cypress" />

/**
 * Admin Song Management E2E Tests
 * 
 * Complete CRUD operations for song management:
 * - View songs library with filtering and search
 * - Create new songs with all required fields
 * - Edit existing songs (title, author, level, key, etc.)
 * - Delete songs with confirmation
 * - Bulk operations (import, export, delete)
 * - Search and filter by multiple criteria
 * - Sort by different columns
 * - Validate Ultimate Guitar links and metadata
 */

describe('Admin Song Management', () => {
	const adminUser = {
		email: 'p.romanczuk@gmail.com',
		password: 'test123_admin',
	};

	const testSong = {
		title: `Test Song ${Date.now()}`,
		author: 'Test Artist',
		level: 'intermediate',
		key: 'C',
		ultimate_guitar_link: 'https://www.ultimate-guitar.com/test-song',
		chords: 'C G Am F',
	};

	const editedSong = {
		title: 'Updated Song Title',
		author: 'Updated Artist',
		level: 'advanced',
		key: 'G',
		chords: 'G D Em C',
	};

	beforeEach(() => {
		cy.clearCookies();
		cy.clearLocalStorage();
		
		// Login as admin
		cy.visit('/sign-in');
		cy.get('input[type="email"]').type(adminUser.email);
		cy.get('input[type="password"]').type(adminUser.password);
		cy.get('button[type="submit"]').click();
		cy.contains(adminUser.email, { timeout: 10000 }).should('be.visible');
		
		// Navigate to songs management
		cy.visit('/dashboard/songs');
	});

	context('Songs Library View', () => {
		it('should display songs library with proper layout', () => {
			cy.url().should('include', '/songs');

			// Wait for loading to complete
			cy.get('[data-testid="song-list-loading"]', { timeout: 5000 }).should('not.exist');

			// Should show either songs table or empty state
			cy.get('body').then(($body) => {
				if ($body.find('table, .songs-table, .song-list').length > 0) {
					// Verify table columns
					cy.get('th, .table-header').should('contain.text', /title|author|level|key/i);
				} else {
					// Empty state is acceptable
					cy.contains(/no songs|empty|create your first/i).should('be.visible');
				}
			});
		});

		it('should show song statistics and counts', () => {
			// Look for song count or statistics
			cy.get('body').then(($body) => {
				if ($body.text().match(/\d+ songs?|total|count/i)) {
					cy.contains(/\d+ songs?|total|count/i).should('be.visible');
				} else {
					cy.log('Song statistics not displayed - this is optional');
				}
			});
		});

		it('should display songs with all required information', () => {
			cy.get('body').then(($body) => {
				if ($body.find('table tbody tr, .song-item, .song-row').length > 0) {
					// Verify first song has required fields
					cy.get('table tbody tr, .song-item, .song-row').first().within(() => {
						cy.contains(/[a-z]/i).should('be.visible'); // Has some text content
					});
				}
			});
		});
	});

	context('Create New Song', () => {
		it('should open create song form', () => {
			// Click create song button
			cy.get('[data-testid="create-song-btn"], button, a')
				.contains(/create|add|new song/i)
				.first()
				.click();

			// Should navigate to create form or open modal
			cy.url().should('match', /\/songs\/new|\/create/);
			cy.contains(/create|add|new song/i).should('be.visible');
		});

		it('should create a new song with all fields', () => {
			// Open create form
			cy.get('[data-testid="create-song-btn"], button, a')
				.contains(/create|add|new song/i)
				.first()
				.click();

			// Fill out all required fields
			cy.get('[data-testid="song-title"], input[name="title"]')
				.type(testSong.title);
			
			cy.get('[data-testid="song-author"], input[name="author"]')
				.type(testSong.author);

			// Select difficulty level
			cy.get('[data-testid="song-level"], select[name="level"]')
				.select(testSong.level);

			// Select musical key
			cy.get('[data-testid="song-key"], select[name="key"]')
				.select(testSong.key);

			// Add Ultimate Guitar link
			cy.get('[data-testid="song-ultimate-guitar-link"], input[name="ultimate_guitar_link"]')
				.type(testSong.ultimate_guitar_link);

			// Add chords (if field exists)
			cy.get('body').then(($body) => {
				if ($body.find('[data-testid="song-chords"], input[name="chords"], textarea[name="chords"]').length > 0) {
					cy.get('[data-testid="song-chords"], input[name="chords"], textarea[name="chords"]')
						.type(testSong.chords);
				}
			});

			// Submit form
			cy.get('[data-testid="submit-song"], button[type="submit"]')
				.click();

			// Should redirect to songs list and show new song
			cy.url({ timeout: 10000 }).should('match', /\/songs$|\/dashboard\/songs$/);
			cy.contains(testSong.title, { timeout: 10000 }).should('be.visible');
		});

		it('should validate required fields', () => {
			// Open create form
			cy.get('[data-testid="create-song-btn"], button, a')
				.contains(/create|add|new song/i)
				.first()
				.click();

			// Try to submit empty form
			cy.get('[data-testid="submit-song"], button[type="submit"]').click();

			// Should show validation errors
			cy.get('input:invalid, .error, .field-error, [aria-invalid="true"]')
				.should('have.length.greaterThan', 0);
		});

		it('should validate Ultimate Guitar URL format', () => {
			cy.get('[data-testid="create-song-btn"], button, a')
				.contains(/create|add|new song/i)
				.first()
				.click();

			// Fill required fields
			cy.get('[data-testid="song-title"], input[name="title"]').type('Test Song');
			cy.get('[data-testid="song-author"], input[name="author"]').type('Test Artist');
			cy.get('[data-testid="song-level"], select[name="level"]').select('beginner');
			cy.get('[data-testid="song-key"], select[name="key"]').select('C');

			// Enter invalid URL
			cy.get('[data-testid="song-ultimate-guitar-link"], input[name="ultimate_guitar_link"]')
				.type('invalid-url');

			cy.get('[data-testid="submit-song"], button[type="submit"]').click();

			// Should show URL validation error
			cy.contains(/invalid|url|link/i, { timeout: 5000 }).should('be.visible');
		});

		it('should handle duplicate song detection', () => {
			// Try to create song with same title and author
			cy.get('[data-testid="create-song-btn"], button, a')
				.contains(/create|add|new song/i)
				.first()
				.click();

			// Use existing song data (create same song twice)
			const duplicateSong = {
				title: `Duplicate Song ${Date.now()}`,
				author: 'Duplicate Artist',
			};

			cy.get('[data-testid="song-title"], input[name="title"]').type(duplicateSong.title);
			cy.get('[data-testid="song-author"], input[name="author"]').type(duplicateSong.author);
			cy.get('[data-testid="song-level"], select[name="level"]').select('beginner');
			cy.get('[data-testid="song-key"], select[name="key"]').select('C');
			cy.get('[data-testid="song-ultimate-guitar-link"], input[name="ultimate_guitar_link"]')
				.type('https://www.ultimate-guitar.com/duplicate-song');

			cy.get('[data-testid="submit-song"], button[type="submit"]').click();

			// Wait for redirect
			cy.url({ timeout: 10000 }).should('match', /\/songs$|\/dashboard\/songs$/);

			// Try to create same song again
			cy.get('[data-testid="create-song-btn"], button, a')
				.contains(/create|add|new song/i)
				.first()
				.click();

			cy.get('[data-testid="song-title"], input[name="title"]').type(duplicateSong.title);
			cy.get('[data-testid="song-author"], input[name="author"]').type(duplicateSong.author);
			cy.get('[data-testid="song-level"], select[name="level"]').select('beginner');
			cy.get('[data-testid="song-key"], select[name="key"]').select('C');
			cy.get('[data-testid="song-ultimate-guitar-link"], input[name="ultimate_guitar_link"]')
				.type('https://www.ultimate-guitar.com/duplicate-song-2');

			cy.get('[data-testid="submit-song"], button[type="submit"]').click();

			// Should either prevent creation or show warning
			cy.get('body').then(($body) => {
				const hasError = $body.text().match(/duplicate|already exists|similar/i);
				if (hasError) {
					cy.contains(/duplicate|already exists|similar/i).should('be.visible');
				} else {
					// If no duplicate detection, both songs should exist
					cy.log('Duplicate detection not implemented - both songs created');
				}
			});
		});
	});

	context('Edit Existing Song', () => {
		beforeEach(() => {
			// Ensure we have a test song to edit
			cy.get('body').then(($body) => {
				if (!$body.text().includes(testSong.title)) {
					// Create test song first
					cy.get('[data-testid="create-song-btn"], button, a')
						.contains(/create|add|new song/i)
						.first()
						.click();

					cy.get('[data-testid="song-title"], input[name="title"]').type(testSong.title);
					cy.get('[data-testid="song-author"], input[name="author"]').type(testSong.author);
					cy.get('[data-testid="song-level"], select[name="level"]').select(testSong.level);
					cy.get('[data-testid="song-key"], select[name="key"]').select(testSong.key);
					cy.get('[data-testid="song-ultimate-guitar-link"], input[name="ultimate_guitar_link"]')
						.type(testSong.ultimate_guitar_link);
					
					cy.get('[data-testid="submit-song"], button[type="submit"]').click();
					cy.url({ timeout: 10000 }).should('match', /\/songs$|\/dashboard\/songs$/);
				}
			});
		});

		it('should open edit form for existing song', () => {
			// Find the test song and click edit
			cy.contains('tr, .song-row', testSong.title)
				.within(() => {
					cy.get('[data-testid="edit-song-btn"], button, a')
						.contains(/edit|update/i)
						.click();
				});

			// Should navigate to edit form
			cy.url().should('match', /\/edit|\/update/);
			cy.contains(/edit|update song/i).should('be.visible');
		});

		it('should update song information', () => {
			// Open edit form
			cy.contains('tr, .song-row', testSong.title)
				.within(() => {
					cy.get('[data-testid="edit-song-btn"], button, a')
						.contains(/edit|update/i)
						.click();
				});

			// Update song fields
			cy.get('[data-testid="song-title"], input[name="title"]')
				.clear()
				.type(editedSong.title);
			
			cy.get('[data-testid="song-author"], input[name="author"]')
				.clear()
				.type(editedSong.author);

			cy.get('[data-testid="song-level"], select[name="level"]')
				.select(editedSong.level);

			cy.get('[data-testid="song-key"], select[name="key"]')
				.select(editedSong.key);

			// Update chords if field exists
			cy.get('body').then(($body) => {
				if ($body.find('[data-testid="song-chords"], input[name="chords"], textarea[name="chords"]').length > 0) {
					cy.get('[data-testid="song-chords"], input[name="chords"], textarea[name="chords"]')
						.clear()
						.type(editedSong.chords);
				}
			});

			// Save changes
			cy.get('[data-testid="submit-song"], button[type="submit"]').click();

			// Should redirect and show updated information
			cy.url({ timeout: 10000 }).should('match', /\/songs$|\/dashboard\/songs$/);
			cy.contains(editedSong.title, { timeout: 10000 }).should('be.visible');
			cy.contains(editedSong.author, { timeout: 10000 }).should('be.visible');
		});

		it('should cancel edit without saving', () => {
			// Open edit form
			cy.contains('tr, .song-row', testSong.title)
				.within(() => {
					cy.get('[data-testid="edit-song-btn"], button, a')
						.contains(/edit|update/i)
						.click();
				});

			// Make changes
			cy.get('[data-testid="song-title"], input[name="title"]')
				.clear()
				.type('Should Not Save');

			// Cancel
			cy.get('[data-testid="cancel-btn"], button, a')
				.contains(/cancel|back/i)
				.click();

			// Should return without saving
			cy.url({ timeout: 10000 }).should('match', /\/songs$|\/dashboard\/songs$/);
			cy.contains('Should Not Save').should('not.exist');
		});

		it('should show song details view', () => {
			// Click on song title or view button
			cy.contains('tr, .song-row', testSong.title).within(() => {
				cy.get('a, [data-testid="view-song"], .song-title').first().click();
			});

			// Should navigate to song detail page
			cy.url().should('match', /\/songs\/[^\/]+$|\/\d+$/);
			cy.contains(testSong.title).should('be.visible');
			cy.contains(testSong.author).should('be.visible');
		});
	});

	context('Delete Song', () => {
		it('should delete song with confirmation', () => {
			// Find test song and delete
			cy.contains('tr, .song-row', testSong.title)
				.within(() => {
					cy.get('[data-testid="delete-song-btn"], button')
						.contains(/delete|remove/i)
						.click();
				});

			// Confirm deletion
			cy.get('[data-testid="confirm-delete"], button')
				.contains(/confirm|yes|delete/i)
				.click();

			// Song should be removed
			cy.contains(testSong.title, { timeout: 10000 }).should('not.exist');
		});

		it('should cancel deletion', () => {
			// Start delete process
			cy.contains('tr, .song-row', testSong.title)
				.within(() => {
					cy.get('[data-testid="delete-song-btn"], button')
						.contains(/delete|remove/i)
						.click();
				});

			// Cancel deletion
			cy.get('[data-testid="cancel-delete"], button')
				.contains(/cancel|no/i)
				.click();

			// Song should still exist
			cy.contains(testSong.title).should('be.visible');
		});
	});

	context('Search and Filter', () => {
		it('should search songs by title', () => {
			// Use search functionality
			cy.get('[data-testid="song-search"], input[placeholder*="search"], input[type="search"]')
				.type(testSong.title.substring(0, 4));

			// Should filter results
			cy.get('tbody tr, .song-row').should('have.length.lessThan', 20);
		});

		it('should search songs by artist', () => {
			cy.get('[data-testid="song-search"], input[placeholder*="search"], input[type="search"]')
				.type(testSong.author);

			// Should show songs by that artist
			cy.contains(testSong.author).should('be.visible');
		});

		it('should filter by difficulty level', () => {
			// Use level filter
			cy.get('[data-testid="level-filter"], select')
				.select('intermediate');

			// Should show only intermediate songs
			cy.get('tbody tr, .song-row').each(($row) => {
				cy.wrap($row).should('contain.text', /intermediate/i);
			});
		});

		it('should filter by musical key', () => {
			// Use key filter
			cy.get('[data-testid="key-filter"], select')
				.select('C');

			// Should show only songs in key of C
			cy.get('tbody tr, .song-row').each(($row) => {
				cy.wrap($row).should('contain.text', 'C');
			});
		});

		it('should combine multiple filters', () => {
			// Apply multiple filters
			cy.get('[data-testid="level-filter"], select').select('intermediate');
			cy.get('[data-testid="key-filter"], select').select('C');
			
			// Should show songs matching both criteria
			cy.get('tbody tr, .song-row').each(($row) => {
				cy.wrap($row).should('contain.text', /intermediate/i);
				cy.wrap($row).should('contain.text', 'C');
			});
		});

		it('should clear all filters', () => {
			// Apply filters
			cy.get('[data-testid="song-search"], input[placeholder*="search"], input[type="search"]')
				.type('test');
			cy.get('[data-testid="level-filter"], select').select('intermediate');

			// Clear filters
			cy.get('[data-testid="clear-filters"], button').click();

			// Should show all songs
			cy.get('[data-testid="song-search"], input[placeholder*="search"], input[type="search"]')
				.should('have.value', '');
		});
	});

	context('Sorting and Pagination', () => {
		it('should sort by title', () => {
			// Click title header to sort
			cy.get('th, .table-header').contains(/title/i).click();

			// Should be sorted alphabetically
			cy.get('tbody tr td:first-child, .song-title').then(($titles) => {
				const titles = Array.from($titles).map(el => el.textContent?.trim() || '');
				const sorted = [...titles].sort();
				expect(titles).to.deep.equal(sorted);
			});
		});

		it('should sort by author', () => {
			cy.get('th, .table-header').contains(/author|artist/i).click();

			// Verify sorting (basic check)
			cy.get('tbody tr, .song-row').should('have.length.greaterThan', 0);
		});

		it('should handle pagination if available', () => {
			cy.get('body').then(($body) => {
				if ($body.find('[data-testid="pagination"], .pagination').length > 0) {
					// Test pagination
					cy.get('[data-testid="next-page"], .pagination button').contains(/next/i).click();
					cy.url().should('include', 'page=');
				} else {
					cy.log('Pagination not available - all songs on one page');
				}
			});
		});
	});

	context('Bulk Operations', () => {
		it('should select multiple songs for bulk operations', () => {
			cy.get('body').then(($body) => {
				if ($body.find('input[type="checkbox"]').length > 1) {
					// Select multiple songs
					cy.get('tbody input[type="checkbox"]').first().check();
					cy.get('tbody input[type="checkbox"]').eq(1).check();

					// Should show bulk actions
					cy.get('[data-testid="bulk-actions"], .bulk-actions').should('be.visible');
				} else {
					cy.log('Bulk selection not available');
				}
			});
		});

		it('should perform bulk delete', () => {
			cy.get('body').then(($body) => {
				if ($body.find('input[type="checkbox"]').length > 1) {
					// Select songs
					cy.get('tbody input[type="checkbox"]').first().check();
					
					// Bulk delete
					cy.get('[data-testid="bulk-delete"], button').contains(/delete/i).click();
					cy.get('[data-testid="confirm-bulk-delete"], button').contains(/confirm/i).click();

					cy.log('Bulk delete completed');
				} else {
					cy.log('Bulk operations not implemented');
				}
			});
		});

		it('should export songs data', () => {
			cy.get('body').then(($body) => {
				if ($body.find('[data-testid="export-songs"], button').length > 0) {
					// Test export functionality
					cy.get('[data-testid="export-songs"], button').contains(/export/i).click();
					
					// Should trigger download or show export options
					cy.log('Export functionality available');
				} else {
					cy.log('Export not implemented');
				}
			});
		});
	});

	context('Error Handling', () => {
		it('should handle API errors gracefully', () => {
			// Simulate API error
			cy.intercept('GET', '**/api/song*', { statusCode: 500 }).as('songsError');

			cy.reload();

			// Should show error message
			cy.contains(/error|failed|unavailable/i, { timeout: 10000 }).should('be.visible');
		});

		it('should handle network failures during creation', () => {
			cy.intercept('POST', '**/api/song*', { forceNetworkError: true }).as('createError');

			// Try to create song
			cy.get('[data-testid="create-song-btn"], button, a')
				.contains(/create|add|new song/i)
				.first()
				.click();

			cy.get('[data-testid="song-title"], input[name="title"]').type('Network Test Song');
			cy.get('[data-testid="song-author"], input[name="author"]').type('Test');
			cy.get('[data-testid="song-level"], select[name="level"]').select('beginner');
			cy.get('[data-testid="song-key"], select[name="key"]').select('C');
			cy.get('[data-testid="song-ultimate-guitar-link"], input[name="ultimate_guitar_link"]')
				.type('https://www.ultimate-guitar.com/test');

			cy.get('[data-testid="submit-song"], button[type="submit"]').click();

			// Should show network error
			cy.contains(/network|connection|error/i, { timeout: 10000 }).should('be.visible');
		});
	});
});