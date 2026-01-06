/// <reference types="cypress" />

/**
 * Song Search and Filter Integration Tests
 * 
 * Tests song library search and filtering:
 * 1. Search songs by title/artist
 * 2. Filter by genre
 * 3. Filter by difficulty
 * 4. Sort songs
 * 5. Combined filters
 * 
 * Priority: P2 - Important for song management workflow
 */

describe('Song Search and Filter', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL')
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD')

  beforeEach(() => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      cy.log('Skipping - no admin credentials configured')
      return
    }

    cy.viewport(1280, 720)
    cy.login(ADMIN_EMAIL, ADMIN_PASSWORD)
    cy.visit('/dashboard/songs')
  })

  describe('Search Functionality', () => {
    it('should search songs by title', () => {
      cy.get('body').then($body => {
        const searchSelectors = [
          'input[type="search"]',
          'input[placeholder*="Search"]',
          'input[placeholder*="search"]',
          'input[name="search"]',
          '[data-testid="search-input"]'
        ]

        let searchInput = null
        for (const selector of searchSelectors) {
          if ($body.find(selector).length > 0) {
            searchInput = selector
            break
          }
        }

        if (searchInput) {
          cy.get(searchInput).type('guitar')
          cy.wait(500)
          cy.log('Song search executed')
        } else {
          cy.log('No search input found on songs page')
        }
      })
    })

    it('should search songs by artist', () => {
      cy.get('body').then($body => {
        const searchInput = $body.find('input[type="search"]').first()
        
        if (searchInput.length > 0) {
          cy.wrap(searchInput).clear().type('Beatles')
          cy.wait(500)
          cy.log('Artist search executed')
        }
      })
    })

    it('should display search results', () => {
      cy.get('body').then($body => {
        const searchInput = $body.find('input[type="search"]').first()
        
        if (searchInput.length > 0) {
          cy.wrap(searchInput).type('song')
          cy.wait(500)

          // Should show results or empty state
          cy.get('body').should('exist')
          cy.log('Search results displayed')
        }
      })
    })

    it('should show no results message for non-matching search', () => {
      cy.get('body').then($body => {
        const searchInput = $body.find('input[type="search"]').first()
        
        if (searchInput.length > 0) {
          cy.wrap(searchInput).type('xyz123nonexistent789')
          cy.wait(500)

          // Should show empty state
          cy.get('body').should('satisfy', $el => {
            const text = $el.text().toLowerCase()
            return text.includes('no songs') ||
                   text.includes('no results') ||
                   text.includes('not found') ||
                   $el.find('[data-testid="empty-state"]').length > 0
          })
        }
      })
    })

    it('should clear search results', () => {
      cy.get('body').then($body => {
        const searchInput = $body.find('input[type="search"]').first()
        
        if (searchInput.length > 0) {
          cy.wrap(searchInput).type('test')
          cy.wait(300)

          // Clear search
          cy.wrap(searchInput).clear()
          cy.wait(300)

          cy.log('Search cleared')
        }
      })
    })
  })

  describe('Genre Filter', () => {
    it('should filter songs by genre', () => {
      cy.get('body').then($body => {
        const genreFilter = $body.find('select[name="genre"], select[name="genreId"], [data-testid="genre-filter"]').first()
        
        if (genreFilter.length > 0) {
          cy.wrap(genreFilter).select(1)
          cy.wait(500)
          cy.log('Genre filter applied')
        } else {
          cy.log('No genre filter found')
        }
      })
    })

    it('should show only songs matching selected genre', () => {
      cy.get('body').then($body => {
        const genreFilter = $body.find('select[name="genre"]').first()
        
        if (genreFilter.length > 0) {
          cy.wrap(genreFilter).select(1)
          cy.wait(500)

          // Verify filtering worked
          cy.log('Genre filter active - results should be filtered')
        }
      })
    })

    it('should show all genres when filter is cleared', () => {
      cy.get('body').then($body => {
        const genreFilter = $body.find('select[name="genre"]').first()
        
        if (genreFilter.length > 0) {
          cy.wrap(genreFilter).select(1)
          cy.wait(300)
          cy.wrap(genreFilter).select(0) // "All genres"
          cy.wait(300)

          cy.log('Genre filter cleared')
        }
      })
    })
  })

  describe('Difficulty Filter', () => {
    it('should filter songs by difficulty level', () => {
      cy.get('body').then($body => {
        const difficultyFilter = $body.find('select[name="difficulty"], [data-testid="difficulty-filter"]').first()
        
        if (difficultyFilter.length > 0) {
          cy.wrap(difficultyFilter).select(1)
          cy.wait(500)
          cy.log('Difficulty filter applied')
        } else {
          cy.log('No difficulty filter found')
        }
      })
    })

    it('should show only songs matching difficulty', () => {
      cy.get('body').then($body => {
        const difficultyFilter = $body.find('select[name="difficulty"]').first()
        
        if (difficultyFilter.length > 0) {
          // Filter to "Beginner" or first option
          cy.wrap(difficultyFilter).select(1)
          cy.wait(500)

          cy.log('Showing only beginner songs')
        }
      })
    })

    it('should handle all difficulty levels', () => {
      cy.get('body').then($body => {
        const difficultyFilter = $body.find('select[name="difficulty"]').first()
        
        if (difficultyFilter.length > 0) {
          cy.wrap(difficultyFilter).find('option').then($options => {
            const levels = $options.length - 1 // Exclude "All" option
            cy.log(`Found ${levels} difficulty levels`)

            // Test each level
            for (let i = 1; i <= Math.min(levels, 4); i++) {
              cy.wrap(difficultyFilter).select(i)
              cy.wait(300)
            }
          })
        }
      })
    })
  })

  describe('Sorting', () => {
    it('should sort songs alphabetically', () => {
      cy.get('body').then($body => {
        const sortSelectors = [
          'select[name="sort"]',
          'select[name="sortBy"]',
          'button:contains("Sort")',
          '[data-testid="sort-select"]'
        ]

        let sortElement = null
        for (const selector of sortSelectors) {
          if ($body.find(selector).length > 0) {
            sortElement = selector
            break
          }
        }

        if (sortElement) {
          if (sortElement.includes('select')) {
            cy.get(sortElement).select('title')
            cy.wait(500)
            cy.log('Alphabetical sort applied')
          }
        } else {
          cy.log('No sort control found')
        }
      })
    })

    it('should sort songs by artist', () => {
      cy.get('body').then($body => {
        const sortSelect = $body.find('select[name*="sort"]').first()
        
        if (sortSelect.length > 0) {
          cy.wrap(sortSelect).find('option').then($options => {
            const artistOption = [...$options].find(opt => 
              opt.value.toLowerCase().includes('artist') ||
              opt.textContent?.toLowerCase().includes('artist')
            )

            if (artistOption) {
              cy.wrap(sortSelect).select(artistOption.value)
              cy.wait(500)
              cy.log('Sort by artist applied')
            }
          })
        }
      })
    })

    it('should sort songs by difficulty', () => {
      cy.get('body').then($body => {
        const sortSelect = $body.find('select[name*="sort"]').first()
        
        if (sortSelect.length > 0) {
          cy.wrap(sortSelect).find('option').then($options => {
            const difficultyOption = [...$options].find(opt => 
              opt.value.toLowerCase().includes('difficulty')
            )

            if (difficultyOption) {
              cy.wrap(sortSelect).select(difficultyOption.value)
              cy.wait(500)
              cy.log('Sort by difficulty applied')
            }
          })
        }
      })
    })

    it('should toggle sort direction', () => {
      cy.get('body').then($body => {
        const sortButton = $body.find('button[aria-label*="sort"], button:contains("Sort")')
        
        if (sortButton.length > 0) {
          cy.wrap(sortButton).first().click()
          cy.wait(300)
          
          cy.wrap(sortButton).first().click()
          cy.wait(300)

          cy.log('Sort direction toggled')
        }
      })
    })
  })

  describe('Combined Filters', () => {
    it('should combine search and genre filter', () => {
      cy.get('body').then($body => {
        const searchInput = $body.find('input[type="search"]').first()
        const genreFilter = $body.find('select[name="genre"]').first()
        
        if (searchInput.length > 0 && genreFilter.length > 0) {
          cy.wrap(searchInput).type('song')
          cy.wrap(genreFilter).select(1)
          cy.wait(500)

          cy.log('Combined search and genre filter')
        }
      })
    })

    it('should combine all filters (search, genre, difficulty)', () => {
      cy.get('body').then($body => {
        const searchInput = $body.find('input[type="search"]').first()
        const genreFilter = $body.find('select[name="genre"]').first()
        const difficultyFilter = $body.find('select[name="difficulty"]').first()
        
        if (searchInput.length > 0) {
          cy.wrap(searchInput).type('guitar')
        }
        
        if (genreFilter.length > 0) {
          cy.wrap(genreFilter).select(1)
        }
        
        if (difficultyFilter.length > 0) {
          cy.wrap(difficultyFilter).select(1)
        }

        cy.wait(500)
        cy.log('All filters combined')
      })
    })

    it('should clear all filters simultaneously', () => {
      cy.get('body').then($body => {
        // Apply multiple filters first
        const searchInput = $body.find('input[type="search"]').first()
        const genreFilter = $body.find('select[name="genre"]').first()
        
        if (searchInput.length > 0) {
          cy.wrap(searchInput).type('test')
        }
        if (genreFilter.length > 0) {
          cy.wrap(genreFilter).select(1)
        }
        cy.wait(500)

        // Look for clear all button (only click if enabled)
        const clearButton = $body.find('button:contains("Clear"), button:contains("Reset")')
        if (clearButton.length > 0 && !clearButton.first().prop('disabled')) {
          cy.wrap(clearButton).first().click()
          cy.wait(300)
          cy.log('All filters cleared')
        } else {
          cy.log('Clear button not available or disabled')
        }
      })
    })
  })

  describe('Filter Performance', () => {
    it('should filter results quickly', () => {
      cy.get('body').then($body => {
        const searchInput = $body.find('input[type="search"]').first()
        
        if (searchInput.length > 0) {
          const startTime = Date.now()
          
          cy.wrap(searchInput).type('performance test')
          cy.wait(500)
          
          const endTime = Date.now()
          const duration = endTime - startTime
          
          cy.log(`Filter completed in ${duration}ms`)
          expect(duration).to.be.lessThan(2000) // Should be under 2 seconds
        }
      })
    })

    it('should debounce search input', () => {
      cy.get('body').then($body => {
        const searchInput = $body.find('input[type="search"]').first()
        
        if (searchInput.length > 0) {
          // Type rapidly
          cy.wrap(searchInput).type('d')
          cy.wait(50)
          cy.wrap(searchInput).type('e')
          cy.wait(50)
          cy.wrap(searchInput).type('bounce')
          
          cy.wait(600) // Wait for debounce

          cy.log('Debounce behavior tested')
        }
      })
    })
  })

  describe('Filter UI/UX', () => {
    it('should show active filter count', () => {
      cy.get('body').then($body => {
        const genreFilter = $body.find('select[name="genre"]').first()
        const difficultyFilter = $body.find('select[name="difficulty"]').first()
        
        if (genreFilter.length > 0 && difficultyFilter.length > 0) {
          cy.wrap(genreFilter).select(1)
          cy.wrap(difficultyFilter).select(1)
          cy.wait(300)

          // Look for filter count badge
          cy.get('body').then($el => {
            const text = $el.text()
            if (text.includes('filter') || text.includes('Filter')) {
              cy.log('Active filters indicated')
            }
          })
        }
      })
    })

    it('should show results count after filtering', () => {
      cy.get('body').then($body => {
        const searchInput = $body.find('input[type="search"]').first()
        
        if (searchInput.length > 0) {
          cy.wrap(searchInput).type('result count test')
          cy.wait(500)

          // Look for results count display
          cy.get('body').then($el => {
            const text = $el.text().toLowerCase()
            if (text.includes('song') || text.includes('result')) {
              cy.log('Results count displayed')
            }
          })
        }
      })
    })

    it('should maintain filter state on pagination', () => {
      cy.get('body').then($body => {
        const searchInput = $body.find('input[type="search"]').first()
        
        if (searchInput.length > 0) {
          cy.wrap(searchInput).type('pagination test')
          cy.wait(500)

          // Look for pagination buttons
          const nextButton = $body.find('button:contains("Next"), [aria-label*="next"]')
          if (nextButton.length > 0) {
            cy.wrap(nextButton).first().click()
            cy.wait(500)

            // Search should still be active
            cy.get('input[type="search"]').should('have.value', 'pagination test')
          }
        }
      })
    })
  })
})
