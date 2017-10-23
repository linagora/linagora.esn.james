'use strict';

module.exports = {
  jamesModule
};

function jamesModule() {
  return {
    domain: {
      name: 'my-domain',
      hostnames: [
        'localhost',
        '127.0.0.1'
      ],
      company_name: 'linagora'
    },
    users: [
      {
        password: 'secret',
        firstname: 'Domain ',
        lastname: 'Administrator',
        accounts: [{
          type: 'email',
          hosted: true,
          emails: ['itadmin@lng.net']
        }]
      },
      {
        password: 'secret',
        firstname: 'John',
        lastname: 'Doe',
        accounts: [{
          type: 'email',
          hosted: true,
          emails: ['jdoe@lng.net']
        }]
      }
    ]
  };
}
