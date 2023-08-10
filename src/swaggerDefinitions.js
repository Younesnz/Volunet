const { string, object } = require('joi');

module.exports = {
  Application: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: 'Application message',
        example: 'Hello, I would like to join your event',
      },
      status: {
        type: 'string',
        enum: ['pending', 'accepted', 'rejected'],
        description: 'Application status',
      },
      eventId: {
        type: 'string',
        description: 'Event ID',
        example: '6151e94986fa7e6f6f006cd8',
      },
      userId: {
        type: 'string',
        description: 'User ID',
        example: '6151e94986fa7e6f6f006cd9',
      },
      adminId: {
        type: 'string',
        description: 'Admin ID',
        example: '6151e94986fa7e6f6f006cda',
      },
    },
  },
  Event: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Event title',
        example: 'OpenAI Workshop',
      },
      description: {
        type: 'string',
        description: 'Event description',
        example: 'A workshop about the usage of OpenAI',
      },
      category: {
        type: 'string',
        description: 'Event category',
        enum: [
          'education',
          'environment',
          'health',
          'animals',
          'arts',
          'sports',
          'tech',
          'community',
          'workshop',
          'charity',
          'other',
        ],
      },
      type: {
        type: 'string',
        description: 'Event type',
        enum: ['online', 'physical', 'both'],
      },
      date: {
        type: 'string',
        format: 'date-time',
        description: 'Event date',
      },
      likes: {
        type: 'integer',
        description: 'Number of likes',
      },
      rating: {
        type: 'number',
        description: 'Rating of the event',
      },
      // Add other properties here
    },
  },
  Comment: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: 'Comment text',
        example: 'Great event!',
      },
      userId: {
        type: 'string',
        description: 'User ID',
        example: '6151e94986fa7e6f6f006cd9',
      },
    },
  },
  Report: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        enum: [
          'other',
          'scam',
          'suspicious',
          'safety',
          'copyright',
          'unethical',
        ],
        default: 'other',
      },
      message: {
        type: 'string',
        description: 'Report message',
        example: 'This is a scam!',
      },
      status: {
        type: 'string',
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
      },
      userId: {
        type: 'string',
        description: 'User ID',
        example: '6151e94986fa7e6f6f006cd9',
      },
      adminId: {
        type: 'string',
        description: 'Admin ID',
        example: '6151e94986fa7e6f6f006cda',
      },
      eventId: {
        type: 'string',
        description: 'Event ID',
        example: '6151e94986fa7e6f6f006cd8',
      },
    },
  },
  User: {
    type: 'object',
    properties: {
      username: {
        type: 'string',
        description: 'The unique username of the user',
      },
      password: {
        type: 'string',
        description: 'The password of the user',
      },
      email: {
        type: 'string',
        description: 'The unique email of the user',
      },
      googleID: {
        type: 'string',
        description: 'Google ID of the user',
      },
      first_name: {
        type: 'string',
        description: 'First name of the user',
      },
      last_name: {
        type: 'string',
        description: 'Last name of the user',
      },
      birthDate: {
        type: 'string',
        format: 'date',
        description: 'Birthdate of the user',
      },
      joinedAt: {
        type: 'string',
        format: 'date',
        description: 'Date the user joined',
      },
      isVerified: {
        type: 'boolean',
        description: 'Whether the user is verified',
      },
      profilePic: {
        type: 'string',
        description: 'URL of the profile picture',
      },
      location: {
        type: 'object',
        properties: {
          point: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                description: 'Type of the point, usually "Point"',
              },
              coordinates: {
                type: 'array',
                items: {
                  type: 'number',
                },
                description: 'Coordinates of the point',
              },
            },
          },
          country: {
            type: 'string',
            description: 'Country of the location',
          },
          city: {
            type: 'string',
            description: 'City of the location',
          },
        },
        description: 'Location of the user',
      },
      notifications: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Title of the notification',
            },
            message: {
              type: 'string',
              description: 'Message of the notification',
            },
            status: {
              type: 'string',
              description: 'Status of the notification',
            },
            createdAt: {
              type: 'string',
              format: 'date',
              description: 'Date the notification was created',
            },
          },
        },
        description: 'Notifications of the user',
      },
      role: {
        type: 'string',
        description: 'Role of the user',
      },
      ratedEvents: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'ID of the rated event',
            },
            rating: {
              type: 'integer',
              description: 'Rating given to the event',
            },
          },
        },
        description: 'Events rated by the user',
      },
      likedEvents: {
        type: 'array',
        items: {
          type: 'string',
          description: 'ID of the liked event',
        },
        description: 'Events liked by the user',
      },
      joinedEvents: {
        type: 'array',
        items: {
          type: 'string',
          description: 'ID of the joined event',
        },
        description: 'Events joined by the user',
      },
      createdEvents: {
        type: 'array',
        items: {
          type: 'string',
          description: 'ID of the created event',
        },
        description: 'Events created by the user',
      },
    },
  },

  RegisterUser: {
    type: 'object',
    properties: {
      username: {
        type: 'string',
        example: 'Goichaurich',
      },
      email: {
        type: 'string',
        example: 'AshleyJHarper@outlook.com',
      },
      password: {
        type: 'string',
        example: 'Eenge7viecie',
      },
      country: {
        type: 'string',
        example: 'UK',
      },
      city: {
        type: 'string',
        example: 'London',
      },
      first_name: {
        type: 'string',
        example: 'Ashley',
      },
      last_name: {
        type: 'string',
        example: 'Harper',
      },
      birthDate: {
        type: 'string',
        format: 'date',
        example: '1989-02-16',
      },
      profilePic: {
        type: 'string',
        example: 'https://source.unsplash.com/AJIqZDAUD7A/300x300',
      },
    },
    required: ['username', 'email', 'password', 'country', 'city'],
  },

  LoginUser: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        example: 'AshleyJHarper@outlook.com',
      },
      password: {
        type: 'string',
        example: 'Eenge7viecie',
      },
    },
    required: ['email', 'password'],
  },

  updateUserProfile: {
    type: 'object',
    properties: {
      username: {
        type: 'string',
        example: 'Goichaurich',
      },
      email: {
        type: 'string',
        example: 'AshleyJHarper@outlook.com',
      },
    },
  },

  userNotification: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        example: 'Welcome!',
      },
      message: {
        type: 'string',
        example: 'Welcome to volunet!',
      },
      sendEmail: {
        type: 'string',
        example: 'true',
      },
    },
  },

  AddEvent: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        example: 'test event for deleting',
      },
      description: {
        type: 'string',
        example: 'test test test',
      },
      type: {
        type: 'string',
        example: 'online',
      },
      date: {
        type: 'string',
        example: '2023-08-18 10:00',
      },
      address: {
        type: 'string',
        example: '145 W 96th St, New York, NY 10025, United States',
      },
      country: {
        type: 'string',
        example: 'US',
      },
      city: {
        type: 'string',
        example: 'New York',
      },
      lon: {
        type: 'number',
        example: -73.9696441,
      },
      lat: {
        type: 'number',
        example: 40.7939432,
      },
      category: {
        type: 'string',
        example: 'workshop',
      },
      pictures: {
        type: 'array',
        example: [
          'https://source.unsplash.com/w46tRF64qNc/',
          'https://source.unsplash.com/EQpXnijYejQ/',
          'https://source.unsplash.com/iUbsw_VOkbM/',
        ],
      },
      contactPhone: {
        type: 'string',
        example: '905343011295',
      },
      contactEmail: {
        type: 'string',
        example: 'events@CreativeCraft.co',
      },
      contactWebsite: {
        type: 'string',
        example: 'https://www.animals.ai',
      },
    },
  },

  // Other model definitions go here
};
