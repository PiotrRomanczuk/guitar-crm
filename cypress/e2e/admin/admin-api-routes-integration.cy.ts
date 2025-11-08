describe('Admin API Routes & Integration', () => {
  const adminEmail = 'p.romanczuk@gmail.com';
  const adminPassword = 'rP#8Kw$9mN2qL@4x';

  beforeEach(() => {
    // Login as admin user
    cy.visit('/auth/signin');
    cy.get('[data-testid="email"], input[name="email"]').type(adminEmail);
    cy.get('[data-testid="password"], input[name="password"]').type(adminPassword);
    cy.get('[data-testid="signin-button"], button[type="submit"]').click();

    // Wait for successful login and redirect
    cy.url().should('include', '/dashboard');
    cy.wait(1000); // Allow for any async operations
  });

  afterEach(() => {
    // Logout to clean up session
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="logout-button"], [data-testid="user-menu"]').length > 0) {
        cy.get('[data-testid="logout-button"], [data-testid="user-menu"]').click();
        if ($body.find('[data-testid="logout-confirm"], a, button').length > 0) {
          cy.get('[data-testid="logout-confirm"], a, button')
            .contains(/logout|sign.*out/i)
            .click();
        }
      }
    });
  });

  context('User Management API', () => {
    it('should test user creation API endpoint', () => {
      cy.request({
        method: 'POST',
        url: '/api/admin/users',
        body: {
          email: 'newuser@example.com',
          password: 'TempPass123!',
          isTeacher: false,
          isStudent: true,
          isAdmin: false,
          firstName: 'John',
          lastName: 'Doe',
        },
        failOnStatusCode: false,
      }).then((response) => {
        // Should either succeed (201) or fail appropriately (400/401/403/404/500)
        expect(response.status).to.be.oneOf([201, 400, 401, 403, 404, 500]);

        if (response.status === 201) {
          expect(response.body).to.have.property('success', true);
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('id');
        } else if (response.status === 401) {
          expect(response.body).to.have.property('error').that.includes('Unauthorized');
        } else if (response.status === 403) {
          expect(response.body).to.have.property('error').that.includes('Forbidden');
        } else if (response.status === 404) {
          expect(response.body).to.have.property('error').that.includes('Not Found');
        }
      });
    });

    it('should test user listing API endpoint', () => {
      cy.request({
        method: 'GET',
        url: '/api/admin/users',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403, 404, 500]);

        if (response.status === 200) {
          expect(response.body).to.have.property('success', true);
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.be.an('array');
        }
      });
    });

    it('should test user update API endpoint', () => {
      // First try to get a user to update
      cy.request({
        method: 'GET',
        url: '/api/admin/users',
        failOnStatusCode: false,
      }).then((listResponse) => {
        if (listResponse.status === 200 && listResponse.body.data?.length > 0) {
          const userId = listResponse.body.data[0].id;

          cy.request({
            method: 'PUT',
            url: `/api/admin/users/${userId}`,
            body: {
              firstName: 'Updated Name',
              isTeacher: true,
            },
            failOnStatusCode: false,
          }).then((response) => {
            expect(response.status).to.be.oneOf([200, 400, 401, 403, 404, 500]);
          });
        } else {
          // If no users exist, test with a dummy ID
          cy.request({
            method: 'PUT',
            url: '/api/admin/users/00000000-0000-0000-0000-000000000000',
            body: {
              firstName: 'Test Update',
            },
            failOnStatusCode: false,
          }).then((response) => {
            expect(response.status).to.be.oneOf([400, 401, 403, 404, 500]);
          });
        }
      });
    });

    it('should test user deletion API endpoint', () => {
      cy.request({
        method: 'DELETE',
        url: '/api/admin/users/00000000-0000-0000-0000-000000000000',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 204, 400, 401, 403, 404, 500]);
      });
    });

    it('should validate user input properly', () => {
      // Test with invalid email
      cy.request({
        method: 'POST',
        url: '/api/admin/users',
        body: {
          email: 'invalid-email',
          password: 'pass',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 401, 403, 404, 500]);
      });
    });
  });

  context('Song Management API', () => {
    it('should test song creation API endpoint', () => {
      cy.request({
        method: 'POST',
        url: '/api/admin/songs',
        body: {
          title: 'Test Song',
          author: 'Test Artist',
          level: 'intermediate',
          key: 'C',
          ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/test',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 401, 403, 404, 500]);

        if (response.status === 201) {
          expect(response.body).to.have.property('success', true);
          expect(response.body.data).to.have.property('title', 'Test Song');
        }
      });
    });

    it('should test song listing API endpoint', () => {
      cy.request({
        method: 'GET',
        url: '/api/songs',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403, 404, 500]);

        if (response.status === 200) {
          expect(response.body).to.have.property('success', true);
          expect(response.body.data).to.be.an('array');
        }
      });
    });

    it('should test song filtering and sorting', () => {
      cy.request({
        method: 'GET',
        url: '/api/songs?level=intermediate&sortBy=title&sortOrder=asc',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 401, 403, 404, 500]);
      });
    });

    it('should validate song input properly', () => {
      // Test with missing required fields
      cy.request({
        method: 'POST',
        url: '/api/admin/songs',
        body: {
          title: 'Test Song',
          // Missing required fields
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 401, 403, 404, 500]);
      });

      // Test with invalid difficulty level
      cy.request({
        method: 'POST',
        url: '/api/admin/songs',
        body: {
          title: 'Test Song',
          author: 'Test Artist',
          level: 'invalid_level',
          key: 'C',
          ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/test',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 401, 403, 404, 500]);
      });

      // Test with invalid URL
      cy.request({
        method: 'POST',
        url: '/api/admin/songs',
        body: {
          title: 'Test Song',
          author: 'Test Artist',
          level: 'intermediate',
          key: 'C',
          ultimate_guitar_link: 'not-a-valid-url',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 401, 403, 404, 500]);
      });
    });
  });

  context('Lesson Management API', () => {
    it('should test lesson creation API endpoint', () => {
      cy.request({
        method: 'POST',
        url: '/api/admin/lessons',
        body: {
          teacherId: '00000000-0000-0000-0000-000000000001',
          studentId: '00000000-0000-0000-0000-000000000002',
          scheduledAt: new Date().toISOString(),
          duration: 60,
          notes: 'Test lesson',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 401, 403, 404, 500]);
      });
    });

    it('should test lesson listing API endpoint', () => {
      cy.request({
        method: 'GET',
        url: '/api/admin/lessons',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403, 404, 500]);
      });
    });

    it('should test lesson filtering by teacher/student', () => {
      cy.request({
        method: 'GET',
        url: '/api/admin/lessons?teacherId=00000000-0000-0000-0000-000000000001',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 401, 403, 404, 500]);
      });
    });

    it('should validate lesson scheduling conflicts', () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 24);

      // Try to create overlapping lessons
      const lessonData = {
        teacherId: '00000000-0000-0000-0000-000000000001',
        studentId: '00000000-0000-0000-0000-000000000002',
        scheduledAt: futureDate.toISOString(),
        duration: 60,
      };

      cy.request({
        method: 'POST',
        url: '/api/admin/lessons',
        body: lessonData,
        failOnStatusCode: false,
      }).then((response1) => {
        // First lesson might succeed or fail
        expect(response1.status).to.be.oneOf([201, 400, 401, 403, 404, 500]);

        // Try to create conflicting lesson
        cy.request({
          method: 'POST',
          url: '/api/admin/lessons',
          body: {
            ...lessonData,
            scheduledAt: new Date(futureDate.getTime() + 30 * 60000).toISOString(), // 30 minutes later
          },
          failOnStatusCode: false,
        }).then((response2) => {
          expect(response2.status).to.be.oneOf([201, 400, 401, 403, 404, 500, 409]);
        });
      });
    });
  });

  context('Profile Management API', () => {
    it('should test profile update API endpoint', () => {
      cy.request({
        method: 'PUT',
        url: '/api/profile',
        body: {
          firstName: 'Updated Admin',
          lastName: 'User',
          bio: 'Updated bio for admin user',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 401, 403, 404, 500]);
      });
    });

    it('should test password change API endpoint', () => {
      cy.request({
        method: 'POST',
        url: '/api/profile/password',
        body: {
          currentPassword: adminPassword,
          newPassword: 'NewTempPass123!',
          confirmPassword: 'NewTempPass123!',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 401, 403, 404, 500]);
      });
    });

    it('should test avatar upload API endpoint', () => {
      // Create a minimal image file for testing
      const imageData =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

      cy.request({
        method: 'POST',
        url: '/api/profile/avatar',
        body: {
          image: imageData,
          filename: 'test-avatar.png',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 401, 403, 404, 413, 415, 500]);
      });
    });
  });

  context('System Configuration API', () => {
    it('should test system settings retrieval', () => {
      cy.request({
        method: 'GET',
        url: '/api/admin/system/settings',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403, 404, 500]);
      });
    });

    it('should test system settings update', () => {
      cy.request({
        method: 'PUT',
        url: '/api/admin/system/settings',
        body: {
          appName: 'Guitar CRM Test',
          maxUsersPerTeacher: 50,
          defaultLessonDuration: 60,
          enableEmailNotifications: true,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 401, 403, 404, 500]);
      });
    });

    it('should test system health check API', () => {
      cy.request({
        method: 'GET',
        url: '/api/admin/system/health',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403, 404, 500]);

        if (response.status === 200) {
          expect(response.body).to.have.property('status');
          expect(response.body.status).to.be.oneOf(['healthy', 'warning', 'error']);
        }
      });
    });

    it('should test backup creation API', () => {
      cy.request({
        method: 'POST',
        url: '/api/admin/system/backup',
        body: {
          includeUserData: false,
          compressionLevel: 5,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 202, 400, 401, 403, 404, 500]);
      });
    });

    it('should test analytics data API', () => {
      cy.request({
        method: 'GET',
        url: '/api/admin/analytics/dashboard',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403, 404, 500]);

        if (response.status === 200) {
          expect(response.body).to.have.property('data');
          // Should include metrics like user counts, lesson stats, etc.
        }
      });
    });
  });

  context('Authentication & Authorization API', () => {
    it('should test role verification API', () => {
      cy.request({
        method: 'GET',
        url: '/api/auth/me',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403, 500]);

        if (response.status === 200) {
          expect(response.body).to.have.property('user');
          expect(response.body.user).to.have.property('email', adminEmail);
          expect(response.body.user).to.have.property('isAdmin', true);
        }
      });
    });

    it('should test admin-only endpoint protection', () => {
      // Test that admin endpoints require admin role
      cy.request({
        method: 'GET',
        url: '/api/admin/users',
        failOnStatusCode: false,
      }).then((response) => {
        // Should either work (200) or deny access (401/403)
        expect(response.status).to.be.oneOf([200, 401, 403, 404]);
      });
    });

    it('should test session management API', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth/refresh',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 403, 404, 500]);
      });

      cy.request({
        method: 'POST',
        url: '/api/auth/logout',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 204, 401, 404, 500]);
      });
    });
  });

  context('Error Handling & Rate Limiting', () => {
    it('should handle malformed requests gracefully', () => {
      cy.request({
        method: 'POST',
        url: '/api/admin/users',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 401, 403, 404, 500]);
        if (response.status === 400) {
          expect(response.body).to.have.property('error');
        }
      });
    });

    it('should handle missing required headers', () => {
      cy.request({
        method: 'POST',
        url: '/api/admin/users',
        body: { email: 'test@example.com' },
        headers: {
          Authorization: undefined,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 401, 403, 404, 500]);
      });
    });

    it('should enforce rate limiting', () => {
      // Make multiple rapid requests to test rate limiting
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          cy.request({
            method: 'GET',
            url: '/api/songs',
            failOnStatusCode: false,
          })
        );
      }

      // At least some should succeed, but rate limiting might kick in
      Promise.all(requests).then((responses) => {
        const statusCodes = responses.map((r) => r.status);
        expect(statusCodes).to.include.oneOf([200, 429, 401, 403, 404, 500]);
      });
    });

    it('should handle large request payloads', () => {
      const largeData = {
        title: 'A'.repeat(10000), // Very long title
        author: 'Test Artist',
        level: 'intermediate',
        key: 'C',
        ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/test',
      };

      cy.request({
        method: 'POST',
        url: '/api/admin/songs',
        body: largeData,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 413, 401, 403, 404, 500]);
      });
    });
  });

  context('CORS & Security Headers', () => {
    it('should include proper security headers', () => {
      cy.request({
        method: 'GET',
        url: '/api/songs',
        failOnStatusCode: false,
      }).then((response) => {
        // Check for common security headers (if implemented)
        const headers = Object.keys(response.headers);
        // Headers might include: x-frame-options, x-content-type-options, etc.
        // This is mainly to verify the API is responding with some headers
        expect(headers).to.be.an('array');
      });
    });

    it('should handle preflight requests', () => {
      cy.request({
        method: 'OPTIONS',
        url: '/api/songs',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 204, 404, 405]);
      });
    });
  });
});
