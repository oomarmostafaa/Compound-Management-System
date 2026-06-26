const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Compound Management System API',
      version: '1.0.0',
    
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Access Token'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Error message here' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: { type: 'object' },
            message: { type: 'string', example: 'Operation successful' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    paths: {
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', example: 'admin@compound.com' },
                    password: { type: 'string', example: 'admin123' }
                  },
                  required: ['email', 'password']
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      user: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          email: { type: 'string' },
                          role: { type: 'string' }
                        }
                      },
                      accessToken: { type: 'string' }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/auth/forgot-password': {
        post: {
          tags: ['Authentication'],
          summary: 'Request forgot password link',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', example: 'resident@example.com' }
                  },
                  required: ['email']
                }
              }
            }
          },
          responses: {
            200: { description: 'Reset link sent' }
          }
        }
      },
      '/api/auth/reset-password': {
        post: {
          tags: ['Authentication'],
          summary: 'Reset password using token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                    password: { type: 'string', example: 'newpassword123' }
                  },
                  required: ['token', 'password']
                }
              }
            }
          },
          responses: {
            200: { description: 'Password reset successful' }
          }
        }
      },
      '/api/dashboard/stats': {
        get: {
          tags: ['Admin Dashboard'],
          summary: 'Get dashboard statistics (Admin Only)',
          responses: {
            200: {
              description: 'Aggregated stats',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data: {
                        type: 'object',
                        properties: {
                          residents: { type: 'object' },
                          staff: { type: 'object' },
                          buildings: { type: 'object' },
                          apartments: { type: 'object' },
                          requests: { type: 'object' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/buildings': {
        get: {
          tags: ['Buildings'],
          summary: 'Get buildings list (Admin Only)',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'search', in: 'query', schema: { type: 'string' } }
          ],
          responses: {
            200: {
              description: 'List of buildings',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            }
          }
        },
        post: {
          tags: ['Buildings'],
          summary: 'Create a building (Admin Only)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Building B' },
                    number: { type: 'string', example: '102' }
                  },
                  required: ['name', 'number']
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Building created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            }
          }
        }
      },
      '/api/buildings/{id}': {
        get: {
          tags: ['Buildings'],
          summary: 'Get building by ID (Admin Only)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Building details' } }
        },
        put: {
          tags: ['Buildings'],
          summary: 'Update building (Admin Only)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    number: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Building updated' } }
        },
        delete: {
          tags: ['Buildings'],
          summary: 'Delete building (Admin Only)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Building deleted' } }
        }
      },
      '/api/apartments': {
        get: {
          tags: ['Apartments'],
          summary: 'Get apartments list (Admin Only)',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['EMPTY', 'OCCUPIED'] } },
            { name: 'search', in: 'query', schema: { type: 'string' } }
          ],
          responses: {
            200: {
              description: 'List of apartments',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            }
          }
        },
        post: {
          tags: ['Apartments'],
          summary: 'Create an apartment (Admin Only)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    number: { type: 'string', example: 'B-101' },
                    floor: { type: 'integer', example: 1 },
                    status: { type: 'string', enum: ['EMPTY', 'OCCUPIED'], default: 'EMPTY' },
                    buildingId: { type: 'string' }
                  },
                  required: ['number', 'floor', 'buildingId']
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Apartment created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            }
          }
        }
      },
      '/api/apartments/{id}/assign': {
        post: {
          tags: ['Apartments'],
          summary: 'Assign resident to apartment (Admin Only)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    residentId: { type: 'string' }
                  },
                  required: ['residentId']
                }
              }
            }
          },
          responses: { 200: { description: 'Resident assigned successfully' } }
        }
      },
      '/api/residents': {
        get: {
          tags: ['Residents'],
          summary: 'Get residents list (Admin Only)',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'search', in: 'query', schema: { type: 'string' } }
          ],
          responses: {
            200: {
              description: 'List of residents',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            }
          }
        },
        post: {
          tags: ['Residents'],
          summary: 'Create a resident (Admin Only)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', example: 'resident1@gmail.com' },
                    password: { type: 'string', example: 'password123' },
                    phone: { type: 'string', example: '0100203040' },
                    nationalId: { type: 'string', example: '29012345678901' },
                    apartmentId: { type: 'string', description: 'Optional apartment to assign' }
                  },
                  required: ['email', 'password', 'phone', 'nationalId']
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Resident created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            }
          }
        }
      },
      '/api/residents/profile-image': {
        post: {
          tags: ['Residents'],
          summary: 'Upload own profile image (Resident Only)',
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    profileImage: { type: 'string', format: 'binary' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Image uploaded successfully' } }
        }
      },
      '/api/residents/{id}': {
        get: {
          tags: ['Residents'],
          summary: 'Get resident profile (Admin or Self)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Resident details' } }
        },
        delete: {
          tags: ['Residents'],
          summary: 'Soft delete resident (Admin Only)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Resident soft deleted' } }
        }
      },
      '/api/staff': {
        get: {
          tags: ['Staff'],
          summary: 'Get staff list (Admin Only)',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'search', in: 'query', schema: { type: 'string' } }
          ],
          responses: { 200: { description: 'List of staff' } }
        },
        post: {
          tags: ['Staff'],
          summary: 'Create a staff member (Admin Only)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', example: 'staff1@compound.com' },
                    password: { type: 'string', example: 'password123' },
                    phone: { type: 'string', example: '0123456789' },
                    jobTitle: { type: 'string', example: 'Electrician' }
                  },
                  required: ['email', 'password', 'phone', 'jobTitle']
                }
              }
            }
          },
          responses: { 201: { description: 'Staff created' } }
        }
      },
      '/api/staff/{id}': {
        get: {
          tags: ['Staff'],
          summary: 'Get staff profile (Admin or Self)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Staff details' } }
        },
        delete: {
          tags: ['Staff'],
          summary: 'Soft delete staff (Admin Only)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Staff soft deleted' } }
        }
      },
      '/api/documents': {
        get: {
          tags: ['Documents'],
          summary: 'Get documents (Admin gets all, Resident gets own)',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
          ],
          responses: { 200: { description: 'List of documents' } }
        },
        post: {
          tags: ['Documents'],
          summary: 'Upload document (Resident Only)',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', enum: ['NATIONAL_ID', 'OWNERSHIP_CONTRACT', 'RENTAL_CONTRACT'] },
                    file: { type: 'string', format: 'binary' }
                  },
                  required: ['type', 'file']
                }
              }
            }
          },
          responses: { 201: { description: 'Document uploaded' } }
        }
      },
      '/api/documents/{id}': {
        delete: {
          tags: ['Documents'],
          summary: 'Delete own document (Resident Only)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Document deleted' } }
        }
      },
      '/api/requests': {
        get: {
          tags: ['Requests'],
          summary: 'Get requests (Resident: own, Staff: assigned, Admin: all)',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'] } },
            { name: 'type', in: 'query', schema: { type: 'string', enum: ['COMPLAINT', 'MAINTENANCE'] } },
            { name: 'search', in: 'query', schema: { type: 'string' } }
          ],
          responses: {
            200: {
              description: 'List of requests',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            }
          }
        },
        post: {
          tags: ['Requests'],
          summary: 'Create request (Resident Only)',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', example: 'Faucet leakage' },
                    description: { type: 'string', example: 'Water keeps dripping' },
                    type: { type: 'string', enum: ['COMPLAINT', 'MAINTENANCE'] },
                    image: { type: 'string', format: 'binary' }
                  },
                  required: ['title', 'description', 'type']
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Request created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            }
          }
        }
      },
      '/api/requests/{id}/assign': {
        post: {
          tags: ['Requests'],
          summary: 'Assign staff to request (Admin Only)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    assignedStaffId: { type: 'string' }
                  },
                  required: ['assignedStaffId']
                }
              }
            }
          },
          responses: { 200: { description: 'Staff assigned' } }
        }
      },
      '/api/requests/{id}/status': {
        patch: {
          tags: ['Requests'],
          summary: 'Update request status (Admin, Staff, or Resident)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'] }
                  },
                  required: ['status']
                }
              }
            }
          },
          responses: { 200: { description: 'Status updated' } }
        }
      },
      '/api/visitors': {
        get: {
          tags: ['Visitors'],
          summary: 'Get visitors list (Admin/Staff: all, Resident: own)',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] } },
            { name: 'search', in: 'query', schema: { type: 'string', description: 'Search by visitor name or phone' } }
          ],
          responses: {
            200: {
              description: 'List of visitors',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            }
          }
        },
        post: {
          tags: ['Visitors'],
          summary: 'Add a visitor pre-registration (Resident Only)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'John Doe' },
                    phone: { type: 'string', example: '0101010101' },
                    visitDate: { type: 'string', format: 'date-time', example: '2026-06-20T10:00:00Z' }
                  },
                  required: ['name', 'phone', 'visitDate']
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Visitor pre-registered',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            }
          }
        }
      },
      '/api/visitors/{id}/status': {
        patch: {
          tags: ['Visitors'],
          summary: 'Approve or Reject visitor (Staff/Security & Admin Only)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['APPROVED', 'REJECTED'] }
                  },
                  required: ['status']
                }
              }
            }
          },
          responses: { 200: { description: 'Visitor status updated' } }
        }
      },
      '/api/announcements': {
        get: {
          tags: ['Announcements'],
          summary: 'Get announcements (Admin & Resident)',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
          ],
          responses: {
            200: {
              description: 'List of announcements',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            }
          }
        },
        post: {
          tags: ['Announcements'],
          summary: 'Create announcement (Admin Only)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', example: 'Water Maintenance' },
                    content: { type: 'string', example: 'Water will be cut off tomorrow from 9 AM to 12 PM.' }
                  },
                  required: ['title', 'content']
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Announcement created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            }
          }
        }
      },
      '/api/announcements/{id}': {
        get: {
          tags: ['Announcements'],
          summary: 'Get announcement by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Announcement details' } }
        },
        put: {
          tags: ['Announcements'],
          summary: 'Update announcement (Admin Only)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    content: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Announcement updated' } }
        },
        delete: {
          tags: ['Announcements'],
          summary: 'Delete announcement (Admin Only)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Announcement deleted' } }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  const customCss = `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .scheme-container { padding: 15px 0; }
    .swagger-ui .btn.authorize { display: none }
    .swagger-ui .download-url-wrapper { display: none }
    .swagger-ui .response-control-media-type__media-type { display: none !important }
    .swagger-ui .response-controls { display: none !important }
    .swagger-ui .response-content-type { display: none !important }
    .swagger-ui .response-control-accept-header { display: none !important }
    .swagger-ui .response-col_links { display: none !important }
    .swagger-ui .response-headers { display: none !important }
    .swagger-ui .response-header { display: none !important }
    .swagger-ui .response-header-table { display: none !important }
    .swagger-ui table.headers { display: none !important }
    .swagger-ui .headers-wrapper { display: none !important }
    .swagger-ui .curl-command { display: none !important }
    .swagger-ui .model-box { display: none !important }
    .swagger-ui .model-container { display: none !important }
    .swagger-ui .response-col_description .markdown { font-size: 13px; }
    .swagger-ui .response-col_description .response-controls { display: none !important }
    .swagger-ui .response-col_description .response-content-type { display: none !important }
    .swagger-ui .responses-table { margin: 0; }
    .swagger-ui .responses-table td { padding: 6px 4px; }
    .swagger-ui .responses-table .response .response-col_description__inner { padding: 0; margin: 0; }
    .swagger-ui .responses-table .response .response-col_description__inner .renderedMarkdown { font-size: 13px; padding: 0; margin: 0; }
    .swagger-ui .model-container { display: none !important }
    .swagger-ui .models { display: none !important }
  `;
  
  const options = {
    customCss,
    customSiteTitle: 'Compound Hub API Docs',
    customfavIcon: '/favicon.ico',
    docExpansion: 'list',
    defaultModelsExpandDepth: 0,
    defaultModelExpandDepth: 0,
    tryItOutEnabled: false,
    persistAuthorization: false,
    displayRequestDuration: false,
    filter: true,
    syntaxHighlight: {
      activate: false
    },
    showExtensions: false,
    showCommonExtensions: false,
    defaultResponseContentType: 'application/json',
    showRequestHeaders: false,
    showResponseHeaders: false,
    responseAreaPadding: 0,
    requestSamplesOpenByDefault: false
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, options));
  console.log(`  Swagger Docs: http://localhost:5000/api-docs`);
};

module.exports = setupSwagger;
